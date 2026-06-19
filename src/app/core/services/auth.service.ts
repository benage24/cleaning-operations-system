import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, throwError, delay, tap } from 'rxjs';
import { AuthUser, User, UserRole } from '../models';
import { DEMO_CREDENTIALS, ROLE_HOME_ROUTES, STORAGE_KEYS } from '../constants/app.constants';
import { MockDataService } from './mock-data.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);
  private readonly mockData = inject(MockDataService);

  private readonly currentUserSignal = signal<AuthUser | null>(this.loadStoredUser());

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);
  readonly userRole = computed(() => this.currentUserSignal()?.role ?? null);

  login(email: string, password: string): Observable<AuthUser> {
    const credential = DEMO_CREDENTIALS.find(
      (c) => c.email === email && c.password === password,
    );

    if (!credential) {
      return throwError(() => new Error('Invalid email or password')).pipe(delay(400));
    }

    const user = this.mockData.users.find((u) => u.email === email);
    if (!user || !user.isActive) {
      return throwError(() => new Error('Account is inactive')).pipe(delay(400));
    }

    const authUser: AuthUser = {
      ...user,
      token: `mock-jwt-${user.id}-${Date.now()}`,
    };

    return of(authUser).pipe(
      delay(500),
      tap((u) => this.setSession(u)),
    );
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    this.currentUserSignal.set(null);
    this.router.navigate(['/auth/login']);
  }

  requestPasswordReset(email: string): Observable<{ message: string }> {
    const exists = this.mockData.users.some((u) => u.email === email);
    if (!exists) {
      return throwError(() => new Error('No account found with this email')).pipe(delay(400));
    }
    return of({ message: 'Password reset link sent to your email.' }).pipe(delay(600));
  }

  hasRole(roles: UserRole[]): boolean {
    const role = this.userRole();
    return role !== null && roles.includes(role);
  }

  redirectToHome(): void {
    const role = this.userRole();
    if (role) {
      this.router.navigate([ROLE_HOME_ROUTES[role]]);
    }
  }

  private setSession(user: AuthUser): void {
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
    this.currentUserSignal.set(user);
  }

  private loadStoredUser(): AuthUser | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      return stored ? (JSON.parse(stored) as AuthUser) : null;
    } catch {
      return null;
    }
  }
}
