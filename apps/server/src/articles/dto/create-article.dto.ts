import { Transform } from 'class-transformer'
import { IsArray, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator'

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
  category: string

  @IsString()
  @IsNotEmpty()
  categorySlug: string

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
