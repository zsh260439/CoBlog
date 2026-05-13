import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateAdminReplyDto {
  @IsString()
  @IsNotEmpty()
  author: string

  @IsString()
  @IsNotEmpty()
  content: string

  @IsOptional()
  @IsString()
  device?: string

  @IsOptional()
  @IsString()
  browser?: string

  @IsOptional()
  @IsString()
  location?: string
}
