import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-booking-monitor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="booking-wrapper animate-fade-in">
      <div class="page-header">
        <h1>Booking Live Monitor</h1>
        <p>Audit booking workflow queues, review assignees, and perform administrative overrides</p>
      </div>

      <!-- Filters -->
      <div class="glass-panel filters-card">
        <div class="filter-group">
          <select class="form-control filter-select" [(ngModel)]="filterStatus" (change)="onFilterChange()">
            <option value="">All Statuses</option>
            <option value="requested">Requested (Matching)</option>
            <option value="accepted">Accepted / In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      <!-- Bookings Table -->
      <div class="glass-panel table-card">
        <div class="table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Customer</th>
                <th>Service Name</th>
                <th>Worker/Provider</th>
                <th>Status</th>
                <th>Cost</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let booking of bookings">
                <td>
                  <span class="booking-id-txt" (click)="openDetailsModal(booking._id)">
                    #{{ booking._id.substring(18) }}
                  </span>
                </td>
                <td>{{ booking.userId?.name || 'Customer' }}</td>
                <td>{{ booking.serviceId?.name || 'Service' }}</td>
                <td>{{ booking.providerId?.userId?.name || 'Not assigned' }}</td>
                <td>
                  <span class="badge" [ngClass]="getStatusClass(booking.status)">{{ booking.status }}</span>
                </td>
                <td>₹{{ booking.totalPrice || booking.serviceId?.basePrice || 0 }}</td>
                <td>
                  <div class="row-actions">
                    <button (click)="openDetailsModal(booking._id)" class="btn btn-secondary btn-small">🔍 View</button>
                    <button
                      *ngIf="canCancel(booking.status)"
                      (click)="openCancelModal(booking)"
                      class="btn btn-danger btn-small"
                    >
                      ❌ Force Cancel
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="bookings.length === 0">
                <td colspan="7" class="no-records">No bookings found matching filters.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="table-pagination">
          <div class="pagination-summary">
            Showing {{ pageStart }}-{{ pageEnd }} of {{ totalBookings }} bookings
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

      <!-- Booking Details Modal -->
      <div class="modal-overlay" *ngIf="showDetailsModal" (click)="closeDetailsModal()">
        <div class="glass-panel modal-content details-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Booking Details #{{ selectedBooking?._id?.substring(18) }}</h3>
            <button class="modal-close" (click)="closeDetailsModal()">×</button>
          </div>
          <div class="modal-body" *ngIf="selectedBooking">
            <div class="details-section">
              <h4>📋 Workflow Info</h4>
              <div class="details-grid">
                <div><span class="detail-label">Status:</span> <span class="badge" [ngClass]="getStatusClass(selectedBooking.status)">{{ selectedBooking.status }}</span></div>
                <div><span class="detail-label">Payment Status:</span> <span class="badge" [ngClass]="selectedBooking.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'">{{ selectedBooking.paymentStatus }}</span></div>
                <div><span class="detail-label">Created At:</span> <span>{{ selectedBooking.createdAt | date:'medium' }}</span></div>
                <div><span class="detail-label">Schedule Time:</span> <span>{{ (selectedBooking.scheduleTime | date:'medium') || 'Instant Match' }}</span></div>
              </div>
            </div>

            <div class="details-section">
              <h4>👥 Counterparties</h4>
              <div class="details-grid">
                <div>
                  <span class="detail-label">Customer:</span>
                  <div>{{ selectedBooking.userId?.name }} ({{ selectedBooking.userId?.email }})</div>
                  <small>{{ selectedBooking.userId?.phone }}</small>
                </div>
                <div>
                  <span class="detail-label">Provider/Worker:</span>
                  <div *ngIf="selectedBooking.providerId?.userId">
                    {{ selectedBooking.providerId.userId.name }} ({{ selectedBooking.providerId.userId.email }})
                  </div>
                  <div *ngIf="!selectedBooking.providerId?.userId" class="text-muted">Not assigned / Matching</div>
                </div>
              </div>
            </div>

            <div class="details-section">
              <h4>📍 Location & Routing Coordinates</h4>
              <div class="details-grid">
                <div>
                  <span class="detail-label">Booking Address:</span>
                  <div>{{ selectedBooking.bookingLocation?.address || 'No address' }}</div>
                </div>
                <div>
                  <span class="detail-label">Coordinates [Lon, Lat]:</span>
                  <div>{{ selectedBooking.bookingLocation?.coordinates?.join(', ') || 'N/A' }}</div>
                </div>
              </div>
            </div>

            <div *ngIf="selectedBooking.cancellationReason" class="details-section cancellation-note">
              <h4>⚠️ Cancellation Overrides</h4>
              <p><strong>Reason:</strong> {{ selectedBooking.cancellationReason }}</p>
              <small *ngIf="selectedBooking.cancelledAt">Cancelled At: {{ selectedBooking.cancelledAt | date:'medium' }}</small>
            </div>

            <div class="modal-actions">
              <button class="btn btn-secondary" (click)="closeDetailsModal()">Close</button>
              <button
                *ngIf="canCancel(selectedBooking.status)"
                class="btn btn-danger"
                (click)="openCancelModal(selectedBooking)"
              >
                Force Cancel Booking
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Force Cancel Modal -->
      <div class="modal-overlay" *ngIf="showCancelModal" (click)="closeCancelModal()">
        <div class="glass-panel modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Override Cancellation</h3>
            <button class="modal-close" (click)="closeCancelModal()">×</button>
          </div>
          <div class="modal-body" *ngIf="cancellingBooking">
            <p class="modal-prompt">Provide cancellation rationale for booking <strong>#{{ cancellingBooking._id.substring(18) }}</strong>.</p>
            
            <div class="form-group">
              <label class="form-label" for="cancelReason">Cancellation Reason</label>
              <input
                type="text"
                id="cancelReason"
                class="form-control"
                [(ngModel)]="cancellationReason"
                placeholder="Admin override / Customer complaint"
                required
              />
            </div>

            <div class="modal-actions">
              <button class="btn btn-secondary" (click)="closeCancelModal()">Cancel</button>
              <button
                class="btn btn-danger"
                [disabled]="!cancellationReason"
                (click)="confirmCancellation()"
              >
                Override & Cancel Booking
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .booking-wrapper {
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
    .booking-id-txt {
      font-family: monospace;
      color: #818cf8;
      cursor: pointer;
      font-weight: 600;
    }
    .booking-id-txt:hover {
      text-decoration: underline;
    }
    .row-actions {
      display: flex;
      gap: 8px;
    }
    .no-records {
      text-align: center;
      padding: 40px 0;
      color: var(--text-muted);
    }
    .table-pagination {
      border-top: 1px solid var(--border);
      margin-top: 12px;
      padding: 16px 4px 4px;
    }
    .details-modal {
      max-width: 600px;
    }
    .details-section {
      border-bottom: 1px solid var(--border);
      padding: 16px 0;
    }
    .details-section:last-child {
      border-bottom: none;
    }
    .details-section h4 {
      font-size: 0.95rem;
      font-weight: 600;
      margin-bottom: 12px;
      color: var(--text-main);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      font-size: 0.925rem;
    }
    .detail-label {
      color: var(--text-muted);
      font-weight: 500;
      margin-right: 4px;
    }
    .cancellation-note {
      background: rgba(244, 63, 94, 0.05);
      border-radius: 8px;
      padding: 12px;
      border: 1px solid rgba(244, 63, 94, 0.2);
    }
    .modal-prompt {
      font-size: 0.95rem;
      color: var(--text-muted);
      margin-bottom: 20px;
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
    }
  `]
})
export class BookingMonitorComponent {
  private adminService = inject(AdminService);

  bookings: any[] = [];
  filterStatus = '';
  
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  totalBookings = 0;

  showDetailsModal = false;
  selectedBooking: any = null;

  showCancelModal = false;
  cancellingBooking: any = null;
  cancellationReason = '';

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    const filters = {
      page: this.currentPage,
      limit: this.pageSize,
      status: this.filterStatus
    };

    this.adminService.getBookings(filters).subscribe({
      next: (res) => {
        this.bookings = res.data?.items || [];
        this.totalBookings = res.data?.total || 0;
        this.totalPages = Math.ceil(this.totalBookings / this.pageSize) || 1;
      },
      error: (err) => {
        console.error('Error fetching bookings:', err);
      }
    });
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadBookings();
    }
  }

  onFilterChange() {
    this.currentPage = 1;
    this.loadBookings();
  }

  onPageSizeChange() {
    this.currentPage = 1;
    this.loadBookings();
  }

  get visiblePages(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, Math.min(this.currentPage - 2, this.totalPages - 4));
    const end = Math.min(this.totalPages, start + 4);
    for (let page = start; page <= end; page++) pages.push(page);
    return pages;
  }

  get pageStart(): number {
    if (this.totalBookings === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get pageEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalBookings);
  }

  getStatusClass(status: string): string {
    if (status === 'requested') return 'badge-warning';
    if (status === 'pending') return 'badge-primary';
    if (status === 'accepted') return 'badge-accent';
    if (status === 'completed') return 'badge-success';
    return 'badge-danger';
  }

  canCancel(status: string): boolean {
    return !['cancelled', 'completed', 'expired'].includes(status);
  }

  openDetailsModal(id: string) {
    this.adminService.getBookingDetails(id).subscribe({
      next: (res) => {
        this.selectedBooking = res.data?.booking;
        this.showDetailsModal = true;
      },
      error: (err) => {
        console.error('Error fetching booking details:', err);
      }
    });
  }

  closeDetailsModal() {
    this.showDetailsModal = false;
    this.selectedBooking = null;
  }

  openCancelModal(booking: any) {
    this.cancellingBooking = booking;
    this.cancellationReason = '';
    this.showCancelModal = true;
    this.closeDetailsModal(); // close details modal if open
  }

  closeCancelModal() {
    this.showCancelModal = false;
    this.cancellingBooking = null;
    this.cancellationReason = '';
  }

  confirmCancellation() {
    if (!this.cancellingBooking) return;

    this.adminService.overrideCancelBooking(this.cancellingBooking._id, this.cancellationReason).subscribe({
      next: () => {
        this.closeCancelModal();
        this.loadBookings();
      },
      error: (err) => {
        console.error('Error cancelling booking:', err);
      }
    });
  }
}
