import { Injectable, inject } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Notification } from '../models';
import { MockDataService } from './mock-data.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly mockData = inject(MockDataService);

  getByUser(userId: string): Observable<Notification[]> {
    return of(
      this.mockData.notifications
        .filter((n) => n.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    ).pipe(delay(200));
  }

  add(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>): void {
    this.mockData.notifications.unshift({
      ...notification,
      id: `n${Date.now()}`,
      read: false,
      createdAt: new Date().toISOString(),
    });
  }

  markAsRead(id: string): Observable<void> {
    const notification = this.mockData.notifications.find((n) => n.id === id);
    if (notification) notification.read = true;
    return of(void 0).pipe(delay(100));
  }
}
