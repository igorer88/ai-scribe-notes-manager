import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Transcription } from '@/domain/note/entities/transcription.entity'

import { WhisperApiProvider } from './providers/whisper-api.provider'
import { AiTranscriptionService } from './services/transcription.service'

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Transcription]),
    HttpModule
  ],
  providers: [AiTranscriptionService, WhisperApiProvider],
  exports: [AiTranscriptionService]
})
export class AiProcessingModule {}
