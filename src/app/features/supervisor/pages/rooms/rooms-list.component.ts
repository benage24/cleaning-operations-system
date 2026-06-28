import { Component, DestroyRef, computed, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusLabelPipe } from '../../../../shared/pipes/status-label.pipe';
import { RoomService } from '../../../../core/services/room.service';
import { Room, RoomStatus } from '../../../../core/models';
import { RoomEntity } from '../../../../shared/entities';

/**
 * Supervisor page for full room CRUD against /api/rooms/.
 */
@Component({
  selector: 'app-rooms-list',
  imports: [
    PageHeaderComponent,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    StatusLabelPipe,
    FormsModule,
    DatePipe,
  ],
  templateUrl: './rooms-list.component.html',
})
export class RoomsListComponent implements OnInit {
  private readonly roomService = inject(RoomService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly actionError = signal<string | null>(null);
  readonly rooms = signal<Room[]>([]);
  readonly showForm = signal(false);
  readonly editingRoomId = signal<string | null>(null);
  readonly roomStatuses = RoomEntity.statuses();
  readonly searchTerm = signal('');
  readonly statusFilter = signal<RoomStatus | 'all'>('all');

  readonly stats = computed(() => {
    const rooms = this.rooms();
    return {
      total: rooms.length,
      clean: rooms.filter((r) => r.status === 'clean').length,
      dirty: rooms.filter((r) => r.status === 'dirty').length,
      inProgress: rooms.filter((r) => r.status === 'in_progress').length,
      overdue: rooms.filter((r) => r.status === 'overdue').length,
    };
  });

  readonly filteredRooms = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const status = this.statusFilter();

    return this.rooms().filter((room) => {
      const matchesStatus = status === 'all' || room.status === status;
      const matchesSearch =
        !term ||
        room.name.toLowerCase().includes(term) ||
        room.number.toLowerCase().includes(term) ||
        room.building.toLowerCase().includes(term) ||
        room.floor.toLowerCase().includes(term) ||
        room.qrCode.toLowerCase().includes(term) ||
        (room.department?.toLowerCase().includes(term) ?? false);

      return matchesStatus && matchesSearch;
    });
  });

  roomForm = RoomEntity.empty();
  private defaultLocationId = '';

  ngOnInit(): void {
    this.loadRooms();
  }

  get isEditing(): boolean {
    return this.editingRoomId() !== null;
  }

  toggleForm(): void {
    if (this.showForm()) {
      this.closeForm();
      return;
    }

    this.actionError.set(null);
    this.editingRoomId.set(null);
    this.roomForm.reset();
    this.roomForm.locationId = this.defaultLocationId;
    this.showForm.set(true);
  }

  /** GET /api/rooms/ */
  loadRooms(): void {
    this.loading.set(true);
    this.error.set(null);

    this.roomService
      .getAll()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (rooms) => this.handleRoomsLoaded(rooms),
        error: (err: Error) => this.handleLoadError(err),
      });
  }

  /** Opens the edit form for an existing room. */
  editRoom(room: Room): void {
    this.actionError.set(null);
    this.editingRoomId.set(room.id);
    this.roomForm = RoomEntity.fromRoom(room);
    this.showForm.set(true);
  }

  /** POST or PUT /api/rooms/ depending on edit mode. */
  saveRoom(): void {
    if (!this.roomForm.isValid()) {
      this.actionError.set('Room number, building, and floor are required.');
      return;
    }

    const editingId = this.editingRoomId();
    const room = editingId ? this.buildRoomEntityForUpdate() : this.buildRoomEntityForCreate();

    this.saving.set(true);
    this.actionError.set(null);

    const request$ = editingId
      ? this.roomService.update(editingId, room)
      : this.roomService.create(room);

    request$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.saving.set(false)),
      )
      .subscribe({
        next: () => this.handleRoomSaved(),
        error: (err: Error) => this.handleActionError(err),
      });
  }

  /** DELETE /api/rooms/{id}/ */
  deleteRoom(id: string, name: string): void {
    if (!confirm(`Delete ${name}? This action cannot be undone.`)) {
      return;
    }

    this.actionError.set(null);

    this.roomService
      .delete(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.loadRooms(),
        error: (err: Error) => this.handleActionError(err),
      });
  }

  /** PATCH /api/rooms/{id}/status/ */
  updateRoomStatus(id: string, status: RoomStatus): void {
    this.actionError.set(null);

    this.roomService
      .updateStatus(id, status)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.rooms.update((list) => list.map((room) => (room.id === updated.id ? updated : room)));
        },
        error: (err: Error) => this.handleActionError(err),
      });
  }

  setStatusFilter(status: RoomStatus | 'all'): void {
    this.statusFilter.set(status);
  }

  statusAccent(status: RoomStatus): string {
    const map: Record<RoomStatus, string> = {
      clean: 'border-emerald-200 bg-emerald-50/60',
      dirty: 'border-red-200 bg-red-50/60',
      in_progress: 'border-blue-200 bg-blue-50/60',
      pending_verification: 'border-purple-200 bg-purple-50/60',
      overdue: 'border-orange-200 bg-orange-50/60',
    };
    return map[status] ?? 'border-slate-200 bg-white';
  }

  private handleRoomsLoaded(rooms: Room[]): void {
    this.rooms.set(rooms);
    this.defaultLocationId = rooms[0]?.locationId ?? '2';
    if (!this.roomForm.locationId) {
      this.roomForm.locationId = this.defaultLocationId;
    }
  }

  private handleRoomSaved(): void {
    this.closeForm();
    this.loadRooms();
  }

  private closeForm(): void {
    this.showForm.set(false);
    this.editingRoomId.set(null);
    this.roomForm.reset();
    this.roomForm.locationId = this.defaultLocationId;
  }

  private handleLoadError(err: Error): void {
    this.error.set(err.message);
  }

  private handleActionError(err: Error): void {
    this.actionError.set(err.message);
  }

  private buildRoomEntityForCreate(): RoomEntity {
    return new RoomEntity({ ...this.roomForm }).prepareForCreate(
      this.roomForm.locationId || this.defaultLocationId,
    );
  }

  private buildRoomEntityForUpdate(): RoomEntity {
    return new RoomEntity({ ...this.roomForm }).prepareForUpdate();
  }
}
