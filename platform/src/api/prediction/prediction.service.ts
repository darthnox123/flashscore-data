import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { PredictionRequestDto, PredictionResultDto } from './prediction.dto'

@Injectable()
export class PredictionService {
  private readonly baseUrl =
    process.env.PREDICTION_SERVICE_URL ?? 'http://localhost:8001'

  async getPlayers(): Promise<string[]> {
    const res = await fetch(`${this.baseUrl}/players`)
    if (!res.ok) throw new InternalServerErrorException('Prediction service unavailable')
    return res.json()
  }

  async predict(dto: PredictionRequestDto): Promise<PredictionResultDto> {
    const res = await fetch(`${this.baseUrl}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    })
    if (!res.ok) throw new InternalServerErrorException('Prediction failed')
    return res.json()
  }
}
