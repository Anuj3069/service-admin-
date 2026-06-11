import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-provider-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col gap-6 animate-fade-in">

      <!-- ─── Page Header ──────────────────────────────────── -->
      <div class="animate-slide-up">
        <div class="flex items-center gap-3 mb-1.5">
          <div class="w-1.5 h-7 rounded-full" style="background: var(--sidebar-accent)"></div>
          <h1 class="text-2xl font-black tracking-tight" style="color: var(--text-main)">Provider Moderation</h1>
        </div>
        <p class="text-sm pl-5" style="color: var(--text-muted)">Manage verification, KYC documents &amp; provider performance</p>
      </div>

      <!-- ─── Tab Switcher ─────────────────────────────────── -->
      <div class="flex gap-2 p-1.5 rounded-xl border w-fit animate-slide-up"
           style="background: var(--bg-soft); border-color: var(--border); animation-delay: 60ms">
        <button
          class="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 border border-transparent"
          [style]="activeTab === 'providers'
            ? 'background: var(--bg-card); color: var(--primary); border-color: rgba(var(--primary-rgb),0.2); box-shadow: var(--shadow-sm)'
            : 'background: transparent; color: var(--text-muted)'"
          (click)="activeTab = 'providers'"
          id="tab-providers"
        >
          <span>👥</span>
          <span>All Providers</span>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-black"
                style="background: rgba(99,102,241,0.1); color: #6366f1">{{ totalProviders }}</span>
        </button>

        <button
          class="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 border border-transparent"
          [style]="activeTab === 'kyc'
            ? 'background: var(--bg-card); color: var(--primary); border-color: rgba(var(--primary-rgb),0.2); box-shadow: var(--shadow-sm)'
            : 'background: transparent; color: var(--text-muted)'"
          (click)="switchToKycTab()"
          id="tab-kyc"
        >
          <span>🔍</span>
          <span>KYC Queue</span>
          <span *ngIf="kycQueue.length > 0"
                class="px-2 py-0.5 rounded-full text-[10px] font-black animate-pulse"
                style="background: rgba(245,158,11,0.15); color: #f59e0b">
            {{ kycQueue.length }}
          </span>
        </button>
      </div>

      <!-- ══════════════════════════════════════════════════════
           TAB: ALL PROVIDERS
           ══════════════════════════════════════════════════════ -->
      <ng-container *ngIf="activeTab === 'providers'">

        <!-- Filters bar -->
        <div class="p-4 rounded-2xl border flex flex-wrap gap-3 items-center animate-slide-up"
             style="background: var(--bg-card); border-color: var(--border); animation-delay: 80ms">
          <div class="flex items-center gap-2 text-xs font-bold" style="color: var(--text-muted)">
            <span>🔧</span> Filters
          </div>
          <div class="h-4 w-px" style="background: var(--border)"></div>

          <select class="px-3.5 py-2 rounded-xl text-xs font-semibold border outline-none transition-all duration-200"
                  style="background: var(--bg-soft); border-color: var(--border); color: var(--text-main)"
                  [(ngModel)]="filterVerified" (change)="onFilterChange()" id="filter-verified">
            <option value="">All Verification Statuses</option>
            <option value="true">✅ Verified Only</option>
            <option value="false">⚠️ Unverified</option>
          </select>

          <select class="px-3.5 py-2 rounded-xl text-xs font-semibold border outline-none transition-all duration-200"
                  style="background: var(--bg-soft); border-color: var(--border); color: var(--text-main)"
                  [(ngModel)]="filterAvailable" (change)="onFilterChange()" id="filter-available">
            <option value="">All Availabilities</option>
            <option value="true">🟢 Available / Online</option>
            <option value="false">⚫ Offline</option>
          </select>

          <div class="ml-auto text-[10px] font-bold uppercase tracking-wider" style="color: var(--text-subtle)">
            {{ totalProviders }} providers
          </div>
        </div>

        <!-- Providers Table Card -->
        <div class="rounded-2xl border overflow-hidden animate-slide-up"
             style="background: var(--bg-card); border-color: var(--border); box-shadow: var(--shadow-sm); animation-delay: 120ms">
          <div class="overflow-x-auto">
            <table class="w-full border-collapse text-left" style="min-width: 860px">
              <thead>
                <tr style="background: var(--bg-soft)">
                  <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b" style="color: var(--text-muted); border-color: var(--border)">Provider</th>
                  <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b" style="color: var(--text-muted); border-color: var(--border)">Skills</th>
                  <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b" style="color: var(--text-muted); border-color: var(--border)">Performance</th>
                  <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b" style="color: var(--text-muted); border-color: var(--border)">Status</th>
                  <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b" style="color: var(--text-muted); border-color: var(--border)">KYC</th>
                  <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b" style="color: var(--text-muted); border-color: var(--border)">Verified</th>
                  <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b" style="color: var(--text-muted); border-color: var(--border)">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let prov of providers"
                    class="border-b group transition-all duration-150"
                    style="border-color: var(--border)"
                    onmouseover="this.style.background='var(--bg-soft)'"
                    onmouseout="this.style.background='transparent'">

                  <!-- Provider Name + Avatar -->
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                           style="background: rgba(99,102,241,0.12); color: #6366f1; border: 1px solid rgba(99,102,241,0.2)">
                        {{ (prov.userId?.name || 'W')[0].toUpperCase() }}
                      </div>
                      <div>
                        <div class="text-sm font-bold" style="color: var(--text-main)">{{ prov.userId?.name || 'Worker' }}</div>
                        <div class="text-[10px] font-medium" style="color: var(--text-muted)">{{ prov.userId?.email || '—' }}</div>
                      </div>
                    </div>
                  </td>

                  <!-- Skills -->
                  <td class="px-6 py-4">
                    <div class="flex flex-wrap gap-1 max-w-[180px]">
                      <span *ngFor="let skill of (prov.skills || []).slice(0, 3)"
                            class="px-2 py-0.5 rounded-lg text-[10px] font-bold border"
                            style="background: rgba(99,102,241,0.07); color: #6366f1; border-color: rgba(99,102,241,0.15)">
                        {{ skill }}
                      </span>
                      <span *ngIf="(prov.skills?.length || 0) > 3"
                            class="px-2 py-0.5 rounded-lg text-[10px] font-bold border"
                            style="background: var(--bg-soft); color: var(--text-muted); border-color: var(--border)">
                        +{{ prov.skills.length - 3 }}
                      </span>
                      <span *ngIf="!prov.skills?.length" class="text-[11px] italic" style="color: var(--text-subtle)">No skills</span>
                    </div>
                  </td>

                  <!-- Rating + Jobs -->
                  <td class="px-6 py-4">
                    <div class="flex flex-col gap-1">
                      <div class="flex items-center gap-1.5">
                        <span class="text-xs">⭐</span>
                        <span class="text-sm font-black tabular-nums" style="color: var(--text-main)">{{ (prov.rating || 0).toFixed(1) }}</span>
                        <span class="text-[10px]" style="color: var(--text-muted)">({{ prov.totalReviews || 0 }})</span>
                      </div>
                      <div class="text-[10px] font-semibold" style="color: var(--text-muted)">{{ prov.totalJobs || 0 }} jobs done</div>
                    </div>
                  </td>

                  <!-- Availability -->
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-1.5">
                      <span class="w-2 h-2 rounded-full flex-shrink-0"
                            [style]="prov.isAvailable
                              ? 'background: #10b981; box-shadow: 0 0 6px rgba(16,185,129,0.5)'
                              : 'background: var(--border-strong)'">
                      </span>
                      <span class="text-xs font-bold px-2 py-1 rounded-lg border"
                            [style]="prov.isAvailable
                              ? 'background: rgba(16,185,129,0.1); color: #10b981; border-color: rgba(16,185,129,0.25)'
                              : 'background: var(--bg-soft); color: var(--text-muted); border-color: var(--border)'">
                        {{ prov.isAvailable ? 'Online' : 'Offline' }}
                      </span>
                    </div>
                  </td>

                  <!-- KYC Status -->
                  <td class="px-6 py-4">
                    <div class="flex flex-col gap-1.5 items-start">
                      <span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                            [ngClass]="kycChipClass(prov.kyc?.status)">
                        {{ kycLabel(prov.kyc?.status) }}
                      </span>
                      <a *ngIf="prov.kyc?.documentUrl"
                         [href]="prov.kyc.documentUrl"
                         target="_blank"
                         rel="noopener noreferrer"
                         class="flex items-center gap-1 text-[10px] font-bold transition-colors"
                         style="color: var(--primary)"
                         [id]="'view-doc-table-' + prov._id">
                        📄 View Doc
                      </a>
                    </div>
                  </td>

                  <!-- Verified Toggle -->
                  <td class="px-6 py-4">
                    <label class="relative inline-block w-11 h-6 cursor-pointer">
                      <input type="checkbox" [checked]="prov.isVerified" (change)="toggleVerification(prov)" class="sr-only peer" />
                      <span class="absolute inset-0 rounded-full transition-all duration-200 peer-checked:bg-indigo-500"
                            style="background: var(--border-strong)">
                      </span>
                      <span class="absolute top-[3px] left-[3px] w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-all duration-200 peer-checked:translate-x-5"></span>
                    </label>
                  </td>

                  <!-- Actions -->
                  <td class="px-6 py-4">
                    <button (click)="openEditModal(prov)"
                            class="px-3.5 py-2 rounded-xl text-xs font-bold border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                            style="background: var(--bg-soft); border-color: var(--border); color: var(--text-main)"
                            onmouseover="this.style.background='var(--bg-card)'; this.style.borderColor='rgba(99,102,241,0.3)'; this.style.color='#6366f1'"
                            onmouseout="this.style.background='var(--bg-soft)'; this.style.borderColor='var(--border)'; this.style.color='var(--text-main)'"
                            [id]="'edit-' + prov._id">
                      ⚙️ Manage
                    </button>
                  </td>
                </tr>

                <!-- Empty state -->
                <tr *ngIf="providers.length === 0">
                  <td colspan="7" class="py-16 text-center">
                    <div class="flex flex-col items-center gap-3">
                      <span class="text-4xl">📭</span>
                      <p class="text-sm font-bold" style="color: var(--text-muted)">No service providers found.</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-t" style="border-color: var(--border)">
            <div class="text-xs font-semibold" style="color: var(--text-muted)">
              Showing <span class="font-black" style="color: var(--text-main)">{{ pageStart }}–{{ pageEnd }}</span> of
              <span class="font-black" style="color: var(--text-main)">{{ totalProviders }}</span> providers
            </div>
            <div class="flex items-center gap-2">
              <select class="px-2.5 py-1.5 rounded-lg border text-xs font-bold outline-none"
                      style="background: var(--bg-soft); border-color: var(--border); color: var(--text-main)"
                      [(ngModel)]="pageSize" (change)="onPageSizeChange()">
                <option [ngValue]="10">10 / page</option>
                <option [ngValue]="25">25 / page</option>
                <option [ngValue]="50">50 / page</option>
              </select>
              <button [disabled]="currentPage === 1" (click)="changePage(currentPage - 1)"
                      class="w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-black transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                      style="background: var(--bg-soft); border-color: var(--border); color: var(--text-main)">‹</button>
              <div class="flex items-center gap-1">
                <button *ngFor="let page of visiblePages"
                        class="w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-black transition-all duration-150"
                        [style]="page === currentPage
                          ? 'background: var(--primary); border-color: var(--primary); color: white; box-shadow: 0 4px 12px rgba(99,102,241,0.35)'
                          : 'background: var(--bg-soft); border-color: var(--border); color: var(--text-main)'"
                        (click)="changePage(page)">
                  {{ page }}
                </button>
              </div>
              <button [disabled]="currentPage === totalPages" (click)="changePage(currentPage + 1)"
                      class="w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-black transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                      style="background: var(--bg-soft); border-color: var(--border); color: var(--text-main)">›</button>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- ══════════════════════════════════════════════════════
           TAB: KYC QUEUE
           ══════════════════════════════════════════════════════ -->
      <ng-container *ngIf="activeTab === 'kyc'">

        <!-- Loading skeleton -->
        <div *ngIf="kycLoading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <div *ngFor="let _ of [1,2,3]" class="p-5 rounded-2xl border" style="background: var(--bg-card); border-color: var(--border)">
            <div class="skeleton h-10 w-10 rounded-xl mb-4"></div>
            <div class="skeleton h-4 w-3/4 rounded-lg mb-2"></div>
            <div class="skeleton h-3 w-1/2 rounded-lg mb-4"></div>
            <div class="skeleton h-20 rounded-xl mb-3"></div>
            <div class="flex gap-3">
              <div class="skeleton h-9 flex-1 rounded-xl"></div>
              <div class="skeleton h-9 flex-1 rounded-xl"></div>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div *ngIf="!kycLoading && kycQueue.length === 0"
             class="flex flex-col items-center justify-center py-24 rounded-2xl border animate-scale-in"
             style="background: var(--bg-card); border-color: var(--border)">
          <div class="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-5"
               style="background: rgba(16,185,129,0.1)">✅</div>
          <h3 class="text-lg font-black mb-1.5" style="color: var(--text-main)">All Clear!</h3>
          <p class="text-sm font-medium" style="color: var(--text-muted)">No pending KYC verifications at this time.</p>
        </div>

        <!-- KYC Cards Grid -->
        <div *ngIf="!kycLoading && kycQueue.length > 0"
             class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <div *ngFor="let item of kycQueue; let i = index"
               class="group p-5 rounded-2xl border flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg animate-slide-up"
               [style]="'background: var(--bg-card); border-color: var(--border); box-shadow: var(--shadow-sm); animation-delay: ' + (i * 60) + 'ms'"
               [id]="'kyc-card-' + item._id">

            <!-- Header -->
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white flex-shrink-0"
                     style="background: var(--sidebar-accent)">
                  {{ (item.userId?.name || 'W')[0].toUpperCase() }}
                </div>
                <div>
                  <div class="font-bold text-sm" style="color: var(--text-main)">{{ item.userId?.name || 'Unknown' }}</div>
                  <div class="text-[10px] font-medium" style="color: var(--text-muted)">{{ item.userId?.email || '' }}</div>
                </div>
              </div>
              <span class="px-2.5 py-1 rounded-full text-[10px] font-black"
                    style="background: rgba(245,158,11,0.12); color: #f59e0b; border: 1px solid rgba(245,158,11,0.25)">
                ⏳ Pending
              </span>
            </div>

            <!-- Document info -->
            <div class="rounded-xl p-3.5 flex flex-col gap-2.5"
                 style="background: var(--bg-soft); border: 1px solid var(--border)">
              <div class="flex justify-between items-center gap-2">
                <span class="text-[9px] font-black uppercase tracking-widest" style="color: var(--text-subtle)">Document</span>
                <span class="text-xs font-bold" style="color: var(--text-main)">{{ docTypeLabel(item.kyc?.documentType) }}</span>
              </div>
              <div class="h-px" style="background: var(--border)"></div>
              <div class="flex justify-between items-center gap-2" *ngIf="item.kyc?.submittedAt">
                <span class="text-[9px] font-black uppercase tracking-widest" style="color: var(--text-subtle)">Submitted</span>
                <span class="text-xs font-bold" style="color: var(--text-main)">{{ item.kyc.submittedAt | date:'dd MMM yyyy' }}</span>
              </div>
              <div class="h-px" style="background: var(--border)"></div>
              <div class="flex justify-between items-center gap-2">
                <span class="text-[9px] font-black uppercase tracking-widest" style="color: var(--text-subtle)">Skills</span>
                <span class="text-xs font-bold truncate max-w-[140px]" style="color: var(--text-main)">
                  {{ (item.skills || []).join(', ') || 'None listed' }}
                </span>
              </div>
            </div>

            <!-- View document link -->
            <a *ngIf="item.kyc?.documentUrl"
               [href]="item.kyc.documentUrl"
               target="_blank"
               rel="noopener noreferrer"
               class="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 border"
               style="background: rgba(99,102,241,0.07); border-color: rgba(99,102,241,0.2); color: #6366f1"
               onmouseover="this.style.background='rgba(99,102,241,0.12)'"
               onmouseout="this.style.background='rgba(99,102,241,0.07)'"
               [id]="'view-doc-' + item._id">
              🔗 View KYC Document
            </a>
            <div *ngIf="!item.kyc?.documentUrl"
                 class="py-2.5 rounded-xl text-xs font-bold text-center italic border"
                 style="background: var(--bg-soft); border-color: var(--border); color: var(--text-subtle)">
              No document URL
            </div>

            <!-- Action buttons -->
            <div class="flex gap-3">
              <button
                class="flex-1 py-2.5 rounded-xl text-xs font-black border transition-all duration-150 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                style="background: rgba(16,185,129,0.1); border-color: rgba(16,185,129,0.25); color: #10b981"
                onmouseover="this.style.background='rgba(16,185,129,0.18)'"
                onmouseout="this.style.background='rgba(16,185,129,0.1)'"
                (click)="approveKyc(item)"
                [disabled]="item._kycProcessing"
                [id]="'approve-' + item._id">
                <span *ngIf="!item._kycProcessing">✅ Approve</span>
                <span *ngIf="item._kycProcessing" class="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></span>
              </button>

              <button
                class="flex-1 py-2.5 rounded-xl text-xs font-black border transition-all duration-150 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                style="background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.25); color: #ef4444"
                onmouseover="this.style.background='rgba(239,68,68,0.18)'"
                onmouseout="this.style.background='rgba(239,68,68,0.1)'"
                (click)="openRejectModal(item)"
                [disabled]="item._kycProcessing"
                [id]="'reject-' + item._id">
                ❌ Reject
              </button>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- ══════════════════════════════════════════════════════
           MODAL: MANAGE PROVIDER PROFILE
           ══════════════════════════════════════════════════════ -->
      <div *ngIf="showModal"
           class="fixed inset-0 flex items-center justify-center z-50 p-6 animate-fade-in"
           style="background: rgba(0,0,0,0.55); backdrop-filter: blur(8px)"
           (click)="closeEditModal()">
        <div class="w-full max-w-lg rounded-2xl border flex flex-col gap-5 p-6 animate-scale-in"
             style="background: var(--bg-card); border-color: var(--border); box-shadow: var(--shadow-xl)"
             (click)="$event.stopPropagation()">

          <!-- Modal header -->
          <div class="flex items-center justify-between pb-4 border-b" style="border-color: var(--border)">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center text-base" style="background: rgba(99,102,241,0.1); color: #6366f1">⚙️</div>
              <div>
                <h3 class="text-base font-black" style="color: var(--text-main)">Manage Provider</h3>
                <p class="text-xs" style="color: var(--text-muted)">{{ modalProvider?.userId?.name }}</p>
              </div>
            </div>
            <button class="w-8 h-8 rounded-xl flex items-center justify-center border font-bold text-sm transition-all duration-150"
                    style="background: var(--bg-soft); border-color: var(--border); color: var(--text-muted)"
                    onmouseover="this.style.color='var(--text-main)'"
                    onmouseout="this.style.color='var(--text-muted)'"
                    (click)="closeEditModal()">✕</button>
          </div>

          <div class="flex flex-col gap-4" *ngIf="modalProvider">
            <div class="flex flex-col gap-1.5">
              <label class="text-[10px] font-black uppercase tracking-widest" style="color: var(--text-muted)" for="skills">Skills (comma separated)</label>
              <input type="text" id="skills" class="form-control"
                     [(ngModel)]="editSkills" placeholder="plumbing, electrical, cleaning" />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-[10px] font-black uppercase tracking-widest" style="color: var(--text-muted)" for="address">Address</label>
              <input type="text" id="address" class="form-control" [(ngModel)]="editAddress" placeholder="123 Street, City" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="flex flex-col gap-1.5">
                <label class="text-[10px] font-black uppercase tracking-widest" style="color: var(--text-muted)" for="longitude">Longitude</label>
                <input type="number" step="0.000001" id="longitude" class="form-control" [(ngModel)]="editLongitude" />
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-[10px] font-black uppercase tracking-widest" style="color: var(--text-muted)" for="latitude">Latitude</label>
                <input type="number" step="0.000001" id="latitude" class="form-control" [(ngModel)]="editLatitude" />
              </div>
            </div>

            <div class="flex items-center justify-between py-3.5 px-4 rounded-xl border" style="background: var(--bg-soft); border-color: var(--border)">
              <div>
                <div class="text-xs font-bold" style="color: var(--text-main)">Availability Status</div>
                <div class="text-[10px]" style="color: var(--text-muted)">Toggle online/offline for this provider</div>
              </div>
              <label class="relative inline-block w-11 h-6 cursor-pointer flex-shrink-0">
                <input type="checkbox" [(ngModel)]="editAvailable" class="sr-only peer" />
                <span class="absolute inset-0 rounded-full transition-all duration-200 peer-checked:bg-indigo-500"
                      style="background: var(--border-strong)"></span>
                <span class="absolute top-[3px] left-[3px] w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-all duration-200 peer-checked:translate-x-5"></span>
              </label>
            </div>

            <div class="flex justify-end gap-3 pt-2">
              <button class="px-5 py-2.5 rounded-xl border text-xs font-bold transition-all duration-150"
                      style="background: var(--bg-soft); border-color: var(--border); color: var(--text-main)"
                      (click)="closeEditModal()">Cancel</button>
              <button class="px-5 py-2.5 rounded-xl text-xs font-black text-white transition-all duration-150 hover:-translate-y-0.5"
                      style="background: var(--primary); box-shadow: 0 4px 15px rgba(99,102,241,0.35)"
                      onmouseover="this.style.background='var(--primary-hover)'"
                      onmouseout="this.style.background='var(--primary)'"
                      (click)="saveProviderProfile()">
                💾 Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════
           MODAL: REJECT KYC
           ══════════════════════════════════════════════════════ -->
      <div *ngIf="showRejectModal"
           class="fixed inset-0 flex items-center justify-center z-50 p-6 animate-fade-in"
           style="background: rgba(0,0,0,0.55); backdrop-filter: blur(8px)"
           (click)="closeRejectModal()">
        <div class="w-full max-w-md rounded-2xl border flex flex-col gap-5 p-6 animate-scale-in"
             style="background: var(--bg-card); border-color: var(--border); box-shadow: var(--shadow-xl)"
             (click)="$event.stopPropagation()">

          <div class="flex items-center justify-between pb-4 border-b" style="border-color: var(--border)">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center text-base"
                   style="background: rgba(239,68,68,0.1); color: #ef4444">❌</div>
              <div>
                <h3 class="text-base font-black" style="color: var(--text-main)">Reject KYC</h3>
                <p class="text-xs" style="color: var(--text-muted)">{{ rejectTarget?.userId?.name }}</p>
              </div>
            </div>
            <button class="w-8 h-8 rounded-xl flex items-center justify-center border font-bold text-sm transition-all"
                    style="background: var(--bg-soft); border-color: var(--border); color: var(--text-muted)"
                    (click)="closeRejectModal()">✕</button>
          </div>

          <div class="flex flex-col gap-4" *ngIf="rejectTarget">
            <div class="p-4 rounded-xl border text-xs font-medium leading-relaxed" style="background: var(--bg-soft); border-color: var(--border); color: var(--text-main)">
              <strong class="font-black">Worker:</strong> {{ rejectTarget.userId?.name || 'Unknown' }}<br>
              <strong class="font-black mt-1 inline-block">Document:</strong> {{ docTypeLabel(rejectTarget.kyc?.documentType) }}
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-[10px] font-black uppercase tracking-widest" style="color: var(--text-muted)" for="rejectionReason">
                Rejection Reason <span style="color: var(--danger)">*</span>
              </label>
              <textarea id="rejectionReason"
                        class="form-control resize-none h-24"
                        [(ngModel)]="rejectionReason"
                        rows="4"
                        placeholder="e.g. Document is blurry. Please re-upload a clear photo.">
              </textarea>
              <small *ngIf="rejectionReasonError" class="text-[10px] font-bold" style="color: var(--danger)">
                {{ rejectionReasonError }}
              </small>
            </div>

            <div class="flex justify-end gap-3 pt-2">
              <button class="px-5 py-2.5 rounded-xl border text-xs font-bold transition-all duration-150"
                      style="background: var(--bg-soft); border-color: var(--border); color: var(--text-main)"
                      (click)="closeRejectModal()">Cancel</button>
              <button
                class="px-5 py-2.5 rounded-xl text-xs font-black text-white transition-all duration-150 hover:-translate-y-0.5 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                style="background: var(--danger); box-shadow: 0 4px 15px rgba(239,68,68,0.3)"
                (click)="confirmReject()"
                [disabled]="rejectProcessing"
                id="confirm-reject-btn">
                <span *ngIf="!rejectProcessing">Confirm Rejection</span>
                <span *ngIf="rejectProcessing" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: []
})
export class ProviderListComponent implements OnInit {
  private adminService = inject(AdminService);

  activeTab: 'providers' | 'kyc' = 'providers';

  providers: any[] = [];
  filterVerified = '';
  filterAvailable = '';
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  totalProviders = 0;

  showModal = false;
  modalProvider: any = null;
  editSkills = '';
  editAddress = '';
  editLongitude = 0;
  editLatitude = 0;
  editAvailable = false;

  kycQueue: any[] = [];
  kycLoading = false;

  showRejectModal = false;
  rejectTarget: any = null;
  rejectionReason = '';
  rejectionReasonError = '';
  rejectProcessing = false;

  ngOnInit() {
    this.loadProviders();
  }

  loadProviders() {
    const filters = {
      page: this.currentPage,
      limit: this.pageSize,
      isVerified: this.filterVerified,
      isAvailable: this.filterAvailable
    };
    this.adminService.getProviders(filters).subscribe({
      next: (res) => {
        this.providers = res.data?.items || [];
        this.totalProviders = res.data?.total || 0;
        this.totalPages = Math.ceil(this.totalProviders / this.pageSize) || 1;
      },
      error: (err) => console.error('Error loading providers:', err)
    });
  }

  onFilterChange()  { this.currentPage = 1; this.loadProviders(); }
  onPageSizeChange(){ this.currentPage = 1; this.loadProviders(); }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadProviders();
    }
  }

  get visiblePages(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, Math.min(this.currentPage - 2, this.totalPages - 4));
    const end   = Math.min(this.totalPages, start + 4);
    for (let p = start; p <= end; p++) pages.push(p);
    return pages;
  }

  get pageStart(): number {
    if (this.totalProviders === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get pageEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalProviders);
  }

  toggleVerification(prov: any) {
    const nextStatus = !prov.isVerified;
    this.adminService.verifyProvider(prov._id, nextStatus).subscribe({
      next: () => { prov.isVerified = nextStatus; },
      error: (err) => console.error('Error setting verification status:', err)
    });
  }

  openEditModal(prov: any) {
    this.modalProvider = prov;
    this.editSkills    = prov.skills ? prov.skills.join(', ') : '';
    this.editAddress   = prov.location?.address || '';
    this.editLongitude = prov.location?.coordinates ? prov.location.coordinates[0] : 0;
    this.editLatitude  = prov.location?.coordinates ? prov.location.coordinates[1] : 0;
    this.editAvailable = prov.isAvailable;
    this.showModal = true;
  }

  closeEditModal() { this.showModal = false; this.modalProvider = null; }

  saveProviderProfile() {
    if (!this.modalProvider) return;
    const payload = {
      skills: this.editSkills.split(',').map(s => s.trim().toLowerCase()).filter(Boolean),
      address: this.editAddress,
      coordinates: [this.editLongitude, this.editLatitude],
      isAvailable: this.editAvailable
    };
    this.adminService.updateProvider(this.modalProvider._id, payload).subscribe({
      next: () => { this.closeEditModal(); this.loadProviders(); },
      error: (err) => console.error('Error updating provider profile:', err)
    });
  }

  switchToKycTab() {
    this.activeTab = 'kyc';
    this.loadKycQueue();
  }

  loadKycQueue() {
    this.kycLoading = true;
    this.adminService.getProviders({ page: 1, limit: 100 }).subscribe({
      next: (res) => {
        const all = res.data?.items || [];
        this.kycQueue = all.filter((p: any) => p.kyc?.status === 'pending');
        this.kycLoading = false;
      },
      error: (err) => {
        console.error('Error loading KYC queue:', err);
        this.kycLoading = false;
      }
    });
  }

  approveKyc(item: any) {
    item._kycProcessing = true;
    const userId = item.userId?._id || item.userId;
    this.adminService.reviewKyc(userId, 'approve').subscribe({
      next: () => {
        this.kycQueue = this.kycQueue.filter(q => q._id !== item._id);
        item._kycProcessing = false;
        this.loadProviders();
      },
      error: (err) => {
        console.error('Error approving KYC:', err);
        item._kycProcessing = false;
      }
    });
  }

  openRejectModal(item: any) {
    this.rejectTarget = item;
    this.rejectionReason = '';
    this.rejectionReasonError = '';
    this.showRejectModal = true;
  }

  closeRejectModal() {
    this.showRejectModal = false;
    this.rejectTarget = null;
    this.rejectionReason = '';
    this.rejectionReasonError = '';
  }

  confirmReject() {
    if (!this.rejectionReason.trim()) {
      this.rejectionReasonError = 'Rejection reason is required.';
      return;
    }
    this.rejectionReasonError = '';
    this.rejectProcessing = true;
    const userId = this.rejectTarget.userId?._id || this.rejectTarget.userId;
    this.adminService.reviewKyc(userId, 'reject', this.rejectionReason.trim()).subscribe({
      next: () => {
        this.kycQueue = this.kycQueue.filter(q => q._id !== this.rejectTarget._id);
        this.rejectProcessing = false;
        this.closeRejectModal();
        this.loadProviders();
      },
      error: (err) => {
        console.error('Error rejecting KYC:', err);
        this.rejectProcessing = false;
      }
    });
  }

  kycLabel(status: string | undefined): string {
    const map: Record<string, string> = {
      approved:      '✅ Approved',
      pending:       '⏳ Pending',
      rejected:      '❌ Rejected',
      not_submitted: '— Not Submitted',
    };
    return map[status || 'not_submitted'] || '—';
  }

  kycChipClass(status: string | undefined): string {
    return `kyc-${status || 'not_submitted'}`;
  }

  docTypeLabel(type: string | undefined): string {
    const map: Record<string, string> = {
      aadhaar:        'Aadhaar Card',
      pan:            'PAN Card',
      passport:       'Passport',
      driving_license:'Driving License',
    };
    return map[type || ''] || type || '—';
  }
}
