import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  author: string

  @IsString()
  @IsNotEmpty()
  content: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  qq?: string

  @IsOptional()
  @IsString()
  location?: string

  @IsOptional()
  @IsString()
  device?: string

  @IsOptional()
  @IsString()
  browser?: string

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean

  @IsOptional()
  @IsBoolean()
  enableEmailNotice?: boolean

  @IsOptional()
  @IsBoolean()
  useMarkdown?: boolean
}