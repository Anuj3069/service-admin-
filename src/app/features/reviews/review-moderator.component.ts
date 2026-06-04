import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-review-moderator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="review-wrapper animate-fade-in">
      <div class="page-header">
        <h1>Review Moderation</h1>
        <p>Monitor user feedback, inspect comments, and delete reviews to automatically trigger provider rating adjustments</p>
      </div>

      <!-- Reviews Container -->
      <div class="reviews-feed">
        <div *ngFor="let rev of reviews" class="glass-panel review-card">
          <div class="review-header">
            <div class="user-info">
              <span class="avatar">C</span>
              <div class="user-meta">
                <span class="user-name">{{ rev.userId?.name || 'Customer' }}</span>
                <span class="user-email">{{ rev.userId?.email || 'N/A' }}</span>
              </div>
            </div>
            <div class="review-rating-stars">
              <span class="star" *ngFor="let s of getStars(rev.rating)">⭐</span>
              <span class="rating-num">({{ rev.rating }} / 5)</span>
            </div>
          </div>

          <div class="review-content">
            <p class="review-comment">"{{ rev.comment || 'No comment provided.' }}"</p>
          </div>

          <div class="review-footer">
            <div class="recipient-worker">
              <span class="worker-label">Provider Recipient:</span>
              <span class="worker-name">{{ rev.providerId?.userId?.name || 'Worker' }}</span>
            </div>
            <button (click)="deleteReview(rev._id)" class="btn btn-danger btn-small">
              🗑️ Delete Review & Recalculate
            </button>
          </div>
        </div>

        <div *ngIf="reviews.length === 0" class="glass-panel no-records">
          No customer reviews registered in the system database.
        </div>

        <!-- Pagination -->
        <div class="glass-panel table-pagination" *ngIf="totalPages > 1">
          <button [disabled]="currentPage === 1" (click)="changePage(currentPage - 1)" class="btn btn-secondary btn-small">Previous</button>
          <span class="page-indicator">Page {{ currentPage }} of {{ totalPages }}</span>
          <button [disabled]="currentPage === totalPages" (click)="changePage(currentPage + 1)" class="btn btn-secondary btn-small">Next</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .review-wrapper {
      display: flex;
      flex-direction: column;
      gap: 24px;
      max-width: 800px;
    }
    .page-header h1 {
      font-size: 2rem;
      font-weight: 600;
      color: #fff;
    }
    .page-header p {
      color: var(--text-muted);
      font-size: 0.95rem;
      margin-top: 4px;
    }
    .reviews-feed {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .review-card {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .review-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border);
      padding-bottom: 12px;
      flex-wrap: wrap;
      gap: 12px;
    }
    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .user-info .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.85rem;
    }
    .user-meta {
      display: flex;
      flex-direction: column;
    }
    .user-meta .user-name {
      font-weight: 600;
      color: #fff;
    }
    .user-meta .user-email {
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    .review-rating-stars {
      display: flex;
      align-items: center;
      gap: 2px;
    }
    .rating-num {
      margin-left: 8px;
      font-size: 0.85rem;
      color: var(--text-muted);
      font-weight: 500;
    }
    .review-content {
      padding: 4px 0;
    }
    .review-comment {
      font-style: italic;
      color: var(--text-main);
      font-size: 0.975rem;
      line-height: 1.5;
    }
    .review-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid var(--border);
      padding-top: 12px;
      flex-wrap: wrap;
      gap: 12px;
    }
    .recipient-worker {
      font-size: 0.875rem;
    }
    .worker-label {
      color: var(--text-muted);
      margin-right: 6px;
    }
    .worker-name {
      font-weight: 500;
      color: #fff;
    }
    .no-records {
      text-align: center;
      padding: 50px 0;
      color: var(--text-muted);
      font-size: 0.95rem;
    }
    .table-pagination {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
    }
    .page-indicator {
      font-size: 0.875rem;
      color: var(--text-muted);
    }
  `]
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
