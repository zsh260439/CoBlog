import { Transform } from 'class-transformer'
import { IsArray, IsNumber, IsOptional, IsString, IsUrl } from 'class-validator'

export class UpdateArticleDto {
  @IsOptional()
  @IsString()
  title?: string

  @IsOptional()
  @IsString()
  slug?: string

  @IsOptional()
  @IsString()
  content?: string

  @IsOptional()
  @IsString()
  excerpt?: string

  @IsOptional()
  @IsString()
  summary?: string

  @IsOptional()
  @IsString()
  category?: string

  @IsOptional()
  @IsString()
  categorySlug?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]

  @IsOptional()
  //数据清洗
  @Transform(({ value }) => {
    if (typeof value !== 'string') {
      return value
    }

    const trimmed = value.trim()
    return trimmed ? trimmed : undefined
  })
  @IsUrl()
  coverImage?: string

  @IsOptional()
  @IsNumber()
  views?: number

  @IsOptional()
  @IsNumber()
  comments?: number

  @IsOptional()
  @IsNumber()
  likes?: number

  @IsOptional()
  @IsNumber()
  wordCount?: number
}
