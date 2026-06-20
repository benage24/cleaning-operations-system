import { Component, inject, OnInit, signal } from '@angular/core';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { ReportService } from '../../../../core/services/dashboard.service';
import { PerformanceReport } from '../../../../core/models';

@Component({
  selector: 'app-reports',
  imports: [PageHeaderComponent, LoadingSpinnerComponent],
  templateUrl: './reports.component.html',
})
export class ReportsComponent implements OnInit {
  private readonly reportService = inject(ReportService);

  readonly loading = signal(true);
  readonly reports = signal<PerformanceReport[]>([]);
  readonly activeTab = signal('performance');
  readonly exportMessage = signal('');

  readonly reportTabs = [
    { id: 'attendance', label: 'Attendance', icon: '⏰', description: 'Daily, weekly, monthly' },
    { id: 'performance', label: 'Cleaning Performance', icon: '✨', description: 'Completion rates & times' },
    { id: 'supervisor', label: 'Supervisor Reports', icon: '📋', description: 'Approvals & rejections' },
  ];

  ngOnInit(): void {
    this.reportService.getPerformanceReports().subscribe((r) => {
      this.reports.set(r);
      this.loading.set(false);
    });
  }

  export(type: 'pdf' | 'excel'): void {
    this.reportService.exportReport(type, this.activeTab()).subscribe(() => {
      this.exportMessage.set(`${type.toUpperCase()} report generated successfully.`);
      setTimeout(() => this.exportMessage.set(''), 3000);
    });
  }
}
