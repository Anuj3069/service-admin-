import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { AdminService } from '../services/admin.service';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take, Observable } from 'rxjs';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const tokenInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const adminService = inject(AdminService);
  const router = inject(Router);

  const token = localStorage.getItem('admin_token');
  let authReq = req;
  
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error) => {
      if (
        error instanceof HttpErrorResponse && 
        error.status === 401 && 
        !req.url.includes('/auth/login') && 
        !req.url.includes('/auth/refresh-token')
      ) {
        return handle401Error(authReq, next, adminService, router);
      }
      return throwError(() => error);
    })
  );
};

function handle401Error(req: HttpRequest<any>, next: HttpHandlerFn, adminService: AdminService, router: Router): Observable<HttpEvent<any>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    const refreshToken = localStorage.getItem('admin_refresh_token');
    if (refreshToken) {
      return adminService.refreshToken(refreshToken).pipe(
        switchMap((res: any) => {
          isRefreshing = false;
          const newToken = res.data.tokens.accessToken;
          const newRefreshToken = res.data.tokens.refreshToken;
          
          localStorage.setItem('admin_token', newToken);
          localStorage.setItem('admin_refresh_token', newRefreshToken);
          refreshTokenSubject.next(newToken);

          return next(req.clone({
            setHeaders: {
              Authorization: `Bearer ${newToken}`
            }
          }));
        }),
        catchError((err) => {
          isRefreshing = false;
          // Clear all tokens and redirect to login
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_refresh_token');
          localStorage.removeItem('admin_user');
          router.navigate(['/login']);
          return throwError(() => err);
        })
      );
    } else {
      isRefreshing = false;
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_refresh_token');
      localStorage.removeItem('admin_user');
      router.navigate(['/login']);
      return throwError(() => new Error('Session expired.'));
    }
  }

  return refreshTokenSubject.pipe(
    filter((token): token is string => token !== null),
    take(1),
    switchMap((token: string) => {
      return next(req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      }));
    })
  );
}
