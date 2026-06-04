import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('admin_token');
  const userJson = localStorage.getItem('admin_user');
  
  if (token && userJson) {
    try {
      const user = JSON.parse(userJson);
      if (user.role === 'admin') {
        return true;
      }
    } catch (e) {
      // Ignore parse error
    }
  }

  // Not logged in or not admin, redirect to login
  router.navigate(['/login']);
  return false;
};
