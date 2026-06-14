import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-booking-monitor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col gap-6 animate-fade-in">

      <!-- ─── Page Header ──────────────────────────────────── -->
      <div class="animate-slide-up">
        <div class="flex items-center gap-3 mb-1.5">
          <div class="w-1.5 h-7 rounded-full bg-gradient-to-b from-primary to-accent"></div>
          <h1 class="text-2xl font-black tracking-tight text-textMain">Booking Monitor</h1>
        </div>
        <p class="text-sm pl-5 text-textMuted">Live booking queue, workflow audit &amp; administrative overrides</p>
      </div>

      <!-- ─── Status Filter Chips ───────────────────────────── -->
      <div class="flex flex-wrap gap-2 animate-slide-up [animation-delay:60ms]">
        <button *ngFor="let chip of statusChips"
                class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-200 active:scale-95 shadow-sm"
                [ngClass]="filterStatus === chip.value
                  ? chip.activeClass
                  : 'bg-bgCard border-border text-textMuted hover:border-borderStrong hover:text-textMain'"
                (click)="filterStatus = chip.value; onFilterChange()">
          <span>{{ chip.icon }}</span>
          <span>{{ chip.label }}</span>
          <span *ngIf="chip.value === '' && totalBookings > 0"
                class="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-primary/10 text-primary">{{ totalBookings }}</span>
        </button>
      </div>

      <!-- ─── Bookings Table ────────────────────────────────── -->
      <div class="rounded-2xl border border-border bg-bgCard overflow-hidden animate-slide-up [animation-delay:120ms] shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-left min-w-[880px]">
            <thead>
              <tr class="bg-bgSoft">
                <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b border-border text-textMuted">Booking ID</th>
                <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b border-border text-textMuted">Customer</th>
                <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b border-border text-textMuted">Service</th>
                <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b border-border text-textMuted">Worker</th>
                <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b border-border text-textMuted">Status</th>
                <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b border-border text-textMuted">Cost</th>
                <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b border-border text-textMuted">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let booking of bookings; let i = index"
                  class="border-b border-border hover:bg-bgSoft/40 group transition-colors duration-150">

                <!-- Booking ID -->
                <td class="px-6 py-4">
                  <button class="flex items-center gap-1.5 font-mono text-xs font-bold text-primary hover:underline hover:scale-105 active:scale-95 transition-all"
                          (click)="openDetailsModal(booking._id)">
                    <span class="text-[10px] text-textSubtle">#</span>{{ booking._id.slice(-8).toUpperCase() }}
                  </button>
                </td>

                <!-- Customer -->
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-black flex-shrink-0 bg-gradient-to-br from-warning to-amber-500 shadow-sm">
                      {{ (booking.userId?.name || 'C')[0].toUpperCase() }}
                    </div>
                    <span class="text-xs font-semibold text-textMain">{{ booking.userId?.name || 'Customer' }}</span>
                  </div>
                </td>

                <!-- Service -->
                <td class="px-6 py-4">
                  <span class="text-xs font-semibold text-textMain">{{ booking.serviceId?.name || 'Service' }}</span>
                </td>

                <!-- Worker -->
                <td class="px-6 py-4">
                  <div *ngIf="booking.providerId?.userId" class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-black flex-shrink-0 bg-gradient-to-br from-success to-emerald-500 shadow-sm">
                      {{ (booking.providerId.userId.name || 'W')[0].toUpperCase() }}
                    </div>
                    <span class="text-xs font-semibold text-textMain">{{ booking.providerId.userId.name }}</span>
                  </div>
                  <span *ngIf="!booking.providerId?.userId"
                        class="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-warning/10 text-warning border border-warning/20">
                    🔄 Matching
                  </span>
                </td>

                <!-- Status badge -->
                <td class="px-6 py-4">
                  <span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border"
                        [ngClass]="getStatusClass(booking.status)">
                    {{ booking.status }}
                  </span>
                </td>

                <!-- Cost -->
                <td class="px-6 py-4">
                  <span class="text-sm font-black tabular-nums text-textMain">
                    ₹{{ booking.totalPrice || booking.serviceId?.basePrice || 0 }}
                  </span>
                </td>

                <!-- Actions -->
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <button (click)="openDetailsModal(booking._id)"
                            class="px-3 py-1.5 rounded-xl border border-border bg-bgSoft text-textMain text-xs font-bold transition-all hover:bg-primary/5 hover:text-primary hover:border-primary/30 active:scale-95">
                      🔍 View
                    </button>
                    <button *ngIf="canCancel(booking.status)"
                            (click)="openCancelModal(booking)"
                            class="px-3 py-1.5 rounded-xl border border-danger/20 bg-danger/5 text-danger text-xs font-bold transition-all hover:bg-danger/10 hover:border-danger/40 active:scale-95">
                      ❌ Cancel
                    </button>
                  </div>
                </td>
              </tr>

              <tr *ngIf="bookings.length === 0">
                <td colspan="7" class="py-16 text-center">
                  <div class="flex flex-col items-center gap-3">
                    <span class="text-4xl">📋</span>
                    <p class="text-sm font-bold text-textMuted">No bookings found.</p>
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
            <span class="font-black text-textMain">{{ totalBookings }}</span> bookings
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

      <!-- ══════════════════════════════════════════════════════
           MODAL: BOOKING DETAILS
           ══════════════════════════════════════════════════════ -->
      <div *ngIf="showDetailsModal"
           class="fixed inset-0 flex items-center justify-center z-50 p-6 bg-black/60 backdrop-blur-md animate-fade-in"
           (click)="closeDetailsModal()">
        <div class="w-full max-w-2xl rounded-3xl border border-border bg-bgCard flex flex-col gap-0 overflow-hidden animate-scale-in shadow-2xl"
             (click)="$event.stopPropagation()">

          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-5 border-b border-border bg-bgSoft">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center text-base bg-primary/10 text-primary">📋</div>
              <div>
                <h3 class="text-base font-black text-textMain">Booking Details</h3>
                <p class="text-[10px] font-mono text-textMuted">#{{ selectedBooking?._id?.slice(-12).toUpperCase() }}</p>
              </div>
            </div>
            <button class="w-8 h-8 rounded-xl border border-border bg-bgCard text-textMuted flex items-center justify-center font-bold text-sm hover:bg-bgSoft/70 transition-all active:scale-95"
                    (click)="closeDetailsModal()">✕</button>
          </div>

          <div *ngIf="selectedBooking" class="p-6 flex flex-col gap-5">
            <!-- Status + Payment row -->
            <div class="grid grid-cols-2 gap-4">
              <div class="p-4 rounded-xl border border-border bg-bgSoft flex flex-col gap-2">
                <span class="text-[9px] font-black uppercase tracking-widest text-textSubtle">Booking Status</span>
                <span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase w-fit border"
                      [ngClass]="getStatusClass(selectedBooking.status)">{{ selectedBooking.status }}</span>
              </div>
              <div class="p-4 rounded-xl border border-border bg-bgSoft flex flex-col gap-2">
                <span class="text-[9px] font-black uppercase tracking-widest text-textSubtle">Payment</span>
                <span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase w-fit border"
                      [ngClass]="selectedBooking.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'">
                  {{ selectedBooking.paymentStatus || 'pending' }}
                </span>
              </div>
            </div>

            <!-- Section: Counterparties -->
            <div>
              <div class="flex items-center gap-2 mb-3">
                <span class="text-[9px] font-black uppercase tracking-widest text-textSubtle">👥 Parties</span>
                <div class="flex-1 h-px bg-border"></div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div class="p-4 rounded-xl border border-border bg-bgSoft">
                  <div class="text-[9px] font-black uppercase tracking-widest mb-1.5 text-textSubtle">Customer</div>
                  <div class="text-sm font-bold text-textMain">{{ selectedBooking.userId?.name }}</div>
                  <div class="text-[10px] text-textMuted">{{ selectedBooking.userId?.email }}</div>
                  <div class="text-[10px] text-textMuted" *ngIf="selectedBooking.userId?.phone">📞 {{ selectedBooking.userId?.phone }}</div>
                </div>
                <div class="p-4 rounded-xl border border-border bg-bgSoft">
                  <div class="text-[9px] font-black uppercase tracking-widest mb-1.5 text-textSubtle">Worker / Provider</div>
                  <ng-container *ngIf="selectedBooking.providerId?.userId; else noWorker">
                    <div class="text-sm font-bold text-textMain">{{ selectedBooking.providerId.userId.name }}</div>
                    <div class="text-[10px] text-textMuted">{{ selectedBooking.providerId.userId.email }}</div>
                  </ng-container>
                  <ng-template #noWorker>
                    <span class="text-xs italic text-textSubtle">Not assigned / Matching</span>
                  </ng-template>
                </div>
              </div>
            </div>

            <!-- Section: Dates -->
            <div>
              <div class="flex items-center gap-2 mb-3">
                <span class="text-[9px] font-black uppercase tracking-widest text-textSubtle">📅 Timeline</span>
                <div class="flex-1 h-px bg-border"></div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div class="p-3 rounded-xl border border-border bg-bgSoft">
                  <div class="text-[9px] font-black uppercase tracking-widest mb-1 text-textSubtle">Created At</div>
                  <div class="text-xs font-semibold text-textMain">{{ selectedBooking.createdAt | date:'dd MMM yyyy, HH:mm' }}</div>
                </div>
                <div class="p-3 rounded-xl border border-border bg-bgSoft">
                  <div class="text-[9px] font-black uppercase tracking-widest mb-1 text-textSubtle">Schedule Time</div>
                  <div class="text-xs font-semibold text-textMain">{{ (selectedBooking.scheduleTime | date:'dd MMM, HH:mm') || 'Instant' }}</div>
                </div>
              </div>
            </div>

            <!-- Section: Location -->
            <div>
              <div class="flex items-center gap-2 mb-3">
                <span class="text-[9px] font-black uppercase tracking-widest text-textSubtle">📍 Location</span>
                <div class="flex-1 h-px bg-border"></div>
              </div>
              <div class="p-4 rounded-xl border border-border bg-bgSoft">
                <div class="text-xs font-medium text-textMain">{{ selectedBooking.bookingLocation?.address || 'No address provided' }}</div>
                <div class="text-[10px] mt-1 font-mono text-textMuted" *ngIf="selectedBooking.bookingLocation?.coordinates">
                  {{ selectedBooking.bookingLocation.coordinates.join(', ') }}
                </div>
              </div>
            </div>

            <!-- Cancellation note if present -->
            <div *ngIf="selectedBooking.cancellationReason"
                 class="p-4 rounded-xl border border-danger/20 bg-danger/5 text-textMain">
              <div class="text-[9px] font-black uppercase tracking-widest mb-1.5 text-danger">{{ isCustomerCancellation(selectedBooking) ? 'Customer Cancellation' : 'Admin Cancellation' }}</div>
              <div class="text-xs font-semibold">{{ selectedBooking.cancellationReason }}</div>
              <div class="text-[10px] mt-1 text-textMuted" *ngIf="selectedBooking.cancelledAt">
                Cancelled: {{ selectedBooking.cancelledAt | date:'dd MMM yyyy, HH:mm' }}
              </div>
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-3 pt-4 border-t border-border">
              <button class="px-5 py-2.5 rounded-xl border border-border bg-bgSoft text-textMain text-xs font-bold hover:bg-bgSoft/70 active:scale-95 transition-all"
                      (click)="closeDetailsModal()">Close</button>
              <button *ngIf="canCancel(selectedBooking.status)"
                      class="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-danger hover:bg-red-600 shadow-lg shadow-danger/25 active:scale-95 transition-all"
                      (click)="openCancelModal(selectedBooking)">
                ❌ Force Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════
           MODAL: FORCE CANCEL
           ══════════════════════════════════════════════════════ -->
      <div *ngIf="showCancelModal"
           class="fixed inset-0 flex items-center justify-center z-50 p-6 bg-black/60 backdrop-blur-md animate-fade-in"
           (click)="closeCancelModal()">
        <div class="w-full max-w-md rounded-3xl border border-border bg-bgCard flex flex-col gap-5 p-6 animate-scale-in shadow-2xl"
             (click)="$event.stopPropagation()">

          <div class="flex items-center justify-between pb-4 border-b border-border">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center text-base bg-danger/10 text-danger">⚠️</div>
              <div>
                <h3 class="text-base font-black text-textMain">Force Cancel Booking</h3>
                <p class="text-[10px] font-mono text-textMuted">#{{ cancellingBooking?._id?.slice(-8).toUpperCase() }}</p>
              </div>
            </div>
            <button class="w-8 h-8 rounded-xl border border-border bg-bgSoft text-textMuted flex items-center justify-center font-bold text-sm hover:bg-bgSoft/70 active:scale-95 transition-all"
                    (click)="closeCancelModal()">✕</button>
          </div>

          <div class="flex flex-col gap-4" *ngIf="cancellingBooking">
            <div class="p-3 rounded-xl border border-danger/20 bg-danger/5 text-xs font-semibold text-textMain">
              This is an <strong>admin override</strong>. The customer and worker will be notified of this cancellation.
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-[10px] font-black uppercase tracking-widest text-textMuted">
                Cancellation Reason <span class="text-danger">*</span>
              </label>
              <input type="text" class="w-full px-4 py-2.5 rounded-xl border border-border bg-bgSoft text-textMain text-xs font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                     [(ngModel)]="cancellationReason"
                     placeholder="Admin override / Customer complaint..."
                     id="cancelReason" />
            </div>

            <div class="flex justify-end gap-3 pt-2">
              <button class="px-5 py-2.5 rounded-xl border border-border bg-bgSoft text-textMain text-xs font-bold hover:bg-bgSoft/70 active:scale-95 transition-all"
                      (click)="closeCancelModal()">Cancel</button>
              <button class="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-danger hover:bg-red-600 shadow-lg shadow-danger/25 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                      [disabled]="!cancellationReason"
                      (click)="confirmCancellation()">
                Override &amp; Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: []
})
export class BookingMonitorComponent implements OnInit {
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

  statusChips = [
    { value: '', label: 'All', icon: 'All', activeClass: 'bg-primary/10 border-primary/30 text-primary shadow-sm shadow-primary/5' },
    { value: 'requested', label: 'Requested', icon: 'Req', activeClass: 'bg-warning/10 border-warning/30 text-warning shadow-sm shadow-warning/5' },
    { value: 'pending', label: 'Pending', icon: 'Pend', activeClass: 'bg-primary/10 border-primary/30 text-primary shadow-sm shadow-primary/5' },
    { value: 'accepted', label: 'Active', icon: 'Act', activeClass: 'bg-accent/10 border-accent/30 text-accent shadow-sm shadow-accent/5' },
    { value: 'completed', label: 'Completed', icon: 'Done', activeClass: 'bg-success/10 border-success/30 text-success shadow-sm shadow-success/5' },
    { value: 'cancelled', label: 'Cancelled', icon: 'X', activeClass: 'bg-danger/10 border-danger/30 text-danger shadow-sm shadow-danger/5' },
    { value: 'expired', label: 'Expired', icon: 'Exp', activeClass: 'bg-borderStrong/20 border-borderStrong text-textSubtle shadow-sm' },
  ];

  ngOnInit() { this.loadBookings(); }

  loadBookings() {
    this.adminService.getBookings({ page: this.currentPage, limit: this.pageSize, status: this.filterStatus }).subscribe({
      next: (res) => {
        this.bookings = res.data?.items || [];
        this.totalBookings = res.data?.total || 0;
        this.totalPages = Math.ceil(this.totalBookings / this.pageSize) || 1;
      },
      error: (err) => console.error('Error fetching bookings:', err)
    });
  }

  onFilterChange()  { this.currentPage = 1; this.loadBookings(); }
  onPageSizeChange(){ this.currentPage = 1; this.loadBookings(); }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) { this.currentPage = page; this.loadBookings(); }
  }

  get visiblePages(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, Math.min(this.currentPage - 2, this.totalPages - 4));
    const end   = Math.min(this.totalPages, start + 4);
    for (let p = start; p <= end; p++) pages.push(p);
    return pages;
  }
  get pageStart(): number { return this.totalBookings === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1; }
  get pageEnd():   number { return Math.min(this.currentPage * this.pageSize, this.totalBookings); }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      requested: 'badge-warning',
      pending:   'badge-primary',
      accepted:  'badge-primary',
      completed: 'badge-success',
      cancelled: 'badge-danger',
      expired:   'badge-muted',
    };
    return map[status] || 'badge-muted';
  }

  canCancel(status: string): boolean {
    return !['cancelled', 'completed', 'expired'].includes(status);
  }

  isCustomerCancellation(booking: any): boolean {
    return (booking?.cancellationReason || '').toLowerCase().includes('customer');
  }

  openDetailsModal(id: string) {
    this.adminService.getBookingDetails(id).subscribe({
      next: (res) => { this.selectedBooking = res.data?.booking; this.showDetailsModal = true; },
      error: (err) => console.error('Error fetching booking details:', err)
    });
  }

  closeDetailsModal() { this.showDetailsModal = false; this.selectedBooking = null; }

  openCancelModal(booking: any) {
    this.cancellingBooking = booking;
    this.cancellationReason = '';
    this.showCancelModal = true;
    this.closeDetailsModal();
  }

  closeCancelModal() { this.showCancelModal = false; this.cancellingBooking = null; this.cancellationReason = ''; }

  confirmCancellation() {
    if (!this.cancellingBooking) return;
    this.adminService.overrideCancelBooking(this.cancellingBooking._id, this.cancellationReason).subscribe({
      next: () => { this.closeCancelModal(); this.loadBookings(); },
      error: (err) => console.error('Error cancelling booking:', err)
    });
  }
}

