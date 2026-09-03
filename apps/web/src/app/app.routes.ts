import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards/auth.guard';

export const appRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'courses',
    loadComponent: () => import('./features/courses/courses-catalog.component').then(m => m.CoursesCatalogComponent),
  },
  {
    path: 'courses/:slug',
    loadComponent: () => import('./features/courses/course-detail.component').then(m => m.CourseDetailComponent),
  },
  {
    path: 'courses/:slug/watch/:lessonId',
    loadComponent: () => import('./features/watch/watch.component').then(m => m.WatchComponent),
  },
  {
    path: 'membership',
    loadComponent: () => import('./features/membership/membership.component').then(m => m.MembershipComponent),
  },
  {
    path: 'contact',
    loadComponent: () => import('./features/contact/contact.component').then(m => m.ContactComponent),
  },
  {
    path: 'checkout',
    loadComponent: () => import('./features/checkout/checkout.component').then(m => m.CheckoutComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent),
  },
  {
    path: 'admin/courses/:id/manage',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/course-editor.component').then(m => m.CourseEditorComponent),
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'auth/signup',
    loadComponent: () => import('./features/auth/signup.component').then(m => m.SignupComponent),
  },
  {
    path: 'auth/forgot-password',
    loadComponent: () => import('./features/auth/forgot-password.component').then(m => m.ForgotPasswordComponent),
  },
  {
    path: 'privacy-policy',
    loadComponent: () => import('./features/legal/privacy-policy.component').then(m => m.PrivacyPolicyComponent),
  },
  {
    path: 'terms-and-conditions',
    loadComponent: () => import('./features/legal/terms.component').then(m => m.TermsComponent),
  },
  {
    path: 'refund-policy',
    loadComponent: () => import('./features/legal/refund-policy.component').then(m => m.RefundPolicyComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
