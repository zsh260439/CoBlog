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

  @IsString()
  @IsNotEmpty()
  senderId: string

  @IsOptional()
  @IsString()
  parentId?: string

  @IsOptional()
  @IsString()
  device?: string

  @IsOptional()
  @IsString()
  browser?: string

  @IsOptional()
  @IsBoolean()
  enableEmailNotice?: boolean

  @IsOptional()
  @IsString()
  location?: string
}
