import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class TrackVisitDto {
  @IsString()
  @IsNotEmpty()
  path: string

  @IsString()
  @IsNotEmpty()
  senderId: string

  @IsOptional()
  @IsString()
  location?: string
}
