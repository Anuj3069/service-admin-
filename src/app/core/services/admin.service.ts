import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // ── DASHBOARD ──────────────────────────────────────────────
  getDashboardStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/dashboard-stats`);
  }

  // ── SETTINGS ────────────────────────────────────────────────
  getSettings(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/settings`);
  }

  updateSettings(data: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/admin/settings`, data);
  }

  // ── ANALYTICS ───────────────────────────────────────────────
  getRevenueTrends(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/analytics/revenue-trends`);
  }

  getPopularServices(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/analytics/popular-services`);
  }

  getProviderLeaderboard(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/analytics/provider-leaderboard`);
  }

  // ── AUTHENTICATION ───────────────────────────────────────────
  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, credentials);
  }

  // ── USER MANAGEMENT ──────────────────────────────────────────
  getUsers(filters: any = {}): Observable<any> {
    let params = new HttpParams();
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.role) params = params.set('role', filters.role);
    if (filters.isActive !== undefined && filters.isActive !== '') {
      params = params.set('isActive', filters.isActive.toString());
    }
    if (filters.search) params = params.set('search', filters.search);
    return this.http.get<any>(`${this.apiUrl}/admin/users`, { params });
  }

  updateUserStatus(id: string, isActive: boolean): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/admin/users/${id}/status`, { isActive });
  }

  updateUserRole(id: string, role: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/admin/users/${id}/role`, { role });
  }

  // ── PROVIDER MANAGEMENT ──────────────────────────────────────
  getProviders(filters: any = {}): Observable<any> {
    let params = new HttpParams();
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.isVerified !== undefined && filters.isVerified !== '') {
      params = params.set('isVerified', filters.isVerified.toString());
    }
    if (filters.isAvailable !== undefined && filters.isAvailable !== '') {
      params = params.set('isAvailable', filters.isAvailable.toString());
    }
    return this.http.get<any>(`${this.apiUrl}/admin/providers`, { params });
  }

  verifyProvider(id: string, isVerified: boolean): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/admin/providers/${id}/verify`, { isVerified });
  }

  updateProvider(id: string, profile: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/admin/providers/${id}/profile`, profile);
  }

  // ── CATALOG MANAGEMENT ───────────────────────────────────────
  getCategoriesAndServices(): Observable<any> {
    // Standard user-services API returns all categories with populated services
    return this.http.get<any>(`${this.apiUrl}/user/services`);
  }

  createCategory(category: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin/categories`, category);
  }

  updateCategory(id: string, category: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/admin/categories/${id}`, category);
  }

  deleteCategory(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/admin/categories/${id}`);
  }

  createService(service: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin/services`, service);
  }

  updateService(id: string, service: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/admin/services/${id}`, service);
  }

  deleteService(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/admin/services/${id}`);
  }

  // ── BOOKING MANAGEMENT ───────────────────────────────────────
  getBookings(filters: any = {}): Observable<any> {
    let params = new HttpParams();
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.status) params = params.set('status', filters.status);
    if (filters.userId) params = params.set('userId', filters.userId);
    if (filters.providerId) params = params.set('providerId', filters.providerId);
    return this.http.get<any>(`${this.apiUrl}/admin/bookings`, { params });
  }

  getBookingDetails(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/bookings/${id}`);
  }

  overrideCancelBooking(id: string, reason: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin/bookings/${id}/cancel`, { cancellationReason: reason });
  }

  // ── PAYMENT MANAGEMENT ───────────────────────────────────────
  getPayments(filters: any = {}): Observable<any> {
    let params = new HttpParams();
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.status) params = params.set('status', filters.status);
    return this.http.get<any>(`${this.apiUrl}/admin/payments`, { params });
  }

  overridePaymentStatus(id: string, status: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/admin/payments/${id}/status`, { status });
  }

  // ── REVIEW MODERATION ────────────────────────────────────────
  getReviews(filters: any = {}): Observable<any> {
    let params = new HttpParams();
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    return this.http.get<any>(`${this.apiUrl}/admin/reviews`, { params });
  }

  deleteReview(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/admin/reviews/${id}`);
  }

  // ── KYC MANAGEMENT ──────────────────────────────────────────
  reviewKyc(userId: string, action: 'approve' | 'reject', rejectionReason?: string): Observable<any> {
    const body: any = { action };
    if (rejectionReason) body.rejectionReason = rejectionReason;
    return this.http.patch<any>(`${this.apiUrl}/admin/providers/${userId}/kyc`, body);
  }

  // ── SETTLEMENT MANAGEMENT ─────────────────────────────────────
  getSettlements(filters: any = {}): Observable<any> {
    let params = new HttpParams();
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.sort) params = params.set('sort', filters.sort);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.providerId) params = params.set('providerId', filters.providerId);
    return this.http.get<any>(`${this.apiUrl}/admin/settlements`, { params });
  }

  getSettlementById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/settlements/${id}`);
  }

  updateSettlementStatus(id: string, status: string, adminNote?: string): Observable<any> {
    const body: any = { status };
    if (adminNote) body.adminNote = adminNote;
    return this.http.patch<any>(`${this.apiUrl}/admin/settlements/${id}/status`, body);
  }
}
