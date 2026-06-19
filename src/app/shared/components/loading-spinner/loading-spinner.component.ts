import { Component } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  template: `
    <div class="flex items-center justify-center py-12">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600"></div>
    </div>
  `,
})
export class LoadingSpinnerComponent {}
