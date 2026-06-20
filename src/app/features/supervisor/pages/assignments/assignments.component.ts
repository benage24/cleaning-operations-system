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
  templateUrl: './assignments.component.html',
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
