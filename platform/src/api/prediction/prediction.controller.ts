import { Controller, Get, Post, Body } from '@nestjs/common'
import { PredictionService } from './prediction.service'
import { PredictionRequestDto } from './prediction.dto'

@Controller('api/predictions')
export class PredictionController {
  constructor(private readonly predictionService: PredictionService) {}

  @Get('players')
  getPlayers() {
    return this.predictionService.getPlayers()
  }

  @Post()
  predict(@Body() dto: PredictionRequestDto) {
    return this.predictionService.predict(dto)
  }
}
