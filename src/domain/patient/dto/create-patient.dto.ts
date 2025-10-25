import { Type } from 'class-transformer'
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDate,
  MaxDate
} from 'class-validator'

export class CreatePatientDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @MaxDate(new Date(), { message: 'Date of birth cannot be in the future' })
  dateOfBirth?: Date
}
