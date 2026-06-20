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
  templateUrl: './cleaner-history.component.html',
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
