import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col gap-6 animate-fade-in">

      <!-- ─── Page Header ──────────────────────────────────────── -->
      <div class="animate-slide-up">
        <div class="flex items-center gap-3 mb-1.5">
          <div class="w-1.5 h-7 rounded-full bg-gradient-to-b from-amber-400 to-orange-500"></div>
          <h1 class="text-2xl font-black tracking-tight" style="color:var(--text-main)">Cash Commission Wallet</h1>
        </div>
        <p class="text-sm pl-5" style="color:var(--text-muted)">
          Track admin commission owed from cash-paid bookings. Commissions are auto-deducted at settlement — this view shows what is pending and what has been cleared.
        </p>
      </div>

      <!-- ─── Summary Cards ─────────────────────────────────────── -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-slide-up [animation-delay:60ms]">

        <!-- Total Pending -->
        <div class="rounded-2xl border p-5 flex items-center gap-4 shadow-sm"
             style="background:var(--bg-card); border-color:var(--border)">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
               style="background:rgba(251,191,36,0.12)">💰</div>
          <div>
            <div class="text-[10px] font-black uppercase tracking-widest mb-1" style="color:var(--text-subtle)">Total Pending</div>
            <div class="text-2xl font-black tabular-nums" style="color:var(--text-main)">₹{{ totalPending | number }}</div>
            <div class="text-[10px]" style="color:var(--text-muted)">across {{ workerSummary.length }} worker(s)</div>
          </div>
        </div>

        <!-- Pending Entries -->
        <div class="rounded-2xl border p-5 flex items-center gap-4 shadow-sm"
             style="background:var(--bg-card); border-color:var(--border)">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
               style="background:rgba(239,68,68,0.10)">⏳</div>
          <div>
            <div class="text-[10px] font-black uppercase tracking-widest mb-1" style="color:var(--text-subtle)">Pending Entries</div>
            <div class="text-2xl font-black tabular-nums" style="color:var(--text-main)">{{ pendingCount }}</div>
            <div class="text-[10px]" style="color:var(--text-muted)">cash jobs not yet netted</div>
          </div>
        </div>

        <!-- Auto-Netted -->
        <div class="rounded-2xl border p-5 flex items-center gap-4 shadow-sm"
             style="background:var(--bg-card); border-color:var(--border)">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
               style="background:rgba(16,185,129,0.10)">✅</div>
          <div>
            <div class="text-[10px] font-black uppercase tracking-widest mb-1" style="color:var(--text-subtle)">Auto-Netted</div>
            <div class="text-2xl font-black tabular-nums" style="color:var(--text-main)">{{ collectedCount }}</div>
            <div class="text-[10px]" style="color:var(--text-muted)">cleared via settlement</div>
          </div>
        </div>
      </div>

      <!-- ─── By-Worker Summary ──────────────────────────────────── -->
      <div class="rounded-2xl border overflow-hidden shadow-sm animate-slide-up [animation-delay:120ms]"
           style="background:var(--bg-card); border-color:var(--border)">
        <div class="px-6 py-4 border-b flex items-center justify-between" style="border-color:var(--border)">
          <div>
            <div class="text-sm font-black" style="color:var(--text-main)">Outstanding by Worker</div>
            <div class="text-[10px]" style="color:var(--text-muted)">Workers with pending cash commission debt</div>
          </div>
          <button (click)="loadSummary()"
                  class="text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all"
                  style="background:var(--bg-soft); border-color:var(--border); color:var(--text-muted)">
            ↻ Refresh
          </button>
        </div>

        <div *ngIf="summaryLoading" class="p-10 text-center text-sm" style="color:var(--text-muted)">Loading…</div>

        <div *ngIf="!summaryLoading && workerSummary.length === 0"
             class="p-10 text-center text-sm" style="color:var(--text-muted)">
          No pending cash commissions. All settled.
        </div>

        <table *ngIf="!summaryLoading && workerSummary.length > 0"
               class="w-full border-collapse text-left min-w-[600px]">
          <thead>
            <tr style="background:var(--bg-soft)">
              <th class="px-6 py-3 text-[10px] font-black uppercase tracking-widest border-b" style="border-color:var(--border); color:var(--text-muted)">Worker</th>
              <th class="px-6 py-3 text-[10px] font-black uppercase tracking-widest border-b" style="border-color:var(--border); color:var(--text-muted)">Phone</th>
              <th class="px-6 py-3 text-[10px] font-black uppercase tracking-widest border-b" style="border-color:var(--border); color:var(--text-muted)">Cash Jobs</th>
              <th class="px-6 py-3 text-[10px] font-black uppercase tracking-widest border-b" style="border-color:var(--border); color:var(--text-muted)">Total Owed</th>
              <th class="px-6 py-3 text-[10px] font-black uppercase tracking-widest border-b" style="border-color:var(--border); color:var(--text-muted)">Oldest</th>
              <th class="px-6 py-3 text-[10px] font-black uppercase tracking-widest border-b" style="border-color:var(--border); color:var(--text-muted)">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let w of workerSummary"
                class="border-b transition-colors duration-150"
                style="border-color:var(--border)"
                onmouseover="this.style.background='var(--bg-soft)'"
                onmouseout="this.style.background='transparent'">
              <td class="px-6 py-4">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-black flex-shrink-0"
                       style="background:linear-gradient(135deg,#f59e0b,#d97706)">
                    {{ (w.workerName || 'W').charAt(0).toUpperCase() }}
                  </div>
                  <span class="text-xs font-semibold" style="color:var(--text-main)">{{ w.workerName || 'Unknown' }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-xs" style="color:var(--text-muted)">{{ w.workerPhone || '—' }}</td>
              <td class="px-6 py-4">
                <span class="text-xs font-bold px-2 py-0.5 rounded-full"
                      style="background:rgba(239,68,68,0.10); color:#ef4444">
                  {{ w.count }} job{{ w.count !== 1 ? 's' : '' }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span class="text-sm font-black tabular-nums" style="color:var(--text-main)">₹{{ w.totalPending | number }}</span>
              </td>
              <td class="px-6 py-4 text-[11px]" style="color:var(--text-muted)">
                {{ w.oldest | date:'dd MMM yyyy' }}
              </td>
              <td class="px-6 py-4">
                <button (click)="filterByWorker(w.providerId)"
                        class="text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all active:scale-95"
                        style="background:rgba(99,102,241,0.08); border-color:rgba(99,102,241,0.2); color:#6366f1">
                  View Entries
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ─── Commission Entries Table ──────────────────────────── -->
      <div class="rounded-2xl border overflow-hidden shadow-sm animate-slide-up [animation-delay:180ms]"
           style="background:var(--bg-card); border-color:var(--border)">

        <!-- Table header + filters -->
        <div class="px-6 py-4 border-b flex flex-wrap items-center gap-3" style="border-color:var(--border)">
          <div class="flex-1">
            <div class="text-sm font-black" style="color:var(--text-main)">Commission Entries</div>
            <div class="text-[10px]" style="color:var(--text-muted)">One row per cash booking</div>
          </div>

          <!-- Status filter chips -->
          <div class="flex items-center gap-2">
            <button *ngFor="let chip of statusChips"
                    class="px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all"
                    [style]="filterStatus === chip.value ? chip.activeStyle : 'background:var(--bg-soft); border-color:var(--border); color:var(--text-muted)'"
                    (click)="filterStatus = chip.value; selectedProviderId = ''; loadEntries()">
              {{ chip.label }}
            </button>
          </div>

          <!-- Clear worker filter -->
          <button *ngIf="selectedProviderId"
                  (click)="selectedProviderId = ''; loadEntries()"
                  class="text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all"
                  style="background:rgba(239,68,68,0.08); border-color:rgba(239,68,68,0.2); color:#ef4444">
            ✕ Clear Worker Filter
          </button>
        </div>

        <div *ngIf="entriesLoading" class="p-10 text-center text-sm" style="color:var(--text-muted)">Loading…</div>

        <div *ngIf="!entriesLoading && entries.length === 0"
             class="p-10 text-center text-sm" style="color:var(--text-muted)">
          No entries found for the selected filter.
        </div>

        <div *ngIf="!entriesLoading && entries.length > 0" class="overflow-x-auto">
          <table class="w-full border-collapse text-left min-w-[900px]">
            <thead>
              <tr style="background:var(--bg-soft)">
                <th class="px-5 py-3 text-[10px] font-black uppercase tracking-widest border-b" style="border-color:var(--border); color:var(--text-muted)">Worker</th>
                <th class="px-5 py-3 text-[10px] font-black uppercase tracking-widest border-b" style="border-color:var(--border); color:var(--text-muted)">Booking</th>
                <th class="px-5 py-3 text-[10px] font-black uppercase tracking-widest border-b" style="border-color:var(--border); color:var(--text-muted)">Booking ₹</th>
                <th class="px-5 py-3 text-[10px] font-black uppercase tracking-widest border-b" style="border-color:var(--border); color:var(--text-muted)">Worker Payout</th>
                <th class="px-5 py-3 text-[10px] font-black uppercase tracking-widest border-b" style="border-color:var(--border); color:var(--text-muted)">Commission</th>
                <th class="px-5 py-3 text-[10px] font-black uppercase tracking-widest border-b" style="border-color:var(--border); color:var(--text-muted)">Status</th>
                <th class="px-5 py-3 text-[10px] font-black uppercase tracking-widest border-b" style="border-color:var(--border); color:var(--text-muted)">Created</th>
                <th class="px-5 py-3 text-[10px] font-black uppercase tracking-widest border-b" style="border-color:var(--border); color:var(--text-muted)">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let e of entries"
                  class="border-b transition-colors duration-150"
                  style="border-color:var(--border)"
                  onmouseover="this.style.background='var(--bg-soft)'"
                  onmouseout="this.style.background='transparent'">

                <!-- Worker -->
                <td class="px-5 py-4">
                  <div class="text-xs font-semibold" style="color:var(--text-main)">{{ getWorkerName(e) }}</div>
                </td>

                <!-- Booking ID -->
                <td class="px-5 py-4">
                  <span class="font-mono text-[11px] font-bold" style="color:var(--primary)">
                    #{{ getBookingId(e).slice(-6).toUpperCase() }}
                  </span>
                </td>

                <!-- Booking price -->
                <td class="px-5 py-4 text-xs font-bold tabular-nums" style="color:var(--text-main)">
                  ₹{{ e.bookingPrice | number }}
                </td>

                <!-- Worker payout -->
                <td class="px-5 py-4 text-xs tabular-nums" style="color:var(--text-muted)">
                  ₹{{ e.workerPayout | number }}
                </td>

                <!-- Commission owed -->
                <td class="px-5 py-4">
                  <span class="text-sm font-black tabular-nums" style="color:#f59e0b">
                    ₹{{ e.commissionAmount | number }}
                  </span>
                </td>

                <!-- Status badge -->
                <td class="px-5 py-4">
                  <span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide"
                        [style]="e.status === 'pending'
                          ? 'background:rgba(239,68,68,0.10); color:#ef4444'
                          : 'background:rgba(16,185,129,0.10); color:#10b981'">
                    {{ e.status === 'pending' ? 'Pending' : 'Collected' }}
                  </span>
                  <div *ngIf="e.status === 'collected' && e.settlementId"
                       class="text-[10px] mt-0.5" style="color:var(--text-subtle)">
                    via settlement
                  </div>
                  <div *ngIf="e.status === 'collected' && !e.settlementId"
                       class="text-[10px] mt-0.5" style="color:var(--text-subtle)">
                    manual
                  </div>
                </td>

                <!-- Date -->
                <td class="px-5 py-4 text-[11px]" style="color:var(--text-muted)">
                  {{ e.createdAt | date:'dd MMM, HH:mm' }}
                </td>

                <!-- Action -->
                <td class="px-5 py-4">
                  <button *ngIf="e.status === 'pending'"
                          (click)="openCollectModal(e)"
                          class="text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all active:scale-95"
                          style="background:rgba(251,191,36,0.10); border-color:rgba(251,191,36,0.3); color:#d97706">
                    Mark Collected
                  </button>
                  <span *ngIf="e.status === 'collected'"
                        class="text-[11px]" style="color:var(--text-subtle)">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div *ngIf="totalEntries > pageSize"
             class="px-6 py-4 border-t flex items-center justify-between" style="border-color:var(--border)">
          <span class="text-xs" style="color:var(--text-muted)">
            Showing {{ (currentPage - 1) * pageSize + 1 }}–{{ min(currentPage * pageSize, totalEntries) }} of {{ totalEntries }}
          </span>
          <div class="flex gap-2">
            <button [disabled]="currentPage === 1"
                    (click)="goPage(currentPage - 1)"
                    class="px-3 py-1.5 rounded-lg border text-xs font-bold transition-all disabled:opacity-40"
                    style="background:var(--bg-soft); border-color:var(--border); color:var(--text-muted)">
              ← Prev
            </button>
            <button [disabled]="currentPage * pageSize >= totalEntries"
                    (click)="goPage(currentPage + 1)"
                    class="px-3 py-1.5 rounded-lg border text-xs font-bold transition-all disabled:opacity-40"
                    style="background:var(--bg-soft); border-color:var(--border); color:var(--text-muted)">
              Next →
            </button>
          </div>
        </div>
      </div>

      <!-- ─── Manual Collect Modal ───────────────────────────────── -->
      <div *ngIf="showCollectModal"
           class="fixed inset-0 z-50 flex items-center justify-center p-4"
           style="background:rgba(0,0,0,0.5); backdrop-filter:blur(6px)">
        <div class="rounded-2xl border shadow-2xl w-full max-w-md p-6 flex flex-col gap-5"
             style="background:var(--bg-card); border-color:var(--border)">

          <div class="flex items-center justify-between">
            <div class="text-base font-black" style="color:var(--text-main)">Mark Commission Collected</div>
            <button (click)="closeCollectModal()"
                    class="w-8 h-8 rounded-lg flex items-center justify-center border text-sm"
                    style="background:var(--bg-soft); border-color:var(--border); color:var(--text-muted)">✕</button>
          </div>

          <div class="rounded-xl p-4 flex flex-col gap-2" style="background:var(--bg-soft)">
            <div class="flex justify-between text-xs">
              <span style="color:var(--text-muted)">Commission amount</span>
              <span class="font-black" style="color:#f59e0b">₹{{ selectedEntry?.commissionAmount | number }}</span>
            </div>
            <div class="flex justify-between text-xs">
              <span style="color:var(--text-muted)">Worker</span>
              <span class="font-semibold" style="color:var(--text-main)">{{ getWorkerName(selectedEntry) }}</span>
            </div>
          </div>

          <div class="text-xs" style="color:var(--text-muted)">
            Use this only as an escape hatch. Commissions are normally auto-deducted from the worker's settlement payout.
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-[11px] font-bold uppercase tracking-widest" style="color:var(--text-subtle)">
              Note (optional)
            </label>
            <input [(ngModel)]="collectNote"
                   type="text"
                   placeholder="e.g. Paid via UPI ref 9923"
                   class="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all"
                   style="background:var(--bg-soft); border-color:var(--border); color:var(--text-main)"
                   onfocus="this.style.borderColor='var(--primary)'"
                   onblur="this.style.borderColor='var(--border)'" />
          </div>

          <div class="flex gap-3">
            <button (click)="closeCollectModal()"
                    class="flex-1 py-2.5 rounded-xl border text-sm font-bold transition-all"
                    style="background:var(--bg-soft); border-color:var(--border); color:var(--text-muted)">
              Cancel
            </button>
            <button (click)="confirmCollect()"
                    [disabled]="collectSaving"
                    class="flex-1 py-2.5 rounded-xl text-sm font-black transition-all disabled:opacity-50"
                    style="background:linear-gradient(135deg,#f59e0b,#d97706); color:#fff">
              {{ collectSaving ? 'Saving…' : 'Confirm Collected' }}
            </button>
          </div>
        </div>
      </div>

    </div>
  `
})
export class WalletComponent implements OnInit {
  private adminService = inject(AdminService);

  // Summary
  summaryLoading = false;
  workerSummary: any[] = [];
  totalPending = 0;

  // Entries
  entriesLoading = false;
  entries: any[] = [];
  totalEntries = 0;
  pendingCount = 0;
  collectedCount = 0;
  currentPage = 1;
  pageSize = 20;

  filterStatus = 'pending';
  selectedProviderId = '';

  statusChips = [
    { value: 'pending',   label: 'Pending',   activeStyle: 'background:rgba(239,68,68,0.10); border-color:rgba(239,68,68,0.3); color:#ef4444' },
    { value: 'collected', label: 'Collected',  activeStyle: 'background:rgba(16,185,129,0.10); border-color:rgba(16,185,129,0.3); color:#10b981' },
    { value: '',          label: 'All',        activeStyle: 'background:rgba(99,102,241,0.10); border-color:rgba(99,102,241,0.3); color:#6366f1' },
  ];

  // Modal
  showCollectModal = false;
  selectedEntry: any = null;
  collectNote = '';
  collectSaving = false;

  ngOnInit() {
    this.loadSummary();
    this.loadEntries();
    this.loadCounts();
  }

  loadSummary() {
    this.summaryLoading = true;
    this.adminService.getCashCommissionSummary().subscribe({
      next: (res) => {
        this.workerSummary = res.data || [];
        this.totalPending = this.workerSummary.reduce((s: number, w: any) => s + (w.totalPending || 0), 0);
        this.summaryLoading = false;
      },
      error: () => { this.summaryLoading = false; }
    });
  }

  loadEntries() {
    this.entriesLoading = true;
    const filters: any = { page: this.currentPage, limit: this.pageSize };
    if (this.filterStatus)      filters.status = this.filterStatus;
    if (this.selectedProviderId) filters.providerId = this.selectedProviderId;

    this.adminService.getCashCommissions(filters).subscribe({
      next: (res) => {
        this.entries = res.data?.items || [];
        this.totalEntries = res.data?.total || 0;
        this.entriesLoading = false;
      },
      error: () => { this.entriesLoading = false; }
    });
  }

  loadCounts() {
    this.adminService.getCashCommissions({ status: 'pending', limit: 1 }).subscribe({
      next: (res) => { this.pendingCount = res.data?.total || 0; }
    });
    this.adminService.getCashCommissions({ status: 'collected', limit: 1 }).subscribe({
      next: (res) => { this.collectedCount = res.data?.total || 0; }
    });
  }

  filterByWorker(providerId: string) {
    this.selectedProviderId = providerId;
    this.filterStatus = '';
    this.currentPage = 1;
    this.loadEntries();
  }

  goPage(page: number) {
    this.currentPage = page;
    this.loadEntries();
  }

  openCollectModal(entry: any) {
    this.selectedEntry = entry;
    this.collectNote = '';
    this.showCollectModal = true;
  }

  closeCollectModal() {
    this.showCollectModal = false;
    this.selectedEntry = null;
  }

  confirmCollect() {
    if (!this.selectedEntry) return;
    this.collectSaving = true;
    this.adminService.markCommissionCollected(this.selectedEntry._id, this.collectNote || undefined).subscribe({
      next: () => {
        this.collectSaving = false;
        this.closeCollectModal();
        this.loadSummary();
        this.loadEntries();
        this.loadCounts();
      },
      error: () => { this.collectSaving = false; }
    });
  }

  getWorkerName(entry: any): string {
    return entry?.providerId?.userId?.name || entry?.workerName || 'Unknown';
  }

  getBookingId(entry: any): string {
    return entry?.bookingId?._id || entry?.bookingId || '';
  }

  min(a: number, b: number) { return Math.min(a, b); }
}
