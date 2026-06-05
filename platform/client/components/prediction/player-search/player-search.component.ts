import { Component, Input, Output, EventEmitter } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common'
import { FootballPlayer } from '../../../services/football.service'

@Component({
  selector: 'app-player-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './player-search.component.html',
})
export class PlayerSearchComponent {
  @Input() players: FootballPlayer[] = []
  @Input() disabled = false
  @Input() side: 'home' | 'away' = 'home'
  @Output() playerSelected = new EventEmitter<FootballPlayer>()

  search = ''
  dropdownOpen = false

  get filtered(): FootballPlayer[] {
    const q = this.search.toLowerCase()
    return (q ? this.players.filter(p => p.name.toLowerCase().includes(q)) : this.players).slice(0, 15)
  }

  get dropdownItemHover(): string {
    return this.side === 'home'
      ? 'hover:bg-emerald-500/10'
      : 'hover:bg-blue-500/10'
  }

  select(player: FootballPlayer): void {
    this.playerSelected.emit(player)
    this.search = ''
    this.dropdownOpen = false
  }
}
