import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class OptimizeArticleDto {
  @IsOptional()
  @IsString()
  title?: string

  @IsString()
  @IsNotEmpty()
  content!: string

  @IsOptional()
  @IsString()
  instruction?: string
}
