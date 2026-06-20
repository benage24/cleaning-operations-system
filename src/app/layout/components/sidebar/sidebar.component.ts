import { Component, computed, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ROLE_LABELS } from '../../../core/constants/app.constants';

export interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  readonly navItems = input.required<NavItem[]>();
  readonly open = input(false);
  readonly closeSidebar = output<void>();

  private readonly auth = inject(AuthService);

  readonly userName = computed(() => {
    const u = this.auth.currentUser();
    return u ? `${u.firstName} ${u.lastName}` : '';
  });

  readonly roleLabel = computed(() => {
    const role = this.auth.userRole();
    return role ? ROLE_LABELS[role] : '';
  });
}
