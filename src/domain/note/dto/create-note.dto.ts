import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsUUID,
  ValidateIf
} from 'class-validator'

import { IsAudioFilePathValid } from '@/shared/validators/custom-note-validation'

export class CreateNoteDto {
  @ValidateIf(o => !o.isVoiceNote)
  @IsString()
  @IsNotEmpty()
  content?: string

  @IsAudioFilePathValid()
  audioFilePath?: string

  @IsBoolean()
  isVoiceNote: boolean

  @IsUUID()
  @IsNotEmpty()
  userId: string
}
