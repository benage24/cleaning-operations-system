import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 class="text-xl font-bold text-slate-900">Reset password</h2>
        <p class="mt-1 text-sm text-slate-500">
          Enter your email and we'll send you a reset link.
        </p>

        @if (success()) {
          <div class="mt-6 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {{ success() }}
          </div>
        } @else {
          <form class="mt-6 space-y-4" [formGroup]="form" (ngSubmit)="onSubmit()">
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                formControlName="email"
                class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            @if (error()) {
              <div class="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{{ error() }}</div>
            }

            <button
              type="submit"
              [disabled]="form.invalid || loading()"
              class="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
            >
              {{ loading() ? 'Sending...' : 'Send reset link' }}
            </button>
          </form>
        }

        <p class="mt-4 text-center text-sm">
          <a routerLink="/auth/login" class="text-teal-600 hover:underline">Back to login</a>
        </p>
      </div>
    </div>
  `,
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly success = signal('');

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');

    this.auth.requestPasswordReset(this.form.controls.email.value).subscribe({
      next: (res) => {
        this.success.set(res.message);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }
}
