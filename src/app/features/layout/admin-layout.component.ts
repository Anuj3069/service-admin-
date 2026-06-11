import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="flex min-h-screen" style="background: var(--bg-shell)">

      <!-- ╔══════════════════════════════════════════╗
           ║           PREMIUM SIDEBAR                ║
           ╚══════════════════════════════════════════╝ -->
      <aside
        class="w-[270px] fixed top-0 bottom-0 left-0 z-50 flex flex-col transition-transform duration-300 ease-spring lg:translate-x-0"
        [class.translate-x-0]="sidebarOpen"
        [class.-translate-x-full]="!sidebarOpen"
        style="background: var(--sidebar-gradient); border-right: 1px solid var(--border);"
      >
        <!-- Brand logo -->
        <div class="flex items-center gap-3.5 px-6 py-5 border-b" style="border-color: var(--border)">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-glow-primary flex-shrink-0"
               style="background: var(--sidebar-accent); box-shadow: 0 6px 20px rgba(99,102,241,0.4)">
            A
          </div>
          <div>
            <div class="text-sm font-black tracking-tight" style="color: var(--text-main)">Admin Console</div>
            <div class="text-[10px] font-semibold" style="color: var(--text-muted)">ServiceApp Control</div>
          </div>
          <!-- Close btn on mobile -->
          <button class="ml-auto lg:hidden w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                  style="background: var(--bg-soft); color: var(--text-muted)"
                  (click)="closeSidebar()">✕</button>
        </div>

        <!-- Nav Section Label -->
        <div class="px-6 pt-5 pb-2">
          <span class="text-[9px] font-black uppercase tracking-[0.12em]" style="color: var(--text-subtle)">Navigation</span>
        </div>

        <!-- Nav items -->
        <nav class="flex-1 px-3 pb-4 flex flex-col gap-0.5 overflow-y-auto">
          <a
            *ngFor="let item of navItems; let i = index"
            [routerLink]="item.path"
            routerLinkActive="nav-active"
            [routerLinkActiveOptions]="{ exact: false }"
            (click)="closeSidebar()"
            class="group flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 border border-transparent relative overflow-hidden"
            style="color: var(--text-muted)"
            [style.animation-delay]="(i * 40) + 'ms'"
          >
            <!-- Hover background -->
            <span class="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style="background: rgba(var(--primary-rgb), 0.07)"></span>

            <!-- Icon box -->
            <span class="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0 relative z-10 transition-all duration-200 group-hover:scale-110"
                  [style]="getNavIconStyle(item.path)">
              {{ item.icon }}
            </span>

            <span class="relative z-10 leading-tight">{{ item.label }}</span>

            <!-- Active indicator dot -->
            <span class="ml-auto relative z-10 w-1.5 h-1.5 rounded-full opacity-0 nav-dot transition-opacity duration-200"
                  style="background: var(--primary)"></span>
          </a>
        </nav>

        <!-- Sidebar footer -->
        <div class="p-4 border-t" style="border-color: var(--border)">
          <!-- Admin user mini card -->
          <div class="flex items-center gap-3 p-3 rounded-xl mb-3" style="background: var(--bg-soft)">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-black flex-shrink-0"
                 style="background: var(--sidebar-accent)">
              {{ adminInitial }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-xs font-bold truncate" style="color: var(--text-main)">{{ adminName }}</div>
              <div class="text-[10px]" style="color: var(--text-muted)">Super Admin</div>
            </div>
            <div class="w-2 h-2 rounded-full flex-shrink-0" style="background: var(--success); box-shadow: 0 0 6px rgba(16,185,129,0.6)"></div>
          </div>

          <button (click)="logout()"
                  class="w-full py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold text-xs transition-all duration-200 border"
                  style="background: rgba(var(--danger-rgb), 0.08); border-color: rgba(var(--danger-rgb), 0.2); color: var(--danger)"
                  onmouseover="this.style.background='rgba(239,68,68,0.15)'"
                  onmouseout="this.style.background='rgba(239,68,68,0.08)'">
            <span>⎋</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <!-- Mobile overlay -->
      <div class="fixed inset-0 z-40 lg:hidden transition-opacity duration-300"
           [class.opacity-0]="!sidebarOpen"
           [class.pointer-events-none]="!sidebarOpen"
           style="background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);"
           *ngIf="sidebarOpen"
           (click)="closeSidebar()">
      </div>

      <!-- ╔══════════════════════════════════════════╗
           ║            MAIN CONTENT AREA             ║
           ╚══════════════════════════════════════════╝ -->
      <div class="flex-1 lg:ml-[270px] flex flex-col min-w-0">

        <!-- ── TOP HEADER BAR ── -->
        <header class="sticky top-0 z-30 flex items-center gap-4 px-6 py-4"
                style="background: rgba(255,255,255,0.8); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-bottom: 1px solid var(--border);">

          <!-- Mobile hamburger -->
          <button class="flex lg:hidden w-9 h-9 rounded-xl items-center justify-center transition-colors border font-bold text-base"
                  style="background: var(--bg-soft); border-color: var(--border); color: var(--text-muted)"
                  (click)="toggleSidebar()" aria-label="Open navigation">
            ☰
          </button>

          <!-- Page breadcrumb -->
          <div class="hidden sm:block">
            <div class="text-[10px] font-black uppercase tracking-widest" style="color: var(--text-subtle)">Admin / {{ currentPageTitle }}</div>
            <div class="text-base font-black leading-tight" style="color: var(--text-main)">{{ currentPageTitle }}</div>
          </div>

          <!-- Spacer -->
          <div class="flex-1"></div>

          <!-- Search -->
          <label class="hidden md:flex items-center gap-2.5 px-3.5 py-2 rounded-xl border w-full max-w-[240px] transition-all duration-200"
                 style="background: var(--bg-soft); border-color: var(--border)"
                 onfocusin="this.style.borderColor='var(--primary)'; this.style.boxShadow='0 0 0 4px rgba(99,102,241,0.1)'"
                 onfocusout="this.style.borderColor='var(--border)'; this.style.boxShadow='none'">
            <span class="text-sm" style="color: var(--text-subtle)">🔍</span>
            <input type="search" placeholder="Search..."
                   class="w-full bg-transparent border-none outline-none text-sm"
                   style="color: var(--text-main); font-family: var(--font-sans)"
                   [(ngModel)]="searchQuery" />
          </label>

          <!-- Notification bell -->
          <button class="relative w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-200"
                  style="background: var(--bg-soft); border-color: var(--border); color: var(--text-muted)"
                  onmouseover="this.style.background='var(--bg-card)'"
                  onmouseout="this.style.background='var(--bg-soft)'">
            🔔
            <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2"
                  style="background: var(--danger); border-color: var(--bg-soft)"></span>
          </button>

          <!-- Theme toggle -->
          <button class="w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-200 text-base"
                  style="background: var(--bg-soft); border-color: var(--border)"
                  (click)="toggleTheme()"
                  [attr.aria-label]="'Switch theme'"
                  onmouseover="this.style.background='var(--bg-card)'"
                  onmouseout="this.style.background='var(--bg-soft)'">
            {{ themeMode === 'dark' ? '☀️' : '🌙' }}
          </button>

          <!-- Admin avatar -->
          <div class="flex items-center gap-2.5 pl-3 border-l" style="border-color: var(--border)" *ngIf="adminName">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-black shadow-sm"
                 style="background: var(--sidebar-accent)">
              {{ adminInitial }}
            </div>
            <div class="hidden xl:block text-right">
              <div class="text-xs font-bold" style="color: var(--text-main)">{{ adminName }}</div>
              <div class="text-[10px]" style="color: var(--text-muted)">Administrator</div>
            </div>
          </div>
        </header>

        <!-- ── PAGE CONTENT ── -->
        <main class="flex-1 p-6 md:p-8">
          <router-outlet></router-outlet>
        </main>

        <!-- ── FOOTER BAR ── -->
        <footer class="px-8 py-4 flex items-center justify-between text-[10px] font-semibold border-t"
                style="color: var(--text-subtle); border-color: var(--border)">
          <span>© 2025 ServiceApp Admin Console</span>
          <span class="flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full" style="background: var(--success)"></span>
            All systems operational
          </span>
        </footer>
      </div>
    </div>
  `,
  styles: [`
    .nav-active {
      background: rgba(var(--primary-rgb), 0.1) !important;
      color: var(--primary) !important;
      border-color: rgba(var(--primary-rgb), 0.2) !important;
    }
    .nav-active .nav-dot {
      opacity: 1 !important;
    }
    :root[data-theme='dark'] header {
      background: rgba(22, 27, 46, 0.9) !important;
    }
    .ease-spring {
      transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
    }
  `]
})
export class AdminLayoutComponent implements OnInit {
  private router = inject(Router);

  sidebarOpen = false;
  adminName = '';
  searchQuery = '';
  themeMode: 'light' | 'dark' = 'light';

  navItems = [
    { icon: '🏠', label: 'Dashboard',  path: 'dashboard' },
    { icon: '📊', label: 'Analytics',  path: 'analytics' },
    { icon: '👤', label: 'Users',      path: 'users' },
    { icon: '🛠️', label: 'Providers',  path: 'providers' },
    { icon: '🗂️', label: 'Catalog',    path: 'catalog' },
    { icon: '📅', label: 'Bookings',   path: 'bookings' },
    { icon: '💳', label: 'Payments',   path: 'payments' },
    { icon: '⭐', label: 'Reviews',    path: 'reviews' },
    { icon: '⚙️', label: 'Settings',   path: 'settings' },
  ];

  private pageTitles: Record<string, string> = {
    dashboard: 'Overview',
    analytics: 'Analytics',
    users: 'Users',
    providers: 'Provider Moderation',
    catalog: 'Service Catalog',
    bookings: 'Booking Monitor',
    payments: 'Payments',
    reviews: 'Review Moderator',
    settings: 'Settings',
  };

  get currentPageTitle(): string {
    const segment = this.router.url.split('/').pop() || 'dashboard';
    return this.pageTitles[segment] || 'Admin Workspace';
  }

  get adminInitial(): string {
    return this.adminName ? this.adminName.charAt(0).toUpperCase() : 'A';
  }

  get nextThemeLabel(): string {
    return this.themeMode === 'dark' ? 'Light' : 'Dark';
  }

  getNavIconStyle(path: string): string {
    const colorMap: Record<string, string> = {
      dashboard: 'background: rgba(99,102,241,0.12); color: #6366f1',
      analytics:  'background: rgba(6,182,212,0.12); color: #06b6d4',
      users:      'background: rgba(245,158,11,0.12); color: #f59e0b',
      providers:  'background: rgba(16,185,129,0.12); color: #10b981',
      catalog:    'background: rgba(168,85,247,0.12); color: #a855f7',
      bookings:   'background: rgba(239,68,68,0.12); color: #ef4444',
      payments:   'background: rgba(34,197,94,0.12); color: #22c55e',
      reviews:    'background: rgba(251,191,36,0.12); color: #fbbf24',
      settings:   'background: rgba(148,163,184,0.12); color: #94a3b8',
    };
    return colorMap[path] || 'background: var(--bg-soft); color: var(--text-muted)';
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

  toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; }
  closeSidebar()  { this.sidebarOpen = false; }

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
