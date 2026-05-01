import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator'

export class GenerateExcerptDto {
  @IsOptional()
  @IsString()
  title?: string

  @IsString()
  @IsNotEmpty()
  content!: string

  @IsOptional()
  @IsString()
  instruction?: string

  @IsOptional()
  @IsInt()
  @Min(60)
  @Max(240)
  excerptLength?: number
}
