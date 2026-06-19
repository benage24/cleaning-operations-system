import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusLabelPipe } from '../../../../shared/pipes/status-label.pipe';
import { TaskService } from '../../../../core/services/task.service';
import { RoomService } from '../../../../core/services/room.service';
import { CleanerService } from '../../../../core/services/cleaner.service';
import { AuthService } from '../../../../core/services/auth.service';
import { CleaningTask, Room, Cleaner } from '../../../../core/models';

@Component({
  selector: 'app-tasks-verification',
  imports: [
    PageHeaderComponent,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    StatusLabelPipe,
    DatePipe,
  ],
  template: `
    <app-page-header
      title="Task Verification"
      description="Review and approve completed cleaning tasks"
    />

    @if (loading()) {
      <app-loading-spinner />
    } @else {
      <div class="space-y-4">
        @for (task of tasks(); track task.id) {
          <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 class="text-lg font-semibold text-slate-900">{{ getRoomName(task.roomId) }}</h3>
                <p class="text-sm text-slate-500">Cleaner: {{ getCleanerName(task.cleanerId) }}</p>
                <app-status-badge
                  class="mt-2 inline-block"
                  [status]="task.status"
                  [label]="task.status | statusLabel"
                />
              </div>
              @if (task.status === 'pending_verification') {
                <div class="flex gap-2">
                  <button
                    type="button"
                    class="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
                    (click)="verify(task.id, 'approve')"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    class="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white"
                    (click)="verify(task.id, 're_cleaning')"
                  >
                    Re-clean
                  </button>
                  <button
                    type="button"
                    class="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
                    (click)="verify(task.id, 'reject')"
                  >
                    Reject
                  </button>
                </div>
              }
            </div>

            @if (task.beforePhotoUrl || task.afterPhotoUrl) {
              <div class="mt-4 grid gap-4 sm:grid-cols-2">
                @if (task.beforePhotoUrl) {
                  <div>
                    <p class="mb-2 text-xs font-medium text-slate-500">Before Cleaning</p>
                    <img [src]="task.beforePhotoUrl" alt="Before" class="rounded-lg border border-slate-200" />
                  </div>
                }
                @if (task.afterPhotoUrl) {
                  <div>
                    <p class="mb-2 text-xs font-medium text-slate-500">After Cleaning</p>
                    <img [src]="task.afterPhotoUrl" alt="After" class="rounded-lg border border-slate-200" />
                  </div>
                }
              </div>
            }

            <div class="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
              @if (task.qrVerified) {
                <span class="rounded bg-teal-50 px-2 py-1 text-teal-700">✓ QR Verified</span>
              }
              @if (task.gpsStart) {
                <span class="rounded bg-blue-50 px-2 py-1 text-blue-700">✓ GPS Recorded</span>
              }
              @if (task.startedAt) {
                <span>Started: {{ task.startedAt | date: 'short' }}</span>
              }
              @if (task.completedAt) {
                <span>Completed: {{ task.completedAt | date: 'short' }}</span>
              }
            </div>
          </div>
        } @empty {
          <p class="py-12 text-center text-slate-500">No tasks to display</p>
        }
      </div>
    }
  `,
})
export class TasksVerificationComponent implements OnInit {
  private readonly taskService = inject(TaskService);
  private readonly roomService = inject(RoomService);
  private readonly cleanerService = inject(CleanerService);
  private readonly auth = inject(AuthService);

  readonly loading = signal(true);
  readonly tasks = signal<CleaningTask[]>([]);
  readonly rooms = signal<Room[]>([]);
  readonly cleaners = signal<Cleaner[]>([]);

  ngOnInit(): void {
    this.taskService.getAll().subscribe((t) => {
      this.tasks.set(t);
      this.loading.set(false);
    });
    this.roomService.getAll().subscribe((r) => this.rooms.set(r));
    this.cleanerService.getAll().subscribe((c) => this.cleaners.set(c));
  }

  getRoomName(id: string): string {
    return this.rooms().find((r) => r.id === id)?.name ?? id;
  }

  getCleanerName(id: string): string {
    const c = this.cleaners().find((cl) => cl.id === id);
    return c ? `${c.firstName} ${c.lastName}` : id;
  }

  verify(taskId: string, action: 'approve' | 'reject' | 're_cleaning'): void {
    const user = this.auth.currentUser();
    if (!user) return;
    this.taskService.verifyTask(taskId, action, user.id, 'Quality check').subscribe(() => {
      this.taskService.getAll().subscribe((t) => this.tasks.set(t));
    });
  }
}
