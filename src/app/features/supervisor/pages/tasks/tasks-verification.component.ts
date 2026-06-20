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
  templateUrl: './tasks-verification.component.html',
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
