import { Component, input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  templateUrl: './stat-card.component.html',
})
export class StatCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly subtitle = input<string>();
  readonly icon = input<string>();
  readonly iconBgClass = input('bg-teal-50 text-teal-600');
  readonly trend = input<number | null>(null);
  protected readonly Math = Math;
}
