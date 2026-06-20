import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthUser, UserRole } from '../models';
import { ROLE_HOME_ROUTES, STORAGE_KEYS } from '../constants/app.constants';
import { ApiService } from './api.service';

interface LoginResponse {
  token: string;
  refresh: string;
  user: Omit<AuthUser, 'token' | 'id'> & { id: number | string };
}

/**
 * Manages authentication state, login/logout, and session persistence.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  private readonly currentUserSignal = signal<AuthUser | null>(this.loadStoredUser());

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);
  readonly userRole = computed(() => this.currentUserSignal()?.role ?? null);

  /** Authenticates a user and stores the returned JWT session. */
  login(username: string, password: string): Observable<AuthUser> {
    return this.api.post<LoginResponse>('auth/login/', { username, password }).pipe(
      map((response) => {
        const user = this.toAuthUser(response);
        this.setSession(user, response.refresh);
        return user;
      }),
    );
  }

  /** Clears the stored session and redirects to the login page. */
  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    localStorage.removeItem(STORAGE_KEYS.AUTH_REFRESH);
    this.currentUserSignal.set(null);
    this.router.navigate(['/auth/login']);
  }

  /** Requests a password reset email for the given address. */
  requestPasswordReset(email: string): Observable<{ message: string }> {
    return this.api.post<{ message: string }>('auth/password-reset/', { email });
  }

  /** Checks whether the current user has one of the allowed roles. */
  hasRole(roles: UserRole[]): boolean {
    const role = this.userRole();
    return role !== null && roles.includes(role);
  }

  /** Navigates the authenticated user to their role-specific home route. */
  redirectToHome(): void {
    const role = this.userRole();
    if (role) {
      this.router.navigate([ROLE_HOME_ROUTES[role]]);
    }
  }

  /** Maps the API login payload into the app's AuthUser model. */
  private toAuthUser(response: LoginResponse): AuthUser {
    return {
      ...response.user,
      id: String(response.user.id),
      token: response.token,
    };
  }

  /** Persists the authenticated user and optional refresh token. */
  private setSession(user: AuthUser, refreshToken?: string): void {
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
    if (refreshToken) {
      localStorage.setItem(STORAGE_KEYS.AUTH_REFRESH, refreshToken);
    }
    this.currentUserSignal.set(user);
  }

  /** Restores a previously saved session from local storage. */
  private loadStoredUser(): AuthUser | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      return stored ? (JSON.parse(stored) as AuthUser) : null;
    } catch {
      return null;
    }
  }
}
