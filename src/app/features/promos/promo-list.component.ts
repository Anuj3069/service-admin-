import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-promo-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="promos-wrapper animate-fade-in">
      <div class="page-header">
        <div>
          <h1>Promo Codes</h1>
          <p>Create and manage discount coupons for customers</p>
        </div>
        <button class="btn btn-primary" (click)="openCreateModal()">+ New Coupon</button>
      </div>

      <!-- Promos Table -->
      <div class="glass-panel table-card">
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Min Order</th>
                <th>Usage</th>
                <th>Valid Until</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let promo of promos">
                <td><span class="code-badge">{{ promo.code }}</span></td>
                <td>
                  <span *ngIf="promo.discountType === 'flat'">₹{{ promo.discountValue }} OFF</span>
                  <span *ngIf="promo.discountType === 'percentage'">{{ promo.discountValue }}% OFF
                    <span *ngIf="promo.maxDiscountAmount > 0" class="cap-label">(max ₹{{ promo.maxDiscountAmount }})</span>
                  </span>
                </td>
                <td>{{ promo.minOrderAmount > 0 ? '₹' + promo.minOrderAmount : 'None' }}</td>
                <td>{{ promo.usageCount }} / {{ promo.usageLimit ?? '∞' }}</td>
                <td>{{ promo.endDate | date:'dd MMM yyyy' }}</td>
                <td>
                  <span class="badge" [ngClass]="promo.isActive ? 'badge-active' : 'badge-inactive'">
                    {{ promo.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="actions">
                  <button class="action-btn" (click)="togglePromo(promo)">
                    {{ promo.isActive ? '⏸' : '▶' }}
                  </button>
                  <button class="action-btn edit-btn" (click)="openEditModal(promo)">✏️</button>
                  <button class="action-btn delete-btn" (click)="deletePromo(promo._id)">🗑️</button>
                </td>
              </tr>
              <tr *ngIf="promos.length === 0">
                <td colspan="7" class="empty-state">No promo codes found. Create your first one!</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Create / Edit Modal -->
      <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
        <div class="modal glass-panel" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editingPromo ? 'Edit Promo Code' : 'Create Promo Code' }}</h3>
            <button class="close-btn" (click)="closeModal()">✕</button>
          </div>

          <form (ngSubmit)="savePromo()" class="modal-form">
            <div class="form-row">
              <div class="form-group">
                <label for="code">Coupon Code</label>
                <input type="text" id="code" [(ngModel)]="form.code" name="code"
                  class="form-control" placeholder="e.g. WELCOME50" required
                  [disabled]="!!editingPromo" style="text-transform: uppercase;" />
              </div>
              <div class="form-group">
                <label for="discountType">Discount Type</label>
                <select id="discountType" [(ngModel)]="form.discountType" name="discountType" class="form-control">
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat Amount (₹)</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="discountValue">Discount Value</label>
                <input type="number" id="discountValue" [(ngModel)]="form.discountValue" name="discountValue"
                  class="form-control" min="0" required
                  [placeholder]="form.discountType === 'percentage' ? '10 (for 10%)' : '100 (for ₹100 off)'" />
              </div>
              <div class="form-group" *ngIf="form.discountType === 'percentage'">
                <label for="maxDiscountAmount">Max Discount (₹) <span class="optional-label">optional</span></label>
                <input type="number" id="maxDiscountAmount" [(ngModel)]="form.maxDiscountAmount" name="maxDiscountAmount"
                  class="form-control" min="0" placeholder="0 (unlimited)" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="minOrderAmount">Min Order Amount (₹)</label>
                <input type="number" id="minOrderAmount" [(ngModel)]="form.minOrderAmount" name="minOrderAmount"
                  class="form-control" min="0" placeholder="0 (no minimum)" />
              </div>
              <div class="form-group">
                <label for="usageLimit">Usage Limit <span class="optional-label">optional</span></label>
                <input type="number" id="usageLimit" [(ngModel)]="form.usageLimit" name="usageLimit"
                  class="form-control" min="0" placeholder="Leave empty for unlimited" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="startDate">Start Date</label>
                <input type="date" id="startDate" [(ngModel)]="form.startDate" name="startDate"
                  class="form-control" required />
              </div>
              <div class="form-group">
                <label for="endDate">End Date</label>
                <input type="date" id="endDate" [(ngModel)]="form.endDate" name="endDate"
                  class="form-control" required />
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="saving">
                {{ saving ? 'Saving...' : (editingPromo ? 'Update Code' : 'Create Code') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .promos-wrapper {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }
    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;
    }
    .page-header h1 { font-size: 2rem; font-weight: 600; color: #fff; }
    .page-header p { color: var(--text-muted); font-size: 0.95rem; margin-top: 4px; }

    .table-card { padding: 0; overflow: hidden; }
    .table-wrapper { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th, .data-table td {
      padding: 14px 20px;
      text-align: left;
      font-size: 0.875rem;
    }
    .data-table thead tr {
      border-bottom: 1px solid var(--border);
    }
    .data-table th {
      color: var(--text-muted);
      font-weight: 500;
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.05em;
    }
    .data-table tbody tr {
      border-bottom: 1px solid rgba(255, 255, 255, 0.03);
      transition: var(--transition-smooth);
    }
    .data-table tbody tr:last-child { border-bottom: none; }
    .data-table tbody tr:hover { background: rgba(255, 255, 255, 0.02); }
    .data-table td { color: var(--text-main); }

    .code-badge {
      display: inline-block;
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.3);
      color: #818cf8;
      padding: 4px 10px;
      border-radius: 6px;
      font-family: monospace;
      font-weight: 600;
      font-size: 0.85rem;
    }
    .cap-label { color: var(--text-muted); font-size: 0.8rem; }
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .badge-active { background: rgba(16, 185, 129, 0.1); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.2); }
    .badge-inactive { background: rgba(244, 63, 94, 0.1); color: #fb7185; border: 1px solid rgba(244, 63, 94, 0.2); }
    .actions { display: flex; gap: 8px; }
    .action-btn {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1rem;
      padding: 4px 8px;
      border-radius: 6px;
      transition: var(--transition-smooth);
    }
    .action-btn:hover { background: rgba(255, 255, 255, 0.05); }
    .empty-state { text-align: center; color: var(--text-muted); padding: 40px; }

    .btn { padding: 10px 20px; font-weight: 600; border-radius: 8px; cursor: pointer; transition: var(--transition-smooth); border: none; font-size: 0.9rem; }
    .btn-primary { background: var(--primary); color: #fff; }
    .btn-primary:hover:not(:disabled) { background: #4f46e5; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-secondary { background: rgba(255,255,255,0.05); color: var(--text-main); border: 1px solid var(--border); }
    .btn-secondary:hover { background: rgba(255,255,255,0.08); }

    /* Modal */
    .modal-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.7);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 200;
      padding: 24px;
    }
    .modal {
      width: 100%;
      max-width: 640px;
      padding: 32px;
      animation: slideUp 0.2s ease;
    }
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 28px;
    }
    .modal-header h3 { font-size: 1.25rem; font-weight: 600; color: #fff; }
    .close-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.2rem; }
    .close-btn:hover { color: #fff; }

    .modal-form { display: flex; flex-direction: column; gap: 16px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    @media (max-width: 600px) { .form-row { grid-template-columns: 1fr; } }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    label { color: var(--text-muted); font-size: 0.85rem; font-weight: 500; }
    .optional-label { color: var(--text-muted); font-size: 0.75rem; }
    .form-control {
      background: rgba(255,255,255,0.03);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 10px 14px;
      color: #fff;
      font-size: 0.9rem;
      width: 100%;
      box-sizing: border-box;
      transition: var(--transition-smooth);
    }
    .form-control:focus { outline: none; border-color: var(--primary); }
    .form-control:disabled { opacity: 0.5; cursor: not-allowed; }
    select.form-control { cursor: pointer; }
    select.form-control option { background: #1e1e2e; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px; }
  `]
})
export class PromoListComponent {
  private adminService = inject(AdminService);

  promos: any[] = [];
  showModal = false;
  editingPromo: any = null;
  saving = false;

  form = {
    code: '',
    discountType: 'percentage',
    discountValue: 10,
    maxDiscountAmount: 0,
    minOrderAmount: 0,
    usageLimit: null as number | null,
    startDate: '',
    endDate: ''
  };

  ngOnInit() {
    this.loadPromos();
  }

  loadPromos() {
    this.adminService.getPromos().subscribe({
      next: (res) => {
        this.promos = res.data?.items || [];
      },
      error: (err) => console.error('Failed to load promos:', err)
    });
  }

  openCreateModal() {
    this.editingPromo = null;
    const today = new Date().toISOString().substring(0, 10);
    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);
    this.form = {
      code: '',
      discountType: 'percentage',
      discountValue: 10,
      maxDiscountAmount: 0,
      minOrderAmount: 0,
      usageLimit: null,
      startDate: today,
      endDate: nextMonth
    };
    this.showModal = true;
  }

  openEditModal(promo: any) {
    this.editingPromo = promo;
    this.form = {
      code: promo.code,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      maxDiscountAmount: promo.maxDiscountAmount || 0,
      minOrderAmount: promo.minOrderAmount || 0,
      usageLimit: promo.usageLimit,
      startDate: new Date(promo.startDate).toISOString().substring(0, 10),
      endDate: new Date(promo.endDate).toISOString().substring(0, 10)
    };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingPromo = null;
  }

  savePromo() {
    this.saving = true;
    const payload = { ...this.form };

    const obs = this.editingPromo
      ? this.adminService.updatePromo(this.editingPromo._id, payload)
      : this.adminService.createPromo(payload);

    obs.subscribe({
      next: () => {
        this.saving = false;
        this.closeModal();
        this.loadPromos();
      },
      error: (err) => {
        this.saving = false;
        alert(err.error?.message || 'Failed to save promo code.');
      }
    });
  }

  togglePromo(promo: any) {
    this.adminService.updatePromo(promo._id, { isActive: !promo.isActive }).subscribe({
      next: () => this.loadPromos(),
      error: (err) => console.error('Failed to toggle promo:', err)
    });
  }

  deletePromo(id: string) {
    if (!confirm('Are you sure you want to delete this promo code?')) return;
    this.adminService.deletePromo(id).subscribe({
      next: () => this.loadPromos(),
      error: (err) => console.error('Failed to delete promo:', err)
    });
  }
}
