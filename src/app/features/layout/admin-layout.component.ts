import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="admin-container">
      <aside class="sidebar" [class.mobile-open]="sidebarOpen">
        <div class="sidebar-brand">
          <span class="brand-icon">A</span>
          <div>
            <span class="brand-name">Admin Console</span>
            <p class="brand-subtitle">Service booking control</p>
          </div>
        </div>

        <nav class="sidebar-nav">
          <a *ngFor="let item of navItems" [routerLink]="item.path" routerLinkActive="active" (click)="closeSidebar()" class="nav-item">
            <span class="nav-icon">{{ item.index }}</span>
            <span>{{ item.label }}</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <button (click)="logout()" class="btn btn-secondary logout-btn">
            <span>Exit</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div class="main-wrapper">
        <header class="top-header glass-panel">
          <button class="mobile-toggle" aria-label="Toggle navigation" (click)="toggleSidebar()">Menu</button>
          <div class="header-left">
            <div class="page-label">Admin Workspace</div>
            <div class="page-title">{{ currentPageTitle }}</div>
          </div>
          <div class="header-actions">
            <label class="search-box">
              <span>Search</span>
              <input type="search" placeholder="Search users, bookings..." [(ngModel)]="searchQuery" />
            </label>
            <button class="theme-toggle" type="button" (click)="toggleTheme()" [attr.aria-label]="'Switch to ' + nextThemeLabel + ' mode'">
              <span class="theme-state">{{ themeMode === 'dark' ? 'Dark' : 'Light' }}</span>
              <span>{{ nextThemeLabel }}</span>
            </button>
            <div class="header-profile" *ngIf="adminName">
              <div class="avatar">{{ adminInitial }}</div>
              <div class="profile-text">
                <span>{{ adminName }}</span>
                <small>Administrator</small>
              </div>
            </div>
          </div>
        </header>

        <main class="main-content">
          <router-outlet></router-outlet>
        </main>
      </div>

      <div class="mobile-overlay" *ngIf="sidebarOpen" (click)="closeSidebar()"></div>
    </div>
  `,
  styles: [`
    .admin-container {
      display: flex;
      min-height: 100vh;
      background: var(--bg-shell);
    }
    .sidebar {
      width: 280px;
      background: var(--bg-sidebar);
      border-right: 1px solid var(--border);
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      z-index: 100;
      transition: var(--transition-smooth);
    }
    .sidebar-brand {
      min-height: 88px;
      display: flex;
      align-items: center;
      padding: 0 24px;
      gap: 14px;
      border-bottom: 1px solid var(--border);
    }
    .brand-icon {
      width: 42px;
      height: 42px;
      border-radius: 8px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: var(--primary);
      color: #fff;
      font-size: 1rem;
      font-weight: 800;
    }
    .brand-name {
      display: block;
      font-size: 1.12rem;
      font-weight: 800;
      color: var(--text-main);
      letter-spacing: 0;
    }
    .brand-subtitle {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-top: 2px;
    }
    .sidebar-nav {
      flex: 1;
      padding: 20px 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 13px 16px;
      color: var(--text-muted);
      text-decoration: none;
      border-radius: 8px;
      font-weight: 700;
      transition: var(--transition-smooth);
    }
    .nav-item:hover {
      background: var(--bg-soft);
      color: var(--text-main);
      transform: translateX(2px);
    }
    .nav-item.active {
      background: rgba(37, 99, 235, 0.12);
      color: var(--primary);
      box-shadow: inset 3px 0 0 var(--primary);
    }
    .nav-icon {
      width: 28px;
      color: var(--text-subtle);
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0;
    }
    .sidebar-footer {
      padding: 22px 18px;
      border-top: 1px solid var(--border);
    }
    .logout-btn {
      width: 100%;
      background: rgba(220, 38, 38, 0.1);
      border-color: rgba(220, 38, 38, 0.18);
      color: var(--danger);
    }
    .logout-btn:hover {
      background: rgba(220, 38, 38, 0.16);
      border-color: rgba(220, 38, 38, 0.28);
    }
    .main-wrapper {
      flex: 1;
      margin-left: 280px;
      display: flex;
      flex-direction: column;
      min-width: 0;
      padding-bottom: 28px;
    }
    .top-header {
      min-height: 82px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      gap: 18px;
      margin: 20px 20px 0;
      position: sticky;
      top: 16px;
      z-index: 90;
    }
    .mobile-toggle {
      display: none;
      background: var(--bg-soft);
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text-main);
      font-size: 0.85rem;
      font-weight: 800;
      padding: 8px 10px;
      cursor: pointer;
    }
    .header-left {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 170px;
    }
    .page-label {
      text-transform: uppercase;
      letter-spacing: 0.16em;
      font-size: 0.68rem;
      color: var(--text-muted);
      font-weight: 800;
    }
    .page-title {
      font-size: 1.28rem;
      font-weight: 800;
      color: var(--text-main);
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      width: 100%;
      justify-content: flex-end;
    }
    .search-box {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 0 12px;
      min-width: 280px;
      min-height: 42px;
      border-radius: 8px;
      border: 1px solid var(--border);
      background: var(--bg-soft);
      color: var(--text-muted);
      transition: var(--transition-smooth);
      font-size: 0.78rem;
      font-weight: 800;
    }
    .search-box input {
      width: 100%;
      background: transparent;
      border: none;
      outline: none;
      color: var(--text-main);
      font-size: 0.92rem;
    }
    .search-box:hover,
    .search-box:focus-within {
      border-color: var(--primary);
      background: var(--bg-card);
    }
    .theme-toggle {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      min-height: 42px;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--bg-card);
      color: var(--text-main);
      padding: 8px 12px;
      font-weight: 800;
      cursor: pointer;
      transition: var(--transition-smooth);
    }
    .theme-toggle:hover {
      border-color: var(--border-strong);
      background: var(--bg-card-hover);
    }
    .theme-state {
      color: var(--text-muted);
      font-size: 0.78rem;
    }
    .header-profile {
      display: flex;
      align-items: center;
      gap: 10px;
      padding-left: 4px;
    }
    .profile-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 120px;
      text-align: right;
    }
    .profile-text span {
      font-weight: 800;
      color: var(--text-main);
    }
    .profile-text small {
      color: var(--text-muted);
      font-size: 0.75rem;
    }
    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background: var(--primary);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      box-shadow: var(--shadow-sm);
    }
    .main-content {
      padding: 32px;
      flex: 1;
      min-height: calc(100vh - 170px);
    }
    .mobile-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.55);
      z-index: 45;
    }
    @media (max-width: 991px) {
      .sidebar {
        transform: translateX(-100%);
      }
      .sidebar.mobile-open {
        transform: translateX(0);
      }
      .main-wrapper {
        margin-left: 0;
      }
      .mobile-toggle {
        display: block;
      }
      .top-header {
        padding: 16px;
        margin: 16px 16px 0;
        align-items: flex-start;
        flex-wrap: wrap;
      }
      .header-actions,
      .search-box,
      .theme-toggle {
        width: 100%;
      }
      .main-content {
        padding: 24px 16px;
      }
    }
  `]
})
export class AdminLayoutComponent {
  private router = inject(Router);

  sidebarOpen = false;
  adminName = '';
  searchQuery = '';
  themeMode: 'light' | 'dark' = 'light';

  navItems = [
    { index: '01', label: 'Dashboard', path: 'dashboard' },
    { index: '02', label: 'Analytics', path: 'analytics' },
    { index: '03', label: 'Users', path: 'users' },
    { index: '04', label: 'Providers', path: 'providers' },
    { index: '05', label: 'Catalog', path: 'catalog' },
    { index: '06', label: 'Bookings', path: 'bookings' },
    { index: '07', label: 'Payments', path: 'payments' },
    { index: '08', label: 'Reviews', path: 'reviews' },
    { index: '09', label: 'Settings', path: 'settings' }
  ];

  get currentPageTitle() {
    const routeName = this.router.url.split('/').pop() || 'dashboard';
    const titles: Record<string, string> = {
      dashboard: 'Overview',
      analytics: 'Analytics',
      users: 'Users',
      providers: 'Providers',
      catalog: 'Catalog',
      bookings: 'Booking Monitor',
      payments: 'Payments',
      reviews: 'Review Moderator',
      settings: 'Settings'
    };
    return titles[routeName] || 'Admin Workspace';
  }

  get adminInitial() {
    return this.adminName ? this.adminName.charAt(0).toUpperCase() : 'A';
  }

  get nextThemeLabel() {
    return this.themeMode === 'dark' ? 'Light' : 'Dark';
  }

  ngOnInit() {
    const savedTheme = localStorage.getItem('admin_theme');
    this.themeMode = savedTheme === 'dark' ? 'dark' : 'light';
    this.applyTheme();

    const userJson = localStorage.getItem('admin_user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        this.adminName = user.name || 'Administrator';
      } catch {
        this.adminName = 'Admin';
      }
    }
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    this.sidebarOpen = false;
  }

  toggleTheme() {
    this.themeMode = this.themeMode === 'dark' ? 'light' : 'dark';
    localStorage.setItem('admin_theme', this.themeMode);
    this.applyTheme();
  }

  logout() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    this.router.navigate(['/login']);
  }

  private applyTheme() {
    document.documentElement.setAttribute('data-theme', this.themeMode);
  }
}
