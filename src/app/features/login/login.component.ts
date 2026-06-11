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
    <div class="flex items-center justify-center min-h-screen bg-[radial-gradient(circle_at_50%_50%,#1e1b4b_0%,#0f172a_100%)] p-5">
      <div class="w-full max-w-[440px] p-10 bg-bgCard/90 border border-white/10 rounded-2xl shadow-[0_24px_70px_rgba(0,0,0,0.45)] backdrop-blur-md animate-fade-in">
        <div class="text-center mb-8">
          <div class="text-5xl mb-3">🛡️</div>
          <h2 class="text-2xl font-bold tracking-tight text-textMain mb-1.5">Admin Portal</h2>
          <p class="text-sm text-textMuted mb-2">Service Booking Management System</p>
          <span class="inline-block mt-3 text-xs text-white/70 bg-white/5 border border-white/10 rounded-full px-3 py-1">Secure access to user, booking, and revenue controls.</span>
        </div>

        <form (ngSubmit)="onSubmit()" #loginForm="ngForm" class="space-y-5">
          <div *ngIf="errorMessage" class="w-full text-center px-3 py-2 text-xs font-semibold rounded-lg bg-danger/10 text-danger border border-danger/25">
            {{ errorMessage }}
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-textMuted uppercase tracking-wider" for="email">Admin Email</label>
            <input
              type="email"
              id="email"
              name="email"
              class="w-full bg-bgCard border border-border text-textMain px-3 py-2.5 text-sm rounded-lg outline-none transition-all duration-200 focus:border-primary focus:ring-4 focus:ring-primary/15"
              placeholder="admin@example.com"
              [(ngModel)]="email"
              required
              email
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-textMuted uppercase tracking-wider" for="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              class="w-full bg-bgCard border border-border text-textMain px-3 py-2.5 text-sm rounded-lg outline-none transition-all duration-200 focus:border-primary focus:ring-4 focus:ring-primary/15"
              placeholder="••••••••"
              [(ngModel)]="password"
              required
            />
          </div>

          <button
            type="submit"
            class="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-lg shadow-lg hover:shadow-primary/20 transition-all duration-200"
            [disabled]="loginForm.invalid || loading"
          >
            <svg *ngIf="loading" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span *ngIf="loading">Logging in...</span>
            <span *ngIf="!loading">Secure Login</span>
          </button>
        </form>
      </div>
    </div>
  `,
  styles: []
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
