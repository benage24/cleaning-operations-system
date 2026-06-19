import { Component, input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  template: `
    <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium" [class]="badgeClass()">
      {{ label() }}
    </span>
  `,
})
export class StatusBadgeComponent {
  readonly status = input.required<string>();
  readonly label = input.required<string>();

  badgeClass(): string {
    const map: Record<string, string> = {
      present: 'bg-emerald-100 text-emerald-700',
      absent: 'bg-red-100 text-red-700',
      late: 'bg-amber-100 text-amber-700',
      leave: 'bg-slate-100 text-slate-600',
      active: 'bg-emerald-100 text-emerald-700',
      inactive: 'bg-slate-100 text-slate-600',
      on_leave: 'bg-amber-100 text-amber-700',
      clean: 'bg-emerald-100 text-emerald-700',
      dirty: 'bg-red-100 text-red-700',
      in_progress: 'bg-blue-100 text-blue-700',
      pending_verification: 'bg-purple-100 text-purple-700',
      overdue: 'bg-orange-100 text-orange-700',
      assigned: 'bg-slate-100 text-slate-700',
      approved: 'bg-emerald-100 text-emerald-700',
      rejected: 'bg-red-100 text-red-700',
      re_cleaning: 'bg-amber-100 text-amber-700',
    };
    return map[this.status()] ?? 'bg-slate-100 text-slate-700';
  }
}
