import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-review-moderator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col gap-6 animate-fade-in max-w-4xl">

      <!-- ─── Page Header ──────────────────────────────────── -->
      <div class="animate-slide-up">
        <div class="flex items-center gap-3 mb-1.5">
          <div class="w-1.5 h-7 rounded-full bg-gradient-to-b from-primary to-accent"></div>
          <h1 class="text-2xl font-black tracking-tight text-textMain">Review Moderation</h1>
        </div>
        <p class="text-sm pl-5 text-textMuted">Monitor user feedback, inspect comments, and delete reviews to automatically trigger provider rating adjustments</p>
      </div>

      <!-- ─── Reviews Container ─────────────────────────────── -->
      <div class="flex flex-col gap-4 animate-slide-up [animation-delay:60ms]">
        <div *ngFor="let rev of reviews" class="p-5 rounded-2xl border border-border bg-bgCard hover:border-primary/20 hover:shadow-md transition-all duration-300 flex flex-col gap-4 shadow-sm group">
          
          <div class="flex justify-between items-start flex-wrap gap-3 pb-3 border-b border-border">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                {{ (rev.userId?.name || 'C')[0] }}
              </div>
              <div class="flex flex-col">
                <span class="text-sm font-bold text-textMain">{{ rev.userId?.name || 'Customer' }}</span>
                <span class="text-[10px] text-textMuted font-semibold">{{ rev.userId?.email || 'N/A' }}</span>
              </div>
            </div>
            <div class="flex items-center gap-1.5 bg-bgSoft px-3 py-1.5 rounded-xl border border-border">
              <div class="flex items-center gap-0.5">
                <span class="text-xs" *ngFor="let s of getStars(rev.rating)">⭐</span>
              </div>
              <span class="text-[10px] font-black text-textMain">({{ rev.rating }} / 5)</span>
            </div>
          </div>

          <div class="py-1">
            <p class="text-sm text-textMain font-medium italic leading-relaxed pl-3 border-l-2 border-primary/30">
              "{{ rev.comment || 'No comment provided.' }}"
            </p>
          </div>

          <div class="flex justify-between items-center flex-wrap gap-3 pt-3 border-t border-border">
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-bold text-textMuted uppercase tracking-wider">Recipient:</span>
              <span class="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-accent/10 text-accent border border-accent/20">
                🛠️ {{ rev.providerId?.userId?.name || 'Worker' }}
              </span>
            </div>
            <button (click)="deleteReview(rev._id)" 
                    class="px-3.5 py-2 rounded-xl border border-danger/25 bg-danger/5 text-danger text-xs font-bold transition-all hover:bg-danger/10 hover:border-danger/45 active:scale-95">
              🗑️ Delete Review & Recalculate
            </button>
          </div>
        </div>

        <div *ngIf="reviews.length === 0" class="p-16 rounded-2xl border border-border bg-bgCard text-center">
          <div class="flex flex-col items-center gap-3">
            <span class="text-4xl">⭐</span>
            <p class="text-sm font-bold text-textMuted">No customer reviews registered in the database.</p>
          </div>
        </div>

        <!-- Pagination -->
        <div class="flex flex-wrap items-center justify-between gap-4 px-6 py-4 rounded-2xl border border-border bg-bgCard shadow-sm">
          <div class="text-xs font-semibold text-textMuted">
            Showing <span class="font-black text-textMain">{{ pageStart }}–{{ pageEnd }}</span> of
            <span class="font-black text-textMain">{{ totalReviews }}</span> reviews
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
    </div>
  `,
  styles: []
})
export class ReviewModeratorComponent {
  private adminService = inject(AdminService);

  reviews: any[] = [];

  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  totalReviews = 0;

  ngOnInit() {
    this.loadReviews();
  }

  loadReviews() {
    const filters = {
      page: this.currentPage,
      limit: this.pageSize
    };

    this.adminService.getReviews(filters).subscribe({
      next: (res) => {
        this.reviews = res.data?.items || [];
        this.totalReviews = res.data?.total || 0;
        this.totalPages = Math.ceil(this.totalReviews / this.pageSize) || 1;
      },
      error: (err) => {
        console.error('Error fetching reviews:', err);
      }
    });
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadReviews();
    }
  }

  onPageSizeChange() {
    this.currentPage = 1;
    this.loadReviews();
  }

  get visiblePages(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, Math.min(this.currentPage - 2, this.totalPages - 4));
    const end = Math.min(this.totalPages, start + 4);
    for (let page = start; page <= end; page++) pages.push(page);
    return pages;
  }

  get pageStart(): number {
    if (this.totalReviews === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get pageEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalReviews);
  }

  getStars(rating: number): any[] {
    const num = Math.round(rating) || 0;
    return Array(num);
  }

  deleteReview(id: string) {
    if (confirm('Are you sure you want to delete this review? This action cannot be undone and will recalculate the provider rating.')) {
      this.adminService.deleteReview(id).subscribe({
        next: () => {
          this.loadReviews();
        },
        error: (err) => {
          console.error('Error deleting review:', err);
        }
      });
    }
  }
}
