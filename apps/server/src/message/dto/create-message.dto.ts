import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  author: string

  @IsString()
  @IsNotEmpty()
  content: string

  @IsOptional()
  @IsString()
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

  @IsString()
  location: string
}
