import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsUUID,
  ValidateIf,
  IsOptional
} from 'class-validator'

// import { IsAudioFilePathValid } from '@/shared/validators/custom-note-validation' // Removed

export class CreateNoteDto {
  @ValidateIf(o => !o.isVoiceNote)
  @IsString()
  @IsNotEmpty()
  content?: string

  @IsOptional()
  // @IsAudioFilePathValid() // Removed
  audioFilePath?: string

  @IsOptional()
  @IsBoolean()
  isVoiceNote?: boolean

  @IsUUID()
  @IsNotEmpty()
  userId: string
}
