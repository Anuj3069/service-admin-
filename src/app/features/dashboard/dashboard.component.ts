import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col gap-8 animate-fade-in">

      <!-- ─── Page Header ──────────────────────────────────── -->
      <div class="animate-slide-up">
        <div class="flex items-center gap-3 mb-1.5">
          <div class="w-1.5 h-7 rounded-full" style="background: var(--sidebar-accent)"></div>
          <h1 class="text-2xl font-black tracking-tight" style="color: var(--text-main)">Overview</h1>
        </div>
        <p class="text-sm pl-5" style="color: var(--text-muted)">
          Platform stats, live analytics &amp; recent system activity
        </p>
      </div>

      <!-- ─── Stat Cards Grid ──────────────────────────────── -->
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

        <!-- Total Users -->
        <div class="group relative p-6 rounded-2xl border overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg animate-slide-up"
             style="background: var(--bg-card); border-color: var(--border); box-shadow: var(--shadow-sm)">
          <!-- Background glow -->
          <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
               style="background: radial-gradient(circle at 80% 20%, rgba(99,102,241,0.06) 0%, transparent 70%)"></div>
          <!-- Top row -->
          <div class="flex items-start justify-between gap-3 mb-4">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl text-white flex-shrink-0 transition-transform duration-300 group-hover:scale-110 icon-gradient-indigo">
              👥
            </div>
            <span class="px-2.5 py-1 rounded-full text-[10px] font-black border"
                  style="background: rgba(99,102,241,0.08); color: #6366f1; border-color: rgba(99,102,241,0.2)">
              +12% ↑
            </span>
          </div>
          <div class="animate-slide-up">
            <div class="text-3xl font-black mb-0.5 tabular-nums" style="color: var(--text-main)">{{ totalUsers }}</div>
            <div class="text-xs font-semibold uppercase tracking-widest" style="color: var(--text-muted)">Total Users</div>
          </div>
          <!-- Bottom progress bar -->
          <div class="mt-4 h-1 rounded-full overflow-hidden" style="background: var(--bg-soft)">
            <div class="h-full rounded-full transition-all duration-1000" style="width: 72%; background: var(--gradient-indigo)"></div>
          </div>
        </div>

        <!-- Verified Providers -->
        <div class="group relative p-6 rounded-2xl border overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg animate-slide-up"
             style="background: var(--bg-card); border-color: var(--border); box-shadow: var(--shadow-sm); animation-delay: 80ms">
          <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
               style="background: radial-gradient(circle at 80% 20%, rgba(6,182,212,0.06) 0%, transparent 70%)"></div>
          <div class="flex items-start justify-between gap-3 mb-4">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl text-white flex-shrink-0 transition-transform duration-300 group-hover:scale-110 icon-gradient-cyan">
              🛠️
            </div>
            <span class="px-2.5 py-1 rounded-full text-[10px] font-black border"
                  style="background: rgba(6,182,212,0.08); color: #06b6d4; border-color: rgba(6,182,212,0.2)">
              +5% ↑
            </span>
          </div>
          <div class="animate-slide-up">
            <div class="text-3xl font-black mb-0.5 tabular-nums" style="color: var(--text-main)">{{ totalProviders }}</div>
            <div class="text-xs font-semibold uppercase tracking-widest" style="color: var(--text-muted)">Providers</div>
          </div>
          <div class="mt-4 h-1 rounded-full overflow-hidden" style="background: var(--bg-soft)">
            <div class="h-full rounded-full transition-all duration-1000" style="width: 58%; background: var(--gradient-cyan)"></div>
          </div>
        </div>

        <!-- Active Bookings -->
        <div class="group relative p-6 rounded-2xl border overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg animate-slide-up"
             style="background: var(--bg-card); border-color: var(--border); box-shadow: var(--shadow-sm); animation-delay: 160ms">
          <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
               style="background: radial-gradient(circle at 80% 20%, rgba(245,158,11,0.06) 0%, transparent 70%)"></div>
          <div class="flex items-start justify-between gap-3 mb-4">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl text-white flex-shrink-0 transition-transform duration-300 group-hover:scale-110 icon-gradient-amber">
              📅
            </div>
            <span class="px-2.5 py-1 rounded-full text-[10px] font-black border"
                  style="background: rgba(245,158,11,0.08); color: #f59e0b; border-color: rgba(245,158,11,0.2)">
              Live
            </span>
          </div>
          <div class="animate-slide-up">
            <div class="text-3xl font-black mb-0.5 tabular-nums" style="color: var(--text-main)">{{ activeBookings }}</div>
            <div class="text-xs font-semibold uppercase tracking-widest" style="color: var(--text-muted)">Active Bookings</div>
          </div>
          <div class="mt-4 h-1 rounded-full overflow-hidden" style="background: var(--bg-soft)">
            <div class="h-full rounded-full transition-all duration-1000" style="width: 45%; background: var(--gradient-amber)"></div>
          </div>
        </div>

        <!-- Revenue -->
        <div class="group relative p-6 rounded-2xl border overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg animate-slide-up"
             style="background: var(--bg-card); border-color: var(--border); box-shadow: var(--shadow-sm); animation-delay: 240ms">
          <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
               style="background: radial-gradient(circle at 80% 20%, rgba(16,185,129,0.06) 0%, transparent 70%)"></div>
          <div class="flex items-start justify-between gap-3 mb-4">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl text-white flex-shrink-0 transition-transform duration-300 group-hover:scale-110 icon-gradient-emerald">
              💰
            </div>
            <span class="px-2.5 py-1 rounded-full text-[10px] font-black border"
                  style="background: rgba(16,185,129,0.08); color: #10b981; border-color: rgba(16,185,129,0.2)">
              +18% ↑
            </span>
          </div>
          <div class="animate-slide-up">
            <div class="text-3xl font-black mb-0.5 tabular-nums" style="color: var(--text-main)">₹{{ totalPaidRevenue.toLocaleString('en-IN') }}</div>
            <div class="text-xs font-semibold uppercase tracking-widest" style="color: var(--text-muted)">Total Revenue</div>
          </div>
          <div class="mt-4 h-1 rounded-full overflow-hidden" style="background: var(--bg-soft)">
            <div class="h-full rounded-full transition-all duration-1000" style="width: 83%; background: var(--gradient-emerald)"></div>
          </div>
        </div>
      </div>

      <!-- ─── Charts & Activity Row ─────────────────────────── -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-5">

        <!-- SVG Donut Chart -->
        <div class="lg:col-span-2 p-6 rounded-2xl border flex flex-col gap-5 animate-slide-up"
             style="background: var(--bg-card); border-color: var(--border); box-shadow: var(--shadow-sm); animation-delay: 320ms">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-sm font-black uppercase tracking-wider" style="color: var(--text-main)">Booking Status</h4>
              <p class="text-xs mt-0.5" style="color: var(--text-muted)">Distribution breakdown</p>
            </div>
            <div class="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                 style="background: rgba(99,102,241,0.1); color: #6366f1">📊</div>
          </div>

          <div class="flex items-center justify-center gap-8">
            <!-- Donut SVG -->
            <div class="relative flex-shrink-0">
              <svg class="w-[130px] h-[130px] -rotate-90 transition-transform duration-300 hover:scale-105" viewBox="0 0 100 100">
                <circle class="fill-none" style="stroke: var(--bg-soft); stroke-width: 10" cx="50" cy="50" r="38" />
                <circle class="fill-none" style="stroke: #f59e0b; stroke-width: 10; stroke-linecap: round; transition: stroke-dasharray 1s cubic-bezier(0.16,1,0.3,1)"
                        cx="50" cy="50" r="38"
                        [attr.stroke-dasharray]="requestedDash"
                        stroke-dashoffset="0" />
                <circle class="fill-none" style="stroke: #6366f1; stroke-width: 10; stroke-linecap: round; transition: stroke-dasharray 1s cubic-bezier(0.16,1,0.3,1)"
                        cx="50" cy="50" r="38"
                        [attr.stroke-dasharray]="acceptedDash"
                        [attr.stroke-dashoffset]="requestedOffset" />
                <circle class="fill-none" style="stroke: #10b981; stroke-width: 10; stroke-linecap: round; transition: stroke-dasharray 1s cubic-bezier(0.16,1,0.3,1)"
                        cx="50" cy="50" r="38"
                        [attr.stroke-dasharray]="completedDash"
                        [attr.stroke-dashoffset]="acceptedOffset" />
              </svg>
              <!-- Center text -->
              <div class="absolute inset-0 flex flex-col items-center justify-center rotate-90">
                <span class="text-lg font-black tabular-nums" style="color: var(--text-main)">{{ totalBookings }}</span>
                <span class="text-[9px] font-bold uppercase tracking-wider" style="color: var(--text-muted)">Total</span>
              </div>
            </div>

            <!-- Legend -->
            <div class="flex flex-col gap-3.5">
              <div class="flex items-center gap-2.5 cursor-pointer group/leg">
                <span class="w-3 h-3 rounded-full flex-shrink-0 animate-pulse" style="background: #f59e0b; box-shadow: 0 0 8px rgba(245,158,11,0.4)"></span>
                <div>
                  <div class="text-[10px] font-black" style="color: var(--text-muted)">Requested</div>
                  <div class="text-sm font-black tabular-nums" style="color: var(--text-main)">{{ countRequested }}</div>
                </div>
              </div>
              <div class="flex items-center gap-2.5 cursor-pointer">
                <span class="w-3 h-3 rounded-full flex-shrink-0" style="background: #6366f1; box-shadow: 0 0 8px rgba(99,102,241,0.4)"></span>
                <div>
                  <div class="text-[10px] font-black" style="color: var(--text-muted)">Active</div>
                  <div class="text-sm font-black tabular-nums" style="color: var(--text-main)">{{ countAccepted }}</div>
                </div>
              </div>
              <div class="flex items-center gap-2.5 cursor-pointer">
                <span class="w-3 h-3 rounded-full flex-shrink-0" style="background: #10b981; box-shadow: 0 0 8px rgba(16,185,129,0.4)"></span>
                <div>
                  <div class="text-[10px] font-black" style="color: var(--text-muted)">Completed</div>
                  <div class="text-sm font-black tabular-nums" style="color: var(--text-main)">{{ countCompleted }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Activity Feed -->
        <div class="lg:col-span-3 p-6 rounded-2xl border flex flex-col gap-5 animate-slide-up"
             style="background: var(--bg-card); border-color: var(--border); box-shadow: var(--shadow-sm); animation-delay: 360ms">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-sm font-black uppercase tracking-wider" style="color: var(--text-main)">Activity Feed</h4>
              <p class="text-xs mt-0.5" style="color: var(--text-muted)">Latest platform events</p>
            </div>
            <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full border"
                 style="background: rgba(16,185,129,0.08); border-color: rgba(16,185,129,0.2)">
              <span class="w-1.5 h-1.5 rounded-full animate-pulse" style="background: #10b981"></span>
              <span class="text-[10px] font-black" style="color: #10b981">Live</span>
            </div>
          </div>

          <div class="flex flex-col gap-1 max-h-[280px] overflow-y-auto pr-1">
            <div *ngFor="let act of recentActivities; let i = index"
                 class="group flex gap-3.5 items-start p-3 rounded-xl transition-all duration-200 cursor-pointer"
                 style="animation-delay: {{ i * 60 }}ms"
                 onmouseover="this.style.background='var(--bg-soft)'"
                 onmouseout="this.style.background='transparent'">
              <!-- Timeline dot + line -->
              <div class="flex flex-col items-center gap-1 flex-shrink-0 pt-1">
                <div class="w-2.5 h-2.5 rounded-full border-2 flex-shrink-0"
                     [ngClass]="{
                       'border-amber-400 bg-amber-400/30': act.type === 'booking',
                       'border-emerald-400 bg-emerald-400/30': act.type === 'payment',
                       'border-indigo-400 bg-indigo-400/30': act.type === 'user'
                     }">
                </div>
                <div class="w-px flex-1 min-h-[16px]" style="background: var(--border)" *ngIf="!isLast(i)"></div>
              </div>
              <!-- Text -->
              <div class="flex-1 min-w-0 pb-1">
                <p class="text-xs font-semibold leading-snug" style="color: var(--text-main)">{{ act.text }}</p>
                <span class="text-[10px] font-bold uppercase tracking-wide mt-0.5 block" style="color: var(--text-subtle)">{{ act.time }}</span>
              </div>
            </div>

            <div *ngIf="recentActivities.length === 0"
                 class="flex flex-col items-center justify-center py-12 gap-3">
              <span class="text-4xl">📭</span>
              <p class="text-sm font-bold" style="color: var(--text-muted)">No recent activity</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ─── Quick Stats Row ───────────────────────────────── -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-5 animate-slide-up" style="animation-delay: 440ms">

        <div class="p-5 rounded-2xl border flex items-center gap-4"
             style="background: var(--bg-card); border-color: var(--border)">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
               style="background: rgba(168,85,247,0.1); color: #a855f7">🎯</div>
          <div>
            <div class="text-xl font-black tabular-nums" style="color: var(--text-main)">{{ completionRate }}%</div>
            <div class="text-[11px] font-semibold" style="color: var(--text-muted)">Booking Completion Rate</div>
          </div>
        </div>

        <div class="p-5 rounded-2xl border flex items-center gap-4"
             style="background: var(--bg-card); border-color: var(--border)">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
               style="background: rgba(239,68,68,0.1); color: #ef4444">🔄</div>
          <div>
            <div class="text-xl font-black tabular-nums" style="color: var(--text-main)">{{ countRequested }}</div>
            <div class="text-[11px] font-semibold" style="color: var(--text-muted)">Pending Requests</div>
          </div>
        </div>

        <div class="p-5 rounded-2xl border flex items-center gap-4"
             style="background: var(--bg-card); border-color: var(--border)">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
               style="background: rgba(34,197,94,0.1); color: #22c55e">📈</div>
          <div>
            <div class="text-xl font-black" style="color: var(--text-main)">₹{{ avgRevenue.toLocaleString('en-IN') }}</div>
            <div class="text-[11px] font-semibold" style="color: var(--text-muted)">Avg. Revenue / Booking</div>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  private adminService = inject(AdminService);

  totalUsers = 0;
  totalProviders = 0;
  activeBookings = 0;
  totalPaidRevenue = 0;

  countRequested = 0;
  countAccepted = 0;
  countCompleted = 0;

  requestedDash = '0, 238.76';
  acceptedDash = '0, 238.76';
  completedDash = '0, 238.76';
  requestedOffset = '0';
  acceptedOffset = '0';

  recentActivities: Array<{ text: string; time: string; type: string }> = [];

  get totalBookings(): number {
    return this.countRequested + this.countAccepted + this.countCompleted;
  }

  get completionRate(): number {
    const total = this.totalBookings;
    if (total === 0) return 0;
    return Math.round((this.countCompleted / total) * 100);
  }

  get avgRevenue(): number {
    const completed = this.countCompleted || 1;
    return Math.round(this.totalPaidRevenue / completed);
  }

  isLast(i: number): boolean {
    return i === this.recentActivities.length - 1;
  }

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.adminService.getDashboardStats().subscribe({
      next: (res) => {
        const stats = res.data;

        this.totalUsers = stats.totalUsers || 0;
        this.totalProviders = stats.totalProviders || 0;
        this.activeBookings = stats.activeBookings || 0;
        this.totalPaidRevenue = stats.totalPaidRevenue || 0;

        this.countRequested = stats.countRequested || 0;
        this.countAccepted = stats.countAccepted || 0;
        this.countCompleted = stats.countCompleted || 0;

        this.calculateRingChart();

        this.recentActivities = (stats.recentActivities || []).map((act: any) => ({
          text: act.text,
          time: this.formatRelativeTime(new Date(act.time)),
          type: act.type
        }));
      },
      error: (err) => {
        console.error('Error fetching dashboard stats:', err);
      }
    });
  }

  calculateRingChart() {
    const total = this.countRequested + this.countAccepted + this.countCompleted;
    if (total === 0) return;

    const circumference = 2 * Math.PI * 38; // r=38 → ~238.76

    const pctRequested = this.countRequested / total;
    const pctAccepted  = this.countAccepted  / total;
    const pctCompleted = this.countCompleted / total;

    const lenReq  = pctRequested  * circumference;
    const lenAcc  = pctAccepted   * circumference;
    const lenComp = pctCompleted  * circumference;

    this.requestedDash  = `${lenReq}, ${circumference}`;
    this.acceptedDash   = `${lenAcc}, ${circumference}`;
    this.completedDash  = `${lenComp}, ${circumference}`;
    this.requestedOffset = `${-lenReq}`;
    this.acceptedOffset  = `${-(lenReq + lenAcc)}`;
  }

  formatRelativeTime(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    const intervals: [number, string][] = [
      [31536000, 'yr'], [2592000, 'mo'], [86400, 'd'],
      [3600, 'hr'], [60, 'min']
    ];
    for (const [secs, unit] of intervals) {
      const val = Math.floor(seconds / secs);
      if (val >= 1) return `${val}${unit} ago`;
    }
    return 'just now';
  }
}
