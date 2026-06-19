import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  template: `
    <div class="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center">
      <span class="mb-4 text-4xl">{{ icon() }}</span>
      <h3 class="text-lg font-semibold text-slate-700">{{ title() }}</h3>
      <p class="mt-1 max-w-sm text-sm text-slate-500">{{ message() }}</p>
      <div class="mt-4">
        <ng-content />
      </div>
    </div>
  `,
})
export class EmptyStateComponent {
  readonly icon = input('📭');
  readonly title = input('No data found');
  readonly message = input('There is nothing to display yet.');
}
