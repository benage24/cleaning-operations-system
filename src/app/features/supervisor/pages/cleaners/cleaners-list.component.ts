import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusLabelPipe } from '../../../../shared/pipes/status-label.pipe';
import { CleanerService } from '../../../../core/services/cleaner.service';
import { Cleaner } from '../../../../core/models';

@Component({
  selector: 'app-cleaners-list',
  imports: [
    PageHeaderComponent,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    StatusLabelPipe,
    FormsModule,
  ],
  templateUrl: './cleaners-list.component.html',
})
export class CleanersListComponent implements OnInit {
  private readonly cleanerService = inject(CleanerService);

  readonly loading = signal(true);
  readonly cleaners = signal<Cleaner[]>([]);
  readonly showForm = signal(false);
  newCleaner = { firstName: '', lastName: '', email: '', phone: '' };

  ngOnInit(): void {
    this.loadCleaners();
  }

  loadCleaners(): void {
    this.cleanerService.getAll().subscribe((c) => {
      this.cleaners.set(c);
      this.loading.set(false);
    });
  }

  addCleaner(): void {
    this.cleanerService.create({ ...this.newCleaner, supervisorId: 'u2' }).subscribe(() => {
      this.showForm.set(false);
      this.newCleaner = { firstName: '', lastName: '', email: '', phone: '' };
      this.loadCleaners();
    });
  }

  deactivate(id: string): void {
    this.cleanerService.deactivate(id).subscribe(() => this.loadCleaners());
  }
}
