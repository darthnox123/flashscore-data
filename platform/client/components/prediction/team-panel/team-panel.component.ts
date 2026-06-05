import { Component, Input, Output, EventEmitter } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FootballTeam, FootballPlayer } from '../../../services/football.service'
import { PlayerSearchComponent } from '../player-search/player-search.component'
import { SpinnerComponent } from '../../ui/spinner/spinner.component'

const POSITION_ORDER: Record<string, number> = {
  Goalkeeper: 1,
  Defender:   2,
  Midfielder: 3,
  Attacker:   4,
}

@Component({
  selector: 'app-team-panel',
  standalone: true,
  imports: [CommonModule, PlayerSearchComponent, SpinnerComponent],
  templateUrl: './team-panel.component.html',
})
export class TeamPanelComponent {
  @Input() side: 'home' | 'away' = 'home'
  @Input() teams: FootballTeam[] = []
  @Input() selectedTeamId: number | null = null
  @Input() selectedPlayers: FootballPlayer[] = []
  @Input() teamPlayers: FootballPlayer[] = []
  @Input() loadingPlayers = false
  @Output() teamSelected   = new EventEmitter<number>()
  @Output() playerAdded    = new EventEmitter<FootballPlayer>()
  @Output() playerRemoved  = new EventEmitter<number>()

  get isHome(): boolean { return this.side === 'home' }

  get availablePlayers(): FootballPlayer[] {
    return this.teamPlayers.filter(p => !this.selectedPlayers.find(s => s.id === p.id))
  }

  get sortedSelected(): FootballPlayer[] {
    return [...this.selectedPlayers].sort(
      (a, b) => (POSITION_ORDER[a.position] ?? 5) - (POSITION_ORDER[b.position] ?? 5),
    )
  }

  get emptySlots(): number[] {
    return Array.from({ length: 11 - this.selectedPlayers.length }, (_, i) => i + 1)
  }

  get containerClass(): string {
    const base = 'flex flex-col gap-3 p-4 lg:p-5'
    return this.isHome ? `${base} lg:border-r border-white/[0.06] border-b lg:border-b-0` : base
  }

  labelClass(): string {
    return this.isHome
      ? 'text-[0.65rem] font-bold uppercase tracking-widest text-emerald-400 m-0'
      : 'text-[0.65rem] font-bold uppercase tracking-widest text-blue-400 m-0'
  }

  playerRowClass(): string {
    return this.isHome
      ? 'group flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/12 transition-all duration-150 hover:bg-emerald-500/10'
      : 'group flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-blue-500/5 border border-blue-500/12 transition-all duration-150 hover:bg-blue-500/10'
  }

  indexClass(): string {
    return this.isHome
      ? 'text-[0.62rem] w-4 text-right font-bold text-emerald-400 shrink-0'
      : 'text-[0.62rem] w-4 text-right font-bold text-blue-400 shrink-0'
  }

  positionBadgeClass(): string {
    return this.isHome
      ? 'text-[0.6rem] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold shrink-0'
      : 'text-[0.6rem] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 font-bold shrink-0'
  }

  onTeamChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value
    if (value) this.teamSelected.emit(+value)
  }
}
