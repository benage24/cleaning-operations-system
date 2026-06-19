import { Injectable, inject } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { CleaningTask, GpsCoordinates, TaskStatus } from '../models';
import { MockDataService } from './mock-data.service';
import { RoomService } from './room.service';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly mockData = inject(MockDataService);
  private readonly roomService = inject(RoomService);
  private readonly notificationService = inject(NotificationService);

  getAll(): Observable<CleaningTask[]> {
    return of([...this.mockData.tasks]).pipe(delay(200));
  }

  getByCleaner(cleanerId: string): Observable<CleaningTask[]> {
    return of(this.mockData.tasks.filter((t) => t.cleanerId === cleanerId)).pipe(delay(200));
  }

  getPendingVerification(): Observable<CleaningTask[]> {
    return of(this.mockData.tasks.filter((t) => t.status === 'pending_verification')).pipe(
      delay(200),
    );
  }

  getById(id: string): Observable<CleaningTask | undefined> {
    return of(this.mockData.tasks.find((t) => t.id === id)).pipe(delay(150));
  }

  startTask(taskId: string, qrCode: string, gps?: GpsCoordinates): Observable<CleaningTask> {
    const task = this.mockData.tasks.find((t) => t.id === taskId);
    if (!task) throw new Error('Task not found');

    const room = this.mockData.rooms.find((r) => r.id === task.roomId);
    if (!room || room.qrCode !== qrCode) {
      throw new Error('Invalid QR code for this room');
    }

    task.status = 'in_progress';
    task.startedAt = new Date().toISOString();
    task.qrVerified = true;
    task.gpsStart = gps;
    this.roomService.updateStatus(task.roomId, 'in_progress').subscribe();

    return of(task).pipe(delay(300));
  }

  uploadBeforePhoto(taskId: string, photoUrl: string): Observable<CleaningTask> {
    const task = this.mockData.tasks.find((t) => t.id === taskId);
    if (!task) throw new Error('Task not found');
    task.beforePhotoUrl = photoUrl;
    return of(task).pipe(delay(200));
  }

  uploadAfterPhoto(taskId: string, photoUrl: string): Observable<CleaningTask> {
    const task = this.mockData.tasks.find((t) => t.id === taskId);
    if (!task) throw new Error('Task not found');
    task.afterPhotoUrl = photoUrl;
    return of(task).pipe(delay(200));
  }

  completeTask(taskId: string, gps?: GpsCoordinates): Observable<CleaningTask> {
    const task = this.mockData.tasks.find((t) => t.id === taskId);
    if (!task) throw new Error('Task not found');
    if (!task.beforePhotoUrl || !task.afterPhotoUrl) {
      throw new Error('Before and after photos are required');
    }

    task.status = 'pending_verification';
    task.completedAt = new Date().toISOString();
    task.gpsComplete = gps;
    this.roomService.updateStatus(task.roomId, 'pending_verification').subscribe();

    this.notificationService.add({
      userId: 'u2',
      title: 'Task Completed',
      message: `Task ${taskId} is awaiting verification.`,
      type: 'success',
    });

    return of(task).pipe(delay(300));
  }

  verifyTask(
    taskId: string,
    action: 'approve' | 'reject' | 're_cleaning',
    supervisorId: string,
    reason?: string,
    rating?: number,
  ): Observable<CleaningTask> {
    const task = this.mockData.tasks.find((t) => t.id === taskId);
    if (!task) throw new Error('Task not found');

    const statusMap: Record<string, TaskStatus> = {
      approve: 'approved',
      reject: 'rejected',
      re_cleaning: 're_cleaning',
    };

    task.status = statusMap[action];
    task.verifiedAt = new Date().toISOString();
    task.verifiedBy = supervisorId;
    task.rejectionReason = reason;
    task.supervisorRating = rating;

    const roomStatus = action === 'approve' ? 'clean' : 'dirty';
    this.roomService.updateStatus(task.roomId, roomStatus).subscribe();

    if (action === 'reject') {
      this.notificationService.add({
        userId: task.cleanerId,
        title: 'Task Rejected',
        message: reason ?? 'Your cleaning task was rejected.',
        type: 'error',
      });
    }

    return of(task).pipe(delay(300));
  }

  createFromAssignment(
    assignmentId: string,
    roomId: string,
    cleanerId: string,
  ): Observable<CleaningTask> {
    const task: CleaningTask = {
      id: `t${Date.now()}`,
      roomId,
      cleanerId,
      assignmentId,
      status: 'assigned',
      qrVerified: false,
      estimatedDurationMinutes: 45,
    };
    this.mockData.tasks.push(task);
    return of(task).pipe(delay(200));
  }
}
