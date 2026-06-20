import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col gap-6 animate-fade-in">

      <!-- ─── Page Header ──────────────────────────────────── -->
      <div class="animate-slide-up">
        <div class="flex items-center gap-3 mb-1.5">
          <div class="w-1.5 h-7 rounded-full bg-gradient-to-b from-primary to-accent"></div>
          <h1 class="text-2xl font-black tracking-tight text-textMain">Catalog Management</h1>
        </div>
        <p class="text-sm pl-5 text-textMuted">Define categories and spec offerings, modify pricing sheets, and toggle active catalog listings</p>
      </div>

      <!-- ─── Main Grid Layout ──────────────────────────────── -->
      <div class="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start animate-slide-up [animation-delay:60ms]">
        
        <!-- Categories Panel (Left) -->
        <div class="p-5 rounded-3xl border border-border bg-bgCard shadow-sm flex flex-col gap-4 min-h-[480px]">
          <div class="flex justify-between items-center pb-3 border-b border-border">
            <h3 class="text-base font-black text-textMain">Categories</h3>
            <button class="px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-black shadow-md shadow-primary/20 transition-all active:scale-95" 
                    (click)="openCategoryModal()">➕ Add</button>
          </div>
          
          <div class="flex flex-col gap-2.5">
            <button
              *ngFor="let cat of categories"
              class="w-full text-left flex justify-between items-center p-3 rounded-2xl border transition-all duration-200"
              [ngClass]="[
                selectedCategory?._id === cat._id
                  ? 'bg-primary/10 border-primary text-primary shadow-sm shadow-primary/5'
                  : 'bg-bgSoft/40 border-border text-textMuted hover:border-borderStrong hover:text-textMain',
                !cat.isActive ? 'opacity-55' : ''
              ]"
              (click)="selectCategory(cat)"
            >
              <div class="flex items-center gap-3">
                <span class="text-2xl bg-bgCard w-10 h-10 rounded-xl flex items-center justify-center border border-border shadow-sm">{{ cat.icon || '🔧' }}</span>
                <div class="flex flex-col">
                  <span class="text-sm font-bold" [ngClass]="selectedCategory?._id === cat._id ? 'text-primary' : 'text-textMain'">{{ cat.name }}</span>
                  <span class="text-[10px] text-textMuted font-semibold">{{ cat.services?.length || 0 }} services</span>
                </div>
              </div>
              <div class="flex items-center gap-1.5" (click)="$event.stopPropagation()">
                <button (click)="openCategoryModal(cat)" 
                        class="w-7 h-7 rounded-lg border border-border bg-bgCard text-textMuted hover:text-primary hover:border-primary/20 flex items-center justify-center text-xs transition-all active:scale-90 shadow-sm">✏️</button>
                <button *ngIf="cat.isActive" (click)="deleteCategory(cat)" 
                        class="w-7 h-7 rounded-lg border border-danger/20 bg-danger/5 text-danger flex items-center justify-center text-xs transition-all hover:bg-danger/10 hover:border-danger/35 active:scale-90 shadow-sm">🗑️</button>
                <span *ngIf="!cat.isActive" class="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-borderStrong/20 text-textSubtle border border-borderStrong">Inactive</span>
              </div>
            </button>
            <div *ngIf="categories.length === 0" class="py-16 text-center text-xs font-bold text-textSubtle">No categories defined.</div>
          </div>
        </div>

        <!-- Services Panel (Right) -->
        <div class="p-5 rounded-3xl border border-border bg-bgCard shadow-sm flex flex-col gap-4 min-h-[480px]">
          <div class="flex justify-between items-center pb-3 border-b border-border">
            <h3 class="text-base font-black text-textMain">
              Services under <span class="text-primary font-black">{{ selectedCategory ? selectedCategory.name : 'Selected Category' }}</span>
            </h3>
            <button
              class="px-4 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-black shadow-md shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              [disabled]="!selectedCategory || !selectedCategory.isActive"
              (click)="openServiceModal()"
            >
              ➕ Add Service
            </button>
          </div>
          
          <div class="flex-1">
            <div *ngIf="!selectedCategory" class="py-20 text-center text-sm font-semibold text-textMuted flex flex-col items-center gap-2">
              <span class="text-3xl">📁</span>
              Please select an active category from the left pane to view services.
            </div>

            <div *ngIf="selectedCategory" class="flex flex-col gap-4">
              <div
                *ngFor="let svc of selectedCategory.services"
                class="p-4 rounded-2xl border border-border bg-bgSoft/20 hover:border-primary/20 hover:shadow-md transition-all duration-300 flex justify-between items-start gap-4 flex-wrap sm:flex-nowrap group"
                [ngClass]="!svc.isActive ? 'opacity-55' : ''"
              >
                <div class="flex flex-col gap-2 flex-1 min-w-0">
                  <div class="flex items-center gap-3">
                    <span class="text-sm font-black text-textMain truncate">{{ svc.name }}</span>
                    <span class="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase bg-success/15 text-success border border-success/20">₹{{ svc.basePrice }} Base</span>
                  </div>
                  <p class="text-xs text-textMuted leading-relaxed pr-2">{{ svc.description || 'No description provided.' }}</p>
                  
                  <div class="flex gap-2.5 items-center flex-wrap text-[10px] font-bold text-textSubtle mt-1.5">
                    <span class="flex items-center gap-1 bg-bgCard px-2 py-1 rounded-lg border border-border">⏱️ {{ svc.duration }} min</span>
                    <span class="flex items-center gap-1 bg-bgCard px-2 py-1 rounded-lg border border-border">📍 Radius: {{ svc.searchRadiusKm || 10 }} km</span>
                    <span *ngIf="svc.pricePerKm" class="flex items-center gap-1 bg-bgCard px-2 py-1 rounded-lg border border-border">🚗 ₹{{ svc.pricePerKm }}/km</span>
                    <span class="px-2 py-1 rounded-lg border border-primary/25 bg-primary/10 text-primary font-black uppercase" *ngFor="let skill of svc.requiredSkills">{{ skill }}</span>
                  </div>
                </div>

                <div class="flex flex-col sm:items-end gap-2.5 flex-shrink-0 self-center">
                  <div class="flex items-center gap-2">
                    <button (click)="openServiceModal(svc)"
                            class="px-3 py-1.5 rounded-xl border border-border bg-bgCard text-textMain text-xs font-bold transition-all hover:bg-bgSoft hover:border-borderStrong active:scale-95 shadow-sm">✏️ Edit</button>
                    <button *ngIf="svc.isActive" (click)="deleteService(svc)"
                            class="px-3 py-1.5 rounded-xl border border-danger/20 bg-danger/5 text-danger text-xs font-bold transition-all hover:bg-danger/10 hover:border-danger/40 active:scale-95 shadow-sm">Deactivate</button>
                  </div>
                  <button (click)="toggleMonthBooking(svc)"
                          class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all active:scale-95 shadow-sm"
                          [ngClass]="svc.allowMonthBooking
                            ? 'border-accent/30 bg-accent/10 text-accent hover:bg-accent/20'
                            : 'border-border bg-bgCard text-textMuted hover:border-borderStrong hover:text-textMain'">
                    <span>📅</span>
                    <span>{{ svc.allowMonthBooking ? 'Monthly ON' : 'Monthly OFF' }}</span>
                  </button>
                  <span *ngIf="!svc.isActive" class="px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-borderStrong/20 text-textSubtle border border-borderStrong text-center">Deactivated</span>
                </div>
              </div>

              <div *ngIf="selectedCategory.services?.length === 0" class="py-20 text-center text-xs font-bold text-textSubtle flex flex-col items-center gap-2">
                <span class="text-3xl">📭</span>
                No services defined in this category.
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Category Modal -->
      <div class="fixed inset-0 flex items-center justify-center z-50 p-6 bg-black/60 backdrop-blur-md animate-fade-in" 
           *ngIf="showCategoryModal" (click)="closeCategoryModal()">
        <div class="w-full max-w-md rounded-3xl border border-border bg-bgCard flex flex-col gap-5 p-6 animate-scale-in shadow-2xl" 
             (click)="$event.stopPropagation()">
          <div class="flex items-center justify-between pb-4 border-b border-border">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center text-base bg-primary/10 text-primary">📁</div>
              <h3 class="text-base font-black text-textMain">{{ editingCategory ? 'Edit Category' : 'Create Category' }}</h3>
            </div>
            <button class="w-8 h-8 rounded-xl border border-border bg-bgSoft text-textMuted flex items-center justify-center font-bold text-sm hover:bg-bgSoft/75 active:scale-95 transition-all" 
                    (click)="closeCategoryModal()">✕</button>
          </div>
          <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-[10px] font-black uppercase tracking-wider text-textMuted" for="catName">Category Name</label>
              <input type="text" id="catName" class="w-full px-4 py-2.5 rounded-xl border border-border bg-bgSoft text-textMain text-xs font-semibold outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all" [(ngModel)]="catName" placeholder="Plumbing" />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-[10px] font-black uppercase tracking-wider text-textMuted" for="catIcon">Icon emoji</label>
              <input type="text" id="catIcon" class="w-full px-4 py-2.5 rounded-xl border border-border bg-bgSoft text-textMain text-xs font-semibold outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all" [(ngModel)]="catIcon" placeholder="🔧" />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-[10px] font-black uppercase tracking-wider text-textMuted" for="catDesc">Description</label>
              <textarea id="catDesc" class="w-full px-4 py-2.5 rounded-xl border border-border bg-bgSoft text-textMain text-xs font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all" [(ngModel)]="catDesc" rows="3"></textarea>
            </div>

            <div class="flex justify-between items-center border-t border-b border-border py-3.5 mt-2" *ngIf="editingCategory">
              <span class="text-xs font-bold text-textMain">Active Listing Status</span>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" [(ngModel)]="catActive" class="sr-only peer" />
                <div class="w-10 h-5.5 bg-borderStrong/35 rounded-full peer peer-checked:bg-primary transition-colors duration-200 relative">
                  <div class="absolute top-[3px] left-[3px] w-[16px] h-[16px] rounded-full bg-white shadow-sm transition-transform duration-200 peer-checked:translate-x-4.5"></div>
                </div>
              </label>
            </div>

            <div class="flex justify-end gap-3 pt-2">
              <button class="px-5 py-2.5 rounded-xl border border-border bg-bgSoft text-textMain text-xs font-bold hover:bg-bgSoft/75 active:scale-95 transition-all" (click)="closeCategoryModal()">Cancel</button>
              <button class="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-primary hover:bg-primary-hover shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95" (click)="saveCategory()">Save Category</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Service Modal -->
      <div class="fixed inset-0 flex items-center justify-center z-50 p-6 bg-black/60 backdrop-blur-md animate-fade-in" 
           *ngIf="showServiceModal" (click)="closeServiceModal()">
        <div class="w-full max-w-lg rounded-3xl border border-border bg-bgCard flex flex-col gap-5 p-6 animate-scale-in shadow-2xl" 
             (click)="$event.stopPropagation()">
          <div class="flex items-center justify-between pb-4 border-b border-border">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center text-base bg-primary/10 text-primary">⚙️</div>
              <h3 class="text-base font-black text-textMain">{{ editingService ? 'Edit Service' : 'Create Service' }}</h3>
            </div>
            <button class="w-8 h-8 rounded-xl border border-border bg-bgSoft text-textMuted flex items-center justify-center font-bold text-sm hover:bg-bgSoft/75 active:scale-95 transition-all" 
                    (click)="closeServiceModal()">✕</button>
          </div>
          <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-[10px] font-black uppercase tracking-wider text-textMuted" for="svcName">Service Name</label>
              <input type="text" id="svcName" class="w-full px-4 py-2.5 rounded-xl border border-border bg-bgSoft text-textMain text-xs font-semibold outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all" [(ngModel)]="svcName" placeholder="Leak Repair" />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-[10px] font-black uppercase tracking-wider text-textMuted" for="svcDesc">Description</label>
              <textarea id="svcDesc" class="w-full px-4 py-2.5 rounded-xl border border-border bg-bgSoft text-textMain text-xs font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all" [(ngModel)]="svcDesc" rows="2"></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="flex flex-col gap-1.5">
                <label class="text-[10px] font-black uppercase tracking-wider text-textMuted" for="svcPrice">Base Price (₹)</label>
                <input type="number" id="svcPrice" class="w-full px-4 py-2.5 rounded-xl border border-border bg-bgSoft text-textMain text-xs font-semibold outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all" [(ngModel)]="svcPrice" />
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-[10px] font-black uppercase tracking-wider text-textMuted" for="svcDuration">Duration (min)</label>
                <input type="number" id="svcDuration" class="w-full px-4 py-2.5 rounded-xl border border-border bg-bgSoft text-textMain text-xs font-semibold outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all" [(ngModel)]="svcDuration" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="flex flex-col gap-1.5">
                <label class="text-[10px] font-black uppercase tracking-wider text-textMuted" for="svcRadius">Search Radius (km)</label>
                <input type="number" id="svcRadius" class="w-full px-4 py-2.5 rounded-xl border border-border bg-bgSoft text-textMain text-xs font-semibold outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all" [(ngModel)]="svcRadius" />
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-[10px] font-black uppercase tracking-wider text-textMuted" for="svcPerKm">Price Per km (₹)</label>
                <input type="number" id="svcPerKm" class="w-full px-4 py-2.5 rounded-xl border border-border bg-bgSoft text-textMain text-xs font-semibold outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all" [(ngModel)]="svcPerKm" />
              </div>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-[10px] font-black uppercase tracking-wider text-textMuted" for="svcSkills">Required Skills (comma separated)</label>
              <input type="text" id="svcSkills" class="w-full px-4 py-2.5 rounded-xl border border-border bg-bgSoft text-textMain text-xs font-semibold outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all" [(ngModel)]="svcSkills" placeholder="plumbing, welding" />
            </div>

            <div class="flex justify-between items-center border-t border-b border-border py-3.5 mt-2" *ngIf="editingService">
              <span class="text-xs font-bold text-textMain">Active Listing Status</span>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" [(ngModel)]="svcActive" class="sr-only peer" />
                <div class="w-10 h-5.5 bg-borderStrong/35 rounded-full peer peer-checked:bg-primary transition-colors duration-200 relative">
                  <div class="absolute top-[3px] left-[3px] w-[16px] h-[16px] rounded-full bg-white shadow-sm transition-transform duration-200 peer-checked:translate-x-4.5"></div>
                </div>
              </label>
            </div>

            <div class="flex justify-end gap-3 pt-2">
              <button class="px-5 py-2.5 rounded-xl border border-border bg-bgSoft text-textMain text-xs font-bold hover:bg-bgSoft/75 active:scale-95 transition-all" (click)="closeServiceModal()">Cancel</button>
              <button class="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-primary hover:bg-primary-hover shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95" (click)="saveService()">Save Service</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class CatalogComponent implements OnInit {
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

  toggleMonthBooking(svc: any) {
    const next = !svc.allowMonthBooking;
    this.adminService.toggleMonthBooking(svc._id, next).subscribe({
      next: () => {
        svc.allowMonthBooking = next;
      },
      error: (err) => console.error('toggleMonthBooking error:', err)
    });
  }
}
