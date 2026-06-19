import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';

export const SUPERVISOR_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, roleGuard(['supervisor'])],
    loadComponent: () =>
      import('./supervisor-shell.component').then((m) => m.SupervisorShellComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/supervisor-dashboard.component').then(
            (m) => m.SupervisorDashboardComponent,
          ),
      },
      {
        path: 'cleaners',
        loadComponent: () =>
          import('./pages/cleaners/cleaners-list.component').then((m) => m.CleanersListComponent),
      },
      {
        path: 'rooms',
        loadComponent: () =>
          import('./pages/rooms/rooms-list.component').then((m) => m.RoomsListComponent),
      },
      {
        path: 'assignments',
        loadComponent: () =>
          import('./pages/assignments/assignments.component').then((m) => m.AssignmentsComponent),
      },
      {
        path: 'attendance',
        loadComponent: () =>
          import('./pages/attendance/attendance-dashboard.component').then(
            (m) => m.AttendanceDashboardComponent,
          ),
      },
      {
        path: 'tasks',
        loadComponent: () =>
          import('./pages/tasks/tasks-verification.component').then(
            (m) => m.TasksVerificationComponent,
          ),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./pages/reports/reports.component').then((m) => m.ReportsComponent),
      },
    ],
  },
];
