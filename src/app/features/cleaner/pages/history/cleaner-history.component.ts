import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../../../core/services/auth.service';
import { TaskService } from '../../../../core/services/task.service';
import { RoomService } from '../../../../core/services/room.service';
import { CleaningTask, Room } from '../../../../core/models';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { StatusLabelPipe } from '../../../../shared/pipes/status-label.pipe';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

/**
 * Cleaner task history page.
 * Loads completed and past tasks from the API for the logged-in cleaner.
 */
@Component({
  selector: 'app-cleaner-history',
  imports: [RouterLink, DatePipe, StatusBadgeComponent, StatusLabelPipe, LoadingSpinnerComponent],
  templateUrl: './cleaner-history.component.html',
})
export class CleanerHistoryComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly taskService = inject(TaskService);
  private readonly roomService = inject(RoomService);
  private readonly destroyRef = inject(DestroyRef);

  /** True while task and room data is being fetched. */
  readonly loading = signal(true);

  /** User-facing error message when an API request fails. */
  readonly error = signal<string | null>(null);

  /** Task history for the current cleaner. */
  readonly tasks = signal<CleaningTask[]>([]);

  /** Room lookup used to display room names in the history list. */
  readonly rooms = signal<Room[]>([]);

  ngOnInit(): void {
    this.loadTaskHistory();
  }

  /**
   * Loads the cleaner's task history and supporting room data from the API.
   * Uses GET requests through TaskService and RoomService.
   */
  loadTaskHistory(): void {
    const user = this.authService.currentUser();
    if (!user) {
      this.loading.set(false);
      this.error.set('You must be logged in to view task history.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      tasks: this.taskService.getByCleaner(user.id),
      rooms: this.roomService.getAll(),
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: ({ tasks, rooms }) => this.handleHistoryLoaded(tasks, rooms),
        error: (err: Error) => this.handleHistoryError(err),
      });
  }

  /** Resolves a room name from the loaded room list. */
  getRoomName(id: string): string {
    return this.rooms().find((room) => room.id === id)?.name ?? id;
  }

  /** Updates component state after a successful API response. */
  private handleHistoryLoaded(tasks: CleaningTask[], rooms: Room[]): void {
    this.tasks.set(tasks);
    this.rooms.set(rooms);
  }

  /** Stores the API error message for display in the template. */
  private handleHistoryError(err: Error): void {
    this.error.set(err.message);
  }
}
