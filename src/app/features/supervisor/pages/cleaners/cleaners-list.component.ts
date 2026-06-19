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
  template: `
    <app-page-header title="Cleaner Management" description="Add, edit, and manage cleaning staff">
      <button
        type="button"
        class="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
        (click)="showForm.set(!showForm())"
      >
        {{ showForm() ? 'Cancel' : '+ Add Cleaner' }}
      </button>
    </app-page-header>

    @if (showForm()) {
      <div class="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 class="mb-4 font-semibold text-slate-900">New Cleaner</h3>
        <div class="grid gap-4 sm:grid-cols-2">
          <input [(ngModel)]="newCleaner.firstName" placeholder="First Name" class="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <input [(ngModel)]="newCleaner.lastName" placeholder="Last Name" class="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <input [(ngModel)]="newCleaner.email" placeholder="Email" class="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <input [(ngModel)]="newCleaner.phone" placeholder="Phone" class="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <button
          type="button"
          class="mt-4 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white"
          (click)="addCleaner()"
        >
          Save Cleaner
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
              <th class="px-6 py-3 font-medium text-slate-600">Employee</th>
              <th class="px-6 py-3 font-medium text-slate-600">ID</th>
              <th class="px-6 py-3 font-medium text-slate-600">Contact</th>
              <th class="px-6 py-3 font-medium text-slate-600">Status</th>
              <th class="px-6 py-3 font-medium text-slate-600">Score</th>
              <th class="px-6 py-3 font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (cleaner of cleaners(); track cleaner.id) {
              <tr class="border-b border-slate-50 hover:bg-slate-50">
                <td class="px-6 py-4 font-medium text-slate-900">
                  {{ cleaner.firstName }} {{ cleaner.lastName }}
                </td>
                <td class="px-6 py-4 text-slate-600">{{ cleaner.employeeId }}</td>
                <td class="px-6 py-4 text-slate-600">{{ cleaner.email }}</td>
                <td class="px-6 py-4">
                  <app-status-badge
                    [status]="cleaner.employmentStatus"
                    [label]="cleaner.employmentStatus | statusLabel"
                  />
                </td>
                <td class="px-6 py-4">
                  <span class="font-semibold text-teal-600">{{ cleaner.performanceScore }}%</span>
                </td>
                <td class="px-6 py-4">
                  @if (cleaner.isActive) {
                    <button
                      type="button"
                      class="text-sm text-red-600 hover:underline"
                      (click)="deactivate(cleaner.id)"
                    >
                      Deactivate
                    </button>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
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
