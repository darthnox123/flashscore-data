import { Component, Input } from '@angular/core'
import { cn } from '../../../lib/utils'

type BadgeColor = 'amber' | 'purple' | 'green' | 'blue' | 'red'

@Component({
  selector: 'app-badge',
  standalone: true,
  template: `<span [class]="classes"><ng-content /></span>`,
})
export class BadgeComponent {
  @Input() color: BadgeColor = 'amber'

  private static readonly COLORS: Record<BadgeColor, string> = {
    amber:  'bg-amber-500/10 text-amber-400 border-amber-500/25',
    purple: 'bg-violet-500/10 text-violet-400 border-violet-500/25',
    green:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    blue:   'bg-blue-500/10 text-blue-400 border-blue-500/25',
    red:    'bg-red-500/10 text-red-300 border-red-500/25',
  }

  get classes(): string {
    return cn(
      'inline-flex items-center text-[0.65rem] font-bold px-2 py-0.5 rounded-full border',
      BadgeComponent.COLORS[this.color],
    )
  }
}
