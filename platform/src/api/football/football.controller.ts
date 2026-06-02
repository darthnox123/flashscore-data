import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common'
import { FootballService } from './football.service'

@Controller('api/football')
export class FootballController {
  constructor(private readonly footballService: FootballService) {}

  @Get('teams')
  getTeams() {
    return this.footballService.getTeams()
  }

  @Get('players/:teamId')
  getPlayers(@Param('teamId', ParseIntPipe) teamId: number) {
    return this.footballService.getPlayersByTeam(teamId)
  }
}
