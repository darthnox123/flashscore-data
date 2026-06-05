import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PredictionResult } from '../../../services/prediction.service'
import { ModelType } from '../model-config/model-config.component'
import { ProgressBarComponent } from '../../ui/progress-bar/progress-bar.component'
import { BadgeComponent } from '../../ui/badge/badge.component'

@Component({
  selector: 'app-result-card',
  standalone: true,
  imports: [CommonModule, ProgressBarComponent, BadgeComponent],
  templateUrl: './result-card.component.html',
})
export class ResultCardComponent {
  @Input() result!: PredictionResult
  @Input() homeTeamName = ''
  @Input() homeTeamLogo = ''
  @Input() awayTeamName = ''
  @Input() awayTeamLogo = ''
  @Input() selectedModel: ModelType = 'lr'

  get favourite(): 'home' | 'away' | 'draw' {
    if (this.result.H > this.result.D && this.result.H > this.result.A) return 'home'
    if (this.result.A > this.result.H && this.result.A > this.result.D) return 'away'
    return 'draw'
  }
}
