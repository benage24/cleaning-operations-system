import { Component, DestroyRef, computed, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { AssignmentService } from '../../../../core/services/assignment.service';
import { CleanerService } from '../../../../core/services/cleaner.service';
import { RoomService } from '../../../../core/services/room.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Cleaner, Room, RoomAssignment } from '../../../../core/models';
import { AssignmentEntity } from '../../../../shared/entities';

/**
 * Supervisor page for listing, creating, and reassigning room assignments
 * against /api/assignments/.
 */
@Component({
  selector: 'app-assignments',
  imports: [PageHeaderComponent, LoadingSpinnerComponent, FormsModule, DatePipe],
  templateUrl: './assignments.component.html',
})
export class AssignmentsComponent implements OnInit {
  private readonly assignmentService = inject(AssignmentService);
  private readonly cleanerService = inject(CleanerService);
  private readonly roomService = inject(RoomService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly loadingReferences = signal(true);
  readonly refreshing = signal(false);
  readonly saving = signal(false);
  readonly reassigningId = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  readonly actionError = signal<string | null>(null);
  readonly assignments = signal<RoomAssignment[]>([]);
  readonly cleaners = signal<Cleaner[]>([]);
  readonly rooms = signal<Room[]>([]);
  readonly showForm = signal(false);
  readonly showInactive = signal(false);
  reassignSelections: Record<string, string> = {};

  newAssignment = AssignmentEntity.empty();

  readonly activeAssignments = computed(() => this.assignments().filter((a) => a.isActive));
  readonly inactiveAssignments = computed(() => this.assignments().filter((a) => !a.isActive));
  readonly visibleAssignments = computed(() =>
    this.showInactive() ? this.assignments() : this.activeAssignments(),
  );

  readonly stats = computed(() => ({
    total: this.assignments().length,
    active: this.activeAssignments().length,
    inactive: this.inactiveAssignments().length,
    cleaners: new Set(this.activeAssignments().map((a) => a.cleanerId)).size,
  }));

  readonly isFormBusy = computed(() => this.saving() || this.loadingReferences());
  readonly isTableBusy = computed(() => this.loading() || this.refreshing());

  ngOnInit(): void {
    this.loadReferenceData();
    this.loadAssignments(true);
  }

  toggleForm(): void {
    if (this.showForm()) {
      this.closeForm();
      return;
    }

    this.actionError.set(null);
    this.newAssignment.reset();
    this.showForm.set(true);
  }

  /** GET /api/assignments/ */
  loadAssignments(initial = false): void {
    if (initial) {
      this.loading.set(true);
    } else {
      this.refreshing.set(true);
    }
    this.error.set(null);

    this.assignmentService
      .getAll()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.loading.set(false);
          this.refreshing.set(false);
        }),
      )
      .subscribe({
        next: (assignments) => this.assignments.set(assignments),
        error: (err: Error) => this.error.set(err.message),
      });
  }

  /** POST /api/assignments/bulk-assign/ */
  assign(): void {
    if (!this.newAssignment.isValid()) {
      this.actionError.set('Select a cleaner and at least one room.');
      return;
    }

    const assignedBy = this.authService.currentUser()?.id;
    if (!assignedBy) {
      this.actionError.set('You must be signed in to create assignments.');
      return;
    }

    this.saving.set(true);
    this.actionError.set(null);

    this.assignmentService
      .bulkAssign(this.newAssignment)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.saving.set(false)),
      )
      .subscribe({
        next: () => this.handleAssignmentSaved(),
        error: (err: Error) => this.actionError.set(err.message),
      });
  }

  /** POST /api/assignments/{id}/reassign/ */
  reassign(assignment: RoomAssignment): void {
    const newCleanerId = this.reassignSelections[assignment.id];
    if (!newCleanerId) {
      this.actionError.set('Select a cleaner to reassign this room.');
      return;
    }

    if (newCleanerId === assignment.cleanerId) {
      this.actionError.set('Choose a different cleaner for reassignment.');
      return;
    }

    this.reassigningId.set(assignment.id);
    this.actionError.set(null);

    this.assignmentService
      .reassign(assignment.id, newCleanerId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.reassigningId.set(null)),
      )
      .subscribe({
        next: () => {
          delete this.reassignSelections[assignment.id];
          this.loadAssignments();
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

  getRoomStatus(id: string): string {
    return this.rooms().find((r) => r.id === id)?.status ?? 'unknown';
  }

  toggleRoomSelection(roomId: string, checked: boolean): void {
    const selected = new Set(this.newAssignment.roomId);
    if (checked) {
      selected.add(roomId);
    } else {
      selected.delete(roomId);
    }
    this.newAssignment.roomId = [...selected];
  }

  isRoomSelected(roomId: string): boolean {
    return this.newAssignment.roomId.includes(roomId);
  }

  private loadReferenceData(): void {
    this.loadingReferences.set(true);

    forkJoin({
      cleaners: this.cleanerService.getAll().pipe(catchError(() => of([] as Cleaner[]))),
      rooms: this.roomService.getAll().pipe(catchError(() => of([] as Room[]))),
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loadingReferences.set(false)),
      )
      .subscribe(({ cleaners, rooms }) => {
        this.cleaners.set(cleaners.filter((cleaner) => cleaner.isActive));
        this.rooms.set(rooms);
      });
  }

  private handleAssignmentSaved(): void {
    this.closeForm();
    this.loadAssignments();
  }

  private closeForm(): void {
    this.showForm.set(false);
    this.newAssignment.reset();
  }
}
