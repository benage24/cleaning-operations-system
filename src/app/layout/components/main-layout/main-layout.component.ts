import { Component, input, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent, NavItem } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  templateUrl: './main-layout.component.html',
})
export class MainLayoutComponent {
  readonly navItems = input.required<NavItem[]>();
  readonly pageTitle = input('Dashboard');
  readonly sidebarOpen = signal(false);
}
