import { GoogleGenAI, Part } from '@google/genai'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import {
  TranscriptionProvider,
  TranscriptionResult
} from '../interfaces/transcription-provider.interface'

const MAX_INLINE_AUDIO_SIZE = 20 * 1024 * 1024 // 20 MB
const MAX_TRANSCRIPTION_ATTEMPTS = 4
const RETRY_BASE_DELAY_MS = 1000
const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504])

function isTransientFailure(error: unknown): boolean {
  const status = (error as { status?: unknown })?.status
  if (typeof status === 'number' && RETRYABLE_STATUS_CODES.has(status)) {
    return true
  }

  const code = (error as { code?: unknown })?.code
  if (typeof code === 'number' && RETRYABLE_STATUS_CODES.has(code)) {
    return true
  }

  const message = error instanceof Error ? error.message : String(error)
  if (/"(?:code|status)"\s*:\s*(429|50[024])/.test(message)) {
    return true
  }

  return /timeout|ECONNRESET|ENOTFOUND|EAI_AGAIN|fetch failed|network/i.test(
    message
  )
}

function describeFailure(error: unknown): string {
  const status = (error as { status?: unknown })?.status
  if (typeof status === 'number') {
    return `status ${status}`
  }
  return error instanceof Error ? error.message : String(error)
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return typeof error === 'string' ? error : JSON.stringify(error)
}

@Injectable()
export class GeminiProvider implements TranscriptionProvider {
  private readonly logger = new Logger(GeminiProvider.name)
  private readonly client: GoogleGenAI

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>(
      'ai.transcription.gemini.apiKey'
    )
    this.client = new GoogleGenAI(apiKey ? { apiKey } : {})
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async transcribe(
    audioFile: Express.Multer.File
  ): Promise<TranscriptionResult> {
    const startTime = Date.now()
    const model = this.configService.get<string>(
      'ai.transcription.gemini.model'
    )

    if (!this.isSupportedAudio(audioFile)) {
      throw new Error(`Unsupported audio type: ${audioFile.mimetype}`)
    }

    if (audioFile.size > MAX_INLINE_AUDIO_SIZE) {
      throw new Error(
        `Audio file exceeds the ${MAX_INLINE_AUDIO_SIZE} bytes inline limit`
      )
    }

    const audioPart: Part = {
      inlineData: {
        data: audioFile.buffer.toString('base64'),
        mimeType: audioFile.mimetype
      }
    }
    const prompt =
      'Transcribe the speech in this audio file. Output only the verbatim text transcription.'

    this.logger.log(
      `Sending audio to Gemini for transcription: ${audioFile.originalname} (${model})`
    )

    for (let attempt = 1; attempt <= MAX_TRANSCRIPTION_ATTEMPTS; attempt++) {
      try {
        const response = await this.client.models.generateContent({
          model,
          contents: [audioPart, prompt]
        })

        const result: TranscriptionResult = {
          text: (response.text || '').trim(),
          metadata: {
            provider: 'gemini',
            model,
            processingTime: Date.now() - startTime
          }
        }

        this.logger.log(
          `Gemini transcription completed in ${result.metadata?.processingTime}ms`
        )
        return result
      } catch (error) {
        if (isTransientFailure(error) && attempt < MAX_TRANSCRIPTION_ATTEMPTS) {
          const backoffMs = RETRY_BASE_DELAY_MS * 2 ** (attempt - 1)
          this.logger.warn(
            `Gemini transcription attempt ${attempt}/${MAX_TRANSCRIPTION_ATTEMPTS} failed (${describeFailure(error)}); retrying in ${backoffMs}ms`
          )
          await this.sleep(backoffMs)
          continue
        }

        this.logger.error(`Gemini transcription failed`, error)
        throw new Error(`Gemini transcription failed: ${errorMessage(error)}`)
      }
    }

    throw new Error('Gemini transcription failed')
  }

  private isSupportedAudio(audioFile: Express.Multer.File): boolean {
    return audioFile.mimetype.startsWith('audio/')
  }
}
