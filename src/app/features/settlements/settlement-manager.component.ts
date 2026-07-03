import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-settlement-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col gap-6 animate-fade-in">

      <!-- ─── Page Header ──────────────────────────────────── -->
      <div class="animate-slide-up">
        <div class="flex items-center gap-3 mb-1.5">
          <div class="w-1.5 h-7 rounded-full bg-gradient-to-b from-success to-emerald-400"></div>
          <h1 class="text-2xl font-black tracking-tight text-textMain">Settlement Manager</h1>
        </div>
        <p class="text-sm pl-5 text-textMuted">Review worker payout requests, process bank transfers, and manage settlement lifecycle</p>
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
          <span *ngIf="chip.value === '' && totalSettlements > 0"
                class="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-primary/10 text-primary">{{ totalSettlements }}</span>
        </button>
      </div>

      <!-- ─── Settlements Table ────────────────────────────── -->
      <div class="rounded-2xl border border-border bg-bgCard overflow-hidden animate-slide-up [animation-delay:120ms] shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-left min-w-[920px]">
            <thead>
              <tr class="bg-bgSoft">
                <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b border-border text-textMuted">Settlement ID</th>
                <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b border-border text-textMuted">Worker</th>
                <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b border-border text-textMuted">Amount</th>
                <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b border-border text-textMuted">Jobs</th>
                <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b border-border text-textMuted">Status</th>
                <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b border-border text-textMuted">Requested</th>
                <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b border-border text-textMuted">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of settlements"
                  class="border-b border-border hover:bg-bgSoft/40 group transition-colors duration-150">

                <!-- Settlement ID -->
                <td class="px-6 py-4">
                  <button class="flex items-center gap-1.5 font-mono text-xs font-bold text-primary hover:underline hover:scale-105 active:scale-95 transition-all"
                          (click)="openDetailModal(s._id)">
                    <span class="text-[10px] text-textSubtle">#</span>{{ s._id.slice(-8).toUpperCase() }}
                  </button>
                </td>

                <!-- Worker -->
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-black flex-shrink-0 bg-gradient-to-br from-success to-emerald-500 shadow-sm">
                      {{ getWorkerInitial(s) }}
                    </div>
                    <div class="flex flex-col gap-0.5">
                      <span class="text-xs font-semibold text-textMain">{{ getWorkerName(s) }}</span>
                      <span class="text-[10px] text-textMuted">{{ getWorkerEmail(s) }}</span>
                    </div>
                  </div>
                </td>

                <!-- Amount -->
                <td class="px-6 py-4">
                  <span class="text-sm font-black tabular-nums text-textMain">₹{{ s.totalAmount }}</span>
                  <div *ngIf="s.cashCommissionDeducted > 0"
                       class="text-[10px] mt-0.5 font-semibold"
                       style="color:#f59e0b">
                    −₹{{ s.cashCommissionDeducted }} cash
                  </div>
                </td>

                <!-- Jobs count -->
                <td class="px-6 py-4">
                  <span class="px-2 py-1 rounded-lg text-[10px] font-bold bg-bgSoft text-textMain border border-border">
                    {{ s.bookingIds?.length || 0 }} jobs
                  </span>
                  <div *ngIf="(s.cashCommissionIds?.length || 0) > 0"
                       class="text-[10px] mt-0.5" style="color:var(--text-muted)">
                    +{{ s.cashCommissionIds.length }} cash netted
                  </div>
                </td>

                <!-- Status badge -->
                <td class="px-6 py-4">
                  <span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border"
                        [ngClass]="getStatusClass(s.status)">
                    {{ s.status }}
                  </span>
                </td>

                <!-- Requested date -->
                <td class="px-6 py-4">
                  <span class="text-xs text-textMuted">{{ s.requestedAt | date:'dd MMM yyyy, HH:mm' }}</span>
                </td>

                <!-- Actions -->
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <button (click)="openDetailModal(s._id)"
                            class="px-3 py-1.5 rounded-xl border border-border bg-bgSoft text-textMain text-xs font-bold transition-all hover:bg-primary/5 hover:text-primary hover:border-primary/30 active:scale-95">
                      🔍 View
                    </button>
                    <button *ngIf="s.status === 'pending'"
                            (click)="quickAction(s._id, 'processing')"
                            class="px-3 py-1.5 rounded-xl border border-blue-400/20 bg-blue-500/5 text-blue-600 text-xs font-bold transition-all hover:bg-blue-500/10 hover:border-blue-400/40 active:scale-95">
                      ⚡ Process
                    </button>
                    <button *ngIf="s.status === 'processing'"
                            (click)="openSettleModal(s)"
                            class="px-3 py-1.5 rounded-xl border border-success/20 bg-success/5 text-success text-xs font-bold transition-all hover:bg-success/10 hover:border-success/40 active:scale-95">
                      ✅ Settle
                    </button>
                    <button *ngIf="s.status === 'pending' || s.status === 'processing'"
                            (click)="openRejectModal(s)"
                            class="px-3 py-1.5 rounded-xl border border-danger/20 bg-danger/5 text-danger text-xs font-bold transition-all hover:bg-danger/10 hover:border-danger/40 active:scale-95">
                      ✕ Reject
                    </button>
                  </div>
                </td>
              </tr>

              <tr *ngIf="settlements.length === 0">
                <td colspan="7" class="py-16 text-center">
                  <div class="flex flex-col items-center gap-3">
                    <span class="text-4xl">💰</span>
                    <p class="text-sm font-bold text-textMuted">No settlements found matching filters.</p>
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
            <span class="font-black text-textMain">{{ totalSettlements }}</span> settlements
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
           MODAL: SETTLEMENT DETAILS
           ══════════════════════════════════════════════════════ -->
      <div *ngIf="showDetailModal"
           class="fixed inset-0 flex items-center justify-center z-50 p-6 bg-black/60 backdrop-blur-md animate-fade-in"
           (click)="closeDetailModal()">
        <div class="w-full max-w-2xl max-h-[85vh] rounded-3xl border border-border bg-bgCard flex flex-col overflow-hidden animate-scale-in shadow-2xl"
             (click)="$event.stopPropagation()">

          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-5 border-b border-border bg-bgSoft flex-shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center text-base bg-success/10 text-success">💰</div>
              <div>
                <h3 class="text-base font-black text-textMain">Settlement Details</h3>
                <p class="text-[10px] font-mono text-textMuted">#{{ selectedSettlement?._id?.slice(-12).toUpperCase() }}</p>
              </div>
            </div>
            <button class="w-8 h-8 rounded-xl border border-border bg-bgCard text-textMuted flex items-center justify-center font-bold text-sm hover:bg-bgSoft/70 transition-all active:scale-95"
                    (click)="closeDetailModal()">✕</button>
          </div>

          <div *ngIf="selectedSettlement" class="p-6 flex flex-col gap-5 overflow-y-auto">

            <!-- Status row -->
            <div class="p-4 rounded-xl border border-border bg-bgSoft flex flex-col gap-2">
              <span class="text-[9px] font-black uppercase tracking-widest text-textSubtle">Status</span>
              <span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase w-fit border"
                    [ngClass]="getStatusClass(selectedSettlement.status)">{{ selectedSettlement.status }}</span>
            </div>

            <!-- Payout Breakdown -->
            <div>
              <div class="flex items-center gap-2 mb-3">
                <span class="text-[9px] font-black uppercase tracking-widest text-textSubtle">💵 Payout Breakdown</span>
                <div class="flex-1 h-px bg-border"></div>
              </div>
              <div class="rounded-xl border border-border overflow-hidden">

                <!-- Online earnings row -->
                <div class="flex items-center justify-between px-4 py-3 border-b border-border">
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-primary flex-shrink-0"></span>
                    <span class="text-xs font-semibold" style="color:var(--text-main)">Online earnings</span>
                    <span class="text-[10px] px-1.5 py-0.5 rounded bg-bgSoft border border-border" style="color:var(--text-muted)">
                      {{ selectedSettlement.bookingIds?.length || 0 }} booking(s)
                    </span>
                  </div>
                  <span class="text-sm font-black tabular-nums" style="color:var(--text-main)">
                    ₹{{ (selectedSettlement.totalAmount + (selectedSettlement.cashCommissionDeducted || 0)) | number }}
                  </span>
                </div>

                <!-- Cash commission deducted row (only if present) -->
                <div *ngIf="(selectedSettlement.cashCommissionDeducted || 0) > 0"
                     class="flex items-center justify-between px-4 py-3 border-b border-border"
                     style="background:rgba(251,191,36,0.04)">
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full flex-shrink-0" style="background:#f59e0b"></span>
                    <span class="text-xs font-semibold" style="color:#d97706">Cash commission deducted</span>
                    <span class="text-[10px] px-1.5 py-0.5 rounded border"
                          style="background:rgba(251,191,36,0.08); border-color:rgba(251,191,36,0.3); color:#d97706">
                      {{ selectedSettlement.cashCommissionIds?.length || 0 }} job(s)
                    </span>
                  </div>
                  <span class="text-sm font-black tabular-nums" style="color:#d97706">
                    −₹{{ selectedSettlement.cashCommissionDeducted | number }}
                  </span>
                </div>

                <!-- Net payout row -->
                <div class="flex items-center justify-between px-4 py-3" style="background:rgba(16,185,129,0.04)">
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full flex-shrink-0" style="background:#10b981"></span>
                    <span class="text-xs font-black" style="color:#10b981">Net payout to worker</span>
                  </div>
                  <span class="text-xl font-black tabular-nums" style="color:#10b981">
                    ₹{{ selectedSettlement.totalAmount | number }}
                  </span>
                </div>
              </div>

              <p *ngIf="(selectedSettlement.cashCommissionDeducted || 0) > 0"
                 class="text-[10px] mt-2 px-1" style="color:var(--text-subtle)">
                The ₹{{ selectedSettlement.cashCommissionDeducted | number }} cash commission was auto-deducted — admin retains this from the total online collection. Transfer only ₹{{ selectedSettlement.totalAmount | number }} to the worker.
              </p>
            </div>

            <!-- Section: Worker Info -->
            <div>
              <div class="flex items-center gap-2 mb-3">
                <span class="text-[9px] font-black uppercase tracking-widest text-textSubtle">👤 Worker</span>
                <div class="flex-1 h-px bg-border"></div>
              </div>
              <div class="p-4 rounded-xl border border-border bg-bgSoft">
                <div class="text-sm font-bold text-textMain">{{ selectedSettlement.providerId?.userId?.name || 'N/A' }}</div>
                <div class="text-[10px] text-textMuted">{{ selectedSettlement.providerId?.userId?.email || 'N/A' }}</div>
                <div class="text-[10px] text-textMuted" *ngIf="selectedSettlement.providerId?.userId?.phone">📞 {{ selectedSettlement.providerId.userId.phone }}</div>
              </div>
            </div>

            <!-- Section: Bank Snapshot -->
            <div>
              <div class="flex items-center gap-2 mb-3">
                <span class="text-[9px] font-black uppercase tracking-widest text-textSubtle">🏦 Bank Details (Snapshot)</span>
                <div class="flex-1 h-px bg-border"></div>
              </div>
              <div class="grid grid-cols-2 gap-3" *ngIf="selectedSettlement.bankSnapshot">
                <div class="p-3 rounded-xl border border-border bg-bgSoft">
                  <div class="text-[9px] font-black uppercase tracking-widest mb-1 text-textSubtle">Account Holder</div>
                  <div class="text-xs font-semibold text-textMain">{{ selectedSettlement.bankSnapshot.accountHolderName }}</div>
                </div>
                <div class="p-3 rounded-xl border border-border bg-bgSoft">
                  <div class="text-[9px] font-black uppercase tracking-widest mb-1 text-textSubtle">Account Number</div>
                  <div class="text-xs font-mono font-semibold text-textMain">{{ selectedSettlement.bankSnapshot.accountNumber }}</div>
                </div>
                <div class="p-3 rounded-xl border border-border bg-bgSoft">
                  <div class="text-[9px] font-black uppercase tracking-widest mb-1 text-textSubtle">IFSC Code</div>
                  <div class="text-xs font-mono font-semibold text-textMain">{{ selectedSettlement.bankSnapshot.ifscCode }}</div>
                </div>
                <div class="p-3 rounded-xl border border-border bg-bgSoft">
                  <div class="text-[9px] font-black uppercase tracking-widest mb-1 text-textSubtle">Bank Name</div>
                  <div class="text-xs font-semibold text-textMain">{{ selectedSettlement.bankSnapshot.bankName }}</div>
                </div>
                <div class="p-3 rounded-xl border border-border bg-bgSoft" *ngIf="selectedSettlement.bankSnapshot.upiId">
                  <div class="text-[9px] font-black uppercase tracking-widest mb-1 text-textSubtle">UPI ID</div>
                  <div class="text-xs font-mono font-semibold text-textMain">{{ selectedSettlement.bankSnapshot.upiId }}</div>
                </div>
              </div>
            </div>

            <!-- Section: Booking Breakdown -->
            <div>
              <div class="flex items-center gap-2 mb-3">
                <span class="text-[9px] font-black uppercase tracking-widest text-textSubtle">📋 Booking Breakdown</span>
                <div class="flex-1 h-px bg-border"></div>
              </div>
              <div class="rounded-xl border border-border overflow-hidden">
                <table class="w-full text-left">
                  <thead>
                    <tr class="bg-bgSoft">
                      <th class="px-4 py-2.5 text-[9px] font-black uppercase tracking-widest text-textMuted border-b border-border">Booking</th>
                      <th class="px-4 py-2.5 text-[9px] font-black uppercase tracking-widest text-textMuted border-b border-border">Price</th>
                      <th class="px-4 py-2.5 text-[9px] font-black uppercase tracking-widest text-textMuted border-b border-border">Payout</th>
                      <th class="px-4 py-2.5 text-[9px] font-black uppercase tracking-widest text-textMuted border-b border-border">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let b of selectedSettlement.bookingIds" class="border-b border-border last:border-0">
                      <td class="px-4 py-2.5 font-mono text-[10px] font-bold text-primary">
                        #{{ (b._id || b).toString().slice(-8).toUpperCase() }}
                      </td>
                      <td class="px-4 py-2.5 text-xs font-semibold text-textMain">₹{{ b.price || 'N/A' }}</td>
                      <td class="px-4 py-2.5 text-xs font-black text-success">₹{{ b.payout || 'N/A' }}</td>
                      <td class="px-4 py-2.5">
                        <span class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase border"
                              [ngClass]="b.status === 'completed' ? 'badge-success' : 'badge-muted'">
                          {{ b.status || 'N/A' }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Section: Timeline -->
            <div>
              <div class="flex items-center gap-2 mb-3">
                <span class="text-[9px] font-black uppercase tracking-widest text-textSubtle">📅 Timeline</span>
                <div class="flex-1 h-px bg-border"></div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div class="p-3 rounded-xl border border-border bg-bgSoft">
                  <div class="text-[9px] font-black uppercase tracking-widest mb-1 text-textSubtle">Requested At</div>
                  <div class="text-xs font-semibold text-textMain">{{ selectedSettlement.requestedAt | date:'dd MMM yyyy, HH:mm' }}</div>
                </div>
                <div class="p-3 rounded-xl border border-border bg-bgSoft">
                  <div class="text-[9px] font-black uppercase tracking-widest mb-1 text-textSubtle">Settled At</div>
                  <div class="text-xs font-semibold text-textMain">{{ selectedSettlement.settledAt ? (selectedSettlement.settledAt | date:'dd MMM yyyy, HH:mm') : '—' }}</div>
                </div>
              </div>
            </div>

            <!-- Admin Note -->
            <div *ngIf="selectedSettlement.adminNote"
                 class="p-4 rounded-xl border"
                 [ngClass]="selectedSettlement.status === 'rejected' ? 'border-danger/20 bg-danger/5' : 'border-success/20 bg-success/5'">
              <div class="text-[9px] font-black uppercase tracking-widest mb-1.5"
                   [ngClass]="selectedSettlement.status === 'rejected' ? 'text-danger' : 'text-success'">
                {{ selectedSettlement.status === 'rejected' ? '❌ Rejection Reason' : '✅ Admin Note / UTR' }}
              </div>
              <div class="text-xs font-semibold text-textMain">{{ selectedSettlement.adminNote }}</div>
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-3 pt-4 border-t border-border">
              <button class="px-5 py-2.5 rounded-xl border border-border bg-bgSoft text-textMain text-xs font-bold hover:bg-bgSoft/70 active:scale-95 transition-all"
                      (click)="closeDetailModal()">Close</button>
              <button *ngIf="selectedSettlement.status === 'pending'"
                      class="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/25 active:scale-95 transition-all"
                      (click)="quickAction(selectedSettlement._id, 'processing'); closeDetailModal()">
                ⚡ Mark Processing
              </button>
              <button *ngIf="selectedSettlement.status === 'processing'"
                      class="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-success hover:bg-emerald-600 shadow-lg shadow-success/25 active:scale-95 transition-all"
                      (click)="openSettleModal(selectedSettlement); closeDetailModal()">
                ✅ Mark Settled
              </button>
              <button *ngIf="selectedSettlement.status === 'pending' || selectedSettlement.status === 'processing'"
                      class="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-danger hover:bg-red-600 shadow-lg shadow-danger/25 active:scale-95 transition-all"
                      (click)="openRejectModal(selectedSettlement); closeDetailModal()">
                ✕ Reject
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════
           MODAL: MARK AS SETTLED (UTR Input)
           ══════════════════════════════════════════════════════ -->
      <div *ngIf="showSettleModal"
           class="fixed inset-0 flex items-center justify-center z-50 p-6 bg-black/60 backdrop-blur-md animate-fade-in"
           (click)="closeSettleModal()">
        <div class="w-full max-w-md rounded-3xl border border-border bg-bgCard flex flex-col gap-5 p-6 animate-scale-in shadow-2xl"
             (click)="$event.stopPropagation()">

          <div class="flex items-center justify-between pb-4 border-b border-border">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center text-base bg-success/10 text-success">✅</div>
              <div>
                <h3 class="text-base font-black text-textMain">Mark as Settled</h3>
                <p class="text-[10px] font-mono text-textMuted">#{{ settlingSettlement?._id?.slice(-8).toUpperCase() }} · ₹{{ settlingSettlement?.totalAmount }}</p>
              </div>
            </div>
            <button class="w-8 h-8 rounded-xl border border-border bg-bgSoft text-textMuted flex items-center justify-center font-bold text-sm hover:bg-bgSoft/70 active:scale-95 transition-all"
                    (click)="closeSettleModal()">✕</button>
          </div>

          <div class="flex flex-col gap-4">
            <div class="p-3 rounded-xl border border-success/20 bg-success/5 text-xs font-semibold text-textMain">
              Confirm that you have <strong>manually transferred ₹{{ settlingSettlement?.totalAmount }}</strong> to the worker's bank account. Enter the UTR / transaction reference below.
            </div>

            <!-- Cash breakdown hint in settle modal -->
            <div *ngIf="(settlingSettlement?.cashCommissionDeducted || 0) > 0"
                 class="rounded-xl border p-3 text-xs flex flex-col gap-1"
                 style="background:rgba(251,191,36,0.05); border-color:rgba(251,191,36,0.25)">
              <div class="flex justify-between">
                <span style="color:var(--text-muted)">Online earnings</span>
                <span class="font-bold" style="color:var(--text-main)">₹{{ (settlingSettlement?.totalAmount + settlingSettlement?.cashCommissionDeducted) | number }}</span>
              </div>
              <div class="flex justify-between">
                <span style="color:#d97706">Cash commission retained by admin</span>
                <span class="font-bold" style="color:#d97706">−₹{{ settlingSettlement?.cashCommissionDeducted | number }}</span>
              </div>
              <div class="flex justify-between border-t pt-1 mt-0.5" style="border-color:rgba(251,191,36,0.2)">
                <span class="font-black" style="color:#10b981">Transfer to worker</span>
                <span class="font-black" style="color:#10b981">₹{{ settlingSettlement?.totalAmount | number }}</span>
              </div>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-[10px] font-black uppercase tracking-widest text-textMuted">
                UTR / Transaction Reference
              </label>
              <input type="text" class="w-full px-4 py-2.5 rounded-xl border border-border bg-bgSoft text-textMain text-xs font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                     [(ngModel)]="settleNote"
                     placeholder="UTR: 423100056789"
                     id="settleNote" />
            </div>

            <div class="flex justify-end gap-3 pt-2">
              <button class="px-5 py-2.5 rounded-xl border border-border bg-bgSoft text-textMain text-xs font-bold hover:bg-bgSoft/70 active:scale-95 transition-all"
                      (click)="closeSettleModal()">Cancel</button>
              <button class="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-success hover:bg-emerald-600 shadow-lg shadow-success/25 transition-all active:scale-95"
                      (click)="confirmSettle()">
                ✅ Confirm Settled
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════
           MODAL: REJECT SETTLEMENT
           ══════════════════════════════════════════════════════ -->
      <div *ngIf="showRejectModal"
           class="fixed inset-0 flex items-center justify-center z-50 p-6 bg-black/60 backdrop-blur-md animate-fade-in"
           (click)="closeRejectModal()">
        <div class="w-full max-w-md rounded-3xl border border-border bg-bgCard flex flex-col gap-5 p-6 animate-scale-in shadow-2xl"
             (click)="$event.stopPropagation()">

          <div class="flex items-center justify-between pb-4 border-b border-border">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center text-base bg-danger/10 text-danger">⚠️</div>
              <div>
                <h3 class="text-base font-black text-textMain">Reject Settlement</h3>
                <p class="text-[10px] font-mono text-textMuted">#{{ rejectingSettlement?._id?.slice(-8).toUpperCase() }} · ₹{{ rejectingSettlement?.totalAmount }}</p>
              </div>
            </div>
            <button class="w-8 h-8 rounded-xl border border-border bg-bgSoft text-textMuted flex items-center justify-center font-bold text-sm hover:bg-bgSoft/70 active:scale-95 transition-all"
                    (click)="closeRejectModal()">✕</button>
          </div>

          <div class="flex flex-col gap-4">
            <div class="p-3 rounded-xl border border-danger/20 bg-danger/5 text-xs font-semibold text-textMain">
              The worker will be notified that their payout request of <strong>₹{{ rejectingSettlement?.totalAmount }}</strong> was rejected. The included bookings will become available for a new settlement request.
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-[10px] font-black uppercase tracking-widest text-textMuted">
                Rejection Reason <span class="text-danger">*</span>
              </label>
              <input type="text" class="w-full px-4 py-2.5 rounded-xl border border-border bg-bgSoft text-textMain text-xs font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                     [(ngModel)]="rejectNote"
                     placeholder="Invalid bank details / Incorrect IFSC..."
                     id="rejectNote" />
            </div>

            <div class="flex justify-end gap-3 pt-2">
              <button class="px-5 py-2.5 rounded-xl border border-border bg-bgSoft text-textMain text-xs font-bold hover:bg-bgSoft/70 active:scale-95 transition-all"
                      (click)="closeRejectModal()">Cancel</button>
              <button class="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-danger hover:bg-red-600 shadow-lg shadow-danger/25 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                      [disabled]="!rejectNote"
                      (click)="confirmReject()">
                ✕ Reject Settlement
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: []
})
export class SettlementManagerComponent implements OnInit {
  private adminService = inject(AdminService);

  settlements: any[] = [];
  filterStatus = '';
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  totalSettlements = 0;

  // Detail modal
  showDetailModal = false;
  selectedSettlement: any = null;

  // Settle modal
  showSettleModal = false;
  settlingSettlement: any = null;
  settleNote = '';

  // Reject modal
  showRejectModal = false;
  rejectingSettlement: any = null;
  rejectNote = '';

  statusChips = [
    { value: '', label: 'All', icon: '📊', activeClass: 'bg-primary/10 border-primary/30 text-primary shadow-sm shadow-primary/5' },
    { value: 'pending', label: 'Pending', icon: '⏳', activeClass: 'bg-warning/10 border-warning/30 text-warning shadow-sm shadow-warning/5' },
    { value: 'processing', label: 'Processing', icon: '🔄', activeClass: 'bg-blue-500/10 border-blue-400/30 text-blue-600 shadow-sm shadow-blue-500/5' },
    { value: 'settled', label: 'Settled', icon: '✅', activeClass: 'bg-success/10 border-success/30 text-success shadow-sm shadow-success/5' },
    { value: 'rejected', label: 'Rejected', icon: '❌', activeClass: 'bg-danger/10 border-danger/30 text-danger shadow-sm shadow-danger/5' },
  ];

  ngOnInit() { this.loadSettlements(); }

  loadSettlements() {
    this.adminService.getSettlements({
      page: this.currentPage,
      limit: this.pageSize,
      status: this.filterStatus,
      sort: '-createdAt'
    }).subscribe({
      next: (res) => {
        this.settlements = res.data?.items || [];
        this.totalSettlements = res.data?.total || 0;
        this.totalPages = Math.ceil(this.totalSettlements / this.pageSize) || 1;
      },
      error: (err) => console.error('Error fetching settlements:', err)
    });
  }

  onFilterChange() { this.currentPage = 1; this.loadSettlements(); }
  onPageSizeChange() { this.currentPage = 1; this.loadSettlements(); }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) { this.currentPage = page; this.loadSettlements(); }
  }

  get visiblePages(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, Math.min(this.currentPage - 2, this.totalPages - 4));
    const end = Math.min(this.totalPages, start + 4);
    for (let p = start; p <= end; p++) pages.push(p);
    return pages;
  }
  get pageStart(): number { return this.totalSettlements === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1; }
  get pageEnd(): number { return Math.min(this.currentPage * this.pageSize, this.totalSettlements); }

  getWorkerName(s: any): string { return s.providerId?.userId?.name || 'Worker'; }
  getWorkerEmail(s: any): string { return s.providerId?.userId?.email || ''; }
  getWorkerInitial(s: any): string { return (this.getWorkerName(s))[0]?.toUpperCase() || 'W'; }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      pending: 'badge-warning',
      processing: 'bg-blue-500/10 text-blue-600 border-blue-400/30',
      settled: 'badge-success',
      rejected: 'badge-danger',
    };
    return map[status] || 'badge-muted';
  }

  // ── Detail Modal ──
  openDetailModal(id: string) {
    this.adminService.getSettlementById(id).subscribe({
      next: (res) => { this.selectedSettlement = res.data?.settlement; this.showDetailModal = true; },
      error: (err) => console.error('Error fetching settlement:', err)
    });
  }
  closeDetailModal() { this.showDetailModal = false; this.selectedSettlement = null; }

  // ── Quick Action (Processing) ──
  quickAction(id: string, status: string) {
    if (confirm(`Mark this settlement as '${status}'?`)) {
      this.adminService.updateSettlementStatus(id, status).subscribe({
        next: () => { this.loadSettlements(); },
        error: (err) => { console.error('Error updating status:', err); alert(err.error?.message || 'Failed to update status'); }
      });
    }
  }

  // ── Settle Modal ──
  openSettleModal(settlement: any) { this.settlingSettlement = settlement; this.settleNote = ''; this.showSettleModal = true; }
  closeSettleModal() { this.showSettleModal = false; this.settlingSettlement = null; this.settleNote = ''; }
  confirmSettle() {
    if (!this.settlingSettlement) return;
    this.adminService.updateSettlementStatus(this.settlingSettlement._id, 'settled', this.settleNote || undefined).subscribe({
      next: () => { this.closeSettleModal(); this.loadSettlements(); },
      error: (err) => { console.error('Error settling:', err); alert(err.error?.message || 'Failed to settle'); }
    });
  }

  // ── Reject Modal ──
  openRejectModal(settlement: any) { this.rejectingSettlement = settlement; this.rejectNote = ''; this.showRejectModal = true; }
  closeRejectModal() { this.showRejectModal = false; this.rejectingSettlement = null; this.rejectNote = ''; }
  confirmReject() {
    if (!this.rejectingSettlement || !this.rejectNote) return;
    this.adminService.updateSettlementStatus(this.rejectingSettlement._id, 'rejected', this.rejectNote).subscribe({
      next: () => { this.closeRejectModal(); this.loadSettlements(); },
      error: (err) => { console.error('Error rejecting:', err); alert(err.error?.message || 'Failed to reject'); }
    });
  }
}
