import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { TaskService } from '../../../../core/services/task.service';
import { RoomService } from '../../../../core/services/room.service';
import { CleaningTask, Room } from '../../../../core/models';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { StatusLabelPipe } from '../../../../shared/pipes/status-label.pipe';

@Component({
  selector: 'app-cleaner-history',
  imports: [RouterLink, DatePipe, StatusBadgeComponent, StatusLabelPipe],
  template: `
    <div class="mx-auto max-w-lg">
      <a routerLink="/cleaner/home" class="mb-4 inline-flex items-center text-sm text-teal-600">
        ← Back
      </a>
      <h1 class="mb-6 text-2xl font-bold text-slate-900">Task History</h1>

      <div class="space-y-3">
        @for (task of tasks(); track task.id) {
          <div class="rounded-xl border border-slate-200 bg-white p-4">
            <div class="flex items-center justify-between">
              <p class="font-semibold text-slate-900">{{ getRoomName(task.roomId) }}</p>
              <app-status-badge [status]="task.status" [label]="task.status | statusLabel" />
            </div>
            @if (task.completedAt) {
              <p class="mt-1 text-sm text-slate-500">Completed: {{ task.completedAt | date: 'medium' }}</p>
            }
          </div>
        } @empty {
          <p class="py-8 text-center text-slate-500">No task history yet</p>
        }
      </div>
    </div>
  `,
})
export class CleanerHistoryComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly taskService = inject(TaskService);
  private readonly roomService = inject(RoomService);

  readonly tasks = signal<CleaningTask[]>([]);
  readonly rooms = signal<Room[]>([]);

  ngOnInit(): void {
    const user = this.auth.currentUser();
    if (!user) return;
    this.taskService.getByCleaner(user.id).subscribe((t) => this.tasks.set(t));
    this.roomService.getAll().subscribe((r) => this.rooms.set(r));
  }

  getRoomName(id: string): string {
    return this.rooms().find((r) => r.id === id)?.name ?? id;
  }
}
