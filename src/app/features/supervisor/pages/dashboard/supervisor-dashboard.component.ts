import { Component, inject, OnInit, signal } from '@angular/core';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { DashboardStats } from '../../../../core/models';

@Component({
  selector: 'app-supervisor-dashboard',
  imports: [PageHeaderComponent, StatCardComponent, LoadingSpinnerComponent],
  template: `
    <app-page-header
      title="Supervisor Dashboard"
      description="Real-time overview of cleaning operations"
    />

    @if (loading()) {
      <app-loading-spinner />
    } @else if (stats()) {
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <app-stat-card label="Total Cleaners" [value]="stats()!.totalCleaners" icon="👥" />
        <app-stat-card
          label="Present Today"
          [value]="stats()!.cleanersPresent"
          icon="✅"
          iconBgClass="bg-emerald-50 text-emerald-600"
          [trend]="5"
        />
        <app-stat-card
          label="Absent Today"
          [value]="stats()!.cleanersAbsent"
          icon="❌"
          iconBgClass="bg-red-50 text-red-600"
        />
        <app-stat-card label="Rooms Assigned" [value]="stats()!.totalRoomsAssigned" icon="🏨" />
        <app-stat-card
          label="Rooms Completed"
          [value]="stats()!.roomsCompleted"
          icon="✨"
          iconBgClass="bg-emerald-50 text-emerald-600"
        />
        <app-stat-card label="Rooms Pending" [value]="stats()!.roomsPending" icon="⏳" />
        <app-stat-card
          label="Rooms Overdue"
          [value]="stats()!.roomsOverdue"
          icon="⚠️"
          iconBgClass="bg-orange-50 text-orange-600"
        />
        <app-stat-card
          label="Awaiting Verification"
          [value]="stats()!.tasksAwaitingVerification"
          icon="🔍"
          iconBgClass="bg-purple-50 text-purple-600"
        />
      </div>

      <div class="mt-8 grid gap-6 lg:grid-cols-2">
        <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-slate-900">Weekly Completion</h3>
          <div class="mt-6 flex items-end justify-between gap-2" style="height: 180px">
            @for (day of weeklyData(); track day.day) {
              <div class="flex flex-1 flex-col items-center gap-1">
                <div class="flex w-full flex-col items-center gap-0.5" style="height: 140px">
                  <div
                    class="w-full rounded-t bg-teal-500"
                    [style.height.%]="(day.completed / maxValue()) * 100"
                  ></div>
                  <div
                    class="w-full rounded-t bg-slate-200"
                    [style.height.%]="((day.assigned - day.completed) / maxValue()) * 100"
                  ></div>
                </div>
                <span class="text-xs text-slate-500">{{ day.day }}</span>
              </div>
            }
          </div>
          <div class="mt-4 flex gap-4 text-xs text-slate-500">
            <span class="flex items-center gap-1"><span class="h-2 w-2 rounded bg-teal-500"></span> Completed</span>
            <span class="flex items-center gap-1"><span class="h-2 w-2 rounded bg-slate-200"></span> Remaining</span>
          </div>
        </div>

        <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-slate-900">Performance Metrics</h3>
          <div class="mt-6 space-y-6">
            <div>
              <div class="mb-2 flex justify-between text-sm">
                <span class="text-slate-600">Completion Rate</span>
                <span class="font-semibold text-slate-900">{{ stats()!.completionRate }}%</span>
              </div>
              <div class="h-2 rounded-full bg-slate-100">
                <div
                  class="h-2 rounded-full bg-teal-500"
                  [style.width.%]="stats()!.completionRate"
                ></div>
              </div>
            </div>
            <div>
              <div class="mb-2 flex justify-between text-sm">
                <span class="text-slate-600">Avg. Cleaning Time</span>
                <span class="font-semibold text-slate-900">{{ stats()!.averageCleaningTime }} min</span>
              </div>
              <div class="h-2 rounded-full bg-slate-100">
                <div class="h-2 rounded-full bg-blue-500" style="width: 70%"></div>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4 pt-2">
              <div class="rounded-lg bg-teal-50 p-4 text-center">
                <p class="text-2xl font-bold text-teal-700">{{ stats()!.completionRate }}%</p>
                <p class="text-xs text-teal-600">On-time Rate</p>
              </div>
              <div class="rounded-lg bg-blue-50 p-4 text-center">
                <p class="text-2xl font-bold text-blue-700">4.6</p>
                <p class="text-xs text-blue-600">Avg. Rating</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
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
