import { IsNotEmpty, IsString } from 'class-validator'

export class TrackVisitDto {
  @IsString()
  @IsNotEmpty()
  path: string
}
