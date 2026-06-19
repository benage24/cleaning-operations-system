import { Component, inject, OnInit, signal } from '@angular/core';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { MockDataService } from '../../../../core/services/mock-data.service';
import { DashboardStats } from '../../../../core/models';

@Component({
  selector: 'app-admin-dashboard',
  imports: [PageHeaderComponent, StatCardComponent, LoadingSpinnerComponent],
  template: `
    <app-page-header
      title="Admin Dashboard"
      description="System-wide overview and analytics"
    />

    @if (loading()) {
      <app-loading-spinner />
    } @else if (stats()) {
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <app-stat-card label="Supervisors" [value]="supervisorCount" icon="👔" />
        <app-stat-card label="Total Cleaners" [value]="stats()!.totalCleaners" icon="👥" />
        <app-stat-card label="Total Rooms" [value]="roomCount" icon="🏨" />
        <app-stat-card label="Completion Rate" [value]="stats()!.completionRate + '%'" icon="📈" />
      </div>

      <div class="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 class="text-lg font-semibold text-slate-900">System Health</h3>
        <div class="mt-4 grid gap-4 sm:grid-cols-3">
          <div class="rounded-lg bg-emerald-50 p-4">
            <p class="text-sm text-emerald-600">Active Users</p>
            <p class="text-2xl font-bold text-emerald-700">{{ activeUsers }}</p>
          </div>
          <div class="rounded-lg bg-blue-50 p-4">
            <p class="text-sm text-blue-600">Tasks Today</p>
            <p class="text-2xl font-bold text-blue-700">{{ stats()!.totalRoomsAssigned }}</p>
          </div>
          <div class="rounded-lg bg-purple-50 p-4">
            <p class="text-sm text-purple-600">Pending Verifications</p>
            <p class="text-2xl font-bold text-purple-700">{{ stats()!.tasksAwaitingVerification }}</p>
          </div>
        </div>
      </div>
    }
  `,
})
export class AdminDashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly mockData = inject(MockDataService);

  readonly loading = signal(true);
  readonly stats = signal<DashboardStats | null>(null);

  get supervisorCount(): number {
    return this.mockData.users.filter((u) => u.role === 'supervisor').length;
  }

  get roomCount(): number {
    return this.mockData.rooms.length;
  }

  get activeUsers(): number {
    return this.mockData.users.filter((u) => u.isActive).length;
  }

  ngOnInit(): void {
    this.dashboardService.getStats().subscribe((s) => {
      this.stats.set(s);
      this.loading.set(false);
    });
  }
}
