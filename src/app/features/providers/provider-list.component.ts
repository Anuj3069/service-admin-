import { Component, inject, OnInit } from '@angular/core';
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
        <p>Manage worker verification, KYC documents, and performance ratings</p>
      </div>

      <!-- Tab Switch -->
      <div class="tabs-bar glass-panel">
        <button
          class="tab-btn"
          [class.active]="activeTab === 'providers'"
          (click)="activeTab = 'providers'"
          id="tab-providers"
        >
          <span class="tab-icon">👥</span> All Providers
          <span class="tab-count">{{ totalProviders }}</span>
        </button>
        <button
          class="tab-btn"
          [class.active]="activeTab === 'kyc'"
          (click)="switchToKycTab()"
          id="tab-kyc"
        >
          <span class="tab-icon">🔍</span> KYC Queue
          <span class="tab-count kyc-badge" *ngIf="kycQueue.length > 0">{{ kycQueue.length }}</span>
        </button>
      </div>

      <!-- ══ TAB: PROVIDERS ══════════════════════════════════════════════ -->
      <ng-container *ngIf="activeTab === 'providers'">
        <!-- Filters -->
        <div class="glass-panel filters-card">
          <div class="filter-group">
            <select class="form-control filter-select" [(ngModel)]="filterVerified" (change)="onFilterChange()" id="filter-verified">
              <option value="">All Verification Statuses</option>
              <option value="true">Verified Only</option>
              <option value="false">Unverified</option>
            </select>
            <select class="form-control filter-select" [(ngModel)]="filterAvailable" (change)="onFilterChange()" id="filter-available">
              <option value="">All Availabilities</option>
              <option value="true">Available / Online</option>
              <option value="false">Offline</option>
            </select>
          </div>
        </div>

        <!-- Providers Table -->
        <div class="glass-panel table-card">
          <div class="table-container">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Provider Name</th>
                  <th>Skills</th>
                  <th>Jobs / Rating</th>
                  <th>Availability</th>
                  <th>KYC Status</th>
                  <th>Verified</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let prov of providers">
                  <td>
                    <div class="prov-name-card">
                      <span class="avatar">{{ (prov.userId?.name || 'W')[0].toUpperCase() }}</span>
                      <div class="prov-details">
                        <span class="name">{{ prov.userId?.name || 'Worker' }}</span>
                        <span class="email">{{ prov.userId?.email || 'No email' }}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="skills-list">
                      <span class="badge badge-primary" *ngFor="let skill of (prov.skills || []).slice(0, 3)">
                        {{ skill }}
                      </span>
                      <span *ngIf="(prov.skills?.length || 0) > 3" class="badge badge-muted">
                        +{{ prov.skills.length - 3 }}
                      </span>
                      <span *ngIf="!prov.skills?.length" class="no-skills">No skills listed</span>
                    </div>
                  </td>
                  <td>
                    <div class="jobs-rating">
                      <span class="rating">⭐ {{ prov.rating || 0 }} ({{ prov.totalReviews || 0 }})</span>
                      <span class="jobs">{{ prov.totalJobs || 0 }} jobs</span>
                    </div>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="prov.isAvailable ? 'badge-success' : 'badge-muted'">
                      {{ prov.isAvailable ? 'Online' : 'Offline' }}
                    </span>
                  </td>
                  <td>
                    <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 6px;">
                      <span class="kyc-chip" [ngClass]="kycChipClass(prov.kyc?.status)">
                        {{ kycLabel(prov.kyc?.status) }}
                      </span>
                      <a
                        *ngIf="prov.kyc?.documentUrl"
                        [href]="prov.kyc.documentUrl"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="kyc-table-link"
                        [id]="'view-doc-table-' + prov._id"
                      >
                        📄 View Document
                      </a>
                    </div>
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
                    <button (click)="openEditModal(prov)" class="btn btn-secondary btn-small" [id]="'edit-' + prov._id">
                      ⚙️ Manage
                    </button>
                  </td>
                </tr>
                <tr *ngIf="providers.length === 0">
                  <td colspan="7" class="no-records">No service providers found.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="table-pagination">
            <div class="pagination-summary">
              Showing {{ pageStart }}-{{ pageEnd }} of {{ totalProviders }} providers
            </div>
            <div class="pagination-controls">
              <select class="form-control page-size-select" [(ngModel)]="pageSize" (change)="onPageSizeChange()">
                <option [ngValue]="10">10 / page</option>
                <option [ngValue]="25">25 / page</option>
                <option [ngValue]="50">50 / page</option>
              </select>
              <button [disabled]="currentPage === 1" (click)="changePage(currentPage - 1)" class="btn btn-secondary btn-small">Prev</button>
              <div class="page-numbers">
                <button
                  *ngFor="let page of visiblePages"
                  class="btn btn-secondary btn-small page-btn"
                  [class.active]="page === currentPage"
                  (click)="changePage(page)"
                >
                  {{ page }}
                </button>
              </div>
              <button [disabled]="currentPage === totalPages" (click)="changePage(currentPage + 1)" class="btn btn-secondary btn-small">Next</button>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- ══ TAB: KYC QUEUE ════════════════════════════════════════════ -->
      <ng-container *ngIf="activeTab === 'kyc'">
        <div class="glass-panel kyc-queue-panel">
          <!-- Empty state -->
          <div *ngIf="kycQueue.length === 0 && !kycLoading" class="kyc-empty">
            <div class="kyc-empty-icon">✅</div>
            <p class="kyc-empty-title">KYC Queue is Clear</p>
            <p class="kyc-empty-sub">No pending document verifications at this time.</p>
          </div>

          <!-- Loading state -->
          <div *ngIf="kycLoading" class="kyc-loading">
            <div class="spinner"></div>
            <p>Loading pending verifications…</p>
          </div>

          <!-- KYC cards grid -->
          <div class="kyc-grid" *ngIf="!kycLoading && kycQueue.length > 0">
            <div *ngFor="let item of kycQueue" class="kyc-card glass-panel" [id]="'kyc-card-' + item._id">
              <!-- Worker info -->
              <div class="kyc-card-header">
                <div class="prov-name-card">
                  <div class="kyc-avatar">{{ (item.userId?.name || 'W')[0].toUpperCase() }}</div>
                  <div class="prov-details">
                    <span class="name">{{ item.userId?.name || 'Unknown Worker' }}</span>
                    <span class="email">{{ item.userId?.email || '' }}</span>
                  </div>
                </div>
                <span class="kyc-chip kyc-pending">⏳ Pending</span>
              </div>

              <!-- Document info -->
              <div class="kyc-doc-info">
                <div class="kyc-doc-row">
                  <span class="kyc-doc-label">Document Type</span>
                  <span class="kyc-doc-value">{{ docTypeLabel(item.kyc?.documentType) }}</span>
                </div>
                <div class="kyc-doc-row" *ngIf="item.kyc?.submittedAt">
                  <span class="kyc-doc-label">Submitted</span>
                  <span class="kyc-doc-value">{{ item.kyc.submittedAt | date:'dd MMM yyyy, HH:mm' }}</span>
                </div>
                <div class="kyc-doc-row">
                  <span class="kyc-doc-label">Skills</span>
                  <span class="kyc-doc-value">{{ (item.skills || []).join(', ') || 'None' }}</span>
                </div>
              </div>

              <!-- Document preview link -->
              <a
                *ngIf="item.kyc?.documentUrl"
                [href]="item.kyc.documentUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="kyc-view-btn"
                [id]="'view-doc-' + item._id"
              >
                <span>🔗</span> View Document
              </a>
              <div *ngIf="!item.kyc?.documentUrl" class="kyc-no-doc">No document URL available</div>

              <!-- Actions -->
              <div class="kyc-actions">
                <button
                  class="btn kyc-approve-btn"
                  (click)="approveKyc(item)"
                  [disabled]="item._kycProcessing"
                  [id]="'approve-' + item._id"
                >
                  <span *ngIf="!item._kycProcessing">✅ Approve</span>
                  <span *ngIf="item._kycProcessing" class="spinner-small"></span>
                </button>
                <button
                  class="btn kyc-reject-btn"
                  (click)="openRejectModal(item)"
                  [disabled]="item._kycProcessing"
                  [id]="'reject-' + item._id"
                >
                  ❌ Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      </ng-container>

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
              <input type="text" id="skills" class="form-control" [(ngModel)]="editSkills" placeholder="plumbing, electrical, cleaning" />
            </div>
            <div class="form-group">
              <label class="form-label" for="address">Address Location</label>
              <input type="text" id="address" class="form-control" [(ngModel)]="editAddress" placeholder="123 Street Name, City" />
            </div>
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label" for="longitude">Longitude</label>
                <input type="number" step="0.000001" id="longitude" class="form-control" [(ngModel)]="editLongitude" />
              </div>
              <div class="form-group">
                <label class="form-label" for="latitude">Latitude</label>
                <input type="number" step="0.000001" id="latitude" class="form-control" [(ngModel)]="editLatitude" />
              </div>
            </div>
            <div class="form-group row-group">
              <label class="form-label">Active Availability Status</label>
              <label class="switch">
                <input type="checkbox" [(ngModel)]="editAvailable" />
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

      <!-- Reject KYC Modal -->
      <div class="modal-overlay" *ngIf="showRejectModal" (click)="closeRejectModal()">
        <div class="glass-panel modal-content modal-reject" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>❌ Reject KYC Verification</h3>
            <button class="modal-close" (click)="closeRejectModal()">×</button>
          </div>
          <div class="modal-body" *ngIf="rejectTarget">
            <div class="reject-worker-info">
              <strong>Worker:</strong> {{ rejectTarget.userId?.name || 'Unknown' }}
              <br>
              <strong>Document:</strong> {{ docTypeLabel(rejectTarget.kyc?.documentType) }}
            </div>
            <div class="form-group" style="margin-top: 16px">
              <label class="form-label" for="rejectionReason">
                Rejection Reason <span class="required">*</span>
              </label>
              <textarea
                id="rejectionReason"
                class="form-control"
                [(ngModel)]="rejectionReason"
                rows="4"
                placeholder="e.g. Document is blurry. Please re-upload a clear, well-lit photo showing all corners."
              ></textarea>
              <small *ngIf="rejectionReasonError" class="form-error">{{ rejectionReasonError }}</small>
            </div>
            <div class="modal-actions">
              <button class="btn btn-secondary" (click)="closeRejectModal()">Cancel</button>
              <button
                class="btn kyc-reject-btn"
                (click)="confirmReject()"
                [disabled]="rejectProcessing"
                id="confirm-reject-btn"
              >
                <span *ngIf="!rejectProcessing">Confirm Rejection</span>
                <span *ngIf="rejectProcessing" class="spinner-small"></span>
              </button>
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
      color: var(--text-main);
    }
    .page-header p {
      color: var(--text-muted);
      font-size: 0.95rem;
      margin-top: 4px;
    }

    /* Tabs */
    .tabs-bar {
      display: flex;
      gap: 8px;
      padding: 10px 14px;
    }
    .tab-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      border-radius: 8px;
      border: 1px solid var(--border);
      background: transparent;
      color: var(--text-muted);
      font-weight: 700;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.18s;
    }
    .tab-btn:hover {
      background: var(--bg-soft);
      color: var(--text-main);
    }
    .tab-btn.active {
      background: rgba(37, 99, 235, 0.1);
      color: var(--primary);
      border-color: rgba(37, 99, 235, 0.3);
    }
    .tab-icon {
      font-size: 1rem;
    }
    .tab-count {
      background: var(--bg-soft);
      color: var(--text-muted);
      border-radius: 20px;
      padding: 2px 8px;
      font-size: 0.75rem;
      font-weight: 800;
    }
    .kyc-badge {
      background: rgba(245, 158, 11, 0.15) !important;
      color: #f59e0b !important;
      animation: pulse-badge 2s infinite;
    }
    @keyframes pulse-badge {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }

    /* Filters */
    .filters-card { padding: 16px 20px; }
    .filter-group { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
    .filter-select { width: 240px; }

    /* Table */
    .table-card { padding: 12px; }
    .prov-name-card { display: flex; align-items: center; gap: 12px; }
    .prov-name-card .avatar,
    .kyc-avatar {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: rgba(37, 99, 235, 0.15);
      border: 1px solid var(--border);
      color: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 0.95rem;
      flex-shrink: 0;
    }
    .prov-details { display: flex; flex-direction: column; }
    .prov-details .name { font-weight: 600; color: var(--text-main); font-size: 0.9rem; }
    .prov-details .email { font-size: 0.78rem; color: var(--text-muted); }
    .skills-list { display: flex; flex-wrap: wrap; gap: 4px; max-width: 200px; }
    .no-skills { font-size: 0.82rem; color: var(--text-muted); }
    .jobs-rating { display: flex; flex-direction: column; gap: 4px; }
    .jobs-rating .rating { font-weight: 500; color: var(--text-main); font-size: 0.88rem; }
    .jobs-rating .jobs { font-size: 0.78rem; color: var(--text-muted); }
    .no-records { text-align: center; padding: 40px 0; color: var(--text-muted); }

    /* KYC chips */
    .kyc-chip {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 700;
    }
    .kyc-approved { background: rgba(16, 185, 129, 0.12); color: #10b981; }
    .kyc-pending  { background: rgba(245, 158, 11, 0.12); color: #f59e0b; }
    .kyc-rejected { background: rgba(239, 68, 68, 0.12);  color: #ef4444; }
    .kyc-not_submitted { background: var(--bg-soft); color: var(--text-muted); }

    /* Pagination */
    .table-pagination { border-top: 1px solid var(--border); margin-top: 12px; padding: 16px 4px 4px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 12px; }
    .row-group {
      flex-direction: row !important;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
      margin-top: 12px;
    }
    .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }

    /* ── KYC QUEUE ─────────────────────────────────────────── */
    .kyc-queue-panel { padding: 24px; }
    .kyc-empty {
      text-align: center;
      padding: 64px 24px;
    }
    .kyc-empty-icon { font-size: 3.5rem; margin-bottom: 16px; }
    .kyc-empty-title { font-size: 1.2rem; font-weight: 700; color: var(--text-main); margin-bottom: 6px; }
    .kyc-empty-sub { color: var(--text-muted); font-size: 0.9rem; }

    .kyc-loading {
      text-align: center;
      padding: 60px 24px;
      color: var(--text-muted);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }
    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid var(--border);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    .spinner-small {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      vertical-align: middle;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .kyc-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 20px;
    }
    .kyc-card {
      padding: 20px;
      border-radius: 14px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      transition: transform 0.18s;
    }
    .kyc-card:hover { transform: translateY(-2px); }

    .kyc-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .kyc-doc-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
      background: var(--bg-soft);
      border-radius: 10px;
      padding: 12px 14px;
    }
    .kyc-doc-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
    }
    .kyc-doc-label {
      font-size: 0.78rem;
      color: var(--text-muted);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .kyc-doc-value {
      font-size: 0.88rem;
      color: var(--text-main);
      font-weight: 600;
      text-align: right;
    }
    .kyc-view-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 16px;
      border-radius: 10px;
      background: rgba(37, 99, 235, 0.08);
      border: 1px solid rgba(37, 99, 235, 0.2);
      color: var(--primary);
      font-weight: 700;
      font-size: 0.88rem;
      text-decoration: none;
      transition: all 0.18s;
    }
    .kyc-view-btn:hover {
      background: rgba(37, 99, 235, 0.15);
      border-color: rgba(37, 99, 235, 0.35);
    }
    .kyc-no-doc {
      font-size: 0.82rem;
      color: var(--text-muted);
      text-align: center;
      padding: 8px;
    }
    .kyc-actions {
      display: flex;
      gap: 10px;
    }
    .kyc-approve-btn {
      flex: 1;
      padding: 10px;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.25);
      color: #10b981;
      border-radius: 10px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.18s;
    }
    .kyc-approve-btn:hover:not(:disabled) {
      background: rgba(16, 185, 129, 0.2);
      border-color: rgba(16, 185, 129, 0.4);
    }
    .kyc-approve-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .kyc-reject-btn {
      flex: 1;
      padding: 10px;
      background: rgba(239, 68, 68, 0.08);
      border: 1px solid rgba(239, 68, 68, 0.2);
      color: #ef4444;
      border-radius: 10px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.18s;
    }
    .kyc-reject-btn:hover:not(:disabled) {
      background: rgba(239, 68, 68, 0.15);
      border-color: rgba(239, 68, 68, 0.35);
    }
    .kyc-reject-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    /* Reject modal */
    .modal-reject { max-width: 500px; }
    .reject-worker-info {
      background: var(--bg-soft);
      border-radius: 10px;
      padding: 12px 16px;
      font-size: 0.9rem;
      color: var(--text-main);
      line-height: 1.7;
    }
    .required { color: #ef4444; }
    .form-error { color: #ef4444; font-size: 0.8rem; display: block; margin-top: 4px; }
    textarea.form-control {
      resize: vertical;
      min-height: 100px;
    }
    .kyc-table-link {
      font-size: 0.78rem;
      color: var(--primary);
      text-decoration: none;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      transition: opacity 0.15s;
    }
    .kyc-table-link:hover {
      text-decoration: underline;
      opacity: 0.85;
    }
  `]
})
export class ProviderListComponent implements OnInit {
  private adminService = inject(AdminService);

  // ── Tab state
  activeTab: 'providers' | 'kyc' = 'providers';

  // ── Providers tab
  providers: any[] = [];
  filterVerified = '';
  filterAvailable = '';
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  totalProviders = 0;

  // ── Edit profile modal
  showModal = false;
  modalProvider: any = null;
  editSkills = '';
  editAddress = '';
  editLongitude = 0;
  editLatitude = 0;
  editAvailable = false;

  // ── KYC Queue tab
  kycQueue: any[] = [];
  kycLoading = false;

  // ── Reject KYC modal
  showRejectModal = false;
  rejectTarget: any = null;
  rejectionReason = '';
  rejectionReasonError = '';
  rejectProcessing = false;

  ngOnInit() {
    this.loadProviders();
  }

  // ── PROVIDERS TAB ────────────────────────────────────────────────────────

  loadProviders() {
    const filters = {
      page: this.currentPage,
      limit: this.pageSize,
      isVerified: this.filterVerified,
      isAvailable: this.filterAvailable
    };
    this.adminService.getProviders(filters).subscribe({
      next: (res) => {
        this.providers = res.data?.items || [];
        this.totalProviders = res.data?.total || 0;
        this.totalPages = Math.ceil(this.totalProviders / this.pageSize) || 1;
      },
      error: (err) => console.error('Error loading providers:', err)
    });
  }

  onFilterChange() { this.currentPage = 1; this.loadProviders(); }
  onPageSizeChange() { this.currentPage = 1; this.loadProviders(); }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadProviders();
    }
  }

  get visiblePages(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, Math.min(this.currentPage - 2, this.totalPages - 4));
    const end = Math.min(this.totalPages, start + 4);
    for (let page = start; page <= end; page++) pages.push(page);
    return pages;
  }

  get pageStart(): number {
    if (this.totalProviders === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get pageEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalProviders);
  }

  toggleVerification(prov: any) {
    const nextStatus = !prov.isVerified;
    this.adminService.verifyProvider(prov._id, nextStatus).subscribe({
      next: () => { prov.isVerified = nextStatus; },
      error: (err) => console.error('Error setting verification status:', err)
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

  closeEditModal() { this.showModal = false; this.modalProvider = null; }

  saveProviderProfile() {
    if (!this.modalProvider) return;
    const payload = {
      skills: this.editSkills.split(',').map(s => s.trim().toLowerCase()).filter(s => s !== ''),
      address: this.editAddress,
      coordinates: [this.editLongitude, this.editLatitude],
      isAvailable: this.editAvailable
    };
    this.adminService.updateProvider(this.modalProvider._id, payload).subscribe({
      next: () => { this.closeEditModal(); this.loadProviders(); },
      error: (err) => console.error('Error updating provider profile:', err)
    });
  }

  // ── KYC QUEUE TAB ─────────────────────────────────────────────────────────

  switchToKycTab() {
    this.activeTab = 'kyc';
    this.loadKycQueue();
  }

  loadKycQueue() {
    this.kycLoading = true;
    // Fetch providers (up to 100) and client-side filter by kyc.status === 'pending'
    this.adminService.getProviders({ page: 1, limit: 100 }).subscribe({
      next: (res) => {
        const all = res.data?.items || [];
        this.kycQueue = all.filter((p: any) => p.kyc?.status === 'pending');
        this.kycLoading = false;
      },
      error: (err) => {
        console.error('Error loading KYC queue:', err);
        this.kycLoading = false;
      }
    });
  }

  approveKyc(item: any) {
    item._kycProcessing = true;
    const userId = item.userId?._id || item.userId;
    this.adminService.reviewKyc(userId, 'approve').subscribe({
      next: () => {
        this.kycQueue = this.kycQueue.filter(q => q._id !== item._id);
        item._kycProcessing = false;
        this.loadProviders(); // Refresh providers tab in background
      },
      error: (err) => {
        console.error('Error approving KYC:', err);
        item._kycProcessing = false;
      }
    });
  }

  openRejectModal(item: any) {
    this.rejectTarget = item;
    this.rejectionReason = '';
    this.rejectionReasonError = '';
    this.showRejectModal = true;
  }

  closeRejectModal() {
    this.showRejectModal = false;
    this.rejectTarget = null;
    this.rejectionReason = '';
    this.rejectionReasonError = '';
  }

  confirmReject() {
    if (!this.rejectionReason.trim()) {
      this.rejectionReasonError = 'Rejection reason is required.';
      return;
    }
    this.rejectionReasonError = '';
    this.rejectProcessing = true;
    const userId = this.rejectTarget.userId?._id || this.rejectTarget.userId;
    this.adminService.reviewKyc(userId, 'reject', this.rejectionReason.trim()).subscribe({
      next: () => {
        this.kycQueue = this.kycQueue.filter(q => q._id !== this.rejectTarget._id);
        this.rejectProcessing = false;
        this.closeRejectModal();
        this.loadProviders();
      },
      error: (err) => {
        console.error('Error rejecting KYC:', err);
        this.rejectProcessing = false;
      }
    });
  }

  // ── DISPLAY HELPERS ───────────────────────────────────────────────────────

  kycLabel(status: string | undefined): string {
    const map: Record<string, string> = {
      approved: '✅ Approved',
      pending: '⏳ Pending',
      rejected: '❌ Rejected',
      not_submitted: '— Not Submitted',
    };
    return map[status || 'not_submitted'] || '—';
  }

  kycChipClass(status: string | undefined): string {
    return `kyc-${status || 'not_submitted'}`;
  }

  docTypeLabel(type: string | undefined): string {
    const map: Record<string, string> = {
      aadhaar: 'Aadhaar Card',
      pan: 'PAN Card',
      passport: 'Passport',
      driving_license: 'Driving License',
    };
    return map[type || ''] || type || '—';
  }
}
