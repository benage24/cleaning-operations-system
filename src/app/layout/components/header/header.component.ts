import { Component, inject, input, output, signal, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Notification } from '../../../core/models';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit {
  readonly pageTitle = input('Dashboard');
  readonly toggleSidebar = output<void>();

  private readonly auth = inject(AuthService);
  private readonly notificationService = inject(NotificationService);

  readonly showNotifications = signal(false);
  readonly notifications = signal<Notification[]>([]);

  unreadCount(): number {
    return this.notifications().filter((n) => !n.read).length;
  }

  ngOnInit(): void {
    const user = this.auth.currentUser();
    if (user) {
      this.notificationService.getByUser(user.id).subscribe((n) => this.notifications.set(n));
    }
  }

  logout(): void {
    this.auth.logout();
  }
}
