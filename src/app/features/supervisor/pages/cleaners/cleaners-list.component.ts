import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusLabelPipe } from '../../../../shared/pipes/status-label.pipe';
import { AuthService } from '../../../../core/services/auth.service';
import { CleanerService } from '../../../../core/services/cleaner.service';
import { Cleaner } from '../../../../core/models';

/**
 * Supervisor page for listing, creating, and deactivating cleaners.
 */
@Component({
  selector: 'app-cleaners-list',
  imports: [
    PageHeaderComponent,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    StatusLabelPipe,
    FormsModule,
  ],
  templateUrl: './cleaners-list.component.html',
})
export class CleanersListComponent implements OnInit {
  private readonly cleanerService = inject(CleanerService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  /** True while the cleaners list is being fetched. */
  readonly loading = signal(true);

  /** True while a new cleaner is being saved. */
  readonly saving = signal(false);

  /** User-facing error for list loading. */
  readonly error = signal<string | null>(null);

  /** User-facing error for create/deactivate actions. */
  readonly actionError = signal<string | null>(null);

  /** Cleaners returned from the API. */
  readonly cleaners = signal<Cleaner[]>([]);

  /** Controls visibility of the add-cleaner form. */
  readonly showForm = signal(false);

  newCleaner = { firstName: '', lastName: '', email: '', phone: '' };

  ngOnInit(): void {
    this.loadCleaners();
  }

  /** Toggles the add-cleaner form and clears action errors. */
  toggleForm(): void {
    this.showForm.update((visible) => !visible);
    this.actionError.set(null);
  }

  /**
   * Loads all cleaners from CleanerService.
   * Called on init and after create/deactivate actions.
   */
  loadCleaners(): void {
    this.loading.set(true);
    this.error.set(null);

    this.cleanerService
      .getAll()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (cleaners) => this.handleCleanersLoaded(cleaners),
        error: (err: Error) => this.handleLoadError(err),
      });
  }

  /** Validates the form and creates a new cleaner through the API. */
  addCleaner(): void {
    const { firstName, lastName, email, phone } = this.newCleaner;
    if (!firstName || !lastName || !email) {
      this.actionError.set('First name, last name, and email are required.');
      return;
    }

    const supervisorId = this.authService.currentUser()?.id;
    this.saving.set(true);
    this.actionError.set(null);

    this.cleanerService
      .create({ firstName, lastName, email, phone, supervisorId })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.saving.set(false)),
      )
      .subscribe({
        next: () => this.handleCleanerCreated(),
        error: (err: Error) => this.handleActionError(err),
      });
  }

  /** Deactivates a cleaner through the API. */
  deactivate(id: string): void {
    this.actionError.set(null);

    this.cleanerService
      .deactivate(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.loadCleaners(),
        error: (err: Error) => this.handleActionError(err),
      });
  }

  /** Updates the list after a successful fetch. */
  private handleCleanersLoaded(cleaners: Cleaner[]): void {
    this.cleaners.set(cleaners);
  }

  /** Resets the form and reloads the list after a successful create. */
  private handleCleanerCreated(): void {
    this.showForm.set(false);
    this.newCleaner = { firstName: '', lastName: '', email: '', phone: '' };
    this.loadCleaners();
  }

  /** Stores list fetch errors for display in the template. */
  private handleLoadError(err: Error): void {
    this.error.set(err.message);
  }

  /** Stores create/deactivate errors for display in the template. */
  private handleActionError(err: Error): void {
    this.actionError.set(err.message);
  }
}
