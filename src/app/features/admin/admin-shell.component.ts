import { Component } from '@angular/core';
import { MainLayoutComponent } from '../../layout/components/main-layout/main-layout.component';
import { NavItem } from '../../layout/components/sidebar/sidebar.component';

@Component({
  selector: 'app-admin-shell',
  imports: [MainLayoutComponent],
  templateUrl: './admin-shell.component.html',
})
export class AdminShellComponent {
  readonly navItems: NavItem[] = [
    { label: 'Dashboard', route: '/admin/dashboard', icon: '📊' },
    { label: 'Supervisors', route: '/admin/supervisors', icon: '👔' },
    { label: 'Cleaners', route: '/admin/cleaners', icon: '👥' },
    { label: 'Rooms & Locations', route: '/admin/rooms', icon: '🏨' },
    { label: 'Reports & Analytics', route: '/admin/reports', icon: '📈' },
  ];
}
