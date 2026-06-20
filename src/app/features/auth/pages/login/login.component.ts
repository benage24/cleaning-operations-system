import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../../../core/services/auth.service';
import { DEMO_CREDENTIALS } from '../../../../core/constants/app.constants';

/**
 * Login page.
 * Delegates authentication to AuthService and keeps only form/UI state here.
 */
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly demoCredentials = DEMO_CREDENTIALS;
  readonly loading = signal(false);
  readonly error = signal('');

  readonly form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  /** Prefills the login form with demo account credentials. */
  fillDemo(username: string, password: string): void {
    this.form.patchValue({ username, password });
  }

  /** Validates the form and starts the login request. */
  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    const { username, password } = this.form.getRawValue();
    this.login(username, password);
  }

  /**
   * Calls AuthService.login and handles navigation or error display.
   * Component method -> service method is the recommended Angular separation.
   */
  login(username: string, password: string): void {
    this.loading.set(true);
    this.error.set('');

    this.authService
      .login(username, password)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: () => this.handleLoginSuccess(),
        error: (err: Error) => this.handleLoginError(err),
      });
  }

  /** Redirects the user after a successful login. */
  private handleLoginSuccess(): void {
    this.authService.redirectToHome();
  }

  /** Shows the API error message on the login form. */
  private handleLoginError(err: Error): void {
    this.error.set(err.message);
  }
}
