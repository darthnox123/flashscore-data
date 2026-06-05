import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FootballService, FootballTeam, FootballPlayer } from '../../services/football.service'
import { PredictionService, PredictionResult } from '../../services/prediction.service'
import { ModelConfigComponent, ModelConfig, ModelType } from '../../components/prediction/model-config/model-config.component'
import { TeamPanelComponent } from '../../components/prediction/team-panel/team-panel.component'
import { MatchCenterComponent } from '../../components/prediction/match-center/match-center.component'
import { ResultCardComponent } from '../../components/prediction/result-card/result-card.component'
import { HowItWorksComponent } from '../../components/prediction/how-it-works/how-it-works.component'
import { SpinnerComponent } from '../../components/ui/spinner/spinner.component'

@Component({
  selector: 'app-prediction',
  standalone: true,
  imports: [
    CommonModule,
    ModelConfigComponent,
    TeamPanelComponent,
    MatchCenterComponent,
    ResultCardComponent,
    HowItWorksComponent,
    SpinnerComponent,
  ],
  templateUrl: './prediction.component.html',
})
export class PredictionComponent implements OnInit {
  teams: FootballTeam[] = []
  loadingTeams = true
  error = ''

  homeTeamId: number | null = null
  awayTeamId: number | null = null
  homeTeamPlayers: FootballPlayer[] = []
  awayTeamPlayers: FootballPlayer[] = []
  loadingHomePlayers = false
  loadingAwayPlayers = false

  homePlayers: FootballPlayer[] = []
  awayPlayers: FootballPlayer[] = []

  modelConfig: ModelConfig = { model: 'lr', params: { C: 1.0, solver: 'lbfgs' } }

  result: PredictionResult | null = null
  loading = false

  constructor(
    private readonly footballService: FootballService,
    private readonly predictionService: PredictionService,
  ) {}

  ngOnInit(): void {
    this.footballService.getTeams().subscribe({
      next: (teams) => {
        this.teams = teams.sort((a, b) => a.name.localeCompare(b.name))
        this.loadingTeams = false
      },
      error: () => {
        this.error = 'Could not load teams. Please check your FOOTBALL_API_KEY.'
        this.loadingTeams = false
      },
    })
  }

  onConfigChanged(config: ModelConfig): void {
    this.modelConfig = config
    this.result = null
  }

  selectTeam(side: 'home' | 'away', teamId: number): void {
    this.result = null
    if (side === 'home') {
      this.homeTeamId = teamId
      this.homeTeamPlayers = []
      this.loadingHomePlayers = true
      this.footballService.getPlayersByTeam(teamId).subscribe({
        next: (p) => {
          this.homeTeamPlayers = p.sort((a, b) => a.name.localeCompare(b.name))
          this.loadingHomePlayers = false
        },
        error: () => (this.loadingHomePlayers = false),
      })
    } else {
      this.awayTeamId = teamId
      this.awayTeamPlayers = []
      this.loadingAwayPlayers = true
      this.footballService.getPlayersByTeam(teamId).subscribe({
        next: (p) => {
          this.awayTeamPlayers = p.sort((a, b) => a.name.localeCompare(b.name))
          this.loadingAwayPlayers = false
        },
        error: () => (this.loadingAwayPlayers = false),
      })
    }
  }

  addPlayer(side: 'home' | 'away', player: FootballPlayer): void {
    if (side === 'home' && this.homePlayers.length < 11) {
      this.homePlayers = [...this.homePlayers, player]
    } else if (side === 'away' && this.awayPlayers.length < 11) {
      this.awayPlayers = [...this.awayPlayers, player]
    }
    this.result = null
  }

  removePlayer(side: 'home' | 'away', playerId: number): void {
    if (side === 'home') {
      this.homePlayers = this.homePlayers.filter(p => p.id !== playerId)
    } else {
      this.awayPlayers = this.awayPlayers.filter(p => p.id !== playerId)
    }
    this.result = null
  }

  teamName(side: 'home' | 'away'): string {
    const id = side === 'home' ? this.homeTeamId : this.awayTeamId
    return this.teams.find(t => t.id === id)?.name ?? ''
  }

  teamLogo(side: 'home' | 'away'): string {
    const id = side === 'home' ? this.homeTeamId : this.awayTeamId
    return this.teams.find(t => t.id === id)?.logo ?? ''
  }

  predict(): void {
    if (this.homePlayers.length !== 11 || this.awayPlayers.length !== 11) return
    this.loading = true
    this.error   = ''
    this.result  = null

    this.predictionService
      .predict(
        this.homePlayers.map(p => p.name),
        this.awayPlayers.map(p => p.name),
        this.modelConfig.model,
        this.modelConfig.params,
      )
      .subscribe({
        next: (res) => {
          this.result  = res
          this.loading = false
        },
        error: () => {
          this.error   = 'Prediction failed. Please check that the ML service is running.'
          this.loading = false
        },
      })
  }
}
