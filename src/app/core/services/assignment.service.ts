import { Injectable, inject } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { RoomAssignment } from '../models';
import { MockDataService } from './mock-data.service';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class AssignmentService {
  private readonly mockData = inject(MockDataService);
  private readonly notificationService = inject(NotificationService);

  getAll(): Observable<RoomAssignment[]> {
    return of([...this.mockData.assignments]).pipe(delay(200));
  }

  getByCleaner(cleanerId: string): Observable<RoomAssignment[]> {
    return of(this.mockData.assignments.filter((a) => a.cleanerId === cleanerId && a.isActive)).pipe(
      delay(200),
    );
  }

  assign(roomIds: string[], cleanerId: string, assignedBy: string): Observable<RoomAssignment[]> {
    const created: RoomAssignment[] = roomIds.map((roomId) => {
      const existing = this.mockData.assignments.find(
        (a) => a.roomId === roomId && a.isActive,
      );
      if (existing) {
        existing.isActive = false;
      }
      const assignment: RoomAssignment = {
        id: `a${Date.now()}-${roomId}`,
        roomId,
        cleanerId,
        assignedBy,
        assignedAt: new Date().toISOString(),
        isActive: true,
      };
      this.mockData.assignments.push(assignment);
      return assignment;
    });

    this.notificationService.add({
      userId: cleanerId,
      title: 'New Room Assignment',
      message: `You have been assigned ${roomIds.length} room(s).`,
      type: 'info',
    });

    return of(created).pipe(delay(300));
  }

  reassign(assignmentId: string, newCleanerId: string): Observable<RoomAssignment> {
    const assignment = this.mockData.assignments.find((a) => a.id === assignmentId);
    if (!assignment) throw new Error('Assignment not found');
    assignment.isActive = false;

    const newAssignment: RoomAssignment = {
      id: `a${Date.now()}`,
      roomId: assignment.roomId,
      cleanerId: newCleanerId,
      assignedBy: assignment.assignedBy,
      assignedAt: new Date().toISOString(),
      isActive: true,
    };
    this.mockData.assignments.push(newAssignment);
    return of(newAssignment).pipe(delay(300));
  }
}
