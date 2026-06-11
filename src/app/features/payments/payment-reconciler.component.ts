import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-payment-reconciler',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col gap-6 animate-fade-in">

      <!-- ─── Page Header ──────────────────────────────────── -->
      <div class="animate-slide-up">
        <div class="flex items-center gap-3 mb-1.5">
          <div class="w-1.5 h-7 rounded-full bg-gradient-to-b from-primary to-accent"></div>
          <h1 class="text-2xl font-black tracking-tight text-textMain">Payment Ledger</h1>
        </div>
        <p class="text-sm pl-5 text-textMuted">Audit order billing statements, track Cashfree transaction IDs, and run payment status overrides</p>
      </div>

      <!-- ─── Filters ───────────────────────────────────────── -->
      <div class="p-4 rounded-2xl border border-border bg-bgCard flex flex-wrap gap-4 items-center justify-between animate-slide-up [animation-delay:60ms] shadow-sm">
        <div class="flex flex-wrap gap-3 items-center">
          <div class="flex items-center gap-2 text-xs font-bold text-textMuted">
            <span>🔧</span> Filters
          </div>
          <div class="h-4 w-px bg-border"></div>

          <select class="px-3 py-2 rounded-xl text-xs font-semibold border border-border bg-bgSoft text-textMain outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer"
                  [(ngModel)]="filterStatus" (change)="onFilterChange()">
            <option value="">All Payment Statuses</option>
            <option value="pending">⏳ Pending</option>
            <option value="paid">🟢 Paid</option>
            <option value="failed">🔴 Failed</option>
          </select>
        </div>

        <div class="text-[10px] font-bold uppercase tracking-wider text-textSubtle">
          {{ totalPayments }} payments
        </div>
      </div>

      <!-- ─── Payments Table ────────────────────────────────── -->
      <div class="rounded-2xl border border-border bg-bgCard overflow-hidden animate-slide-up [animation-delay:120ms] shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-left min-w-[880px]">
            <thead>
              <tr class="bg-bgSoft">
                <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b border-border text-textMuted">Payment ID</th>
                <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b border-border text-textMuted">Booking ID</th>
                <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b border-border text-textMuted">User / Payer</th>
                <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b border-border text-textMuted">Amount</th>
                <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b border-border text-textMuted">Cashfree Order ID</th>
                <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b border-border text-textMuted">Status</th>
                <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b border-border text-textMuted">Created At</th>
                <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b border-border text-textMuted">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of payments"
                  class="border-b border-border hover:bg-bgSoft/40 group transition-colors duration-150">
                <td class="px-6 py-4">
                  <span class="font-mono text-xs font-bold text-textSubtle">#{{ p._id.substring(18).toUpperCase() }}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="font-mono text-xs font-bold text-primary">
                    #{{ p.bookingId?._id ? p.bookingId._id.substring(18).toUpperCase() : (p.bookingId ? p.bookingId.substring(18).toUpperCase() : 'N/A') }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex flex-col gap-0.5">
                    <span class="text-xs font-semibold text-textMain">{{ p.userId?.name || 'Customer' }}</span>
                    <span class="text-[10px] text-textMuted">{{ p.userId?.email || 'N/A' }}</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="text-xs font-black tabular-nums text-textMain">₹{{ p.amount }}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="font-mono text-xs text-textMuted">{{ p.cfOrderId || 'N/A' }}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border"
                        [ngClass]="getStatusClass(p.status)">
                    {{ p.status }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span class="text-xs text-textMuted">{{ p.createdAt | date:'dd MMM yyyy, HH:mm' }}</span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <button *ngIf="p.status !== 'paid'"
                            (click)="overrideStatus(p._id, 'paid')"
                            class="px-3 py-1.5 rounded-xl border border-success/20 bg-success/5 text-success text-xs font-bold transition-all hover:bg-success/10 hover:border-success/40 active:scale-95">
                      ✅ Force Paid
                    </button>
                    <button *ngIf="p.status === 'pending'"
                            (click)="overrideStatus(p._id, 'failed')"
                            class="px-3 py-1.5 rounded-xl border border-danger/20 bg-danger/5 text-danger text-xs font-bold transition-all hover:bg-danger/10 hover:border-danger/40 active:scale-95">
                      ❌ Mark Failed
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="payments.length === 0">
                <td colspan="8" class="py-16 text-center">
                  <div class="flex flex-col items-center gap-3">
                    <span class="text-4xl">💸</span>
                    <p class="text-sm font-bold text-textMuted">No payments found matching filters.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-t border-border">
          <div class="text-xs font-semibold text-textMuted">
            Showing <span class="font-black text-textMain">{{ pageStart }}–{{ pageEnd }}</span> of
            <span class="font-black text-textMain">{{ totalPayments }}</span> payments
          </div>
          <div class="flex items-center gap-2">
            <select class="px-2.5 py-1.5 rounded-lg border border-border bg-bgSoft text-textMain text-xs font-bold outline-none cursor-pointer"
                    [(ngModel)]="pageSize" (change)="onPageSizeChange()">
              <option [ngValue]="10">10 / page</option>
              <option [ngValue]="25">25 / page</option>
              <option [ngValue]="50">50 / page</option>
            </select>
            <button [disabled]="currentPage === 1" (click)="changePage(currentPage - 1)"
                    class="w-8 h-8 rounded-lg border border-border bg-bgSoft text-textMain flex items-center justify-center text-xs font-black hover:bg-bgSoft/70 transition-colors disabled:opacity-40">‹</button>
            <div class="flex gap-1">
              <button *ngFor="let page of visiblePages"
                      class="w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-black transition-all duration-150"
                      [ngClass]="page === currentPage
                        ? 'bg-primary border-primary text-white shadow-lg shadow-primary/25'
                        : 'bg-bgSoft border-border text-textMain hover:bg-bgSoft/70'"
                      (click)="changePage(page)">
                {{ page }}
              </button>
            </div>
            <button [disabled]="currentPage === totalPages" (click)="changePage(currentPage + 1)"
                    class="w-8 h-8 rounded-lg border border-border bg-bgSoft text-textMain flex items-center justify-center text-xs font-black hover:bg-bgSoft/70 transition-colors disabled:opacity-40">›</button>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: []
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

  onFilterChange() {
    this.currentPage = 1;
    this.loadPayments();
  }

  onPageSizeChange() {
    this.currentPage = 1;
    this.loadPayments();
  }

  get visiblePages(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, Math.min(this.currentPage - 2, this.totalPages - 4));
    const end = Math.min(this.totalPages, start + 4);
    for (let page = start; page <= end; page++) pages.push(page);
    return pages;
  }

  get pageStart(): number {
    if (this.totalPayments === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get pageEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalPayments);
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
