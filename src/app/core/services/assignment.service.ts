import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RoomAssignment } from '../models';
import { PaginatedResponse } from '../models/api.model';
import { AssignmentEntity } from '../../shared/entities';
import { ApiService } from './api.service';

type ApiRoomAssignment = Omit<RoomAssignment, 'id' | 'roomId' | 'cleanerId' | 'assignedBy'> & {
  id: number;
  roomId: number;
  cleanerId: number;
  assignedBy: number | null;
};

/** Maps an assignment payload from the API into the app RoomAssignment model. */
function mapAssignment(assignment: ApiRoomAssignment): RoomAssignment {
  return {
    ...assignment,
    id: String(assignment.id),
    roomId: String(assignment.roomId),
    cleanerId: String(assignment.cleanerId),
    assignedBy: assignment.assignedBy != null ? String(assignment.assignedBy) : '',
  };
}

/**
 * Loads and manages room assignments from the backend API.
 */
@Injectable({ providedIn: 'root' })
export class AssignmentService {
  private readonly api = inject(ApiService);

  /** GET /api/assignments/ */
  getAll(): Observable<RoomAssignment[]> {
    return this.api.get<PaginatedResponse<ApiRoomAssignment>>('assignments/').pipe(
      map((response) => response.results.map(mapAssignment)),
    );
  }

  /** GET /api/assignments/{id}/ */
  getById(id: string): Observable<RoomAssignment> {
    return this.api.get<ApiRoomAssignment>(`assignments/${id}/`).pipe(map(mapAssignment));
  }

  /** Returns active assignments for a specific cleaner. */
  getByCleaner(cleanerId: string): Observable<RoomAssignment[]> {
    return this.getAll().pipe(
      map((assignments) =>
        assignments.filter((assignment) => assignment.cleanerId === cleanerId && assignment.isActive),
      ),
    );
  }

  /** POST /api/assignments/bulk-assign/ */
  bulkAssign(assignment: AssignmentEntity): Observable<RoomAssignment[]> {
    return this.api
      .post<ApiRoomAssignment | ApiRoomAssignment[]>(
        'assignments/bulk-assign/',
        assignment.toBulkAssignPayload(),
      )
      .pipe(
        map((response) => {
          const items = Array.isArray(response) ? response : [response];
          return items.map(mapAssignment);
        }),
      );
  }

  /** POST /api/assignments/{id}/reassign/ */
  reassign(assignmentId: string, newCleanerId: string): Observable<RoomAssignment> {
    return this.api
      .post<ApiRoomAssignment>(`assignments/${assignmentId}/reassign/`, {
        newCleanerId: Number(newCleanerId),
      })
      .pipe(map(mapAssignment));
  }
}
