import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';

export const CLEANER_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, roleGuard(['cleaner'])],
    loadComponent: () => import('./cleaner-shell.component').then((m) => m.CleanerShellComponent),
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        loadComponent: () =>
          import('./pages/home/cleaner-home.component').then((m) => m.CleanerHomeComponent),
      },
      {
        path: 'tasks/:roomId',
        loadComponent: () =>
          import('./pages/task-detail/cleaner-task-detail.component').then(
            (m) => m.CleanerTaskDetailComponent,
          ),
      },
      {
        path: 'history',
        loadComponent: () =>
          import('./pages/history/cleaner-history.component').then((m) => m.CleanerHistoryComponent),
      },
    ],
  },
];
