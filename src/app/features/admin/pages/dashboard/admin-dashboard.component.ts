import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { AdminDashboardOverview } from '../../../../core/models';

/**
 * Admin dashboard page.
 * The component owns UI state; the service owns API communication.
 */
@Component({
  selector: 'app-admin-dashboard',
  imports: [PageHeaderComponent, StatCardComponent, LoadingSpinnerComponent],
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly destroyRef = inject(DestroyRef);

  /** True while dashboard data is being fetched. */
  readonly loading = signal(true);

  /** Dashboard metrics returned by the API. */
  readonly overview = signal<AdminDashboardOverview | null>(null);

  /** User-facing error message when the API request fails. */
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadAdminOverview();
  }

  /**
   * Loads admin dashboard data from DashboardService.
   * Called on init and can be reused for retry actions.
   */
  loadAdminOverview(): void {
    this.loading.set(true);
    this.error.set(null);

    this.dashboardService
      .getAdminOverview()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (data) => this.handleOverviewLoaded(data),
        error: (err: Error) => this.handleOverviewError(err),
      });
  }

  /** Updates the dashboard state after a successful API response. */
  private handleOverviewLoaded(data: AdminDashboardOverview): void {
    this.overview.set(data);
  }

  /** Stores the error message when the API request fails. */
  private handleOverviewError(err: Error): void {
    this.error.set(err.message);
  }
}
