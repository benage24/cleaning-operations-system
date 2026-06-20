import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { RoomService } from '../../../../core/services/room.service';
import { TaskService } from '../../../../core/services/task.service';
import { AssignmentService } from '../../../../core/services/assignment.service';
import { CleaningTask, Room } from '../../../../core/models';

@Component({
  selector: 'app-cleaner-task-detail',
  imports: [RouterLink, FormsModule],
  templateUrl: './cleaner-task-detail.component.html',
})
export class CleanerTaskDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);
  private readonly roomService = inject(RoomService);
  private readonly taskService = inject(TaskService);
  private readonly assignmentService = inject(AssignmentService);

  readonly room = signal<Room | null>(null);
  readonly task = signal<CleaningTask | null>(null);
  qrInput = '';
  private roomId = '';
  private assignmentId = '';

  ngOnInit(): void {
    this.roomId = this.route.snapshot.paramMap.get('roomId') ?? '';
    this.roomService.getById(this.roomId).subscribe((r) => this.room.set(r ?? null));

    const user = this.auth.currentUser();
    if (user) {
      this.taskService.getByCleaner(user.id).subscribe((tasks) => {
        const existing = tasks.find((t) => t.roomId === this.roomId);
        if (existing) this.task.set(existing);
      });
      this.assignmentService.getByCleaner(user.id).subscribe((a) => {
        const assignment = a.find((x) => x.roomId === this.roomId);
        if (assignment) this.assignmentId = assignment.id;
      });
    }
  }

  createTask(): void {
    const user = this.auth.currentUser();
    if (!user || !this.assignmentId) return;
    this.taskService
      .createFromAssignment(this.assignmentId, this.roomId, user.id)
      .subscribe((t) => this.task.set(t));
  }

  startTask(): void {
    const t = this.task();
    if (!t) return;
    const qr = this.qrInput || this.room()?.qrCode || '';
    this.taskService.startTask(t.id, qr).subscribe((updated) => this.task.set(updated));
  }

  uploadBefore(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    const t = this.task();
    if (!file || !t) return;
    const url = URL.createObjectURL(file);
    this.taskService.uploadBeforePhoto(t.id, url).subscribe((updated) => this.task.set(updated));
  }

  uploadAfter(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    const t = this.task();
    if (!file || !t) return;
    const url = URL.createObjectURL(file);
    this.taskService.uploadAfterPhoto(t.id, url).subscribe((updated) => this.task.set(updated));
  }

  completeTask(): void {
    const t = this.task();
    if (!t) return;
    navigator.geolocation?.getCurrentPosition((pos) => {
      this.taskService
        .completeTask(t.id, { latitude: pos.coords.latitude, longitude: pos.coords.longitude })
        .subscribe((updated) => this.task.set(updated));
    }, () => {
      this.taskService.completeTask(t.id).subscribe((updated) => this.task.set(updated));
    });
  }
}
