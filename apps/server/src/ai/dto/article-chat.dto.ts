import { ArrayMinSize, IsArray, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

export class ArticleChatMessageDto {
  @IsIn(['user', 'assistant'])
  role!: 'user' | 'assistant'

  @IsString()
  @IsNotEmpty()
  content!: string
}

export class ArticleChatDto {
  @IsOptional()
  @IsString()
  title?: string

  @IsOptional()
  @IsString()
  content?: string

  @IsOptional()
  @IsString()
  instruction?: string

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ArticleChatMessageDto)
  messages!: ArticleChatMessageDto[]
}
