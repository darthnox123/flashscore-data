import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { FootballService, FootballTeam, FootballPlayer } from '../../services/football.service'
import { PredictionService, PredictionResult } from '../../services/prediction.service'

const POSITION_ORDER: Record<string, number> = {
  Goalkeeper: 1,
  Defender: 2,
  Midfielder: 3,
  Attacker: 4,
}

@Component({
  selector: 'app-prediction',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './prediction.component.html',
})
export class PredictionComponent implements OnInit {
  teams: FootballTeam[] = []
  loadingTeams = true

  homePlayers: FootballPlayer[] = []
  awayPlayers: FootballPlayer[] = []

  homeTeamPlayers: FootballPlayer[] = []
  awayTeamPlayers: FootballPlayer[] = []
  loadingHomePlayers = false
  loadingAwayPlayers = false

  homeTeamId: number | null = null
  awayTeamId: number | null = null
  homeSearch = ''
  awaySearch = ''
  homeDropdownOpen = false
  awayDropdownOpen = false

  result: PredictionResult | null = null
  loading = false
  error = ''

  constructor(
    private readonly footballService: FootballService,
    private readonly predictionService: PredictionService,
  ) {}

  ngOnInit() {
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

  selectTeam(side: 'home' | 'away', teamId: number) {
    if (side === 'home') {
      this.homeTeamId = teamId
      this.homeTeamPlayers = []
      this.homeSearch = ''
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
      this.awaySearch = ''
      this.loadingAwayPlayers = true
      this.footballService.getPlayersByTeam(teamId).subscribe({
        next: (p) => {
          this.awayTeamPlayers = p.sort((a, b) => a.name.localeCompare(b.name))
          this.loadingAwayPlayers = false
        },
        error: () => (this.loadingAwayPlayers = false),
      })
    }
    this.result = null
  }

  filteredPlayers(side: 'home' | 'away'): FootballPlayer[] {
    const pool = side === 'home' ? this.homeTeamPlayers : this.awayTeamPlayers
    const selected = side === 'home' ? this.homePlayers : this.awayPlayers
    const q = (side === 'home' ? this.homeSearch : this.awaySearch).toLowerCase()
    return pool
      .filter((p) => p.name.toLowerCase().includes(q) && !selected.find((s) => s.id === p.id))
      .slice(0, 15)
  }

  addPlayer(side: 'home' | 'away', player: FootballPlayer) {
    if (side === 'home' && this.homePlayers.length < 11) {
      this.homePlayers = [...this.homePlayers, player]
      this.homeSearch = ''
      this.homeDropdownOpen = false
    } else if (side === 'away' && this.awayPlayers.length < 11) {
      this.awayPlayers = [...this.awayPlayers, player]
      this.awaySearch = ''
      this.awayDropdownOpen = false
    }
    this.result = null
  }

  removePlayer(side: 'home' | 'away', playerId: number) {
    if (side === 'home') {
      this.homePlayers = this.homePlayers.filter((p) => p.id !== playerId)
    } else {
      this.awayPlayers = this.awayPlayers.filter((p) => p.id !== playerId)
    }
    this.result = null
  }

  sortedPlayers(players: FootballPlayer[]): FootballPlayer[] {
    return [...players].sort(
      (a, b) => (POSITION_ORDER[a.position] ?? 5) - (POSITION_ORDER[b.position] ?? 5),
    )
  }

  teamName(side: 'home' | 'away'): string {
    const id = side === 'home' ? this.homeTeamId : this.awayTeamId
    return this.teams.find((t) => t.id === id)?.name ?? ''
  }

  teamLogo(side: 'home' | 'away'): string {
    const id = side === 'home' ? this.homeTeamId : this.awayTeamId
    return this.teams.find((t) => t.id === id)?.logo ?? ''
  }

  getEmptySlots(filled: number): number[] {
    return Array.from({ length: 11 - filled }, (_, i) => i + 1)
  }

  get canPredict(): boolean {
    return this.homePlayers.length === 11 && this.awayPlayers.length === 11
  }

  predict() {
    if (!this.canPredict) return
    this.loading = true
    this.error = ''
    this.result = null

    this.predictionService
      .predict(
        this.homePlayers.map((p) => p.name),
        this.awayPlayers.map((p) => p.name),
      )
      .subscribe({
        next: (res) => {
          this.result = res
          this.loading = false
        },
        error: () => {
          this.error = 'Prediction failed. Please check that the ML service is running.'
          this.loading = false
        },
      })
  }
}
