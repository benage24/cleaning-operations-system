import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { AssignmentService } from '../../../../core/services/assignment.service';
import { CleanerService } from '../../../../core/services/cleaner.service';
import { RoomService } from '../../../../core/services/room.service';
import { AuthService } from '../../../../core/services/auth.service';
import { RoomAssignment, Cleaner, Room } from '../../../../core/models';

@Component({
  selector: 'app-assignments',
  imports: [PageHeaderComponent, LoadingSpinnerComponent, FormsModule, DatePipe],
  template: `
    <app-page-header title="Room Assignments" description="Assign rooms to cleaners">
      <button
        type="button"
        class="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white"
        (click)="showForm.set(!showForm())"
      >
        + New Assignment
      </button>
    </app-page-header>

    @if (showForm()) {
      <div class="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Cleaner</label>
            <select [(ngModel)]="selectedCleaner" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="">Select cleaner</option>
              @for (c of cleaners(); track c.id) {
                <option [value]="c.id">{{ c.firstName }} {{ c.lastName }}</option>
              }
            </select>
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Rooms</label>
            <select multiple [(ngModel)]="selectedRooms" class="h-32 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              @for (r of rooms(); track r.id) {
                <option [value]="r.id">{{ r.name }} ({{ r.status }})</option>
              }
            </select>
          </div>
        </div>
        <button type="button" class="mt-4 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white" (click)="assign()">
          Assign Rooms
        </button>
      </div>
    }

    @if (loading()) {
      <app-loading-spinner />
    } @else {
      <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table class="w-full text-left text-sm">
          <thead class="border-b border-slate-100 bg-slate-50">
            <tr>
              <th class="px-6 py-3 font-medium text-slate-600">Room</th>
              <th class="px-6 py-3 font-medium text-slate-600">Cleaner</th>
              <th class="px-6 py-3 font-medium text-slate-600">Assigned At</th>
              <th class="px-6 py-3 font-medium text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody>
            @for (a of assignments(); track a.id) {
              @if (a.isActive) {
                <tr class="border-b border-slate-50">
                  <td class="px-6 py-4 font-medium">{{ getRoomName(a.roomId) }}</td>
                  <td class="px-6 py-4">{{ getCleanerName(a.cleanerId) }}</td>
                  <td class="px-6 py-4 text-slate-500">{{ a.assignedAt | date: 'medium' }}</td>
                  <td class="px-6 py-4">
                    <span class="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">Active</span>
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>
    }
  `,
})
export class AssignmentsComponent implements OnInit {
  private readonly assignmentService = inject(AssignmentService);
  private readonly cleanerService = inject(CleanerService);
  private readonly roomService = inject(RoomService);
  private readonly auth = inject(AuthService);

  readonly loading = signal(true);
  readonly assignments = signal<RoomAssignment[]>([]);
  readonly cleaners = signal<Cleaner[]>([]);
  readonly rooms = signal<Room[]>([]);
  readonly showForm = signal(false);
  selectedCleaner = '';
  selectedRooms: string[] = [];

  ngOnInit(): void {
    this.assignmentService.getAll().subscribe((a) => {
      this.assignments.set(a);
      this.loading.set(false);
    });
    this.cleanerService.getAll().subscribe((c) => this.cleaners.set(c));
    this.roomService.getAll().subscribe((r) => this.rooms.set(r));
  }

  getRoomName(id: string): string {
    return this.rooms().find((r) => r.id === id)?.name ?? id;
  }

  getCleanerName(id: string): string {
    const c = this.cleaners().find((cl) => cl.id === id);
    return c ? `${c.firstName} ${c.lastName}` : id;
  }

  assign(): void {
    const user = this.auth.currentUser();
    if (!this.selectedCleaner || !this.selectedRooms.length || !user) return;
    this.assignmentService
      .assign(this.selectedRooms, this.selectedCleaner, user.id)
      .subscribe(() => {
        this.assignmentService.getAll().subscribe((a) => this.assignments.set(a));
        this.showForm.set(false);
        this.selectedCleaner = '';
        this.selectedRooms = [];
      });
  }
}
