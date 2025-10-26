import { TranscriptionSegment } from '@/domain/note/entities/transcription.entity'

export interface TranscriptionProvider {
  transcribe(
    audioFile: Express.Multer.File,
    options?: TranscriptionOptions
  ): Promise<TranscriptionResult>
}

export interface TranscriptionResult {
  text: string
  segments?: TranscriptionSegment[]
  language?: string
  metadata?: Record<string, unknown>
  structuredData?: Record<string, unknown>
  rawFiles?: {
    json?: string
    tsv?: string
  }
}

export interface TranscriptionOptions {
  noteId?: string
  saveRawFiles?: boolean
}
