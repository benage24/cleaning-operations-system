import { Component, inject, OnInit, signal } from '@angular/core';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { DashboardStats } from '../../../../core/models';

@Component({
  selector: 'app-supervisor-dashboard',
  imports: [PageHeaderComponent, StatCardComponent, LoadingSpinnerComponent],
  templateUrl: './supervisor-dashboard.component.html',
})
export class SupervisorDashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  readonly loading = signal(true);
  readonly stats = signal<DashboardStats | null>(null);
  readonly weeklyData = signal<{ day: string; completed: number; assigned: number }[]>([]);

  maxValue(): number {
    const data = this.weeklyData();
    return Math.max(...data.map((d) => d.assigned), 1);
  }

  ngOnInit(): void {
    this.dashboardService.getStats().subscribe((s) => {
      this.stats.set(s);
      this.loading.set(false);
    });
    this.dashboardService.getWeeklyCompletionData().subscribe((d) => this.weeklyData.set(d));
  }
}
