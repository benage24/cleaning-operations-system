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
  templateUrl: './cleaner-home.component.html',
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
