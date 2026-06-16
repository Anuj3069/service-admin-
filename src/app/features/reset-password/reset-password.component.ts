import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="flex items-center justify-center min-h-screen bg-[radial-gradient(circle_at_50%_50%,#1e1b4b_0%,#0f172a_100%)] p-5">
      <div class="w-full max-w-[440px] p-10 bg-bgCard/90 border border-white/10 rounded-2xl shadow-[0_24px_70px_rgba(0,0,0,0.45)] backdrop-blur-md animate-fade-in">
        <div class="text-center mb-8">
          <div class="text-5xl mb-3">🔄</div>
          <h2 class="text-2xl font-bold tracking-tight text-textMain mb-1.5">Reset Password</h2>
          <p class="text-sm text-textMuted mb-2">Service Booking Management System</p>
          <span class="inline-block mt-3 text-xs text-white/70 bg-white/5 border border-white/10 rounded-full px-3 py-1">Set a new secure password for your admin account.</span>
        </div>

        <div *ngIf="!token" class="w-full text-center px-3 py-3 text-xs font-semibold rounded-lg bg-danger/10 text-danger border border-danger/25">
          ⚠️ Reset token is missing from the URL. Please click the reset link in your email.
        </div>

        <form *ngIf="token" (ngSubmit)="onSubmit()" #resetForm="ngForm" class="space-y-5">
          <div *ngIf="successMessage" class="w-full text-center px-3 py-2 text-xs font-semibold rounded-lg bg-success/10 text-success border border-success/25">
            {{ successMessage }}
          </div>

          <div *ngIf="errorMessage" class="w-full text-center px-3 py-2 text-xs font-semibold rounded-lg bg-danger/10 text-danger border border-danger/25">
            {{ errorMessage }}
          </div>

          <div *ngIf="!successMessage" class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-textMuted uppercase tracking-wider" for="password">New Password</label>
            <input
              type="password"
              id="password"
              name="password"
              class="w-full bg-bgCard border border-border text-textMain px-3 py-2.5 text-sm rounded-lg outline-none transition-all duration-200 focus:border-primary focus:ring-4 focus:ring-primary/15"
              placeholder="••••••••"
              [(ngModel)]="password"
              required
              minlength="6"
            />
          </div>

          <div *ngIf="!successMessage" class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-textMuted uppercase tracking-wider" for="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              class="w-full bg-bgCard border border-border text-textMain px-3 py-2.5 text-sm rounded-lg outline-none transition-all duration-200 focus:border-primary focus:ring-4 focus:ring-primary/15"
              placeholder="••••••••"
              [(ngModel)]="confirmPassword"
              required
            />
          </div>

          <button
            *ngIf="!successMessage"
            type="submit"
            class="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-lg shadow-lg hover:shadow-primary/20 transition-all duration-200"
            [disabled]="resetForm.invalid || password !== confirmPassword || loading"
          >
            <svg *ngIf="loading" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span *ngIf="loading">Updating Password...</span>
            <span *ngIf="!loading">Update Password</span>
          </button>

          <div class="text-center mt-6">
            <a routerLink="/login" class="text-xs font-bold text-primary hover:underline">Back to Login</a>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ResetPasswordComponent implements OnInit {
  private adminService = inject(AdminService);
  private route = inject(ActivatedRoute);

  token = '';
  password = '';
  confirmPassword = '';
  loading = false;
  successMessage = '';
  errorMessage = '';

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
    });
  }

  onSubmit() {
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.adminService.resetPassword(this.token, this.password).subscribe({
      next: (res) => {
        this.loading = false;
        this.successMessage = res.message || 'Password has been reset successfully.';
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Password reset token is invalid or has expired.';
      }
    });
  }
}
