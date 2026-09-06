import { GoogleGenAI, Part } from '@google/genai'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import {
  TranscriptionProvider,
  TranscriptionResult
} from '../interfaces/transcription-provider.interface'

const MAX_INLINE_AUDIO_SIZE = 20 * 1024 * 1024 // 20 MB

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

    try {
      this.logger.log(
        `Sending audio to Gemini for transcription: ${audioFile.originalname} (${model})`
      )

      const audioPart: Part = {
        inlineData: {
          data: audioFile.buffer.toString('base64'),
          mimeType: audioFile.mimetype
        }
      }

      const response = await this.client.models.generateContent({
        model,
        contents: [
          audioPart,
          'Transcribe the speech in this audio file. Output only the verbatim text transcription.'
        ]
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
      this.logger.error(`Gemini transcription failed`, error)
      throw new Error(`Gemini transcription failed: ${error.message}`)
    }
  }

  private isSupportedAudio(audioFile: Express.Multer.File): boolean {
    return audioFile.mimetype.startsWith('audio/')
  }
}
