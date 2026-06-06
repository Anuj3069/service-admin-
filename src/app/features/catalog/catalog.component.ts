import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="catalog-wrapper animate-fade-in">
      <div class="page-header">
        <h1>Catalog Management</h1>
        <p>Define categories and spec offerings, modify pricing sheets, and toggle active catalog listings</p>
      </div>

      <div class="catalog-grid">
        <!-- Categories Panel (Left) -->
        <div class="glass-panel pane-card">
          <div class="pane-header">
            <h3>Categories</h3>
            <button class="btn btn-primary btn-small" (click)="openCategoryModal()">➕ Add</button>
          </div>
          
          <div class="pane-body">
            <div
              *ngFor="let cat of categories"
              class="cat-item"
              [class.active]="selectedCategory?._id === cat._id"
              [class.inactive]="!cat.isActive"
              (click)="selectCategory(cat)"
            >
              <div class="cat-details">
                <span class="cat-icon">{{ cat.icon || '🔧' }}</span>
                <div class="cat-meta">
                  <span class="cat-name">{{ cat.name }}</span>
                  <span class="cat-services-count">{{ cat.services?.length || 0 }} services</span>
                </div>
              </div>
              <div class="cat-actions" (click)="$event.stopPropagation()">
                <button (click)="openCategoryModal(cat)" class="action-btn">✏️</button>
                <button *ngIf="cat.isActive" (click)="deleteCategory(cat)" class="action-btn delete">🗑️</button>
                <span *ngIf="!cat.isActive" class="badge badge-muted">Inactive</span>
              </div>
            </div>
            <div *ngIf="categories.length === 0" class="no-data">No categories defined.</div>
          </div>
        </div>

        <!-- Services Panel (Right) -->
        <div class="glass-panel pane-card">
          <div class="pane-header">
            <h3>Services under {{ selectedCategory ? selectedCategory.name : 'Selected Category' }}</h3>
            <button
              class="btn btn-primary btn-small"
              [disabled]="!selectedCategory || !selectedCategory.isActive"
              (click)="openServiceModal()"
            >
              ➕ Add Service
            </button>
          </div>
          
          <div class="pane-body">
            <div *ngIf="!selectedCategory" class="no-category-prompt">
              Please select an active category from the left pane to view services.
            </div>

            <div *ngIf="selectedCategory" class="services-list-container">
              <div
                *ngFor="let svc of selectedCategory.services"
                class="service-item"
                [class.inactive]="!svc.isActive"
              >
                <div class="svc-details">
                  <div class="svc-header-row">
                    <span class="svc-name">{{ svc.name }}</span>
                    <span class="badge badge-accent">₹{{ svc.basePrice }} Base</span>
                  </div>
                  <p class="svc-description">{{ svc.description || 'No description provided.' }}</p>
                  
                  <div class="svc-meta-row">
                    <span>⏱️ {{ svc.duration }} min</span>
                    <span>📍 Radius: {{ svc.searchRadiusKm || 10 }} km</span>
                    <span *ngIf="svc.pricePerKm">🚗 ₹{{ svc.pricePerKm }}/km</span>
                    <span class="badge badge-primary" *ngFor="let skill of svc.requiredSkills">{{ skill }}</span>
                  </div>
                </div>

                <div class="svc-actions">
                  <button (click)="openServiceModal(svc)" class="btn btn-secondary btn-small">✏️ Edit</button>
                  <button *ngIf="svc.isActive" (click)="deleteService(svc)" class="btn btn-danger btn-small">🗑️ Deactivate</button>
                  <span *ngIf="!svc.isActive" class="badge badge-muted">Deactivated</span>
                </div>
              </div>

              <div *ngIf="selectedCategory.services?.length === 0" class="no-data">
                No services defined in this category.
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Category Modal -->
      <div class="modal-overlay" *ngIf="showCategoryModal" (click)="closeCategoryModal()">
        <div class="glass-panel modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editingCategory ? 'Edit Category' : 'Create Category' }}</h3>
            <button class="modal-close" (click)="closeCategoryModal()">×</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label" for="catName">Category Name</label>
              <input type="text" id="catName" class="form-control" [(ngModel)]="catName" placeholder="Plumbing" />
            </div>

            <div class="form-group">
              <label class="form-label" for="catIcon">Icon emoji</label>
              <input type="text" id="catIcon" class="form-control" [(ngModel)]="catIcon" placeholder="🔧" />
            </div>

            <div class="form-group">
              <label class="form-label" for="catDesc">Description</label>
              <textarea id="catDesc" class="form-control" [(ngModel)]="catDesc" rows="3"></textarea>
            </div>

            <div class="form-group row-group" *ngIf="editingCategory">
              <label class="form-label">Active Listing Status</label>
              <label class="switch">
                <input type="checkbox" [(ngModel)]="catActive" />
                <span class="slider"></span>
              </label>
            </div>

            <div class="modal-actions">
              <button class="btn btn-secondary" (click)="closeCategoryModal()">Cancel</button>
              <button class="btn btn-primary" (click)="saveCategory()">Save Category</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Service Modal -->
      <div class="modal-overlay" *ngIf="showServiceModal" (click)="closeServiceModal()">
        <div class="glass-panel modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editingService ? 'Edit Service' : 'Create Service' }}</h3>
            <button class="modal-close" (click)="closeServiceModal()">×</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label" for="svcName">Service Name</label>
              <input type="text" id="svcName" class="form-control" [(ngModel)]="svcName" placeholder="Leak Repair" />
            </div>

            <div class="form-group">
              <label class="form-label" for="svcDesc">Description</label>
              <textarea id="svcDesc" class="form-control" [(ngModel)]="svcDesc" rows="2"></textarea>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label" for="svcPrice">Base Price (₹)</label>
                <input type="number" id="svcPrice" class="form-control" [(ngModel)]="svcPrice" />
              </div>
              <div class="form-group">
                <label class="form-label" for="svcDuration">Duration (min)</label>
                <input type="number" id="svcDuration" class="form-control" [(ngModel)]="svcDuration" />
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label" for="svcRadius">Search Radius (km)</label>
                <input type="number" id="svcRadius" class="form-control" [(ngModel)]="svcRadius" />
              </div>
              <div class="form-group">
                <label class="form-label" for="svcPerKm">Price Per km (₹)</label>
                <input type="number" id="svcPerKm" class="form-control" [(ngModel)]="svcPerKm" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="svcSkills">Required Skills (comma separated)</label>
              <input type="text" id="svcSkills" class="form-control" [(ngModel)]="svcSkills" placeholder="plumbing, welding" />
            </div>

            <div class="form-group row-group" *ngIf="editingService">
              <label class="form-label">Active Listing Status</label>
              <label class="switch">
                <input type="checkbox" [(ngModel)]="svcActive" />
                <span class="slider"></span>
              </label>
            </div>

            <div class="modal-actions">
              <button class="btn btn-secondary" (click)="closeServiceModal()">Cancel</button>
              <button class="btn btn-primary" (click)="saveService()">Save Service</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .catalog-wrapper {
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
    .catalog-grid {
      display: grid;
      grid-template-columns: 1fr 1.5fr;
      gap: 24px;
      align-items: start;
    }
    @media (max-width: 991px) {
      .catalog-grid {
        grid-template-columns: 1fr;
      }
    }
    .pane-card {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      min-height: 450px;
    }
    .pane-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border);
      padding-bottom: 12px;
    }
    .pane-header h3 {
      font-size: 1.2rem;
      font-weight: 600;
      color: var(--text-main);
    }
    .pane-body {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .cat-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-radius: 10px;
      border: 1px solid var(--border);
      cursor: pointer;
      transition: var(--transition-smooth);
      background: rgba(255, 255, 255, 0.01);
    }
    .cat-item:hover {
      background: rgba(255, 255, 255, 0.03);
      border-color: rgba(99, 102, 241, 0.2);
    }
    .cat-item.active {
      background: rgba(99, 102, 241, 0.08);
      border-color: var(--primary);
    }
    .cat-item.inactive {
      opacity: 0.5;
    }
    .cat-details {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .cat-icon {
      font-size: 1.5rem;
    }
    .cat-meta {
      display: flex;
      flex-direction: column;
    }
    .cat-name {
      font-weight: 500;
      color: var(--text-main);
    }
    .cat-services-count {
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    .cat-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .action-btn {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 0.95rem;
      padding: 4px;
      border-radius: 4px;
      transition: var(--transition-smooth);
    }
    .action-btn:hover {
      background: rgba(255, 255, 255, 0.05);
    }
    .action-btn.delete:hover {
      background: rgba(244, 63, 94, 0.1);
    }
    .no-data, .no-category-prompt {
      text-align: center;
      padding: 40px 0;
      color: var(--text-muted);
      font-size: 0.95rem;
    }
    .services-list-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .service-item {
      padding: 16px;
      border-radius: 12px;
      border: 1px solid var(--border);
      background: rgba(255, 255, 255, 0.01);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }
    .service-item.inactive {
      opacity: 0.55;
    }
    .svc-details {
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex: 1;
    }
    .svc-header-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .svc-name {
      font-weight: 600;
      color: var(--text-main);
      font-size: 1.05rem;
    }
    .svc-description {
      font-size: 0.875rem;
      color: var(--text-muted);
    }
    .svc-meta-row {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-top: 4px;
    }
    .svc-actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .row-group {
      flex-direction: row !important;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
      padding: 10px 0;
      margin-top: 10px;
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
    }
  `]
})
export class CatalogComponent {
  private adminService = inject(AdminService);

  categories: any[] = [];
  selectedCategory: any = null;

  // Category Modal Form State
  showCategoryModal = false;
  editingCategory: any = null;
  catName = '';
  catIcon = '';
  catDesc = '';
  catActive = true;

  // Service Modal Form State
  showServiceModal = false;
  editingService: any = null;
  svcName = '';
  svcDesc = '';
  svcPrice = 0;
  svcDuration = 30;
  svcRadius = 10;
  svcPerKm = 0;
  svcSkills = '';
  svcActive = true;

  ngOnInit() {
    this.loadCatalog();
  }

  loadCatalog() {
    this.adminService.getCategoriesAndServices().subscribe({
      next: (res) => {
        this.categories = res.data?.categories || [];
        
        // Retain selected category if it exists in the new list
        if (this.selectedCategory) {
          const match = this.categories.find(c => c._id === this.selectedCategory._id);
          this.selectedCategory = match || this.categories[0] || null;
        } else {
          this.selectedCategory = this.categories[0] || null;
        }
      },
      error: (err) => {
        console.error('Error fetching catalog:', err);
      }
    });
  }

  selectCategory(cat: any) {
    this.selectedCategory = cat;
  }

  // ── CATEGORIES CRUD ──────────────────────────────────────────
  openCategoryModal(cat: any = null) {
    this.editingCategory = cat;
    if (cat) {
      this.catName = cat.name;
      this.catIcon = cat.icon || '';
      this.catDesc = cat.description || '';
      this.catActive = cat.isActive;
    } else {
      this.catName = '';
      this.catIcon = '🔧';
      this.catDesc = '';
      this.catActive = true;
    }
    this.showCategoryModal = true;
  }

  closeCategoryModal() {
    this.showCategoryModal = false;
    this.editingCategory = null;
  }

  saveCategory() {
    const payload = {
      name: this.catName,
      icon: this.catIcon,
      description: this.catDesc,
      isActive: this.catActive
    };

    if (this.editingCategory) {
      this.adminService.updateCategory(this.editingCategory._id, payload).subscribe({
        next: () => {
          this.closeCategoryModal();
          this.loadCatalog();
        },
        error: (err) => console.error(err)
      });
    } else {
      this.adminService.createCategory(payload).subscribe({
        next: () => {
          this.closeCategoryModal();
          this.loadCatalog();
        },
        error: (err) => console.error(err)
      });
    }
  }

  deleteCategory(cat: any) {
    if (confirm(`Are you sure you want to deactivate category '${cat.name}'? This will also deactivate all services in it.`)) {
      this.adminService.deleteCategory(cat._id).subscribe({
        next: () => this.loadCatalog(),
        error: (err) => console.error(err)
      });
    }
  }

  // ── SERVICES CRUD ────────────────────────────────────────────
  openServiceModal(svc: any = null) {
    this.editingService = svc;
    if (svc) {
      this.svcName = svc.name;
      this.svcDesc = svc.description || '';
      this.svcPrice = svc.basePrice;
      this.svcDuration = svc.duration;
      this.svcRadius = svc.searchRadiusKm || 10;
      this.svcPerKm = svc.pricePerKm || 0;
      this.svcSkills = svc.requiredSkills ? svc.requiredSkills.join(', ') : '';
      this.svcActive = svc.isActive;
    } else {
      this.svcName = '';
      this.svcDesc = '';
      this.svcPrice = 0;
      this.svcDuration = 30;
      this.svcRadius = 10;
      this.svcPerKm = 0;
      this.svcSkills = '';
      this.svcActive = true;
    }
    this.showServiceModal = true;
  }

  closeServiceModal() {
    this.showServiceModal = false;
    this.editingService = null;
  }

  saveService() {
    if (!this.selectedCategory) return;

    const payload = {
      name: this.svcName,
      category: this.selectedCategory._id,
      description: this.svcDesc,
      basePrice: this.svcPrice,
      duration: this.svcDuration,
      searchRadiusKm: this.svcRadius,
      pricePerKm: this.svcPerKm,
      requiredSkills: this.svcSkills.split(',').map(s => s.trim().toLowerCase()).filter(s => s !== ''),
      isActive: this.svcActive
    };

    if (this.editingService) {
      this.adminService.updateService(this.editingService._id, payload).subscribe({
        next: () => {
          this.closeServiceModal();
          this.loadCatalog();
        },
        error: (err) => console.error(err)
      });
    } else {
      this.adminService.createService(payload).subscribe({
        next: () => {
          this.closeServiceModal();
          this.loadCatalog();
        },
        error: (err) => console.error(err)
      });
    }
  }

  deleteService(svc: any) {
    if (confirm(`Are you sure you want to deactivate service '${svc.name}'?`)) {
      this.adminService.deleteService(svc._id).subscribe({
        next: () => this.loadCatalog(),
        error: (err) => console.error(err)
      });
    }
  }
}
