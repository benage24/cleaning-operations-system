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
  template: `
    <div class="mx-auto max-w-lg">
      <a routerLink="/cleaner/home" class="mb-4 inline-flex items-center text-sm text-teal-600">
        ← Back to rooms
      </a>

      @if (room()) {
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-slate-900">{{ room()!.name }}</h1>
          <p class="text-slate-500">{{ room()!.building }} · {{ room()!.floor }}</p>
        </div>

        <div class="mb-6 rounded-xl border border-slate-200 bg-white p-4">
          <p class="text-sm font-medium text-slate-700">Step 1: Scan QR Code</p>
          <input
            [(ngModel)]="qrInput"
            placeholder="Enter QR code (e.g. QR-R103)"
            class="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        @if (task()) {
          <div class="space-y-4">
            @if (task()!.status === 'assigned' || task()!.status === 're_cleaning') {
              <button
                type="button"
                class="w-full rounded-xl bg-teal-600 py-3 font-semibold text-white"
                (click)="startTask()"
              >
                Start Cleaning
              </button>
            }

            @if (task()!.status === 'in_progress') {
              <div class="rounded-xl border border-slate-200 bg-white p-4">
                <p class="mb-3 text-sm font-medium text-slate-700">Before Photo</p>
                @if (task()!.beforePhotoUrl) {
                  <img [src]="task()!.beforePhotoUrl" alt="Before" class="mb-3 rounded-lg" />
                } @else {
                  <label class="flex cursor-pointer flex-col items-center rounded-lg border-2 border-dashed border-slate-300 py-8">
                    <span class="text-3xl">📷</span>
                    <span class="mt-2 text-sm text-slate-500">Upload before photo</span>
                    <input type="file" accept="image/*" class="hidden" (change)="uploadBefore($event)" />
                  </label>
                }

                <p class="mb-3 mt-4 text-sm font-medium text-slate-700">After Photo</p>
                @if (task()!.afterPhotoUrl) {
                  <img [src]="task()!.afterPhotoUrl" alt="After" class="mb-3 rounded-lg" />
                } @else {
                  <label class="flex cursor-pointer flex-col items-center rounded-lg border-2 border-dashed border-slate-300 py-8">
                    <span class="text-3xl">📷</span>
                    <span class="mt-2 text-sm text-slate-500">Upload after photo</span>
                    <input type="file" accept="image/*" class="hidden" (change)="uploadAfter($event)" />
                  </label>
                }

                @if (task()!.beforePhotoUrl && task()!.afterPhotoUrl) {
                  <button
                    type="button"
                    class="mt-4 w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white"
                    (click)="completeTask()"
                  >
                    Complete Task
                  </button>
                }
              </div>
            }

            @if (task()!.status === 'pending_verification') {
              <div class="rounded-xl bg-purple-50 p-4 text-center">
                <p class="font-semibold text-purple-700">Pending Verification</p>
                <p class="text-sm text-purple-600">Waiting for supervisor approval</p>
              </div>
            }

            @if (task()!.status === 'approved') {
              <div class="rounded-xl bg-emerald-50 p-4 text-center">
                <p class="font-semibold text-emerald-700">Task Approved ✓</p>
              </div>
            }
          </div>
        } @else {
          <button
            type="button"
            class="w-full rounded-xl bg-teal-600 py-3 font-semibold text-white"
            (click)="createTask()"
          >
            Begin Task
          </button>
        }
      }
    </div>
  `,
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
