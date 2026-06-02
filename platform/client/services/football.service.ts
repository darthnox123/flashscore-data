import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'

export interface FootballTeam {
  id: number
  name: string
  logo: string
}

export interface FootballPlayer {
  id: number
  name: string
  photo: string
  position: string
  teamName: string
}

@Injectable({ providedIn: 'root' })
export class FootballService {
  constructor(private readonly http: HttpClient) {}

  getTeams(): Observable<FootballTeam[]> {
    return this.http.get<FootballTeam[]>('/api/football/teams')
  }

  getPlayersByTeam(teamId: number): Observable<FootballPlayer[]> {
    return this.http.get<FootballPlayer[]>(`/api/football/players/${teamId}`)
  }
}
