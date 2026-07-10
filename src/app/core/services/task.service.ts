import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CleaningTask, GpsCoordinates, TaskStatus } from '../models';
import { PaginatedResponse } from '../models/api.model';
import { TaskEntity } from '../../shared/entities';
import { ApiService } from './api.service';

type ApiCleaningTask = Omit<CleaningTask, 'id' | 'roomId' | 'cleanerId' | 'assignmentId' | 'verifiedBy'> & {
  id: number;
  roomId: number;
  cleanerId: number;
  assignmentId: number | null;
  verifiedBy?: number | null;
};

/** Maps a cleaning task payload from the API into the app CleaningTask model. */
function mapTask(task: ApiCleaningTask): CleaningTask {
  return {
    ...task,
    id: String(task.id),
    roomId: String(task.roomId),
    cleanerId: String(task.cleanerId),
    assignmentId: task.assignmentId != null ? String(task.assignmentId) : '',
    verifiedBy: task.verifiedBy != null ? String(task.verifiedBy) : undefined,
  };
}

/**
 * Loads and mutates cleaning task data from the backend API.
 */
@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly api = inject(ApiService);

  /** Returns all tasks. */
  getAll(): Observable<CleaningTask[]> {
    return this.api.get<PaginatedResponse<ApiCleaningTask>>('tasks/').pipe(
      map((response) => response.results.map(mapTask)),
    );
  }

  /** Returns tasks assigned to a specific cleaner. */
  getByCleaner(cleanerId: string): Observable<CleaningTask[]> {
    return this.api
      .get<PaginatedResponse<ApiCleaningTask>>('tasks/', { cleanerId })
      .pipe(map((response) => response.results.map(mapTask)));
  }

  /** Returns tasks filtered by status. */
  getByStatus(status: TaskStatus): Observable<CleaningTask[]> {
    return this.api
      .get<PaginatedResponse<ApiCleaningTask>>('tasks/', { status })
      .pipe(map((response) => response.results.map(mapTask)));
  }

  /** Returns tasks waiting for supervisor verification. */
  getPendingVerification(): Observable<CleaningTask[]> {
    return this.api
      .get<ApiCleaningTask[]>('tasks/pending-verification/')
      .pipe(map((tasks) => tasks.map(mapTask)));
  }

  /** Returns a single task by id. */
  getById(id: string): Observable<CleaningTask | undefined> {
    return this.api.get<ApiCleaningTask>(`tasks/${id}/`).pipe(map(mapTask));
  }

  /** POST /api/tasks/ */
  create(task: TaskEntity): Observable<CleaningTask> {
    return this.api.post<ApiCleaningTask>('tasks/', task.toCreatePayload()).pipe(map(mapTask));
  }

  /** Creates a task from an active room assignment. */
  createFromAssignment(
    assignmentId: string,
    roomId: string,
    cleanerId: string,
  ): Observable<CleaningTask> {
    return this.api
      .post<ApiCleaningTask>('tasks/from-assignment/', {
        assignmentId: Number(assignmentId),
        roomId: Number(roomId),
        cleanerId: Number(cleanerId),
      })
      .pipe(map(mapTask));
  }

  /** Starts a task after QR verification. */
  startTask(taskId: string, qrCode: string, gps?: GpsCoordinates): Observable<CleaningTask> {
    return this.api
      .post<ApiCleaningTask>(`tasks/${taskId}/start/`, {
        qrCode,
        gps: gps
          ? {
              latitude: gps.latitude,
              longitude: gps.longitude,
              accuracy: gps.accuracy,
            }
          : undefined,
      })
      .pipe(map(mapTask));
  }

  /** Uploads the before-cleaning photo URL for a task. */
  uploadBeforePhoto(taskId: string, photoUrl: string): Observable<CleaningTask> {
    return this.api
      .post<ApiCleaningTask>(`tasks/${taskId}/before-photo/`, { photoUrl })
      .pipe(map(mapTask));
  }

  /** Uploads the after-cleaning photo URL for a task. */
  uploadAfterPhoto(taskId: string, photoUrl: string): Observable<CleaningTask> {
    return this.api
      .post<ApiCleaningTask>(`tasks/${taskId}/after-photo/`, { photoUrl })
      .pipe(map(mapTask));
  }

  /** Marks a task as complete and sends it for verification. */
  completeTask(taskId: string, gps?: GpsCoordinates): Observable<CleaningTask> {
    return this.api
      .post<ApiCleaningTask>(`tasks/${taskId}/complete/`, {
        gps: gps
          ? {
              latitude: gps.latitude,
              longitude: gps.longitude,
              accuracy: gps.accuracy,
            }
          : undefined,
      })
      .pipe(map(mapTask));
  }

  /** Supervisor action to approve, reject, or request re-cleaning. */
  verifyTask(
    taskId: string,
    action: 'approve' | 'reject' | 're_cleaning',
    _supervisorId: string,
    reason?: string,
    rating?: number,
  ): Observable<CleaningTask> {
    return this.api
      .post<ApiCleaningTask>(`tasks/${taskId}/verify/`, { action, reason, rating })
      .pipe(map(mapTask));
  }
}
