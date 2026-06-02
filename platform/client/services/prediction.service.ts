import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'

export interface PredictionResult {
  H: number
  D: number
  A: number
}

@Injectable({ providedIn: 'root' })
export class PredictionService {
  constructor(private readonly http: HttpClient) {}

  getPlayers(): Observable<string[]> {
    return this.http.get<string[]>('/api/predictions/players')
  }

  predict(homePlayers: string[], awayPlayers: string[]): Observable<PredictionResult> {
    return this.http.post<PredictionResult>('/api/predictions', {
      home_players: homePlayers,
      away_players: awayPlayers,
    })
  }
}
