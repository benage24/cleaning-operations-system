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
  templateUrl: './attendance-dashboard.component.html',
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
