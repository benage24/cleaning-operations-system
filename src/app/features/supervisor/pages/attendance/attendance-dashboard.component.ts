import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusLabelPipe } from '../../../../shared/pipes/status-label.pipe';
import { AttendanceService } from '../../../../core/services/attendance.service';
import { CleanerService } from '../../../../core/services/cleaner.service';
import { AttendanceRecord, Cleaner } from '../../../../core/models';

@Component({
  selector: 'app-attendance-dashboard',
  imports: [
    PageHeaderComponent,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    StatusLabelPipe,
    DatePipe,
  ],
  template: `
    <app-page-header
      title="Attendance Dashboard"
      description="Monitor daily check-ins and attendance history"
    />

    @if (loading()) {
      <app-loading-spinner />
    } @else {
      <div class="mb-6 grid gap-4 sm:grid-cols-4">
        <div class="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
          <p class="text-2xl font-bold text-emerald-600">{{ countByStatus('present') }}</p>
          <p class="text-sm text-slate-500">Present</p>
        </div>
        <div class="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
          <p class="text-2xl font-bold text-amber-600">{{ countByStatus('late') }}</p>
          <p class="text-sm text-slate-500">Late</p>
        </div>
        <div class="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
          <p class="text-2xl font-bold text-red-600">{{ countByStatus('absent') }}</p>
          <p class="text-sm text-slate-500">Absent</p>
        </div>
        <div class="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
          <p class="text-2xl font-bold text-slate-600">{{ countByStatus('leave') }}</p>
          <p class="text-sm text-slate-500">On Leave</p>
        </div>
      </div>

      <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table class="w-full text-left text-sm">
          <thead class="border-b border-slate-100 bg-slate-50">
            <tr>
              <th class="px-6 py-3 font-medium text-slate-600">Cleaner</th>
              <th class="px-6 py-3 font-medium text-slate-600">Date</th>
              <th class="px-6 py-3 font-medium text-slate-600">Check In</th>
              <th class="px-6 py-3 font-medium text-slate-600">Check Out</th>
              <th class="px-6 py-3 font-medium text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody>
            @for (record of attendance(); track record.id) {
              <tr class="border-b border-slate-50">
                <td class="px-6 py-4 font-medium">{{ getCleanerName(record.cleanerId) }}</td>
                <td class="px-6 py-4">{{ record.date }}</td>
                <td class="px-6 py-4">{{ record.checkIn ? (record.checkIn | date: 'shortTime') : '—' }}</td>
                <td class="px-6 py-4">{{ record.checkOut ? (record.checkOut | date: 'shortTime') : '—' }}</td>
                <td class="px-6 py-4">
                  <app-status-badge [status]="record.status" [label]="record.status | statusLabel" />
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
})
export class AttendanceDashboardComponent implements OnInit {
  private readonly attendanceService = inject(AttendanceService);
  private readonly cleanerService = inject(CleanerService);

  readonly loading = signal(true);
  readonly attendance = signal<AttendanceRecord[]>([]);
  readonly cleaners = signal<Cleaner[]>([]);

  ngOnInit(): void {
    this.attendanceService.getAll().subscribe((a) => {
      this.attendance.set(a);
      this.loading.set(false);
    });
    this.cleanerService.getAll().subscribe((c) => this.cleaners.set(c));
  }

  getCleanerName(id: string): string {
    const c = this.cleaners().find((cl) => cl.id === id);
    return c ? `${c.firstName} ${c.lastName}` : id;
  }

  countByStatus(status: string): number {
    return this.attendance().filter((a) => a.status === status).length;
  }
}
