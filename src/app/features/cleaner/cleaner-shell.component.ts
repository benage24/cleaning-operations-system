import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-cleaner-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './cleaner-shell.component.html',
})
export class CleanerShellComponent {
  private readonly auth = inject(AuthService);

  logout(): void {
    this.auth.logout();
  }
}
