import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { PatientModule } from '@/domain/patient/patient.module'
import { UserModule } from '@/domain/user/user.module'
import { AiProcessingModule } from '@/shared/ai-processing/ai-processing.module'

import { Note } from './entities/note.entity'
import { Transcription } from './entities/transcription.entity'
import { NoteController } from './note.controller'
import { NoteService } from './note.service'
import { TranscriptionService } from './transcription.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([Note, Transcription]),
    AiProcessingModule,
    UserModule,
    PatientModule
  ],
  controllers: [NoteController],
  providers: [NoteService, TranscriptionService],
  exports: [NoteService, TranscriptionService]
})
export class NoteModule {}
