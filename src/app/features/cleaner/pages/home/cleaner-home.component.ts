import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { AttendanceService } from '../../../../core/services/attendance.service';
import { AssignmentService } from '../../../../core/services/assignment.service';
import { RoomService } from '../../../../core/services/room.service';
import { AttendanceRecord, Room, RoomAssignment } from '../../../../core/models';

@Component({
  selector: 'app-cleaner-home',
  imports: [RouterLink, DatePipe],
  template: `
    <div class="mx-auto max-w-lg">
      <div class="mb-6">
        <p class="text-sm text-slate-500">Welcome back,</p>
        <h1 class="text-2xl font-bold text-slate-900">{{ userName() }}</h1>
      </div>

      <div class="mb-6 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 p-6 text-white shadow-lg">
        <p class="text-sm text-teal-100">Today's Status</p>
        @if (attendance()) {
          <p class="mt-1 text-xl font-bold capitalize">{{ attendance()!.status }}</p>
          @if (attendance()!.checkIn) {
            <p class="mt-1 text-sm text-teal-200">Checked in at {{ attendance()!.checkIn | date: 'shortTime' }}</p>
          }
        } @else {
          <p class="mt-1 text-xl font-bold">Not checked in</p>
        }
        <div class="mt-4 flex gap-3">
          @if (!attendance()?.checkIn) {
            <button
              type="button"
              class="flex-1 rounded-xl bg-white py-3 text-sm font-semibold text-teal-700"
              (click)="checkIn()"
            >
              Check In
            </button>
          } @else if (!attendance()?.checkOut) {
            <button
              type="button"
              class="flex-1 rounded-xl bg-white/20 py-3 text-sm font-semibold text-white"
              (click)="checkOut()"
            >
              Check Out
            </button>
          }
        </div>
      </div>

      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-slate-900">Assigned Rooms</h2>
        <span class="rounded-full bg-teal-100 px-3 py-1 text-xs font-medium text-teal-700">
          {{ assignments().length }} rooms
        </span>
      </div>

      <div class="space-y-3">
        @for (assignment of assignments(); track assignment.id) {
          @if (getRoom(assignment.roomId); as room) {
            <a
              [routerLink]="['/cleaner/tasks', assignment.roomId]"
              class="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-teal-300"
            >
              <div>
                <p class="font-semibold text-slate-900">{{ room.name }}</p>
                <p class="text-sm text-slate-500">{{ room.building }} · {{ room.floor }}</p>
              </div>
              <span
                class="rounded-full px-2.5 py-0.5 text-xs font-medium capitalize"
                [class]="statusClass(room.status)"
              >
                {{ room.status.replace('_', ' ') }}
              </span>
            </a>
          }
        } @empty {
          <p class="py-8 text-center text-slate-500">No rooms assigned today</p>
        }
      </div>

      <a
        routerLink="/cleaner/history"
        class="mt-6 block rounded-xl border border-slate-200 bg-white p-4 text-center text-sm font-medium text-teal-600"
      >
        View Task History →
      </a>
    </div>
  `,
})
export class CleanerHomeComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly attendanceService = inject(AttendanceService);
  private readonly assignmentService = inject(AssignmentService);
  private readonly roomService = inject(RoomService);

  readonly attendance = signal<AttendanceRecord | undefined>(undefined);
  readonly assignments = signal<RoomAssignment[]>([]);
  readonly rooms = signal<Room[]>([]);

  userName(): string {
    const u = this.auth.currentUser();
    return u ? u.firstName : '';
  }

  ngOnInit(): void {
    const user = this.auth.currentUser();
    if (!user) return;

    this.attendanceService.getTodayByCleaner(user.id).subscribe((a) => this.attendance.set(a));
    this.assignmentService.getByCleaner(user.id).subscribe((a) => this.assignments.set(a));
    this.roomService.getAll().subscribe((r) => this.rooms.set(r));
  }

  getRoom(id: string): Room | undefined {
    return this.rooms().find((r) => r.id === id);
  }

  checkIn(): void {
    const user = this.auth.currentUser();
    if (!user) return;
    navigator.geolocation?.getCurrentPosition((pos) => {
      this.attendanceService
        .checkIn(user.id, { latitude: pos.coords.latitude, longitude: pos.coords.longitude })
        .subscribe((a) => this.attendance.set(a));
    }, () => {
      this.attendanceService.checkIn(user.id).subscribe((a) => this.attendance.set(a));
    });
  }

  checkOut(): void {
    const user = this.auth.currentUser();
    if (!user) return;
    this.attendanceService.checkOut(user.id).subscribe((a) => this.attendance.set(a));
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      dirty: 'bg-red-100 text-red-700',
      in_progress: 'bg-blue-100 text-blue-700',
      clean: 'bg-emerald-100 text-emerald-700',
      pending_verification: 'bg-purple-100 text-purple-700',
      overdue: 'bg-orange-100 text-orange-700',
    };
    return map[status] ?? 'bg-slate-100 text-slate-700';
  }
}
