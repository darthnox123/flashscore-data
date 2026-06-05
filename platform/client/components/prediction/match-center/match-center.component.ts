import { Component, Input, Output, EventEmitter } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SpinnerComponent } from '../../ui/spinner/spinner.component'
import { ModelType } from '../model-config/model-config.component'

@Component({
  selector: 'app-match-center',
  standalone: true,
  imports: [CommonModule, SpinnerComponent],
  templateUrl: './match-center.component.html',
})
export class MatchCenterComponent {
  @Input() homeCount = 0
  @Input() awayCount = 0
  @Input() loading = false
  @Input() selectedModel: ModelType = 'lr'
  @Output() predict    = new EventEmitter<void>()
  @Output() clearHome  = new EventEmitter<void>()
  @Output() clearAway  = new EventEmitter<void>()

  get canPredict(): boolean {
    return this.homeCount === 11 && this.awayCount === 11
  }

  get remaining(): number {
    return 22 - this.homeCount - this.awayCount
  }

  get predictBtnClass(): string {
    const base = 'py-2 lg:py-3 px-3 lg:px-2 lg:w-full text-sm font-bold text-white rounded-lg transition-all duration-200 text-center leading-snug border-none whitespace-nowrap'
    return this.canPredict && !this.loading
      ? `${base} bg-amber-500 cursor-pointer hover:bg-amber-600 hover:-translate-y-px hover:shadow-lg hover:shadow-amber-500/40`
      : `${base} bg-amber-500/30 cursor-not-allowed`
  }
}
