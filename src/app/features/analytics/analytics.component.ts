import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="analytics-wrapper animate-fade-in">
      <div class="page-header">
        <div>
          <h1>Analytics</h1>
          <p>Platform-wide revenue, service demand, and provider performance insights</p>
        </div>
        <div class="period-badge">Last 6 Months</div>
      </div>

      <!-- Summary Cards -->
      <div class="summary-row" *ngIf="revenueTrends.length > 0">
        <div class="glass-panel summary-card">
          <div class="summary-icon" style="background:rgba(99,102,241,0.15);color:#818cf8">₹</div>
          <div>
            <div class="summary-label">Total Revenue</div>
            <div class="summary-value">₹{{ totalRevenue | number }}</div>
          </div>
        </div>
        <div class="glass-panel summary-card">
          <div class="summary-icon" style="background:rgba(16,185,129,0.15);color:#34d399">✓</div>
          <div>
            <div class="summary-label">Total Bookings</div>
            <div class="summary-value">{{ totalBookings | number }}</div>
          </div>
        </div>
        <div class="glass-panel summary-card">
          <div class="summary-icon" style="background:rgba(245,158,11,0.15);color:#fbbf24">★</div>
          <div>
            <div class="summary-label">Top Service</div>
            <div class="summary-value text-sm">{{ topService }}</div>
          </div>
        </div>
        <div class="glass-panel summary-card">
          <div class="summary-icon" style="background:rgba(244,63,94,0.15);color:#fb7185">👤</div>
          <div>
            <div class="summary-label">Top Provider</div>
            <div class="summary-value text-sm">{{ topProvider }}</div>
          </div>
        </div>
      </div>

      <!-- Revenue Trend Chart -->
      <div class="glass-panel chart-card">
        <div class="chart-header">
          <h2>Monthly Revenue</h2>
          <span class="chart-subtitle">Completed booking revenue per month</span>
        </div>

        <div class="loading-state" *ngIf="loadingRevenue">
          <div class="spinner"></div><span>Loading revenue data…</span>
        </div>

        <div class="bar-chart" *ngIf="!loadingRevenue && revenueTrends.length > 0">
          <div class="y-axis">
            <span *ngFor="let tick of yTicks">₹{{ tick }}</span>
          </div>
          <div class="bars-area">
            <div class="bar-col" *ngFor="let item of revenueTrends">
              <div class="bar-track">
                <div class="bar revenue-bar"
                  [style.height.%]="(item.revenue / maxRevenue) * 100"
                  [title]="'₹' + item.revenue">
                  <span class="bar-tip">₹{{ item.revenue | number }}</span>
                </div>
              </div>
              <div class="bar-label">{{ item.month }}</div>
            </div>
          </div>
        </div>

        <div class="empty-chart" *ngIf="!loadingRevenue && revenueTrends.length === 0">
          No revenue data available yet.
        </div>
      </div>

      <div class="two-col">
        <!-- Popular Services Chart -->
        <div class="glass-panel chart-card">
          <div class="chart-header">
            <h2>Top Services</h2>
            <span class="chart-subtitle">By number of bookings</span>
          </div>

          <div class="loading-state" *ngIf="loadingServices">
            <div class="spinner"></div><span>Loading…</span>
          </div>

          <div class="hbar-chart" *ngIf="!loadingServices && popularServices.length > 0">
            <div class="hbar-row" *ngFor="let svc of popularServices; let i = index">
              <div class="hbar-label" [title]="svc.name">{{ svc.name }}</div>
              <div class="hbar-track">
                <div class="hbar-fill"
                  [style.width.%]="(svc.count / popularServices[0].count) * 100"
                  [style.background]="barColors[i % barColors.length]">
                </div>
              </div>
              <div class="hbar-value">{{ svc.count }}</div>
            </div>
          </div>

          <div class="empty-chart" *ngIf="!loadingServices && popularServices.length === 0">
            No service data available yet.
          </div>
        </div>

        <!-- Provider Leaderboard -->
        <div class="glass-panel chart-card">
          <div class="chart-header">
            <h2>Provider Leaderboard</h2>
            <span class="chart-subtitle">Ranked by completed jobs</span>
          </div>

          <div class="loading-state" *ngIf="loadingProviders">
            <div class="spinner"></div><span>Loading…</span>
          </div>

          <div class="leaderboard" *ngIf="!loadingProviders && leaderboard.length > 0">
            <div class="leader-row" *ngFor="let p of leaderboard; let i = index">
              <div class="rank" [ngClass]="getRankClass(i)">{{ i + 1 }}</div>
              <div class="leader-avatar">{{ p.name.charAt(0).toUpperCase() }}</div>
              <div class="leader-info">
                <div class="leader-name">{{ p.name }}</div>
                <div class="leader-stat">{{ p.completedJobs }} jobs · ₹{{ p.totalEarnings | number }} earned</div>
              </div>
              <div class="leader-rating">
                <span class="star">★</span> {{ p.avgRating | number:'1.1-1' }}
              </div>
            </div>
          </div>

          <div class="empty-chart" *ngIf="!loadingProviders && leaderboard.length === 0">
            No provider data available yet.
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .analytics-wrapper { display: flex; flex-direction: column; gap: 28px; }

    /* Header */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 16px;
    }
    .page-header h1 { font-size: 2rem; font-weight: 600; color: var(--text-main); }
    .page-header p { color: var(--text-muted); font-size: 0.95rem; margin-top: 4px; }
    .period-badge {
      background: rgba(99,102,241,0.15);
      border: 1px solid rgba(99,102,241,0.3);
      color: #818cf8;
      padding: 8px 18px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
    }

    /* Summary cards */
    .summary-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }
    @media (max-width: 900px) { .summary-row { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 500px) { .summary-row { grid-template-columns: 1fr; } }
    .summary-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px 24px;
    }
    .summary-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
      flex-shrink: 0;
    }
    .summary-label { color: var(--text-muted); font-size: 0.8rem; margin-bottom: 4px; }
    .summary-value { color: var(--text-main); font-size: 1.25rem; font-weight: 700; }
    .summary-value.text-sm { font-size: 0.95rem; }

    /* Chart card */
    .chart-card { padding: 28px; }
    .chart-header { margin-bottom: 24px; }
    .chart-header h2 { font-size: 1.1rem; font-weight: 600; color: var(--text-main); }
    .chart-subtitle { color: var(--text-muted); font-size: 0.82rem; }

    /* Loading */
    .loading-state {
      display: flex;
      align-items: center;
      gap: 12px;
      color: var(--text-muted);
      padding: 40px 0;
      justify-content: center;
    }
    .spinner {
      width: 20px; height: 20px;
      border: 2px solid rgba(255,255,255,0.1);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-chart { text-align: center; color: var(--text-muted); padding: 40px 0; font-size: 0.9rem; }

    /* Vertical bar chart */
    .bar-chart {
      display: flex;
      gap: 12px;
      height: 220px;
    }
    .y-axis {
      display: flex;
      flex-direction: column-reverse;
      justify-content: space-between;
      padding-bottom: 28px;
      font-size: 0.72rem;
      color: var(--text-muted);
      min-width: 60px;
      text-align: right;
    }
    .bars-area {
      display: flex;
      align-items: flex-end;
      gap: 10px;
      flex: 1;
      border-left: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
      padding: 0 8px;
      padding-bottom: 0;
    }
    .bar-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
      height: 100%;
    }
    .bar-track {
      width: 100%;
      display: flex;
      align-items: flex-end;
      height: calc(100% - 28px);
    }
    .bar {
      width: 100%;
      border-radius: 6px 6px 0 0;
      position: relative;
      transition: height 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      min-height: 4px;
    }
    .revenue-bar {
      background: linear-gradient(180deg, #818cf8 0%, #6366f1 100%);
    }
    .revenue-bar:hover { background: linear-gradient(180deg, #a5b4fc 0%, #818cf8 100%); }
    .bar-tip {
      position: absolute;
      top: -28px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.8);
      color: var(--text-main);
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 0.7rem;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s;
    }
    .bar:hover .bar-tip { opacity: 1; }
    .bar-label {
      font-size: 0.72rem;
      color: var(--text-muted);
      margin-top: 6px;
      text-align: center;
    }

    /* Horizontal bar chart */
    .hbar-chart { display: flex; flex-direction: column; gap: 14px; }
    .hbar-row { display: flex; align-items: center; gap: 10px; }
    .hbar-label {
      min-width: 100px;
      max-width: 120px;
      font-size: 0.82rem;
      color: var(--text-main);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .hbar-track {
      flex: 1;
      height: 10px;
      background: rgba(255,255,255,0.05);
      border-radius: 99px;
      overflow: hidden;
    }
    .hbar-fill {
      height: 100%;
      border-radius: 99px;
      transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .hbar-value {
      min-width: 32px;
      text-align: right;
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--text-main);
    }

    /* Two-column layout */
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    @media (max-width: 900px) { .two-col { grid-template-columns: 1fr; } }

    /* Leaderboard */
    .leaderboard { display: flex; flex-direction: column; gap: 12px; }
    .leader-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 0;
      border-bottom: 1px solid rgba(255,255,255,0.04);
    }
    .leader-row:last-child { border-bottom: none; }
    .rank {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.85rem;
      background: rgba(255,255,255,0.05);
      color: var(--text-muted);
      flex-shrink: 0;
    }
    .rank.gold { background: rgba(251,191,36,0.15); color: #fbbf24; }
    .rank.silver { background: rgba(148,163,184,0.15); color: #94a3b8; }
    .rank.bronze { background: rgba(180,108,46,0.15); color: #d97706; }
    .leader-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.9rem;
      color: var(--text-main);
      flex-shrink: 0;
    }
    .leader-info { flex: 1; min-width: 0; }
    .leader-name { font-size: 0.9rem; font-weight: 600; color: var(--text-main); }
    .leader-stat { font-size: 0.75rem; color: var(--text-muted); margin-top: 2px; }
    .leader-rating { font-size: 0.85rem; font-weight: 600; color: #fbbf24; white-space: nowrap; }
    .star { font-size: 0.9rem; }
  `]
})
export class AnalyticsComponent implements OnInit {
  private adminService = inject(AdminService);

  revenueTrends: any[] = [];
  popularServices: any[] = [];
  leaderboard: any[] = [];

  loadingRevenue = true;
  loadingServices = true;
  loadingProviders = true;

  maxRevenue = 1;
  yTicks: string[] = [];

  barColors = [
    '#6366f1', '#8b5cf6', '#ec4899',
    '#06b6d4', '#10b981', '#f59e0b'
  ];

  get totalRevenue(): number {
    return this.revenueTrends.reduce((s, r) => s + (r.revenue || 0), 0);
  }
  get totalBookings(): number {
    return this.revenueTrends.reduce((s, r) => s + (r.bookings || 0), 0);
  }
  get topService(): string {
    return this.popularServices[0]?.name || '—';
  }
  get topProvider(): string {
    return this.leaderboard[0]?.name || '—';
  }

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
          month: this.shortMonth(item._id),
          bookings: item.count || 0
        }));
        this.maxRevenue = Math.max(1, ...this.revenueTrends.map((r) => r.revenue));
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
          name: item._id || 'Unknown',
          count: item.bookingsCount || 0,
          revenue: item.totalRevenue || 0
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
          avgRating: item.rating ?? 0
        }));
        this.loadingProviders = false;
      },
      error: () => { this.loadingProviders = false; }
    });
  }

  getRankClass(i: number): string {
    if (i === 0) return 'rank gold';
    if (i === 1) return 'rank silver';
    if (i === 2) return 'rank bronze';
    return 'rank';
  }

  private buildYTicks() {
    const steps = 4;
    const step = this.maxRevenue / steps;
    this.yTicks = Array.from({ length: steps + 1 }, (_, i) =>
      this.formatAmount(Math.round(step * i))
    ).reverse();
  }

  private formatAmount(n: number): string {
    if (n >= 100000) return (n / 100000).toFixed(1) + 'L';
    if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
    return n.toString();
  }

  private shortMonth(id: string): string {
    if (!id) return '';
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const parts = id.split('-');
    if (parts.length === 2) {
      const m = parseInt(parts[1], 10);
      return `${months[m - 1]} '${parts[0].slice(2)}`;
    }
    return id;
  }
}
