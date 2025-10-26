import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { AiTranscriptionService } from '@/shared/ai-processing/services/transcription.service'

import { Transcription } from './entities/transcription.entity'

@Injectable()
export class TranscriptionService {
  constructor(
    @InjectRepository(Transcription)
    private transcriptionRepository: Repository<Transcription>,
    private aiTranscriptionService: AiTranscriptionService
  ) {}

  async transcribeAudio(
    noteId: string,
    audioFile: Express.Multer.File
  ): Promise<Transcription> {
    return this.aiTranscriptionService.transcribeAudio(noteId, audioFile)
  }

  async findOneByNoteId(noteId: string): Promise<Transcription | undefined> {
    return this.transcriptionRepository.findOne({
      where: { note: { id: noteId } }
    })
  }
}
