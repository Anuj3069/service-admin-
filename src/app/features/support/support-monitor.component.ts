import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-support-monitor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col gap-6 animate-fade-in">

      <!-- Page Header -->
      <div class="animate-slide-up">
        <div class="flex items-center gap-3 mb-1.5">
          <div class="w-1.5 h-7 rounded-full bg-gradient-to-b from-primary to-accent"></div>
          <h1 class="text-2xl font-black tracking-tight text-textMain">Support Tickets</h1>
        </div>
        <p class="text-sm pl-5 text-textMuted">Respond to customer and worker booking issues</p>
      </div>

      <!-- Status Filter Chips -->
      <div class="flex flex-wrap gap-2 animate-slide-up [animation-delay:60ms]">
        <button *ngFor="let chip of statusChips"
                class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-200 active:scale-95 shadow-sm"
                [ngClass]="filterStatus === chip.value
                  ? chip.activeClass
                  : 'bg-bgCard border-border text-textMuted hover:border-borderStrong hover:text-textMain'"
                (click)="filterStatus = chip.value; load()">
          <span>{{ chip.icon }}</span>
          <span>{{ chip.label }}</span>
          <span *ngIf="chip.value === '' && total > 0"
                class="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-primary/10 text-primary">{{ total }}</span>
        </button>
      </div>

      <!-- Tickets Table -->
      <div class="rounded-2xl border border-border bg-bgCard overflow-hidden animate-slide-up [animation-delay:120ms] shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-left min-w-[800px]">
            <thead>
              <tr class="bg-bgSoft">
                <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b border-border text-textMuted">Ticket</th>
                <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b border-border text-textMuted">Booking</th>
                <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b border-border text-textMuted">Raised By</th>
                <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b border-border text-textMuted">Issue</th>
                <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b border-border text-textMuted">Status</th>
                <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b border-border text-textMuted">Created</th>
                <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b border-border text-textMuted">Action</th>
              </tr>
            </thead>
            <tbody>
              <!-- Loading -->
              <tr *ngIf="loading">
                <td colspan="7" class="px-6 py-16 text-center">
                  <div class="flex flex-col items-center gap-3 text-textMuted">
                    <div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span class="text-sm font-medium">Loading tickets…</span>
                  </div>
                </td>
              </tr>
              <!-- Empty -->
              <tr *ngIf="!loading && tickets.length === 0">
                <td colspan="7" class="px-6 py-16 text-center">
                  <div class="flex flex-col items-center gap-2 text-textMuted">
                    <span class="text-3xl">🎫</span>
                    <span class="text-sm font-semibold">No support tickets found</span>
                  </div>
                </td>
              </tr>
              <!-- Rows -->
              <tr *ngFor="let t of tickets"
                  class="border-b border-border hover:bg-bgSoft/40 transition-colors duration-150">
                <td class="px-6 py-4">
                  <span class="font-mono text-xs font-bold text-primary">#{{ t._id.slice(-8).toUpperCase() }}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="font-mono text-xs text-textMuted">
                    {{ t.bookingId?._id ? t.bookingId._id.slice(-8).toUpperCase() : '—' }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-semibold text-textMain">{{ t.raisedBy?.name || '—' }}</span>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                          [ngClass]="t.raisedByRole === 'worker'
                            ? 'bg-blue-500/10 text-blue-400'
                            : 'bg-purple-500/10 text-purple-400'">
                      {{ t.raisedByRole }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 max-w-[220px]">
                  <span class="text-sm text-textMuted truncate block">{{ t.issue }}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="px-2.5 py-1 rounded-lg text-[11px] font-bold"
                        [ngStyle]="statusStyle(t.status)">
                    {{ statusLabel(t.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 text-xs text-textMuted whitespace-nowrap">
                  {{ t.createdAt | date:'dd MMM, HH:mm' }}
                </td>
                <td class="px-6 py-4">
                  <button (click)="openTicket(t)"
                          class="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                    Respond
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- ── Ticket Detail Modal ────────────────────────────────── -->
    <div *ngIf="activeTicket"
         class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
         (click)="closeTicket()">
      <div class="relative w-full max-w-xl bg-bgCard rounded-2xl border border-border shadow-2xl flex flex-col max-h-[90vh]"
           (click)="$event.stopPropagation()">

        <!-- Modal Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div>
            <h2 class="text-base font-black text-textMain">
              Ticket #{{ activeTicket._id.slice(-8).toUpperCase() }}
            </h2>
            <p class="text-xs text-textMuted mt-0.5">
              {{ activeTicket.raisedBy?.name }} ·
              <span [ngClass]="activeTicket.raisedByRole === 'worker' ? 'text-blue-400' : 'text-purple-400'">
                {{ activeTicket.raisedByRole }}
              </span>
            </p>
          </div>
          <div class="flex items-center gap-2">
            <!-- Status actions -->
            <button *ngIf="activeTicket.status !== 'in_progress'"
                    (click)="changeStatus('in_progress')"
                    [disabled]="updatingStatus"
                    class="px-3 py-1.5 rounded-lg text-xs font-bold bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition-colors disabled:opacity-50">
              Mark In Progress
            </button>
            <button *ngIf="activeTicket.status !== 'closed'"
                    (click)="changeStatus('closed')"
                    [disabled]="updatingStatus"
                    class="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors disabled:opacity-50">
              Close Ticket
            </button>
            <button (click)="closeTicket()"
                    class="w-8 h-8 flex items-center justify-center rounded-xl bg-bgSoft text-textMuted hover:text-textMain transition-colors">
              ✕
            </button>
          </div>
        </div>

        <!-- Status Banner -->
        <div class="px-6 py-2.5 border-b border-border shrink-0"
             [ngStyle]="{'background': statusBg(activeTicket.status)}">
          <span class="text-xs font-bold" [ngStyle]="{'color': statusColor(activeTicket.status)}">
            Status: {{ statusLabel(activeTicket.status) }}
          </span>
        </div>

        <!-- Messages -->
        <div #messageList class="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3 min-h-0">
          <div *ngIf="loadingMessages" class="flex justify-center py-8">
            <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div *ngFor="let msg of activeTicket.messages"
               class="flex"
               [ngClass]="msg.senderRole === 'admin' ? 'justify-end' : 'justify-start'">
            <div class="max-w-[75%]">
              <p *ngIf="msg.senderRole !== 'admin'"
                 class="text-[10px] font-bold text-primary mb-1 ml-1">Support Admin</p>
              <div class="px-4 py-2.5 rounded-xl text-sm leading-relaxed"
                   [ngClass]="msg.senderRole === 'admin'
                     ? 'bg-primary text-white rounded-br-sm'
                     : 'bg-bgSoft text-textMain border border-border rounded-bl-sm'">
                {{ msg.text }}
              </div>
              <p class="text-[10px] text-textMuted mt-1"
                 [ngClass]="msg.senderRole === 'admin' ? 'text-right mr-1' : 'ml-1'">
                {{ msg.sentAt | date:'HH:mm' }}
              </p>
            </div>
          </div>
          <p *ngIf="!loadingMessages && activeTicket.messages.length === 0"
             class="text-center text-sm text-textMuted py-6">No messages yet</p>
        </div>

        <!-- Reply Input -->
        <div class="px-6 py-4 border-t border-border shrink-0">
          <div *ngIf="activeTicket.status === 'closed'"
               class="text-center text-xs font-semibold text-green-400 py-2">
            ✓ This ticket is closed
          </div>
          <div *ngIf="activeTicket.status !== 'closed'" class="flex gap-3">
            <textarea [(ngModel)]="replyText"
                      rows="2"
                      placeholder="Type your reply…"
                      class="flex-1 resize-none bg-bgSoft border border-border rounded-xl px-4 py-2.5 text-sm text-textMain placeholder-textMuted focus:outline-none focus:border-primary/40 transition-colors">
            </textarea>
            <button (click)="sendReply()"
                    [disabled]="sending || !replyText.trim()"
                    class="w-12 h-12 self-end flex items-center justify-center rounded-xl bg-primary text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-40 shrink-0">
              <span *ngIf="!sending">➤</span>
              <span *ngIf="sending" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin block"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SupportMonitorComponent implements OnInit {
  private adminService = inject(AdminService);

  tickets: any[] = [];
  total = 0;
  loading = false;
  filterStatus = '';

  activeTicket: any = null;
  loadingMessages = false;
  replyText = '';
  sending = false;
  updatingStatus = false;

  statusChips = [
    { value: '',            label: 'All',         icon: '🎫', activeClass: 'bg-primary/10 border-primary/30 text-primary' },
    { value: 'open',        label: 'Open',        icon: '🔴', activeClass: 'bg-red-500/10 border-red-500/30 text-red-400' },
    { value: 'in_progress', label: 'In Progress', icon: '🟡', activeClass: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' },
    { value: 'closed',      label: 'Closed',      icon: '🟢', activeClass: 'bg-green-500/10 border-green-500/30 text-green-400' },
  ];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    const filters: any = { limit: 50 };
    if (this.filterStatus) filters.status = this.filterStatus;

    this.adminService.getSupportTickets(filters).subscribe({
      next: (res) => {
        this.tickets = res.data?.tickets ?? [];
        this.total = res.data?.total ?? 0;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  openTicket(ticket: any): void {
    this.activeTicket = { ...ticket };
    this.replyText = '';
    this.loadingMessages = true;

    this.adminService.getSupportTicket(ticket._id).subscribe({
      next: (res) => {
        this.activeTicket = res.data?.ticket ?? this.activeTicket;
        this.loadingMessages = false;
      },
      error: () => { this.loadingMessages = false; }
    });
  }

  closeTicket(): void {
    this.activeTicket = null;
    this.replyText = '';
  }

  sendReply(): void {
    const text = this.replyText.trim();
    if (!text || this.sending || !this.activeTicket) return;

    this.sending = true;
    this.adminService.sendSupportMessage(this.activeTicket._id, text).subscribe({
      next: (res) => {
        const msg = res.data?.message;
        if (msg) {
          this.activeTicket.messages = [...(this.activeTicket.messages ?? []), msg];
          if (this.activeTicket.status === 'open') {
            this.activeTicket.status = 'in_progress';
          }
        }
        this.replyText = '';
        this.sending = false;
        this.syncTicketInList();
      },
      error: () => { this.sending = false; }
    });
  }

  changeStatus(status: string): void {
    if (this.updatingStatus || !this.activeTicket) return;
    this.updatingStatus = true;

    this.adminService.updateSupportStatus(this.activeTicket._id, status).subscribe({
      next: (res) => {
        this.activeTicket.status = res.data?.ticket?.status ?? status;
        this.updatingStatus = false;
        this.syncTicketInList();
      },
      error: () => { this.updatingStatus = false; }
    });
  }

  private syncTicketInList(): void {
    const idx = this.tickets.findIndex(t => t._id === this.activeTicket._id);
    if (idx !== -1) {
      this.tickets[idx] = { ...this.tickets[idx], status: this.activeTicket.status };
    }
  }

  statusLabel(status: string): string {
    return { open: 'Open', in_progress: 'In Progress', closed: 'Closed' }[status] ?? status;
  }

  statusStyle(status: string): any {
    return {
      open:        { background: 'rgba(239,68,68,0.12)',  color: '#ef4444' },
      in_progress: { background: 'rgba(251,191,36,0.12)', color: '#fbbf24' },
      closed:      { background: 'rgba(34,197,94,0.12)',  color: '#22c55e' },
    }[status] ?? {};
  }

  statusBg(status: string): string {
    return { open: 'rgba(239,68,68,0.06)', in_progress: 'rgba(251,191,36,0.06)', closed: 'rgba(34,197,94,0.06)' }[status] ?? '';
  }

  statusColor(status: string): string {
    return { open: '#ef4444', in_progress: '#fbbf24', closed: '#22c55e' }[status] ?? '#94a3b8';
  }
}
