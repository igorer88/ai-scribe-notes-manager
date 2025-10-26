import { registerAs } from '@nestjs/config'

export interface AiConfig {
  transcription: {
    provider: 'whisperApi' | 'openai'
    whisperApi: {
      url: string
    }
    openai: {
      apiKey: string
      model: string
    }
  }
}

export const aiConfig = registerAs(
  'ai',
  (): AiConfig => ({
    transcription: {
      provider:
        (process.env
          .AI_TRANSCRIPTION_PROVIDER as AiConfig['transcription']['provider']) ||
        'whisperApi',
      whisperApi: {
        url:
          process.env.AI_TRANSCRIPTION_WHISPER_API_URL ||
          'http://localhost:9000'
      },
      openai: {
        apiKey: process.env.OPENAI_API_KEY || '',
        model: process.env.AI_TRANSCRIPTION_OPENAI_MODEL || 'whisper-1'
      }
    }
  })
)
