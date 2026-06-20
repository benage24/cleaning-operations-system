import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.component.html',
})
export class EmptyStateComponent {
  readonly icon = input('📭');
  readonly title = input('No data found');
  readonly message = input('There is nothing to display yet.');
}
