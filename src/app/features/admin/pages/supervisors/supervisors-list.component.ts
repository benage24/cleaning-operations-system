import { Component, inject, OnInit, signal } from '@angular/core';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { MockDataService } from '../../../../core/services/mock-data.service';
import { User } from '../../../../core/models';
import { ROLE_LABELS } from '../../../../core/constants/app.constants';

@Component({
  selector: 'app-supervisors-list',
  imports: [PageHeaderComponent, StatusBadgeComponent],
  template: `
    <app-page-header title="Supervisor Management" description="Manage supervisor accounts" />

    <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <table class="w-full text-left text-sm">
        <thead class="border-b border-slate-100 bg-slate-50">
          <tr>
            <th class="px-6 py-3 font-medium text-slate-600">Name</th>
            <th class="px-6 py-3 font-medium text-slate-600">Email</th>
            <th class="px-6 py-3 font-medium text-slate-600">Phone</th>
            <th class="px-6 py-3 font-medium text-slate-600">Status</th>
          </tr>
        </thead>
        <tbody>
          @for (user of supervisors(); track user.id) {
            <tr class="border-b border-slate-50">
              <td class="px-6 py-4 font-medium">{{ user.firstName }} {{ user.lastName }}</td>
              <td class="px-6 py-4">{{ user.email }}</td>
              <td class="px-6 py-4">{{ user.phone }}</td>
              <td class="px-6 py-4">
                <app-status-badge
                  [status]="user.isActive ? 'active' : 'inactive'"
                  [label]="user.isActive ? 'Active' : 'Inactive'"
                />
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class SupervisorsListComponent implements OnInit {
  private readonly mockData = inject(MockDataService);
  readonly supervisors = signal<User[]>([]);
  readonly roleLabels = ROLE_LABELS;

  ngOnInit(): void {
    this.supervisors.set(this.mockData.users.filter((u) => u.role === 'supervisor'));
  }
}
