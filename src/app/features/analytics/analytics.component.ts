import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col gap-6 animate-fade-in">

      <!-- ─── Page Header ──────────────────────────────────── -->
      <div class="flex items-start justify-between gap-4 flex-wrap animate-slide-up">
        <div>
          <div class="flex items-center gap-3 mb-1.5">
            <div class="w-1.5 h-7 rounded-full bg-gradient-to-b from-primary to-accent"></div>
            <h1 class="text-2xl font-black tracking-tight text-textMain">Analytics</h1>
          </div>
          <p class="text-sm pl-5 text-textMuted">Revenue trends, service demand &amp; provider performance</p>
        </div>
        <div class="flex items-center gap-2 px-4 py-2 rounded-xl border border-primary/25 bg-primary/10 text-primary text-xs font-black shadow-sm">
          📅 Last 6 Months
        </div>
      </div>

      <!-- ─── Summary KPI Cards ─────────────────────────────── -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-slide-up [animation-delay:60ms]"
           *ngIf="!loadingRevenue">
        <!-- Total Revenue -->
        <div class="group p-5 rounded-2xl border border-border bg-bgCard hover:border-primary/20 hover:shadow-md transition-all duration-300 flex flex-col gap-3">
          <div class="flex items-start justify-between">
            <div class="w-11 h-11 rounded-xl flex items-center justify-center text-lg font-black text-white bg-gradient-to-br from-primary to-indigo-600 shadow-md shadow-primary/25">
              ₹
            </div>
            <span class="px-2.5 py-0.5 rounded-full text-[9px] font-black border border-primary/25 bg-primary/10 text-primary uppercase">Revenue</span>
          </div>
          <div>
            <div class="text-2xl font-black tabular-nums text-textMain mb-0.5">₹{{ formatAmount(totalRevenue) }}</div>
            <div class="text-[10px] font-bold uppercase tracking-wider text-textMuted">Total Collected</div>
          </div>
        </div>

        <!-- Total Bookings -->
        <div class="group p-5 rounded-2xl border border-border bg-bgCard hover:border-success/20 hover:shadow-md transition-all duration-300 flex flex-col gap-3">
          <div class="flex items-start justify-between">
            <div class="w-11 h-11 rounded-xl flex items-center justify-center text-lg text-white bg-gradient-to-br from-success to-emerald-500 shadow-md shadow-success/25">
              ✓
            </div>
            <span class="px-2.5 py-0.5 rounded-full text-[9px] font-black border border-success/25 bg-success/10 text-success uppercase">Bookings</span>
          </div>
          <div>
            <div class="text-2xl font-black tabular-nums text-textMain mb-0.5">{{ totalBookings | number }}</div>
            <div class="text-[10px] font-bold uppercase tracking-wider text-textMuted">Total Bookings</div>
          </div>
        </div>

        <!-- Top Service -->
        <div class="group p-5 rounded-2xl border border-border bg-bgCard hover:border-warning/20 hover:shadow-md transition-all duration-300 flex flex-col gap-3">
          <div class="flex items-start justify-between">
            <div class="w-11 h-11 rounded-xl flex items-center justify-center text-lg text-white bg-gradient-to-br from-warning to-amber-500 shadow-md shadow-warning/25">
              ★
            </div>
            <span class="px-2.5 py-0.5 rounded-full text-[9px] font-black border border-warning/25 bg-warning/10 text-warning uppercase">Top</span>
          </div>
          <div>
            <div class="text-base font-black text-textMain mb-0.5 truncate leading-snug">{{ topService }}</div>
            <div class="text-[10px] font-bold uppercase tracking-wider text-textMuted">Most Demanded</div>
          </div>
        </div>

        <!-- Top Provider -->
        <div class="group p-5 rounded-2xl border border-border bg-bgCard hover:border-pink-500/20 hover:shadow-md transition-all duration-300 flex flex-col gap-3">
          <div class="flex items-start justify-between">
            <div class="w-11 h-11 rounded-xl flex items-center justify-center text-lg text-white bg-gradient-to-br from-pink-500 to-rose-500 shadow-md shadow-pink-500/25">
              👤
            </div>
            <span class="px-2.5 py-0.5 rounded-full text-[9px] font-black border border-pink-500/25 bg-pink-500/10 text-pink-500 uppercase">Best</span>
          </div>
          <div>
            <div class="text-base font-black text-textMain mb-0.5 truncate leading-snug">{{ topProvider }}</div>
            <div class="text-[10px] font-bold uppercase tracking-wider text-textMuted">Top Provider</div>
          </div>
        </div>
      </div>

      <!-- KPI skeleton while loading -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" *ngIf="loadingRevenue">
        <div *ngFor="let _ of [1,2,3,4]" class="p-5 rounded-2xl border border-border bg-bgCard flex flex-col gap-3">
          <div class="skeleton w-11 h-11 rounded-xl"></div>
          <div class="skeleton h-6 w-2/3 rounded-lg mt-2"></div>
          <div class="skeleton h-3 w-1/2 rounded"></div>
        </div>
      </div>

      <!-- ─── Revenue Bar Chart ─────────────────────────────── -->
      <div class="p-6 rounded-3xl border border-border bg-bgCard shadow-sm animate-slide-up [animation-delay:140ms]">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-sm font-black uppercase tracking-wider text-textMain">Monthly Revenue</h2>
            <p class="text-xs text-textMuted mt-0.5">Completed booking revenue per month</p>
          </div>
          <div class="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/10 text-primary">📈</div>
        </div>

        <!-- Loading -->
        <div *ngIf="loadingRevenue" class="flex items-center justify-center gap-3 py-16 text-textMuted">
          <div class="w-5 h-5 border-2 rounded-full animate-spin border-border border-t-primary"></div>
          <span class="text-xs font-semibold">Loading revenue data…</span>
        </div>

        <!-- Bar chart -->
        <div *ngIf="!loadingRevenue && revenueTrends.length > 0" class="flex gap-3 h-[200px] mt-4">
          <!-- Y-axis -->
          <div class="flex flex-col-reverse justify-between pb-7 text-right min-w-[50px]">
            <span *ngFor="let tick of yTicks" class="text-[10px] font-bold text-textSubtle">{{ tick }}</span>
          </div>
          <!-- Bars -->
          <div class="flex items-end gap-3 flex-1 pb-0 border-l border-b border-border">
            <div *ngFor="let item of revenueTrends; let i = index"
                 class="group flex-1 flex flex-col items-center gap-1 relative"
                 style="height: calc(100% - 28px); justify-content: flex-end; align-self: flex-end">
              <!-- Tooltip -->
              <div class="absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1.5 rounded-lg text-[10px] font-black whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-10 bg-textMain text-bgCard shadow-lg">
                ₹{{ item.revenue | number }}
              </div>
              <!-- Bar fill -->
              <div class="w-full rounded-t-lg transition-all duration-700 cursor-pointer group-hover:brightness-110 relative overflow-hidden bg-gradient-to-t from-primary to-indigo-400"
                   [style.height.%]="maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0"
                   style="min-height: 4px;">
                <!-- Shimmer overlay on hover -->
                <div class="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity bg-gradient-to-r from-transparent via-white to-transparent -skew-x-[20deg]"></div>
              </div>
              <!-- X label -->
              <div class="text-[9px] font-bold absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-textMuted">{{ item.month }}</div>
            </div>
          </div>
        </div>

        <div *ngIf="!loadingRevenue && revenueTrends.length === 0"
             class="flex flex-col items-center justify-center py-16 gap-3">
          <span class="text-4xl">📭</span>
          <p class="text-sm font-bold text-textMuted">No revenue data yet</p>
        </div>
      </div>

      <!-- ─── Services + Leaderboard ────────────────────────── -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up [animation-delay:200ms]">

        <!-- Popular Services – Horizontal Bar Chart -->
        <div class="p-6 rounded-3xl border border-border bg-bgCard shadow-sm">
          <div class="flex items-center justify-between mb-5">
            <div>
              <h2 class="text-sm font-black uppercase tracking-wider text-textMain">Top Services</h2>
              <p class="text-xs text-textMuted mt-0.5">By number of bookings</p>
            </div>
            <div class="w-8 h-8 rounded-lg flex items-center justify-center bg-warning/10 text-warning">🗂️</div>
          </div>

          <div *ngIf="loadingServices" class="flex items-center justify-center gap-3 py-12 text-textMuted">
            <div class="w-5 h-5 border-2 rounded-full animate-spin border-border border-t-primary"></div>
            <span class="text-xs font-semibold">Loading…</span>
          </div>

          <div *ngIf="!loadingServices && popularServices.length > 0" class="flex flex-col gap-4">
            <div *ngFor="let svc of popularServices; let i = index" class="group">
              <!-- Label row -->
              <div class="flex items-center justify-between mb-1.5">
                <div class="flex items-center gap-2">
                  <span class="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black text-white flex-shrink-0"
                        [style.background]="barColors[i % barColors.length]">{{ i + 1 }}</span>
                  <span class="text-xs font-bold truncate max-w-[180px] text-textMain">{{ svc.name }}</span>
                </div>
                <span class="text-xs font-black tabular-nums text-textMain">{{ svc.count }}</span>
              </div>
              <!-- Bar track -->
              <div class="h-2 rounded-full overflow-hidden bg-bgSoft">
                <div class="h-full rounded-full transition-all duration-700"
                     [style.width.%]="popularServices[0].count > 0 ? (svc.count / popularServices[0].count) * 100 : 0"
                     [style.background]="barColors[i % barColors.length]">
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="!loadingServices && popularServices.length === 0"
               class="flex flex-col items-center py-12 gap-3">
            <span class="text-4xl">📭</span>
            <p class="text-xs font-bold text-textMuted">No service data yet</p>
          </div>
        </div>

        <!-- Provider Leaderboard -->
        <div class="p-6 rounded-3xl border border-border bg-bgCard shadow-sm">
          <div class="flex items-center justify-between mb-5">
            <div>
              <h2 class="text-sm font-black uppercase tracking-wider text-textMain">Leaderboard</h2>
              <p class="text-xs text-textMuted mt-0.5">Ranked by completed jobs</p>
            </div>
            <div class="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-500/10 text-amber-500">🏆</div>
          </div>

          <div *ngIf="loadingProviders" class="flex items-center justify-center gap-3 py-12 text-textMuted">
            <div class="w-5 h-5 border-2 rounded-full animate-spin border-border border-t-primary"></div>
            <span class="text-xs font-semibold">Loading…</span>
          </div>

          <div *ngIf="!loadingProviders && leaderboard.length > 0" class="flex flex-col gap-2">
            <div *ngFor="let p of leaderboard; let i = index"
                 class="group flex items-center gap-3 p-2.5 rounded-2xl hover:bg-bgSoft/40 transition-colors duration-150 cursor-pointer">

              <!-- Rank badge -->
              <div class="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
                   [ngClass]="getRankClass(i)">
                {{ i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1) }}
              </div>

              <!-- Avatar -->
              <div class="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-black flex-shrink-0 bg-gradient-to-br from-primary to-indigo-600 shadow-sm">
                {{ (p.name || 'P')[0].toUpperCase() }}
              </div>

              <!-- Info -->
              <div class="flex-1 min-w-0">
                <div class="text-sm font-bold truncate text-textMain">{{ p.name }}</div>
                <div class="text-[10px] font-semibold text-textMuted">
                  {{ p.completedJobs }} jobs · ₹{{ formatAmount(p.totalEarnings) }} earned
                </div>
              </div>

              <!-- Rating -->
              <div class="flex items-center gap-1 flex-shrink-0">
                <span class="text-sm">⭐</span>
                <span class="text-sm font-black tabular-nums text-textMain">{{ p.avgRating | number:'1.1-1' }}</span>
              </div>
            </div>
          </div>

          <div *ngIf="!loadingProviders && leaderboard.length === 0"
               class="flex flex-col items-center py-12 gap-3">
            <span class="text-4xl">🏆</span>
            <p class="text-xs font-bold text-textMuted">No provider data yet</p>
          </div>
        </div>
      </div>

      <!-- ─── Bookings Per Month Trend ───────────────────────── -->
      <div class="p-6 rounded-3xl border border-border bg-bgCard shadow-sm animate-slide-up [animation-delay:260ms]"
           *ngIf="!loadingRevenue && revenueTrends.length > 0">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-sm font-black uppercase tracking-wider text-textMain">Booking Volume</h2>
            <p class="text-xs text-textMuted mt-0.5">Monthly booking count trend</p>
          </div>
          <div class="w-8 h-8 rounded-lg flex items-center justify-center bg-success/10 text-success">📅</div>
        </div>

        <div class="flex flex-col gap-4">
          <div *ngFor="let item of revenueTrends; let i = index"
               class="group flex items-center gap-3">
            <div class="text-[10px] font-black w-16 text-right flex-shrink-0 text-textMuted">{{ item.month }}</div>
            <div class="flex-1 h-2.5 rounded-full overflow-hidden bg-bgSoft">
              <div class="h-full rounded-full transition-all duration-700 group-hover:brightness-105 bg-gradient-to-r from-success to-emerald-400"
                   [style.width.%]="maxBookings > 0 ? (item.bookings / maxBookings) * 100 : 0">
              </div>
            </div>
            <span class="text-xs font-black tabular-nums w-10 text-right flex-shrink-0 text-textMain">{{ item.bookings }}</span>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: []
})
export class AnalyticsComponent implements OnInit {
  private adminService = inject(AdminService);

  revenueTrends:    any[] = [];
  popularServices:  any[] = [];
  leaderboard:      any[] = [];

  loadingRevenue   = true;
  loadingServices  = true;
  loadingProviders = true;

  maxRevenue  = 1;
  maxBookings = 1;
  yTicks:     string[] = [];

  barColors = ['#6366f1','#8b5cf6','#ec4899','#06b6d4','#10b981','#f59e0b'];

  get totalRevenue():  number { return this.revenueTrends.reduce((s, r) => s + (r.revenue  || 0), 0); }
  get totalBookings(): number { return this.revenueTrends.reduce((s, r) => s + (r.bookings || 0), 0); }
  get topService():    string { return this.popularServices[0]?.name || '—'; }
  get topProvider():   string { return this.leaderboard[0]?.name    || '—'; }

  ngOnInit() {
    this.loadRevenue();
    this.loadServices();
    this.loadLeaderboard();
  }

  loadRevenue() {
    this.adminService.getRevenueTrends().subscribe({
      next: (res) => {
        this.revenueTrends = (res.data?.monthly || []).map((item: any) => ({
          ...item,
          month:    this.shortMonth(item._id),
          bookings: item.count || 0
        }));
        this.maxRevenue  = Math.max(1, ...this.revenueTrends.map(r => r.revenue));
        this.maxBookings = Math.max(1, ...this.revenueTrends.map(r => r.bookings));
        this.buildYTicks();
        this.loadingRevenue = false;
      },
      error: () => { this.loadingRevenue = false; }
    });
  }

  loadServices() {
    this.adminService.getPopularServices().subscribe({
      next: (res) => {
        this.popularServices = (res.data || []).map((item: any) => ({
          name:    item._id || 'Unknown',
          count:   item.bookingsCount || 0,
          revenue: item.totalRevenue  || 0
        }));
        this.loadingServices = false;
      },
      error: () => { this.loadingServices = false; }
    });
  }

  loadLeaderboard() {
    this.adminService.getProviderLeaderboard().subscribe({
      next: (res) => {
        this.leaderboard = (res.data || []).map((item: any) => ({
          ...item,
          completedJobs: item.completedJobs ?? item.totalJobs ?? 0,
          totalEarnings: item.totalEarnings ?? 0,
          avgRating:     item.rating ?? 0
        }));
        this.loadingProviders = false;
      },
      error: () => { this.loadingProviders = false; }
    });
  }

  getRankClass(i: number): string {
    if (i === 0) return 'bg-amber-500/15 text-amber-500 text-base';
    if (i === 1) return 'bg-slate-400/20 text-slate-400 text-base';
    if (i === 2) return 'bg-amber-700/20 text-amber-700 text-base';
    return 'bg-bgSoft text-textMuted';
  }

  formatAmount(n: number): string {
    if (n >= 100000) return (n / 100000).toFixed(1) + 'L';
    if (n >= 1000)   return (n / 1000).toFixed(1)   + 'K';
    return n.toString();
  }

  private buildYTicks() {
    const steps = 4;
    const step  = this.maxRevenue / steps;
    this.yTicks = Array.from({ length: steps + 1 }, (_, i) =>
      this.formatAmount(Math.round(step * i))
    ).reverse();
  }

  private shortMonth(id: string): string {
    if (!id) return '';
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const parts  = id.split('-');
    if (parts.length === 2) {
      const m = parseInt(parts[1], 10);
      return `${months[m - 1]} '${parts[0].slice(2)}`;
    }
    return id;
  }
}
