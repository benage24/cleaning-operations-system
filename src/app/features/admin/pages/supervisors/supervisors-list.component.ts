import { Component, inject, OnInit, signal } from '@angular/core';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { MockDataService } from '../../../../core/services/mock-data.service';
import { User } from '../../../../core/models';
import { ROLE_LABELS } from '../../../../core/constants/app.constants';

@Component({
  selector: 'app-supervisors-list',
  imports: [PageHeaderComponent, StatusBadgeComponent],
  templateUrl: './supervisors-list.component.html',
})
export class SupervisorsListComponent implements OnInit {
  private readonly mockData = inject(MockDataService);
  readonly supervisors = signal<User[]>([]);
  readonly roleLabels = ROLE_LABELS;

  ngOnInit(): void {
    this.supervisors.set(this.mockData.users.filter((u) => u.role === 'supervisor'));
  }
}
