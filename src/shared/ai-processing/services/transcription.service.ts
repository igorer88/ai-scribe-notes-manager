import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { Transcription } from '@/domain/note/entities/transcription.entity'

import { TranscriptionProvider } from '../interfaces/transcription-provider.interface'
import { WhisperApiProvider } from '../providers/whisper-api.provider'

@Injectable()
export class AiTranscriptionService {
  private readonly logger = new Logger(AiTranscriptionService.name)

  constructor(
    private configService: ConfigService,
    private whisperApiProvider: WhisperApiProvider,
    @InjectRepository(Transcription)
    private transcriptionRepository: Repository<Transcription>
  ) {}

  async transcribeAudio(
    noteId: string,
    audioFile: Express.Multer.File
  ): Promise<Transcription> {
    const providerType = this.configService.get<string>(
      'ai.transcription.provider'
    )

    let provider: TranscriptionProvider
    switch (providerType) {
      default:
        provider = this.whisperApiProvider
        break
    }

    try {
      this.logger.log(
        `Starting transcription for note ${noteId} using ${providerType} provider`
      )

      const result = await provider.transcribe(audioFile, {
        noteId,
        saveRawFiles: true
      })

      // Create and save transcription entity
      const transcription = this.transcriptionRepository.create({
        text: result.text || '',
        segments: result.segments || [],
        structuredData: result.structuredData || {},
        language: result.language || null,
        metadata: result.metadata || {},
        note: { id: noteId } // Link to note by ID
      })

      const savedTranscription =
        await this.transcriptionRepository.save(transcription)
      this.logger.log('Transcription saved')
      this.logger.log(`Transcription completed for note ${noteId}`)
      return savedTranscription
    } catch (error) {
      this.logger.error(`Transcription failed for note ${noteId}`, error)
      throw error
    }
  }
}
