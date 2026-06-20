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
  templateUrl: './rooms-list.component.html',
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
