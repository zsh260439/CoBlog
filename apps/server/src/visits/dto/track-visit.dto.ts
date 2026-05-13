import { IsNotEmpty, IsString } from 'class-validator'

export class TrackVisitDto {
  @IsString()
  @IsNotEmpty()
  path: string

  @IsString()
  @IsNotEmpty()
  senderId: string

  @IsString()
  location: string
}
