import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'

export class OptimizeArticleDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string

  @IsString()
  @IsNotEmpty()
  content!: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  instruction?: string
}
