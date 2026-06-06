import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="glass-panel login-card animate-fade-in">
        <div class="login-header">
          <div class="logo-icon">🛡️</div>
          <h2>Admin Portal</h2>
          <p>Service Booking Management System</p>
          <span class="small-tag">Secure access to user, booking, and revenue controls.</span>
        </div>

        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div *ngIf="errorMessage" class="error-message badge badge-danger">
            {{ errorMessage }}
          </div>

          <div class="form-group">
            <label class="form-label" for="email">Admin Email</label>
            <input
              type="email"
              id="email"
              name="email"
              class="form-control"
              placeholder="admin@example.com"
              [(ngModel)]="email"
              required
              email
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              class="form-control"
              placeholder="••••••••"
              [(ngModel)]="password"
              required
            />
          </div>

          <button
            type="submit"
            class="btn btn-primary login-btn"
            [disabled]="loginForm.invalid || loading"
          >
            <span *ngIf="loading">Logging in...</span>
            <span *ngIf="!loading">Secure Login</span>
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: radial-gradient(circle at 50% 50%, #1e1b4b 0%, #0f172a 100%);
      padding: 20px;
    }
    .login-card {
      width: 100%;
      max-width: 440px;
      padding: 42px 34px;
      box-shadow: 0 24px 70px rgba(0, 0, 0, 0.45);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .login-header {
      text-align: center;
      margin-bottom: 34px;
    }
    .logo-icon {
      font-size: 3rem;
      margin-bottom: 12px;
    }
    .login-header h2 {
      font-size: 1.75rem;
      font-weight: 600;
      color: var(--text-main);
      margin-bottom: 6px;
    }
    .login-header p {
      font-size: 0.95rem;
      color: var(--text-muted);
    }
    .small-tag {
      display: inline-block;
      margin-top: 12px;
      font-size: 0.82rem;
      color: rgba(255, 255, 255, 0.72);
    }
    .error-message {
      width: 100%;
      padding: 10px 14px;
      border-radius: 8px;
      margin-bottom: 20px;
      font-size: 0.875rem;
      display: block;
      text-align: center;
    }
    .login-btn {
      width: 100%;
      margin-top: 15px;
      padding: 12px;
      font-size: 1rem;
      letter-spacing: 0.025em;
    }
  `]
})
export class LoginComponent {
  private adminService = inject(AdminService);
  private router = inject(Router);

  email = '';
  password = '';
  loading = false;
  errorMessage = '';

  onSubmit() {
    this.loading = true;
    this.errorMessage = '';

    this.adminService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.loading = false;
        // Verify role is admin
        if (res.data?.user?.role !== 'admin') {
          this.errorMessage = 'Access denied. You are not authorized as an administrator.';
          return;
        }

        // Save token and user details
        localStorage.setItem('admin_token', res.data.tokens.accessToken);
        localStorage.setItem('admin_user', JSON.stringify(res.data.user));

        // Redirect to dashboard
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Invalid email or password.';
      }
    });
  }
}
