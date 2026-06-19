import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusLabelPipe } from '../../../../shared/pipes/status-label.pipe';
import { RoomService } from '../../../../core/services/room.service';
import { Room } from '../../../../core/models';

@Component({
  selector: 'app-rooms-list',
  imports: [
    PageHeaderComponent,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    StatusLabelPipe,
    FormsModule,
    DatePipe,
  ],
  template: `
    <app-page-header title="Room Management" description="Create and manage rooms by floor and building">
      <button
        type="button"
        class="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
        (click)="showForm.set(!showForm())"
      >
        + Add Room
      </button>
    </app-page-header>

    @if (showForm()) {
      <div class="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="grid gap-4 sm:grid-cols-3">
          <input [(ngModel)]="newRoom.number" placeholder="Room Number" class="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <input [(ngModel)]="newRoom.building" placeholder="Building" class="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <input [(ngModel)]="newRoom.floor" placeholder="Floor" class="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <button type="button" class="mt-4 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white" (click)="addRoom()">
          Save Room
        </button>
      </div>
    }

    @if (loading()) {
      <app-loading-spinner />
    } @else {
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        @for (room of rooms(); track room.id) {
          <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="flex items-start justify-between">
              <div>
                <h3 class="text-lg font-bold text-slate-900">{{ room.name }}</h3>
                <p class="text-sm text-slate-500">{{ room.building }} · {{ room.floor }}</p>
              </div>
              <app-status-badge [status]="room.status" [label]="room.status | statusLabel" />
            </div>
            <div class="mt-4 space-y-2 text-sm text-slate-600">
              <p>QR: <span class="font-mono text-xs">{{ room.qrCode }}</span></p>
              @if (room.department) {
                <p>Dept: {{ room.department }}</p>
              }
              @if (room.deadline) {
                <p class="text-orange-600">Deadline: {{ room.deadline | date: 'short' }}</p>
              }
            </div>
          </div>
        }
      </div>
    }
  `,
})
export class RoomsListComponent implements OnInit {
  private readonly roomService = inject(RoomService);

  readonly loading = signal(true);
  readonly rooms = signal<Room[]>([]);
  readonly showForm = signal(false);
  newRoom = { number: '', building: 'Main Building', floor: 'Floor 1' };

  ngOnInit(): void {
    this.roomService.getAll().subscribe((r) => {
      this.rooms.set(r);
      this.loading.set(false);
    });
  }

  addRoom(): void {
    this.roomService.create(this.newRoom).subscribe((room) => {
      this.rooms.update((list) => [...list, room]);
      this.showForm.set(false);
      this.newRoom = { number: '', building: 'Main Building', floor: 'Floor 1' };
    });
  }
}
