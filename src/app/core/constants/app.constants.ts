import { UserRole } from '../models';

export const STORAGE_KEYS = {
  AUTH_USER: 'cleanops_auth_user',
  AUTH_REFRESH: 'cleanops_auth_refresh',
  THEME: 'cleanops_theme',
} as const;

export const DEMO_CREDENTIALS = [
  { username: 'admin@cleanops.com', password: 'admin123', role: 'admin' as UserRole },
  { username: 'supervisor@cleanops.com', password: 'supervisor123', role: 'supervisor' as UserRole },
  { username: 'cleaner@cleanops.com', password: 'cleaner123', role: 'cleaner' as UserRole },
];

export const ROLE_HOME_ROUTES: Record<UserRole, string> = {
  admin: '/admin/dashboard',
  supervisor: '/supervisor/dashboard',
  cleaner: '/cleaner/home',
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrator',
  supervisor: 'Supervisor',
  cleaner: 'Cleaner',
};
