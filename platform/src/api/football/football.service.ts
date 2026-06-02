import { Injectable, Inject, InternalServerErrorException } from '@nestjs/common'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import type { Cache } from 'cache-manager'

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

const LEAGUE_ID = 94
const SEASON = 2024
const CACHE_TTL = 86400 * 1000 // 24 h in ms

@Injectable()
export class FootballService {
  private readonly apiUrl = 'https://v3.football.api-sports.io'
  private readonly apiKey = process.env.FOOTBALL_API_KEY ?? ''

  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  private async apiGet<T>(path: string): Promise<T> {
    if (!this.apiKey) throw new InternalServerErrorException('FOOTBALL_API_KEY not configured')
    const res = await fetch(`${this.apiUrl}${path}`, {
      headers: { 'x-apisports-key': this.apiKey },
    })
    if (!res.ok) throw new InternalServerErrorException(`api-football error: ${res.status}`)
    return res.json()
  }

  async getTeams(): Promise<FootballTeam[]> {
    const key = `football:teams:${LEAGUE_ID}:${SEASON}`
    const cached = await this.cache.get<FootballTeam[]>(key)
    if (cached) return cached

    const data = await this.apiGet<any>(`/teams?league=${LEAGUE_ID}&season=${SEASON}`)
    const teams: FootballTeam[] = data.response.map((r: any) => ({
      id: r.team.id,
      name: r.team.name,
      logo: r.team.logo,
    }))

    await this.cache.set(key, teams, CACHE_TTL)
    return teams
  }

  async getPlayersByTeam(teamId: number): Promise<FootballPlayer[]> {
    const key = `football:players:${teamId}:${SEASON}`
    const cached = await this.cache.get<FootballPlayer[]>(key)
    if (cached) return cached

    const players: FootballPlayer[] = []
    let page = 1
    let totalPages = 1

    do {
      const data = await this.apiGet<any>(
        `/players?team=${teamId}&season=${SEASON}&page=${page}`,
      )
      totalPages = data.paging.total
      for (const r of data.response) {
        players.push({
          id: r.player.id,
          name: r.player.name,
          photo: r.player.photo,
          position: r.statistics?.[0]?.games?.position ?? 'Unknown',
          teamName: r.statistics?.[0]?.team?.name ?? '',
        })
      }
      page++
    } while (page <= totalPages)

    await this.cache.set(key, players, CACHE_TTL)
    return players
  }
}
