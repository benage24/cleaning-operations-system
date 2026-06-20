import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  AdminDashboardOverview,
  DashboardStats,
  PerformanceReport,
  Room,
  User,
} from '../models';
import { PaginatedResponse } from '../models/api.model';
import { ApiService } from './api.service';

/**
 * Loads dashboard metrics and report data from the backend API.
 */
@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly api = inject(ApiService);

  /** Returns the main supervisor/admin dashboard statistics. */
  getStats(): Observable<DashboardStats> {
    return this.api.get<DashboardStats>('dashboard/stats/');
  }

  /** Returns weekly room completion chart data. */
  getWeeklyCompletionData(): Observable<{ day: string; completed: number; assigned: number }[]> {
    return this.api.get<{ day: string; completed: number; assigned: number }[]>(
      'dashboard/weekly-completion/',
    );
  }

  /**
   * Builds the admin dashboard overview by combining stats with
   * user and room counts from related endpoints.
   */
  getAdminOverview(): Observable<AdminDashboardOverview> {
    return forkJoin({
      stats: this.getStats(),
      supervisors: this.api.get<PaginatedResponse<User>>('auth/users/', { role: 'supervisor' }),
      users: this.api.get<PaginatedResponse<User>>('auth/users/'),
      rooms: this.api.get<PaginatedResponse<Room>>('rooms/'),
    }).pipe(
      map(({ stats, supervisors, users, rooms }) => ({
        ...stats,
        supervisorCount: supervisors.count,
        roomCount: rooms.count,
        activeUsers: users.results.filter((user) => user.isActive).length,
      })),
    );
  }
}

/**
 * Loads performance report data and export actions from the backend API.
 */
@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly api = inject(ApiService);

  /** Returns cleaner performance metrics for the reports page. */
  getPerformanceReports(): Observable<PerformanceReport[]> {
    return this.api
      .get<(Omit<PerformanceReport, 'cleanerId'> & { cleanerId: number })[]>(
        'reports/performance/',
      )
      .pipe(
        map((reports) =>
          reports.map((report) => ({
            ...report,
            cleanerId: String(report.cleanerId),
          })),
        ),
      );
  }

  /** Triggers a report export on the backend. */
  exportReport(type: 'pdf' | 'excel', reportName: string): Observable<{ url: string }> {
    return this.api.post<{ url: string }>('reports/export/', { type, reportName });
  }
}
