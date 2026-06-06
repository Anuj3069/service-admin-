import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-wrapper animate-fade-in">
      <div class="page-header">
        <h1>Overview</h1>
        <p>Live stats and administrative performance analytics</p>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="glass-panel glass-panel-hover stat-card">
          <div class="stat-icon users-icon">👥</div>
          <div class="stat-content">
            <span class="stat-label">Total Platform Users</span>
            <h3 class="stat-value">{{ totalUsers }}</h3>
          </div>
        </div>

        <div class="glass-panel glass-panel-hover stat-card">
          <div class="stat-icon providers-icon">🛠️</div>
          <div class="stat-content">
            <span class="stat-label">Verified Providers</span>
            <h3 class="stat-value">{{ totalProviders }}</h3>
          </div>
        </div>

        <div class="glass-panel glass-panel-hover stat-card">
          <div class="stat-icon bookings-icon">📅</div>
          <div class="stat-content">
            <span class="stat-label">Active Bookings</span>
            <h3 class="stat-value">{{ activeBookings }}</h3>
          </div>
        </div>

        <div class="glass-panel glass-panel-hover stat-card">
          <div class="stat-icon earnings-icon">💰</div>
          <div class="stat-content">
            <span class="stat-label">Total Paid Revenue</span>
            <h3 class="stat-value">₹{{ totalPaidRevenue.toLocaleString() }}</h3>
          </div>
        </div>
      </div>

      <div class="dashboard-charts">
        <!-- SVG Ring Chart -->
        <div class="glass-panel chart-card">
          <h4 class="card-title">Booking Status Distribution</h4>
          <div class="chart-container">
            <svg class="ring-chart" viewBox="0 0 100 100">
              <circle class="ring-bg" cx="50" cy="50" r="40" />
              <circle class="ring-fg requested" cx="50" cy="50" r="40" 
                [attr.stroke-dasharray]="requestedDash" 
                [attr.stroke-dashoffset]="0" />
              <circle class="ring-fg accepted" cx="50" cy="50" r="40" 
                [attr.stroke-dasharray]="acceptedDash" 
                [attr.stroke-dashoffset]="requestedOffset" />
              <circle class="ring-fg completed" cx="50" cy="50" r="40" 
                [attr.stroke-dasharray]="completedDash" 
                [attr.stroke-dashoffset]="acceptedOffset" />
            </svg>
            <div class="chart-legend">
              <div class="legend-item"><span class="legend-dot requested-dot"></span> Requested ({{ countRequested }})</div>
              <div class="legend-item"><span class="legend-dot accepted-dot"></span> Accepted/Active ({{ countAccepted }})</div>
              <div class="legend-item"><span class="legend-dot completed-dot"></span> Completed ({{ countCompleted }})</div>
            </div>
          </div>
        </div>

        <!-- Recent Activities / Notifications -->
        <div class="glass-panel activity-card">
          <h4 class="card-title">System Activity Log</h4>
          <div class="activity-feed">
            <div class="feed-item" *ngFor="let act of recentActivities">
              <div class="feed-marker" [ngClass]="act.type"></div>
              <div class="feed-body">
                <p class="feed-text">{{ act.text }}</p>
                <span class="feed-time">{{ act.time }}</span>
              </div>
            </div>
            <div *ngIf="recentActivities.length === 0" class="no-activity">
              No recent bookings or payment updates.
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-wrapper {
      display: flex;
      flex-direction: column;
      gap: 32px;
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
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 24px;
    }
    .stat-card {
      display: flex;
      align-items: center;
      padding: 24px;
      gap: 20px;
    }
    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border);
    }
    .users-icon { color: #818cf8; background: rgba(99, 102, 241, 0.1); border-color: rgba(99, 102, 241, 0.2); }
    .providers-icon { color: #22d3ee; background: rgba(6, 182, 212, 0.1); border-color: rgba(6, 182, 212, 0.2); }
    .bookings-icon { color: #fbbf24; background: rgba(245, 158, 11, 0.1); border-color: rgba(245, 158, 11, 0.2); }
    .earnings-icon { color: #34d399; background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.2); }

    .stat-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .stat-label {
      font-size: 0.85rem;
      color: var(--text-muted);
      font-weight: 500;
    }
    .stat-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-main);
    }

    .dashboard-charts {
      display: grid;
      grid-template-columns: 1fr 1.2fr;
      gap: 24px;
    }
    @media (max-width: 991px) {
      .dashboard-charts {
        grid-template-columns: 1fr;
      }
    }
    .chart-card, .activity-card {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .card-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-main);
    }
    .chart-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 32px;
      height: 200px;
    }
    .ring-chart {
      width: 150px;
      height: 150px;
      transform: rotate(-90deg);
    }
    .ring-bg {
      fill: none;
      stroke: rgba(255, 255, 255, 0.05);
      stroke-width: 8px;
    }
    .ring-fg {
      fill: none;
      stroke-width: 8px;
      stroke-linecap: round;
      transition: stroke-dasharray 0.3s ease;
    }
    .ring-fg.requested { stroke: #fbbf24; }
    .ring-fg.accepted { stroke: #818cf8; }
    .ring-fg.completed { stroke: #34d399; }

    .chart-legend {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.875rem;
      color: var(--text-muted);
    }
    .legend-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    .requested-dot { background: #fbbf24; }
    .accepted-dot { background: #818cf8; }
    .completed-dot { background: #34d399; }

    .activity-feed {
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-height: 260px;
      overflow-y: auto;
      padding-right: 8px;
    }
    .feed-item {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }
    .feed-marker {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-top: 6px;
      flex-shrink: 0;
    }
    .feed-marker.booking { background: #fbbf24; }
    .feed-marker.payment { background: #34d399; }
    .feed-marker.user { background: #818cf8; }

    .feed-body {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .feed-text {
      font-size: 0.9rem;
      color: var(--text-main);
    }
    .feed-time {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .no-activity {
      text-align: center;
      padding: 40px 0;
      color: var(--text-muted);
      font-size: 0.9rem;
    }
  `]
})
export class DashboardComponent {
  private adminService = inject(AdminService);

  totalUsers = 0;
  totalProviders = 0;
  activeBookings = 0;
  totalPaidRevenue = 0;

  countRequested = 0;
  countAccepted = 0;
  countCompleted = 0;

  requestedDash = '0, 251.2';
  acceptedDash = '0, 251.2';
  completedDash = '0, 251.2';
  requestedOffset = '0';
  acceptedOffset = '0';

  recentActivities: Array<{ text: string, time: string, type: string }> = [];

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.adminService.getDashboardStats().subscribe({
      next: (res) => {
        const stats = res.data;

        // All values are pre-computed by the backend
        this.totalUsers = stats.totalUsers || 0;
        this.totalProviders = stats.totalProviders || 0;
        this.activeBookings = stats.activeBookings || 0;
        this.totalPaidRevenue = stats.totalPaidRevenue || 0;

        this.countRequested = stats.countRequested || 0;
        this.countAccepted = stats.countAccepted || 0;
        this.countCompleted = stats.countCompleted || 0;

        this.calculateRingChart();

        // Activity feed — only format relative times on the UI side
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

    const circumference = 2 * Math.PI * 40; // ~251.2
    
    const pctRequested = this.countRequested / total;
    const pctAccepted = this.countAccepted / total;
    const pctCompleted = this.countCompleted / total;

    const lenReq = pctRequested * circumference;
    const lenAcc = pctAccepted * circumference;
    const lenComp = pctCompleted * circumference;

    this.requestedDash = `${lenReq}, ${circumference}`;
    this.acceptedDash = `${lenAcc}, ${circumference}`;
    this.completedDash = `${lenComp}, ${circumference}`;

    this.requestedOffset = `${-lenReq}`;
    this.acceptedOffset = `${-(lenReq + lenAcc)}`;
  }

  formatRelativeTime(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = Math.floor(seconds / 31536000);

    if (interval >= 1) return interval + " years ago";
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return interval + " months ago";
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return interval + " days ago";
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return interval + " hours ago";
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return interval + " minutes ago";
    return "just now";
  }
}
