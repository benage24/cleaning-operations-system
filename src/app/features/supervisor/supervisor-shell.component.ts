import { Component } from '@angular/core';
import { MainLayoutComponent } from '../../layout/components/main-layout/main-layout.component';
import { NavItem } from '../../layout/components/sidebar/sidebar.component';

@Component({
  selector: 'app-supervisor-shell',
  imports: [MainLayoutComponent],
  template: `<app-main-layout [navItems]="navItems" pageTitle="Supervisor Portal" />`,
})
export class SupervisorShellComponent {
  readonly navItems: NavItem[] = [
    { label: 'Dashboard', route: '/supervisor/dashboard', icon: '📊' },
    { label: 'Cleaners', route: '/supervisor/cleaners', icon: '👥' },
    { label: 'Rooms', route: '/supervisor/rooms', icon: '🏨' },
    { label: 'Assignments', route: '/supervisor/assignments', icon: '📋' },
    { label: 'Attendance', route: '/supervisor/attendance', icon: '⏰' },
    { label: 'Tasks', route: '/supervisor/tasks', icon: '✅' },
    { label: 'Reports', route: '/supervisor/reports', icon: '📈' },
  ];
}
