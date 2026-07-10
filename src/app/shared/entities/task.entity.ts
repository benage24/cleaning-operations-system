import { TaskStatus } from '../../core/models';

/**
 * Entity representing task form data before posting to POST /api/tasks/.
 */
export class TaskEntity {
  roomId = '';
  cleanerId = '';
  assignmentId = '';
  estimatedDurationMinutes = 45;
  status: TaskStatus = 'assigned';

  constructor(init?: Partial<TaskEntity>) {
    if (init) {
      Object.assign(this, init);
    }
  }

  /** Returns a new entity with default field values. */
  static empty(): TaskEntity {
    return new TaskEntity();
  }

  /** True when required fields for task creation are filled. */
  isValid(): boolean {
    return Boolean(
      this.roomId &&
        this.cleanerId &&
        Number(this.estimatedDurationMinutes) > 0,
    );
  }

  /** Builds the JSON body for POST /api/tasks/. */
  toCreatePayload(): Record<string, number | string | null> {
    return {
      roomId: Number(this.roomId),
      cleanerId: Number(this.cleanerId),
      assignmentId: this.assignmentId ? Number(this.assignmentId) : null,
      estimatedDurationMinutes: Number(this.estimatedDurationMinutes),
      status: this.status,
    };
  }

  /** Applies room/cleaner from a selected assignment. */
  applyAssignment(assignmentId: string, roomId: string, cleanerId: string): void {
    this.assignmentId = assignmentId;
    this.roomId = roomId;
    this.cleanerId = cleanerId;
  }

  /** Resets all fields to their default empty values. */
  reset(): void {
    this.roomId = '';
    this.cleanerId = '';
    this.assignmentId = '';
    this.estimatedDurationMinutes = 45;
    this.status = 'assigned';
  }
}
