import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-wrapper animate-fade-in">
      <div class="page-header">
        <h1>System Settings</h1>
        <p>Configure platform-wide variables and parameters</p>
      </div>

      <div class="glass-panel form-card">
        <form (ngSubmit)="saveSettings()" #settingsForm="ngForm">
          <div class="form-group">
            <label for="commissionRate">Platform Commission Rate (%)</label>
            <input 
              type="number" 
              id="commissionRate" 
              name="commissionRate" 
              [(ngModel)]="settings.commissionRate" 
              required 
              min="0" 
              max="100" 
              class="form-control"
            />
            <small class="form-text text-muted">The percentage of the booking fee taken by the platform.</small>
          </div>

          <div class="form-group">
            <label for="defaultSearchRadiusKm">Default Search Radius (km)</label>
            <input 
              type="number" 
              id="defaultSearchRadiusKm" 
              name="defaultSearchRadiusKm" 
              [(ngModel)]="settings.defaultSearchRadiusKm" 
              required 
              min="1" 
              max="50" 
              class="form-control"
            />
            <small class="form-text text-muted">Radius in kilometers within which candidate providers are matched.</small>
          </div>

          <div class="form-group">
            <label for="bookingExpiryMinutes">Booking Expiry Timeout (minutes)</label>
            <input 
              type="number" 
              id="bookingExpiryMinutes" 
              name="bookingExpiryMinutes" 
              [(ngModel)]="settings.bookingExpiryMinutes" 
              required 
              min="1" 
              max="60" 
              class="form-control"
            />
            <small class="form-text text-muted">How long a provider has to confirm a booking before it auto-expires.</small>
          </div>

          <div class="form-actions">
            <button type="submit" [disabled]="!settingsForm.valid || saving" class="btn btn-primary">
              {{ saving ? 'Saving Changes...' : 'Save Settings' }}
            </button>
          </div>
        </form>

        <div *ngIf="successMessage" class="alert alert-success animate-fade-in">
          {{ successMessage }}
        </div>
        <div *ngIf="errorMessage" class="alert alert-danger animate-fade-in">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-wrapper {
      display: flex;
      flex-direction: column;
      gap: 32px;
      max-width: 600px;
    }
    .page-header h1 {
      font-size: 2rem;
      font-weight: 600;
      color: var(--text-main);
    }
    .page-header p {
      color: var(--text-muted);
      font-size: 0.95rem;
      margin-top: 4px;
    }
    .form-card {
      padding: 32px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 24px;
    }
    label {
      color: var(--text-main);
      font-weight: 500;
      font-size: 0.95rem;
    }
    .form-control {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 12px 16px;
      color: var(--text-main);
      font-size: 1rem;
      transition: var(--transition-smooth);
    }
    .form-control:focus {
      outline: none;
      border-color: var(--primary);
      background: rgba(255, 255, 255, 0.05);
    }
    .form-text {
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
    }
    .btn {
      padding: 12px 24px;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      transition: var(--transition-smooth);
      border: none;
    }
    .btn-primary {
      background: var(--primary);
      color: var(--text-main);
    }
    .btn-primary:hover:not(:disabled) {
      background: #4f46e5;
    }
    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .alert {
      padding: 16px;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 500;
      margin-top: 16px;
    }
    .alert-success {
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.2);
      color: #34d399;
    }
    .alert-danger {
      background: rgba(244, 63, 94, 0.1);
      border: 1px solid rgba(244, 63, 94, 0.2);
      color: #f43f5e;
    }
  `]
})
export class SettingsComponent {
  private adminService = inject(AdminService);

  settings = {
    commissionRate: 10,
    defaultSearchRadiusKm: 10,
    bookingExpiryMinutes: 2
  };

  saving = false;
  successMessage = '';
  errorMessage = '';

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    this.adminService.getSettings().subscribe({
      next: (res) => {
        if (res.data) {
          this.settings = {
            commissionRate: res.data.commissionRate ?? 10,
            defaultSearchRadiusKm: res.data.defaultSearchRadiusKm ?? 10,
            bookingExpiryMinutes: res.data.bookingExpiryMinutes ?? 2
          };
        }
      },
      error: (err) => {
        console.error('Failed to load settings:', err);
        this.errorMessage = 'Failed to load system settings.';
      }
    });
  }

  saveSettings() {
    this.saving = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.adminService.updateSettings(this.settings).subscribe({
      next: (res) => {
        this.saving = false;
        this.successMessage = 'System settings updated successfully!';
        setTimeout(() => this.successMessage = '', 4000);
      },
      error: (err) => {
        this.saving = false;
        this.errorMessage = err.error?.message || 'Failed to save settings.';
        setTimeout(() => this.errorMessage = '', 4000);
      }
    });
  }
}
