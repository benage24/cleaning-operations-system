import { Injectable, inject } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { DashboardStats, PerformanceReport } from '../models';
import { MockDataService } from './mock-data.service';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly mockData = inject(MockDataService);

  getStats(): Observable<DashboardStats> {
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = this.mockData.attendance.filter((a) => a.date === today);
    const activeAssignments = this.mockData.assignments.filter((a) => a.isActive);

    const stats: DashboardStats = {
      totalCleaners: this.mockData.cleaners.filter((c) => c.isActive).length,
      cleanersPresent: todayAttendance.filter((a) => a.status === 'present' || a.status === 'late')
        .length,
      cleanersAbsent: todayAttendance.filter((a) => a.status === 'absent').length,
      totalRoomsAssigned: activeAssignments.length,
      roomsCompleted: this.mockData.rooms.filter((r) => r.status === 'clean').length,
      roomsPending: this.mockData.rooms.filter(
        (r) => r.status === 'dirty' || r.status === 'in_progress',
      ).length,
      roomsOverdue: this.mockData.rooms.filter((r) => r.status === 'overdue').length,
      tasksAwaitingVerification: this.mockData.tasks.filter(
        (t) => t.status === 'pending_verification',
      ).length,
      completionRate: 78,
      averageCleaningTime: 42,
    };

    return of(stats).pipe(delay(300));
  }

  getWeeklyCompletionData(): Observable<{ day: string; completed: number; assigned: number }[]> {
    return of([
      { day: 'Mon', completed: 12, assigned: 15 },
      { day: 'Tue', completed: 14, assigned: 16 },
      { day: 'Wed', completed: 11, assigned: 14 },
      { day: 'Thu', completed: 16, assigned: 18 },
      { day: 'Fri', completed: 13, assigned: 15 },
      { day: 'Sat', completed: 8, assigned: 10 },
      { day: 'Sun', completed: 6, assigned: 8 },
    ]).pipe(delay(200));
  }
}

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly mockData = inject(MockDataService);

  getPerformanceReports(): Observable<PerformanceReport[]> {
    const reports: PerformanceReport[] = this.mockData.cleaners.map((c) => ({
      cleanerId: c.id,
      cleanerName: `${c.firstName} ${c.lastName}`,
      roomsCleaned: Math.floor(Math.random() * 20) + 10,
      completionRate: c.performanceScore,
      averageTimeMinutes: Math.floor(Math.random() * 20) + 35,
      attendanceRate: Math.floor(Math.random() * 15) + 85,
      performanceScore: c.performanceScore,
    }));
    return of(reports).pipe(delay(300));
  }

  exportReport(type: 'pdf' | 'excel', reportName: string): Observable<{ url: string }> {
    return of({ url: `#export-${type}-${reportName}` }).pipe(delay(500));
  }
}
