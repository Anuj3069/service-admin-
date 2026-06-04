import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-payment-reconciler',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="payment-wrapper animate-fade-in">
      <div class="page-header">
        <h1>Payment Ledger</h1>
        <p>Audit order billing statements, track Cashfree transaction IDs, and run payment status overrides</p>
      </div>

      <!-- Filters -->
      <div class="glass-panel filters-card">
        <div class="filter-group">
          <select class="form-control filter-select" [(ngModel)]="filterStatus" (change)="loadPayments()">
            <option value="">All Payment Statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      <!-- Payments Table -->
      <div class="glass-panel table-card">
        <div class="table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Booking ID</th>
                <th>User / Payer</th>
                <th>Amount</th>
                <th>Cashfree Order ID</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of payments">
                <td><span class="mono-txt">#{{ p._id.substring(18) }}</span></td>
                <td><span class="mono-txt">#{{ p.bookingId?._id ? p.bookingId._id.substring(18) : (p.bookingId ? p.bookingId.substring(18) : 'N/A') }}</span></td>
                <td>
                  <div class="user-details">
                    <span class="name">{{ p.userId?.name || 'Customer' }}</span>
                    <span class="email">{{ p.userId?.email || 'N/A' }}</span>
                  </div>
                </td>
                <td>₹{{ p.amount }}</td>
                <td><span class="mono-txt">{{ p.cfOrderId || 'N/A' }}</span></td>
                <td>
                  <span class="badge" [ngClass]="getStatusClass(p.status)">{{ p.status }}</span>
                </td>
                <td>{{ p.createdAt | date:'medium' }}</td>
                <td>
                  <div class="action-buttons">
                    <button
                      *ngIf="p.status !== 'paid'"
                      (click)="overrideStatus(p._id, 'paid')"
                      class="btn btn-primary btn-small btn-success-action"
                    >
                      ✅ Force Paid
                    </button>
                    <button
                      *ngIf="p.status === 'pending'"
                      (click)="overrideStatus(p._id, 'failed')"
                      class="btn btn-danger btn-small"
                    >
                      ❌ Mark Failed
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="payments.length === 0">
                <td colspan="8" class="no-records">No payments found matching filters.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="table-pagination" *ngIf="totalPages > 1">
          <button [disabled]="currentPage === 1" (click)="changePage(currentPage - 1)" class="btn btn-secondary btn-small">Previous</button>
          <span class="page-indicator">Page {{ currentPage }} of {{ totalPages }}</span>
          <button [disabled]="currentPage === totalPages" (click)="changePage(currentPage + 1)" class="btn btn-secondary btn-small">Next</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .payment-wrapper {
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
    .mono-txt {
      font-family: monospace;
      color: var(--text-muted);
      font-weight: 500;
    }
    .user-details {
      display: flex;
      flex-direction: column;
    }
    .user-details .name {
      font-weight: 500;
      color: #fff;
    }
    .user-details .email {
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    .action-buttons {
      display: flex;
      gap: 8px;
    }
    .btn-success-action {
      background: var(--success);
    }
    .btn-success-action:hover {
      background: #059669;
    }
    .no-records {
      text-align: center;
      padding: 40px 0;
      color: var(--text-muted);
    }
    .table-pagination {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 12px 4px 12px;
      border-top: 1px solid var(--border);
      margin-top: 12px;
    }
    .page-indicator {
      font-size: 0.875rem;
      color: var(--text-muted);
    }
  `]
})
export class PaymentReconcilerComponent {
  private adminService = inject(AdminService);

  payments: any[] = [];
  filterStatus = '';
  
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  totalPayments = 0;

  ngOnInit() {
    this.loadPayments();
  }

  loadPayments() {
    const filters = {
      page: this.currentPage,
      limit: this.pageSize,
      status: this.filterStatus
    };

    this.adminService.getPayments(filters).subscribe({
      next: (res) => {
        this.payments = res.data?.items || [];
        this.totalPayments = res.data?.total || 0;
        this.totalPages = Math.ceil(this.totalPayments / this.pageSize) || 1;
      },
      error: (err) => {
        console.error('Error fetching payments:', err);
      }
    });
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadPayments();
    }
  }

  getStatusClass(status: string): string {
    if (status === 'paid') return 'badge-success';
    if (status === 'failed') return 'badge-danger';
    return 'badge-warning';
  }

  overrideStatus(id: string, status: string) {
    if (confirm(`Are you sure you want to force set the payment status to '${status}'?`)) {
      this.adminService.overridePaymentStatus(id, status).subscribe({
        next: () => {
          this.loadPayments();
        },
        error: (err) => {
          console.error('Error overriding payment status:', err);
        }
      });
    }
  }
}
