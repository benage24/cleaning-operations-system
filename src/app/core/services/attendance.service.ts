import { Injectable, inject } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { AttendanceRecord, AttendanceStatus, GpsCoordinates } from '../models';
import { MockDataService } from './mock-data.service';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private readonly mockData = inject(MockDataService);
  private readonly notificationService = inject(NotificationService);

  getAll(): Observable<AttendanceRecord[]> {
    return of([...this.mockData.attendance]).pipe(delay(200));
  }

  getByCleaner(cleanerId: string): Observable<AttendanceRecord[]> {
    return of(this.mockData.attendance.filter((a) => a.cleanerId === cleanerId)).pipe(delay(200));
  }

  getTodayByCleaner(cleanerId: string): Observable<AttendanceRecord | undefined> {
    const today = new Date().toISOString().split('T')[0];
    return of(
      this.mockData.attendance.find((a) => a.cleanerId === cleanerId && a.date === today),
    ).pipe(delay(150));
  }

  checkIn(cleanerId: string, gps?: GpsCoordinates): Observable<AttendanceRecord> {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const hour = now.getHours();
    const status: AttendanceStatus = hour > 8 ? 'late' : 'present';

    const existing = this.mockData.attendance.find(
      (a) => a.cleanerId === cleanerId && a.date === today,
    );

    if (existing) {
      existing.checkIn = now.toISOString();
      existing.status = status;
      existing.gpsCheckIn = gps;
      return of(existing).pipe(delay(300));
    }

    const record: AttendanceRecord = {
      id: `att${Date.now()}`,
      cleanerId,
      date: today,
      checkIn: now.toISOString(),
      status,
      gpsCheckIn: gps,
    };
    this.mockData.attendance.push(record);

    this.notificationService.add({
      userId: 'u2',
      title: 'Cleaner Checked In',
      message: `Cleaner ${cleanerId} checked in.`,
      type: 'info',
    });

    return of(record).pipe(delay(300));
  }

  checkOut(cleanerId: string, gps?: GpsCoordinates): Observable<AttendanceRecord> {
    const today = new Date().toISOString().split('T')[0];
    const record = this.mockData.attendance.find(
      (a) => a.cleanerId === cleanerId && a.date === today,
    );
    if (!record) throw new Error('No check-in found for today');
    record.checkOut = new Date().toISOString();
    record.gpsCheckOut = gps;
    return of(record).pipe(delay(300));
  }
}
