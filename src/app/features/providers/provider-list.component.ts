import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-provider-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="provider-wrapper animate-fade-in">
      <div class="page-header">
        <h1>Provider Moderation</h1>
        <p>Manage worker verification, profile coordinates, and performance ratings</p>
      </div>

      <!-- Filters -->
      <div class="glass-panel filters-card">
        <div class="filter-group">
          <select class="form-control filter-select" [(ngModel)]="filterVerified" (change)="loadProviders()">
            <option value="">All Verification Statuses</option>
            <option value="true">Verified Only</option>
            <option value="false">Unverified (Pending Approval)</option>
          </select>

          <select class="form-control filter-select" [(ngModel)]="filterAvailable" (change)="loadProviders()">
            <option value="">All Availabilities</option>
            <option value="true">Available / Online</option>
            <option value="false">Offline</option>
          </select>
        </div>
      </div>

      <!-- Providers Grid / Table -->
      <div class="glass-panel table-card">
        <div class="table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Provider Name</th>
                <th>Skills</th>
                <th>Jobs / Rating</th>
                <th>Availability</th>
                <th>Verification</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let prov of providers">
                <td>
                  <div class="prov-name-card">
                    <span class="avatar">W</span>
                    <div class="prov-details">
                      <span class="name">{{ prov.userId?.name || 'Worker' }}</span>
                      <span class="email">{{ prov.userId?.email || 'No email' }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="skills-list">
                    <span class="badge badge-primary" *ngFor="let skill of prov.skills">
                      {{ skill }}
                    </span>
                    <span *ngIf="prov.skills?.length === 0" class="no-skills">No skills listed</span>
                  </div>
                </td>
                <td>
                  <div class="jobs-rating">
                    <span class="rating">⭐ {{ prov.rating || 0 }} ({{ prov.totalReviews || 0 }} reviews)</span>
                    <span class="jobs">{{ prov.totalJobs || 0 }} completed jobs</span>
                  </div>
                </td>
                <td>
                  <span class="badge" [ngClass]="prov.isAvailable ? 'badge-success' : 'badge-muted'">
                    {{ prov.isAvailable ? 'Online' : 'Offline' }}
                  </span>
                </td>
                <td>
                  <label class="switch">
                    <input
                      type="checkbox"
                      [checked]="prov.isVerified"
                      (change)="toggleVerification(prov)"
                    />
                    <span class="slider"></span>
                  </label>
                </td>
                <td>
                  <button (click)="openEditModal(prov)" class="btn btn-secondary btn-small">
                    ⚙️ Manage Profile
                  </button>
                </td>
              </tr>
              <tr *ngIf="providers.length === 0">
                <td colspan="6" class="no-records">No service providers found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Manage Profile Modal -->
      <div class="modal-overlay" *ngIf="showModal" (click)="closeEditModal()">
        <div class="glass-panel modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Manage Provider Profile</h3>
            <button class="modal-close" (click)="closeEditModal()">×</button>
          </div>
          <div class="modal-body" *ngIf="modalProvider">
            <div class="form-group">
              <label class="form-label" for="skills">Skills (comma separated)</label>
              <input
                type="text"
                id="skills"
                class="form-control"
                [(ngModel)]="editSkills"
                placeholder="plumbing, electrical, cleaning"
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="address">Address Location</label>
              <input
                type="text"
                id="address"
                class="form-control"
                [(ngModel)]="editAddress"
                placeholder="123 Street Name, City"
              />
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label" for="longitude">Longitude</label>
                <input
                  type="number"
                  step="0.000001"
                  id="longitude"
                  class="form-control"
                  [(ngModel)]="editLongitude"
                />
              </div>
              <div class="form-group">
                <label class="form-label" for="latitude">Latitude</label>
                <input
                  type="number"
                  step="0.000001"
                  id="latitude"
                  class="form-control"
                  [(ngModel)]="editLatitude"
                />
              </div>
            </div>

            <div class="form-group row-group">
              <label class="form-label">Active Availability Status</label>
              <label class="switch">
                <input
                  type="checkbox"
                  [(ngModel)]="editAvailable"
                />
                <span class="slider"></span>
              </label>
            </div>

            <div class="modal-actions">
              <button class="btn btn-secondary" (click)="closeEditModal()">Cancel</button>
              <button class="btn btn-primary" (click)="saveProviderProfile()">Save Profile</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .provider-wrapper {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .page-header h1 {
      font-size: 2rem;
      font-weight: 600;
      color: #fff;
    }
    .page-header p {
      color: var(--text-muted);
      font-size: 0.95rem;
      margin-top: 4px;
    }
    .filters-card {
      padding: 16px 20px;
    }
    .filter-group {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }
    .filter-select {
      width: 240px;
    }
    .table-card {
      padding: 12px;
    }
    .prov-name-card {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .prov-name-card .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.85rem;
    }
    .prov-details {
      display: flex;
      flex-direction: column;
    }
    .prov-details .name {
      font-weight: 500;
      color: #fff;
    }
    .prov-details .email {
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    .skills-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      max-width: 250px;
    }
    .no-skills {
      font-size: 0.85rem;
      color: var(--text-muted);
    }
    .jobs-rating {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .jobs-rating .rating {
      font-weight: 500;
      color: #fff;
    }
    .jobs-rating .jobs {
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    .no-records {
      text-align: center;
      padding: 40px 0;
      color: var(--text-muted);
    }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 12px;
    }
    .row-group {
      flex-direction: row !important;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
      margin-top: 12px;
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
    }
  `]
})
export class ProviderListComponent {
  private adminService = inject(AdminService);

  providers: any[] = [];
  filterVerified = '';
  filterAvailable = '';

  showModal = false;
  modalProvider: any = null;
  editSkills = '';
  editAddress = '';
  editLongitude = 0;
  editLatitude = 0;
  editAvailable = false;

  ngOnInit() {
    this.loadProviders();
  }

  loadProviders() {
    const filters = {
      isVerified: this.filterVerified,
      isAvailable: this.filterAvailable
    };

    this.adminService.getProviders(filters).subscribe({
      next: (res) => {
        this.providers = res.data?.items || [];
      },
      error: (err) => {
        console.error('Error loading providers:', err);
      }
    });
  }

  toggleVerification(prov: any) {
    const nextStatus = !prov.isVerified;
    this.adminService.verifyProvider(prov._id, nextStatus).subscribe({
      next: (res) => {
        prov.isVerified = nextStatus;
      },
      error: (err) => {
        console.error('Error setting verification status:', err);
      }
    });
  }

  openEditModal(prov: any) {
    this.modalProvider = prov;
    this.editSkills = prov.skills ? prov.skills.join(', ') : '';
    this.editAddress = prov.location?.address || '';
    this.editLongitude = prov.location?.coordinates ? prov.location.coordinates[0] : 0;
    this.editLatitude = prov.location?.coordinates ? prov.location.coordinates[1] : 0;
    this.editAvailable = prov.isAvailable;
    this.showModal = true;
  }

  closeEditModal() {
    this.showModal = false;
    this.modalProvider = null;
  }

  saveProviderProfile() {
    if (!this.modalProvider) return;

    const payload = {
      skills: this.editSkills.split(',').map(s => s.trim().toLowerCase()).filter(s => s !== ''),
      address: this.editAddress,
      coordinates: [this.editLongitude, this.editLatitude],
      isAvailable: this.editAvailable
    };

    this.adminService.updateProvider(this.modalProvider._id, payload).subscribe({
      next: (res) => {
        this.closeEditModal();
        this.loadProviders();
      },
      error: (err) => {
        console.error('Error updating provider profile:', err);
      }
    });
  }
}
