import { Transform } from 'class-transformer'
import { IsArray, IsOptional, IsString, IsUrl } from 'class-validator'

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
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value !== 'string') {
      return value
    }

    const trimmed = value.trim()
    return trimmed ? trimmed : undefined
  })
  @IsUrl()
  coverImage?: string
}
