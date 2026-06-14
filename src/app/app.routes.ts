import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { AdminLayoutComponent } from './features/layout/admin-layout.component';
import { adminGuard } from './core/guards/admin.guard';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { UserListComponent } from './features/users/user-list.component';
import { ProviderListComponent } from './features/providers/provider-list.component';
import { CatalogComponent } from './features/catalog/catalog.component';
import { BookingMonitorComponent } from './features/bookings/booking-monitor.component';
import { PaymentReconcilerComponent } from './features/payments/payment-reconciler.component';
import { ReviewModeratorComponent } from './features/reviews/review-moderator.component';
import { AnalyticsComponent } from './features/analytics/analytics.component';
import { SettingsComponent } from './features/settings/settings.component';
import { SettlementManagerComponent } from './features/settlements/settlement-manager.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'users', component: UserListComponent },
      { path: 'providers', component: ProviderListComponent },
      { path: 'catalog', component: CatalogComponent },
      { path: 'bookings', component: BookingMonitorComponent },
      { path: 'payments', component: PaymentReconcilerComponent },
      { path: 'settlements', component: SettlementManagerComponent },
      { path: 'reviews', component: ReviewModeratorComponent },
      { path: 'analytics', component: AnalyticsComponent },
      { path: 'settings', component: SettingsComponent }
    ]
  },
  { path: '', redirectTo: 'admin/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'admin/dashboard' }
];
