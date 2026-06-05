import { Component, Input } from '@angular/core'

type BarColor = 'green' | 'blue' | 'amber'

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  templateUrl: './progress-bar.component.html',
})
export class ProgressBarComponent {
  @Input() value = 0
  @Input() color: BarColor = 'green'
  @Input() label = ''
  @Input() displayValue = ''

  private static readonly VALUE_COLORS: Record<BarColor, string> = {
    green: 'text-emerald-500',
    blue:  'text-blue-500',
    amber: 'text-amber-500',
  }

  private static readonly BAR_GRADIENTS: Record<BarColor, string> = {
    green: 'from-emerald-600 to-emerald-500',
    blue:  'from-blue-600 to-blue-500',
    amber: 'from-amber-600 to-amber-500',
  }

  get valueClass(): string {
    return `font-bold text-2xl leading-none ${ProgressBarComponent.VALUE_COLORS[this.color]}`
  }

  get barClass(): string {
    return `h-full rounded-full bg-gradient-to-r transition-all duration-[1200ms] ease-out ${ProgressBarComponent.BAR_GRADIENTS[this.color]}`
  }
}
