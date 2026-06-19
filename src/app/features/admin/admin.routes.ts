import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadComponent: () => import('./admin-shell.component').then((m) => m.AdminShellComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/admin-dashboard.component').then((m) => m.AdminDashboardComponent),
      },
      {
        path: 'supervisors',
        loadComponent: () =>
          import('./pages/supervisors/supervisors-list.component').then(
            (m) => m.SupervisorsListComponent,
          ),
      },
      {
        path: 'cleaners',
        loadComponent: () =>
          import('../supervisor/pages/cleaners/cleaners-list.component').then(
            (m) => m.CleanersListComponent,
          ),
      },
      {
        path: 'rooms',
        loadComponent: () =>
          import('../supervisor/pages/rooms/rooms-list.component').then((m) => m.RoomsListComponent),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('../supervisor/pages/reports/reports.component').then((m) => m.ReportsComponent),
      },
    ],
  },
];
