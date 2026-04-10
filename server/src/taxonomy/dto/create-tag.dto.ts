import { IsNotEmpty, IsString } from 'class-validator'

export class CreateTagDto {
  @IsString()
  @IsNotEmpty()
  label: string

  @IsString()
  @IsNotEmpty()
  slug: string
}
