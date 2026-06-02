import { IsArray, IsString, ArrayMinSize, ArrayMaxSize } from 'class-validator'

export class PredictionRequestDto {
  @IsArray()
  @ArrayMinSize(11)
  @ArrayMaxSize(11)
  @IsString({ each: true })
  home_players: string[]

  @IsArray()
  @ArrayMinSize(11)
  @ArrayMaxSize(11)
  @IsString({ each: true })
  away_players: string[]
}

export interface PredictionResultDto {
  H: number
  D: number
  A: number
}
