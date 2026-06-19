import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: 'supervisor',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/supervisor/supervisor.routes').then((m) => m.SUPERVISOR_ROUTES),
  },
  {
    path: 'cleaner',
    canActivate: [authGuard],
    loadChildren: () => import('./features/cleaner/cleaner.routes').then((m) => m.CLEANER_ROUTES),
  },
  { path: '**', redirectTo: 'auth/login' },
];
