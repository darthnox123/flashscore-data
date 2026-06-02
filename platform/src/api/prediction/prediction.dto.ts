import { IsArray, IsString, ArrayMinSize, ArrayMaxSize, IsOptional, IsIn, IsObject } from 'class-validator'

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

  @IsOptional()
  @IsIn(['lr', 'rf', 'xgb'])
  model_type?: string

  @IsOptional()
  @IsObject()
  params?: Record<string, unknown>
}

export interface PredictionResultDto {
  H: number
  D: number
  A: number
  accuracy?: number
}
