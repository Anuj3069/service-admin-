import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col gap-6 animate-fade-in max-w-xl">

      <!-- ─── Page Header ──────────────────────────────────── -->
      <div class="animate-slide-up">
        <div class="flex items-center gap-3 mb-1.5">
          <div class="w-1.5 h-7 rounded-full bg-gradient-to-b from-primary to-accent"></div>
          <h1 class="text-2xl font-black tracking-tight text-textMain">System Settings</h1>
        </div>
        <p class="text-sm pl-5 text-textMuted">Configure platform-wide variables and parameters</p>
      </div>

      <!-- ─── Form Card ─────────────────────────────────────── -->
      <div class="p-6 rounded-3xl border border-border bg-bgCard shadow-sm animate-slide-up [animation-delay:60ms]">
        <form (ngSubmit)="saveSettings()" #settingsForm="ngForm" class="flex flex-col gap-5">
          
          <div class="flex flex-col gap-1.5">
            <label for="commissionRate" class="text-xs font-black uppercase tracking-wider text-textMuted">Platform Commission Rate (%)</label>
            <input 
              type="number" 
              id="commissionRate" 
              name="commissionRate" 
              [(ngModel)]="settings.commissionRate" 
              required 
              min="0" 
              max="100" 
              class="w-full px-4 py-2.5 rounded-xl border border-border bg-bgSoft text-textMain text-sm font-semibold outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
            />
            <span class="text-[10px] text-textSubtle font-medium pl-1">The percentage of the booking fee taken by the platform.</span>
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="defaultSearchRadiusKm" class="text-xs font-black uppercase tracking-wider text-textMuted">Default Search Radius (km)</label>
            <input 
              type="number" 
              id="defaultSearchRadiusKm" 
              name="defaultSearchRadiusKm" 
              [(ngModel)]="settings.defaultSearchRadiusKm" 
              required 
              min="1" 
              max="50" 
              class="w-full px-4 py-2.5 rounded-xl border border-border bg-bgSoft text-textMain text-sm font-semibold outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
            />
            <span class="text-[10px] text-textSubtle font-medium pl-1">Radius in kilometers within which candidate providers are matched.</span>
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="bookingExpiryMinutes" class="text-xs font-black uppercase tracking-wider text-textMuted">Booking Expiry Timeout (minutes)</label>
            <input 
              type="number" 
              id="bookingExpiryMinutes" 
              name="bookingExpiryMinutes" 
              [(ngModel)]="settings.bookingExpiryMinutes" 
              required 
              min="1" 
              max="60" 
              class="w-full px-4 py-2.5 rounded-xl border border-border bg-bgSoft text-textMain text-sm font-semibold outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
            />
            <span class="text-[10px] text-textSubtle font-medium pl-1">How long a provider has to confirm a booking before it auto-expires.</span>
          </div>

          <div class="flex justify-end pt-3 border-t border-border mt-2">
            <button type="submit" 
                    [disabled]="!settingsForm.valid || saving" 
                    class="px-6 py-2.5 rounded-xl text-xs font-black text-white bg-primary hover:bg-primary-hover shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none">
              {{ saving ? 'Saving Changes...' : 'Save Settings' }}
            </button>
          </div>
        </form>

        <div *ngIf="successMessage" class="mt-4 p-4 rounded-xl border border-success/20 bg-success/5 text-success text-xs font-bold animate-fade-in flex items-center gap-2">
          <span>✅</span> {{ successMessage }}
        </div>
        <div *ngIf="errorMessage" class="mt-4 p-4 rounded-xl border border-danger/20 bg-danger/5 text-danger text-xs font-bold animate-fade-in flex items-center gap-2">
          <span>⚠️</span> {{ errorMessage }}
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class SettingsComponent implements OnInit {
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
