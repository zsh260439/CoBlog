import { Transform } from 'class-transformer'
import { IsArray, IsNotEmpty, IsOptional, IsString, IsUrl, IsNumber } from 'class-validator'
export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  title: string

  @IsString()
  @IsNotEmpty()
  slug: string

  @IsString()
  @IsNotEmpty()
  content: string

  @IsString()
  @IsNotEmpty()
  excerpt: string

  @IsString()
  @IsNotEmpty()
  summary: string

  @IsString()
  @IsNotEmpty()
  category: string

  @IsString()
  @IsNotEmpty()
  categorySlug: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]

  @IsOptional()
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
