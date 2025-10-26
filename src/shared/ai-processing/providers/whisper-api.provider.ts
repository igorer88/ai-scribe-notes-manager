import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom } from 'rxjs'

import { TranscriptionSegment } from '@/domain/note/entities/transcription.entity'

import {
  TranscriptionProvider,
  TranscriptionResult
} from '../interfaces/transcription-provider.interface'

@Injectable()
export class WhisperApiProvider implements TranscriptionProvider {
  private readonly logger = new Logger(WhisperApiProvider.name)

  constructor(
    private configService: ConfigService,
    private httpService: HttpService
  ) {}

  async transcribe(
    audioFile: Express.Multer.File
  ): Promise<TranscriptionResult> {
    const startTime = Date.now()
    const whisperUrl = this.configService.get<string>(
      'ai.transcription.whisperApi.url'
    )

    try {
      this.logger.log(`Sending audio to Whisper API: ${audioFile.originalname}`)

      // Create form data for the API request
      const formData = new FormData()
      const audioBlob = new Blob([audioFile.buffer as unknown as ArrayBuffer], {
        type: audioFile.mimetype
      })
      formData.append('audio_file', audioBlob, audioFile.originalname)

      // Make API request with query parameters
      const response = await firstValueFrom(
        this.httpService.post(
          `${whisperUrl}/asr?encode=true&task=transcribe&output=json`,
          formData,
          {
            headers: {
              accept: 'application/json',
              'Content-Type': 'multipart/form-data'
            },
            timeout: 300000 // 5 minutes timeout
          }
        )
      )

      const apiResult = response.data

      // Debug: Log the raw response
      this.logger.debug(`Raw API response type: ${typeof apiResult}`)
      this.logger.debug(
        `Raw API response: ${JSON.stringify(apiResult).substring(0, 200)}...`
      )

      // Transform API response to our format
      const result: TranscriptionResult = {
        text: apiResult.text || '',
        segments: this.transformSegments(apiResult.segments || []),
        language: apiResult.language || 'en',
        metadata: {
          provider: 'whisper-api',
          processingTime: Date.now() - startTime,
          model: 'whisper-local',
          duration: apiResult.duration || 0
        }
      }

      this.logger.log(
        `Whisper API transcription completed in ${result.metadata.processingTime}ms`
      )
      return result
    } catch (error) {
      this.logger.error(`Whisper API transcription failed`, error)
      throw new Error(`Whisper API transcription failed: ${error.message}`)
    }
  }

  private transformSegments(
    apiSegments: Record<string, unknown>[]
  ): TranscriptionSegment[] {
    return apiSegments.map(segment => ({
      id: (segment.id as number) || 0,
      start: (segment.start as number) || 0,
      end: (segment.end as number) || 0,
      text: (segment.text as string) || '',
      confidence:
        (segment.confidence as number) || (segment.avg_logprob as number) || 0
    }))
  }
}
