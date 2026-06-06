import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-container">
      <!-- Sidebar -->
      <aside class="sidebar" [class.mobile-open]="sidebarOpen">
        <div class="sidebar-brand">
          <span class="brand-icon">🛡️</span>
          <span class="brand-name">Admin Console</span>
        </div>

        <nav class="sidebar-nav">
          <a routerLink="dashboard" routerLinkActive="active" (click)="closeSidebar()" class="nav-item">
            <span class="nav-icon">📊</span> Dashboard
          </a>
          <a routerLink="analytics" routerLinkActive="active" (click)="closeSidebar()" class="nav-item">
            <span class="nav-icon">📈</span> Analytics
          </a>
          <a routerLink="users" routerLinkActive="active" (click)="closeSidebar()" class="nav-item">
            <span class="nav-icon">👥</span> Users
          </a>
          <a routerLink="providers" routerLinkActive="active" (click)="closeSidebar()" class="nav-item">
            <span class="nav-icon">🛠️</span> Providers
          </a>
          <a routerLink="catalog" routerLinkActive="active" (click)="closeSidebar()" class="nav-item">
            <span class="nav-icon">🗂️</span> Catalog
          </a>
          <a routerLink="bookings" routerLinkActive="active" (click)="closeSidebar()" class="nav-item">
            <span class="nav-icon">📅</span> Bookings
          </a>
          <a routerLink="payments" routerLinkActive="active" (click)="closeSidebar()" class="nav-item">
            <span class="nav-icon">💳</span> Payments
          </a>
          <a routerLink="reviews" routerLinkActive="active" (click)="closeSidebar()" class="nav-item">
            <span class="nav-icon">💬</span> Reviews
          </a>
          <a routerLink="promos" routerLinkActive="active" (click)="closeSidebar()" class="nav-item">
            <span class="nav-icon">🎟️</span> Promo Codes
          </a>
          <a routerLink="settings" routerLinkActive="active" (click)="closeSidebar()" class="nav-item">
            <span class="nav-icon">⚙️</span> Settings
          </a>
        </nav>

        <div class="sidebar-footer">
          <button (click)="logout()" class="btn btn-secondary logout-btn">
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      <!-- Main Area -->
      <div class="main-wrapper">
        <header class="top-header glass-panel">
          <button class="mobile-toggle" (click)="toggleSidebar()">
            ☰
          </button>
          <div class="header-title">
            <!-- Dynamic placeholder based on route -->
            Service Booking Admin Dashboard
          </div>
          <div class="header-profile" *ngIf="adminName">
            <div class="avatar">A</div>
            <span class="admin-username">{{ adminName }}</span>
          </div>
        </header>

        <main class="main-content">
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- Mobile Overlay -->
      <div class="mobile-overlay" *ngIf="sidebarOpen" (click)="closeSidebar()"></div>
    </div>
  `,
  styles: [`
    .admin-container {
      display: flex;
      min-height: 100vh;
    }
    .sidebar {
      width: 260px;
      background: var(--bg-sidebar);
      backdrop-filter: blur(16px);
      border-right: 1px solid var(--border);
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
      height: 70px;
      display: flex;
      align-items: center;
      padding: 0 24px;
      gap: 12px;
      border-bottom: 1px solid var(--border);
    }
    .brand-icon {
      font-size: 1.5rem;
    }
    .brand-name {
      font-size: 1.15rem;
      font-weight: 600;
      color: #fff;
      letter-spacing: 0.5px;
    }
    .sidebar-nav {
      flex: 1;
      padding: 24px 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      color: var(--text-muted);
      text-decoration: none;
      border-radius: 8px;
      font-weight: 500;
      transition: var(--transition-smooth);
    }
    .nav-item:hover {
      background: rgba(255, 255, 255, 0.03);
      color: var(--text-main);
    }
    .nav-item.active {
      background: rgba(99, 102, 241, 0.12);
      color: #818cf8;
      border-left: 3px solid var(--primary);
    }
    .nav-icon {
      font-size: 1.1rem;
    }
    .sidebar-footer {
      padding: 20px 16px;
      border-top: 1px solid var(--border);
    }
    .logout-btn {
      width: 100%;
      background: transparent;
      border-color: rgba(244, 63, 94, 0.3);
      color: #fb7185;
    }
    .logout-btn:hover {
      background: rgba(244, 63, 94, 0.1);
      border-color: var(--danger);
    }
    .main-wrapper {
      flex: 1;
      margin-left: 260px;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .top-header {
      height: 70px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 32px;
      border-radius: 0;
      border-left: none;
      border-top: none;
      border-right: none;
      position: sticky;
      top: 0;
      z-index: 90;
    }
    .mobile-toggle {
      display: none;
      background: none;
      border: none;
      color: #fff;
      font-size: 1.5rem;
      cursor: pointer;
    }
    .header-title {
      font-size: 1.1rem;
      font-weight: 500;
    }
    .header-profile {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--primary);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
    }
    .admin-username {
      font-size: 0.9rem;
      font-weight: 500;
    }
    .main-content {
      padding: 32px;
      flex: 1;
    }
    .mobile-overlay {
      display: none;
    }

    /* Responsive */
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
        padding: 0 20px;
      }
      .mobile-overlay {
        display: block;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(2px);
        z-index: 99;
      }
    }
  `]
})
export class AdminLayoutComponent {
  private router = inject(Router);

  sidebarOpen = false;
  adminName = '';

  ngOnInit() {
    const userJson = localStorage.getItem('admin_user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        this.adminName = user.name || 'Administrator';
      } catch (e) {
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

  logout() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    this.router.navigate(['/login']);
  }
}
