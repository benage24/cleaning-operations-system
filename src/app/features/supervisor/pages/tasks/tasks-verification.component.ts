import { Component, DestroyRef, computed, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusLabelPipe } from '../../../../shared/pipes/status-label.pipe';
import { TaskService } from '../../../../core/services/task.service';
import { RoomService } from '../../../../core/services/room.service';
import { CleanerService } from '../../../../core/services/cleaner.service';
import { AssignmentService } from '../../../../core/services/assignment.service';
import { AuthService } from '../../../../core/services/auth.service';
import { CleaningTask, Cleaner, Room, RoomAssignment, TaskStatus } from '../../../../core/models';
import { TaskEntity } from '../../../../shared/entities';

type TaskFilter = 'pending_verification' | 'all' | TaskStatus;
type VerifyAction = 'approve' | 'reject' | 're_cleaning';

/**
 * Supervisor page for reviewing and verifying cleaning tasks
 * against /api/tasks/ and related actions.
 */
@Component({
  selector: 'app-tasks-verification',
  imports: [
    PageHeaderComponent,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    StatusLabelPipe,
    FormsModule,
    DatePipe,
  ],
  templateUrl: './tasks-verification.component.html',
})
export class TasksVerificationComponent implements OnInit {
  private readonly taskService = inject(TaskService);
  private readonly roomService = inject(RoomService);
  private readonly cleanerService = inject(CleanerService);
  private readonly assignmentService = inject(AssignmentService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly loadingReferences = signal(true);
  readonly refreshing = signal(false);
  readonly saving = signal(false);
  readonly verifyingId = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  readonly actionError = signal<string | null>(null);
  readonly tasks = signal<CleaningTask[]>([]);
  readonly rooms = signal<Room[]>([]);
  readonly cleaners = signal<Cleaner[]>([]);
  readonly assignments = signal<RoomAssignment[]>([]);
  readonly showForm = signal(false);
  readonly statusFilter = signal<TaskFilter>('pending_verification');

  newTask = TaskEntity.empty();

  verifyReasons: Record<string, string> = {};
  verifyRatings: Record<string, number | null> = {};

  readonly filterOptions: { value: TaskFilter; label: string }[] = [
    { value: 'pending_verification', label: 'Pending Verification' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 're_cleaning', label: 'Re-cleaning' },
    { value: 'all', label: 'All Tasks' },
  ];

  readonly stats = computed(() => {
    const tasks = this.tasks();
    return {
      total: tasks.length,
      pending: tasks.filter((task) => task.status === 'pending_verification').length,
      inProgress: tasks.filter((task) => task.status === 'in_progress').length,
      approved: tasks.filter((task) => task.status === 'approved').length,
    };
  });

  readonly isListBusy = computed(() => this.loading() || this.refreshing());
  readonly isFormBusy = computed(() => this.saving() || this.loadingReferences());
  readonly activeAssignments = computed(() => this.assignments().filter((a) => a.isActive));
  readonly taskStatuses: TaskStatus[] = ['assigned', 'in_progress'];

  ngOnInit(): void {
    this.loadReferenceData();
    this.loadTasks(true);
  }

  toggleForm(): void {
    if (this.showForm()) {
      this.closeForm();
      return;
    }

    this.actionError.set(null);
    this.newTask.reset();
    this.showForm.set(true);
  }

  /** POST /api/tasks/ */
  createTask(): void {
    if (!this.newTask.isValid()) {
      this.actionError.set('Select a room, cleaner, and estimated duration before creating a task.');
      return;
    }

    this.saving.set(true);
    this.actionError.set(null);

    this.taskService
      .create(this.newTask)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.saving.set(false)),
      )
      .subscribe({
        next: () => {
          this.closeForm();
          this.statusFilter.set('all');
          this.loadTasks();
        },
        error: (err: Error) => this.actionError.set(err.message),
      });
  }

  onAssignmentSelected(assignmentId: string): void {
    if (!assignmentId) {
      this.newTask.assignmentId = '';
      return;
    }

    const assignment = this.activeAssignments().find((item) => item.id === assignmentId);
    if (!assignment) {
      return;
    }

    this.newTask.applyAssignment(assignment.id, assignment.roomId, assignment.cleanerId);
  }

  setStatusFilter(filter: TaskFilter): void {
    this.statusFilter.set(filter);
    this.loadTasks();
  }

  /** GET /api/tasks/ or /api/tasks/pending-verification/ */
  loadTasks(initial = false): void {
    if (initial) {
      this.loading.set(true);
    } else {
      this.refreshing.set(true);
    }
    this.error.set(null);

    this.fetchTasksForFilter(this.statusFilter())
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.loading.set(false);
          this.refreshing.set(false);
        }),
      )
      .subscribe({
        next: (tasks) => this.tasks.set(tasks),
        error: (err: Error) => this.error.set(err.message),
      });
  }

  /** POST /api/tasks/{id}/verify/ */
  verify(task: CleaningTask, action: VerifyAction): void {
    const user = this.authService.currentUser();
    if (!user) {
      this.actionError.set('You must be signed in to verify tasks.');
      return;
    }

    const reason = this.verifyReasons[task.id]?.trim() ?? '';
    const rating = this.verifyRatings[task.id];

    if ((action === 'reject' || action === 're_cleaning') && !reason) {
      this.actionError.set('Please provide a reason for reject or re-clean actions.');
      return;
    }

    this.verifyingId.set(task.id);
    this.actionError.set(null);

    this.taskService
      .verifyTask(task.id, action, user.id, reason || undefined, rating ?? undefined)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.verifyingId.set(null)),
      )
      .subscribe({
        next: () => {
          delete this.verifyReasons[task.id];
          delete this.verifyRatings[task.id];
          this.loadTasks();
        },
        error: (err: Error) => this.actionError.set(err.message),
      });
  }

  getRoomName(id: string): string {
    const room = this.rooms().find((r) => r.id === id);
    return room ? `${room.name} (${room.number})` : id;
  }

  getCleanerName(id: string): string {
    const cleaner = this.cleaners().find((c) => c.id === id);
    return cleaner ? `${cleaner.firstName} ${cleaner.lastName}` : id;
  }

  isVerifying(taskId: string): boolean {
    return this.verifyingId() === taskId;
  }

  private fetchTasksForFilter(filter: TaskFilter): Observable<CleaningTask[]> {
    if (filter === 'pending_verification') {
      return this.taskService.getPendingVerification();
    }

    if (filter === 'all') {
      return this.taskService.getAll();
    }

    return this.taskService.getByStatus(filter);
  }

  private loadReferenceData(): void {
    this.loadingReferences.set(true);

    forkJoin({
      rooms: this.roomService.getAll().pipe(catchError(() => of([] as Room[]))),
      cleaners: this.cleanerService.getAll().pipe(catchError(() => of([] as Cleaner[]))),
      assignments: this.assignmentService.getAll().pipe(catchError(() => of([] as RoomAssignment[]))),
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loadingReferences.set(false)),
      )
      .subscribe(({ rooms, cleaners, assignments }) => {
        this.rooms.set(rooms);
        this.cleaners.set(cleaners);
        this.assignments.set(assignments);
      });
  }

  private closeForm(): void {
    this.showForm.set(false);
    this.newTask.reset();
  }
}
