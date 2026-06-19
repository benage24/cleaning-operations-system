import { Component, input, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent, NavItem } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  template: `
    <div class="min-h-screen bg-slate-50">
      <app-sidebar
        [navItems]="navItems()"
        [open]="sidebarOpen()"
        (closeSidebar)="sidebarOpen.set(false)"
      />
      <div class="lg:pl-64">
        <app-header [pageTitle]="pageTitle()" (toggleSidebar)="sidebarOpen.set(true)" />
        <main class="p-4 lg:p-8">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class MainLayoutComponent {
  readonly navItems = input.required<NavItem[]>();
  readonly pageTitle = input('Dashboard');
  readonly sidebarOpen = signal(false);
}
