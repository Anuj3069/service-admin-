import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col gap-6 animate-fade-in">

      <!-- ─── Page Header ──────────────────────────────────── -->
      <div class="animate-slide-up">
        <div class="flex items-center gap-3 mb-1.5">
          <div class="w-1.5 h-7 rounded-full bg-gradient-to-b from-primary to-accent"></div>
          <h1 class="text-2xl font-black tracking-tight text-textMain">User Management</h1>
        </div>
        <p class="text-sm pl-5 text-textMuted">Monitor registrations, manage roles and authorization status</p>
      </div>

      <!-- ─── Stats Row ─────────────────────────────────────── -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5 animate-slide-up [animation-delay:50ms]">
        <div class="p-5 rounded-2xl border border-border bg-bgCard hover:border-primary/20 hover:shadow-md transition-all duration-300 flex items-center gap-4 group">
          <div class="w-11 h-11 rounded-xl flex items-center justify-center text-lg font-black bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
            👤
          </div>
          <div>
            <div class="text-2xl font-black tabular-nums text-textMain">{{ totalUsers }}</div>
            <div class="text-[10px] font-bold uppercase tracking-wider text-textMuted">Total Users</div>
          </div>
        </div>
        <div class="p-5 rounded-2xl border border-border bg-bgCard hover:border-success/20 hover:shadow-md transition-all duration-300 flex items-center gap-4 group">
          <div class="w-11 h-11 rounded-xl flex items-center justify-center text-lg bg-success/10 text-success group-hover:scale-110 transition-transform duration-300">
            ✅
          </div>
          <div>
            <div class="text-2xl font-black tabular-nums text-textMain">{{ activeCount }}</div>
            <div class="text-[10px] font-bold uppercase tracking-wider text-textMuted">Active</div>
          </div>
        </div>
        <div class="p-5 rounded-2xl border border-border bg-bgCard hover:border-danger/20 hover:shadow-md transition-all duration-300 flex items-center gap-4 group">
          <div class="w-11 h-11 rounded-xl flex items-center justify-center text-lg bg-danger/10 text-danger group-hover:scale-110 transition-transform duration-300">
            🚫
          </div>
          <div>
            <div class="text-2xl font-black tabular-nums text-textMain">{{ blockedCount }}</div>
            <div class="text-[10px] font-bold uppercase tracking-wider text-textMuted">Blocked</div>
          </div>
        </div>
      </div>

      <!-- ─── Filters ───────────────────────────────────────── -->
      <div class="p-4 rounded-2xl border border-border bg-bgCard flex flex-wrap gap-4 items-center justify-between animate-slide-up [animation-delay:100ms] shadow-sm">
        <div class="flex flex-wrap gap-3 items-center flex-1">
          <div class="flex items-center gap-2 text-xs font-bold text-textMuted">
            <span>🔧</span> Filters
          </div>
          <div class="h-4 w-px bg-border hidden sm:block"></div>

          <div class="relative flex-1 min-w-[220px] max-w-sm">
            <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm pointer-events-none text-textSubtle">🔍</span>
            <input type="text"
                   class="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-bgSoft text-textMain text-xs font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                   placeholder="Search name, email or phone..."
                   [(ngModel)]="searchQuery"
                   (ngModelChange)="onSearch()" />
          </div>

          <select class="px-3 py-2 rounded-xl text-xs font-semibold border border-border bg-bgSoft text-textMain outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer"
                  [(ngModel)]="selectedRole" (change)="onFilterChange()">
            <option value="">All Roles</option>
            <option value="customer">👤 Customer</option>
            <option value="worker">🛠️ Worker</option>
            <option value="admin">🛡️ Administrator</option>
          </select>

          <select class="px-3 py-2 rounded-xl text-xs font-semibold border border-border bg-bgSoft text-textMain outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer"
                  [(ngModel)]="selectedStatus" (change)="onFilterChange()">
            <option value="">All Statuses</option>
            <option value="true">🟢 Active Only</option>
            <option value="false">🔴 Blocked Only</option>
          </select>
        </div>

        <div class="text-[10px] font-bold uppercase tracking-wider text-textSubtle">
          {{ totalUsers }} users
        </div>
      </div>

      <!-- ─── Users Table ───────────────────────────────────── -->
      <div class="rounded-2xl border border-border bg-bgCard overflow-hidden animate-slide-up [animation-delay:140ms] shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-left min-w-[760px]">
            <thead>
              <tr class="bg-bgSoft">
                <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b border-border text-textMuted">User</th>
                <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b border-border text-textMuted">Contact</th>
                <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b border-border text-textMuted">Role</th>
                <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b border-border text-textMuted">Status</th>
                <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b border-border text-textMuted">Registered</th>
                <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b border-border text-textMuted">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of users; let i = index"
                  class="border-b border-border hover:bg-bgSoft/40 group transition-colors duration-150">

                <!-- Avatar + Name -->
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
                         [style]="getAvatarStyle(user.role)">
                      {{ (user.name || 'U')[0].toUpperCase() }}
                    </div>
                    <div>
                      <div class="text-sm font-bold text-textMain">{{ user.name }}</div>
                      <div class="text-[10px] font-semibold text-textSubtle">ID: {{ user._id?.slice(-6) }}</div>
                    </div>
                  </div>
                </td>

                <!-- Contact -->
                <td class="px-6 py-4">
                  <div class="flex flex-col gap-0.5">
                    <span class="text-xs font-semibold text-textMain">{{ user.email }}</span>
                    <span *ngIf="user.phone" class="text-[10px] text-textMuted">📞 {{ user.phone }}</span>
                  </div>
                </td>

                <!-- Role badge -->
                <td class="px-6 py-4">
                  <span class="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border"
                        [ngClass]="getRoleBadge(user.role)">
                    {{ user.role }}
                  </span>
                </td>

                <!-- Active toggle -->
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2.5">
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" [checked]="user.isActive" (change)="toggleStatus(user)" class="sr-only peer" />
                      <div class="w-10 h-5.5 bg-borderStrong/35 rounded-full peer peer-checked:bg-success transition-colors duration-200 relative">
                        <div class="absolute top-[3px] left-[3px] w-[16px] h-[16px] rounded-full bg-white shadow-sm transition-transform duration-200 peer-checked:translate-x-4.5"></div>
                      </div>
                    </label>
                    <span class="text-[10px] font-bold" [ngClass]="user.isActive ? 'text-success' : 'text-textSubtle'">
                      {{ user.isActive ? 'Active' : 'Blocked' }}
                    </span>
                  </div>
                </td>

                <!-- Date -->
                <td class="px-6 py-4">
                  <span class="text-xs text-textMuted">{{ user.createdAt | date:'dd MMM yyyy' }}</span>
                </td>

                <!-- Actions -->
                <td class="px-6 py-4">
                  <button (click)="openRoleModal(user)"
                          class="px-3 py-1.5 rounded-xl text-xs font-bold border border-border bg-bgSoft text-textMain transition-all hover:bg-primary/5 hover:text-primary hover:border-primary/30 active:scale-95"
                          [id]="'role-' + user._id">
                    ✏️ Change Role
                  </button>
                </td>
              </tr>

              <tr *ngIf="users.length === 0">
                <td colspan="6" class="py-16 text-center">
                  <div class="flex flex-col items-center gap-3">
                    <span class="text-4xl">🔍</span>
                    <p class="text-sm font-bold text-textMuted">No users found matching filters.</p>
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
            <span class="font-black text-textMain">{{ totalUsers }}</span> users
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

      <!-- ─── Change Role Modal ──────────────────────────────── -->
      <div *ngIf="showModal"
           class="fixed inset-0 flex items-center justify-center z-50 p-6 bg-black/60 backdrop-blur-md animate-fade-in"
           (click)="closeRoleModal()">
        <div class="w-full max-w-md rounded-3xl border border-border bg-bgCard flex flex-col gap-5 p-6 animate-scale-in shadow-2xl"
             (click)="$event.stopPropagation()">

          <div class="flex items-center justify-between pb-4 border-b border-border">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center text-base bg-primary/10 text-primary">✏️</div>
              <div>
                <h3 class="text-base font-black text-textMain">Change User Role</h3>
                <p class="text-xs text-textMuted">{{ modalUser?.name }}</p>
              </div>
            </div>
            <button class="w-8 h-8 rounded-xl border border-border bg-bgSoft text-textMuted flex items-center justify-center font-bold text-sm hover:bg-bgSoft/75 active:scale-95 transition-all"
                    (click)="closeRoleModal()">✕</button>
          </div>

          <div class="flex flex-col gap-5" *ngIf="modalUser">
            <p class="text-xs font-medium px-4 py-3 rounded-xl border border-border bg-bgSoft text-textMuted">
              Updating role for <strong class="text-textMain">{{ modalUser.name }}</strong> ({{ modalUser.email }})
            </p>

            <!-- Role selector cards -->
            <div class="grid grid-cols-3 gap-3">
              <button *ngFor="let role of ['customer', 'worker', 'admin']"
                     class="flex flex-col items-center gap-2.5 p-4 rounded-xl border transition-all duration-200"
                     [ngClass]="modalRole === role
                       ? 'bg-primary/10 border-primary text-primary shadow-sm shadow-primary/10'
                       : 'bg-bgSoft border-border text-textMuted hover:border-borderStrong hover:text-textMain'"
                     (click)="modalRole = role">
                <span class="text-2xl">{{ role === 'customer' ? '👤' : role === 'worker' ? '🛠️' : '🛡️' }}</span>
                <span class="text-[10px] font-black uppercase tracking-wider">{{ role }}</span>
              </button>
            </div>

            <div class="flex justify-end gap-3 pt-2">
              <button class="px-5 py-2.5 rounded-xl border border-border bg-bgSoft text-textMain text-xs font-bold hover:bg-bgSoft/75 active:scale-95 transition-all"
                      (click)="closeRoleModal()">Cancel</button>
              <button class="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-primary hover:bg-primary-hover shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95"
                      (click)="saveUserRole()">
                💾 Save Role
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: []
})
export class UserListComponent implements OnInit {
  private adminService = inject(AdminService);

  users: any[] = [];
  searchQuery = '';
  selectedRole = '';
  selectedStatus = '';

  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  totalUsers = 0;

  showModal = false;
  modalUser: any = null;
  modalRole = 'customer';

  get activeCount(): number { return this.users.filter(u => u.isActive).length; }
  get blockedCount(): number { return this.users.filter(u => !u.isActive).length; }

  ngOnInit() { this.loadUsers(); }

  loadUsers() {
    this.adminService.getUsers({
      page: this.currentPage,
      limit: this.pageSize,
      role: this.selectedRole,
      isActive: this.selectedStatus,
      search: this.searchQuery
    }).subscribe({
      next: (res) => {
        this.users = res.data?.items || [];
        this.totalUsers = res.data?.total || 0;
        this.totalPages = Math.ceil(this.totalUsers / this.pageSize) || 1;
      },
      error: (err) => console.error('Error fetching users:', err)
    });
  }

  onSearch()      { this.currentPage = 1; this.loadUsers(); }
  onFilterChange(){ this.currentPage = 1; this.loadUsers(); }
  onPageSizeChange(){ this.currentPage = 1; this.loadUsers(); }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) { this.currentPage = page; this.loadUsers(); }
  }

  toggleStatus(user: any) {
    const next = !user.isActive;
    this.adminService.updateUserStatus(user._id, next).subscribe({
      next: () => { user.isActive = next; },
      error: (err) => console.error('Error toggling user status:', err)
    });
  }

  getAvatarStyle(role: string): string {
    if (role === 'admin')  return 'background: linear-gradient(135deg,#6366f1,#818cf8)';
    if (role === 'worker') return 'background: linear-gradient(135deg,#10b981,#34d399)';
    return 'background: linear-gradient(135deg,#f59e0b,#fbbf24)';
  }

  getRoleBadge(role: string): string {
    if (role === 'admin')  return 'badge-primary';
    if (role === 'worker') return 'badge-success';
    return 'badge-warning';
  }

  get visiblePages(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, Math.min(this.currentPage - 2, this.totalPages - 4));
    const end = Math.min(this.totalPages, start + 4);
    for (let p = start; p <= end; p++) pages.push(p);
    return pages;
  }
  get pageStart(): number { return this.totalUsers === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1; }
  get pageEnd():   number { return Math.min(this.currentPage * this.pageSize, this.totalUsers); }

  openRoleModal(user: any) { this.modalUser = user; this.modalRole = user.role; this.showModal = true; }
  closeRoleModal()          { this.showModal = false; this.modalUser = null; }

  saveUserRole() {
    if (!this.modalUser) return;
    this.adminService.updateUserRole(this.modalUser._id, this.modalRole).subscribe({
      next: () => { this.modalUser.role = this.modalRole; this.closeRoleModal(); this.loadUsers(); },
      error: (err) => console.error('Error updating user role:', err)
    });
  }
}
