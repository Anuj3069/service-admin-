import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="user-wrapper animate-fade-in">
      <div class="page-header">
        <h1>User Management</h1>
        <p>Monitor and update registration status and authorization roles</p>
      </div>

      <!-- Filters & Actions -->
      <div class="glass-panel filters-card">
        <div class="filter-group">
          <input
            type="text"
            class="form-control search-input"
            placeholder="Search by name, email or phone..."
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearch()"
          />
          
          <select class="form-control filter-select" [(ngModel)]="selectedRole" (change)="onFilterChange()">
            <option value="">All Roles</option>
            <option value="customer">Customer</option>
            <option value="worker">Worker</option>
            <option value="admin">Administrator</option>
          </select>

          <select class="form-control filter-select" [(ngModel)]="selectedStatus" (change)="onFilterChange()">
            <option value="">All Statuses</option>
            <option value="true">Active Only</option>
            <option value="false">Blocked Only</option>
          </select>
        </div>
      </div>

      <!-- Users Table -->
      <div class="glass-panel table-card">
        <div class="table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email / Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Registered At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of users">
                <td>
                  <div class="user-info">
                    <span class="user-avatar">{{ user.name.charAt(0).toUpperCase() }}</span>
                    <span class="user-name">{{ user.name }}</span>
                  </div>
                </td>
                <td>
                  <div class="contact-details">
                    <span class="email">{{ user.email }}</span>
                    <span class="phone" *ngIf="user.phone">{{ user.phone }}</span>
                  </div>
                </td>
                <td>
                  <span class="badge" [ngClass]="getRoleClass(user.role)">{{ user.role }}</span>
                </td>
                <td>
                  <label class="switch">
                    <input
                      type="checkbox"
                      [checked]="user.isActive"
                      (change)="toggleStatus(user)"
                    />
                    <span class="slider"></span>
                  </label>
                </td>
                <td>{{ user.createdAt | date:'mediumDate' }}</td>
                <td>
                  <button (click)="openRoleModal(user)" class="btn btn-secondary btn-small">
                    ✏️ Change Role
                  </button>
                </td>
              </tr>
              <tr *ngIf="users.length === 0">
                <td colspan="6" class="no-records">No users found matching search filters.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="table-pagination">
          <div class="pagination-summary">
            Showing {{ pageStart }}-{{ pageEnd }} of {{ totalUsers }} users
          </div>
          <div class="pagination-controls">
            <select class="form-control page-size-select" [(ngModel)]="pageSize" (change)="onPageSizeChange()">
              <option [ngValue]="10">10 / page</option>
              <option [ngValue]="25">25 / page</option>
              <option [ngValue]="50">50 / page</option>
            </select>
            <button [disabled]="currentPage === 1" (click)="changePage(currentPage - 1)" class="btn btn-secondary btn-small">Prev</button>
            <div class="page-numbers">
              <button
                *ngFor="let page of visiblePages"
                class="btn btn-secondary btn-small page-btn"
                [class.active]="page === currentPage"
                (click)="changePage(page)"
              >
                {{ page }}
              </button>
            </div>
            <button [disabled]="currentPage === totalPages" (click)="changePage(currentPage + 1)" class="btn btn-secondary btn-small">Next</button>
          </div>
        </div>
      </div>

      <!-- Change Role Modal -->
      <div class="modal-overlay" *ngIf="showModal" (click)="closeRoleModal()">
        <div class="glass-panel modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Change User Role</h3>
            <button class="modal-close" (click)="closeRoleModal()">×</button>
          </div>
          <div class="modal-body" *ngIf="modalUser">
            <p class="modal-prompt">Update role credentials for <strong>{{ modalUser.name }}</strong> ({{ modalUser.email }}).</p>
            
            <div class="form-group">
              <label class="form-label" for="modalRole">Select Role</label>
              <select id="modalRole" class="form-control" [(ngModel)]="modalRole">
                <option value="customer">Customer</option>
                <option value="worker">Worker</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div class="modal-actions">
              <button class="btn btn-secondary" (click)="closeRoleModal()">Cancel</button>
              <button class="btn btn-primary" (click)="saveUserRole()">Save Changes</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .user-wrapper {
      display: flex;
      flex-direction: column;
      gap: 24px;
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
    .filters-card {
      padding: 16px 20px;
    }
    .filter-group {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }
    .search-input {
      flex: 1;
      min-width: 250px;
    }
    .filter-select {
      width: 180px;
    }
    .table-card {
      padding: 12px;
    }
    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .user-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-main);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      border: 1px solid var(--border);
      font-size: 0.8rem;
    }
    .user-name {
      font-weight: 500;
      color: var(--text-main);
    }
    .contact-details {
      display: flex;
      flex-direction: column;
    }
    .phone {
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    .no-records {
      text-align: center;
      padding: 40px 0;
      color: var(--text-muted);
    }
    .table-pagination {
      border-top: 1px solid var(--border);
      margin-top: 12px;
      padding: 16px 4px 4px;
    }
    .modal-prompt {
      font-size: 0.95rem;
      color: var(--text-muted);
      margin-bottom: 20px;
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
    }
  `]
})
export class UserListComponent {
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

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    const filters = {
      page: this.currentPage,
      limit: this.pageSize,
      role: this.selectedRole,
      isActive: this.selectedStatus,
      search: this.searchQuery
    };

    this.adminService.getUsers(filters).subscribe({
      next: (res) => {
        this.users = res.data?.items || [];
        this.totalUsers = res.data?.total || 0;
        this.totalPages = Math.ceil(this.totalUsers / this.pageSize) || 1;
      },
      error: (err) => {
        console.error('Error fetching users:', err);
      }
    });
  }

  onSearch() {
    this.currentPage = 1;
    this.loadUsers();
  }

  onFilterChange() {
    this.currentPage = 1;
    this.loadUsers();
  }

  onPageSizeChange() {
    this.currentPage = 1;
    this.loadUsers();
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadUsers();
    }
  }

  toggleStatus(user: any) {
    const nextStatus = !user.isActive;
    this.adminService.updateUserStatus(user._id, nextStatus).subscribe({
      next: (res) => {
        user.isActive = nextStatus;
      },
      error: (err) => {
        console.error('Error toggling user status:', err);
      }
    });
  }

  getRoleClass(role: string): string {
    if (role === 'admin') return 'badge-primary';
    if (role === 'worker') return 'badge-accent';
    return 'badge-success';
  }

  get visiblePages(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, Math.min(this.currentPage - 2, this.totalPages - 4));
    const end = Math.min(this.totalPages, start + 4);
    for (let page = start; page <= end; page++) pages.push(page);
    return pages;
  }

  get pageStart(): number {
    if (this.totalUsers === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get pageEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalUsers);
  }

  openRoleModal(user: any) {
    this.modalUser = user;
    this.modalRole = user.role;
    this.showModal = true;
  }

  closeRoleModal() {
    this.showModal = false;
    this.modalUser = null;
  }

  saveUserRole() {
    if (!this.modalUser) return;
    this.adminService.updateUserRole(this.modalUser._id, this.modalRole).subscribe({
      next: (res) => {
        this.modalUser.role = this.modalRole;
        this.closeRoleModal();
        this.loadUsers();
      },
      error: (err) => {
        console.error('Error updating user role:', err);
      }
    });
  }
}
