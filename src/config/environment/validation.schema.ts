import Joi from 'joi'

import { Environment } from '../enums'

export const getValidationSchema = (): Joi.ObjectSchema => {
  return Joi.object({
    NODE_ENV: Joi.string()
      .valid(
        Environment.Development,
        Environment.Production,
        Environment.Staging
      )
      .default(Environment.Development),
    API_PORT: Joi.number().integer().min(1).max(65535).optional(),
    API_SECRET_KEY: Joi.string().required(),
    JWT_EXPIRES_IN: Joi.string().default('7d').optional(),
    THROTTLE_TTL: Joi.number().integer().min(1).default(60).optional(),
    THROTTLE_LIMIT: Joi.number().integer().min(1).default(60).optional(),
    API_ALLOWED_ORIGINS: Joi.string().optional(),
    MAX_AUDIO_UPLOAD_MB: Joi.number().integer().min(1).default(20).optional(),
    API_SWAGGER_ENABLED: Joi.string().optional(),
    FILE_STORAGE_TYPE: Joi.string().valid('local').default('local'),
    FILE_STORAGE_LOCAL_PATH: Joi.string().default('config/data/uploads'),
    // AI configuration
    AI_TRANSCRIPTION_PROVIDER: Joi.string()
      .valid('whisper-api', 'openai', 'gemini')
      .default('whisper-api'),
    AI_TRANSCRIPTION_WHISPER_API_URL: Joi.string().default(
      'http://localhost:9000'
    ),
    AI_TRANSCRIPTION_OPENAI_MODEL: Joi.string().default('whisper-1'),
    AI_TRANSCRIPTION_GEMINI_MODEL: Joi.string().default('gemini-2.5-flash'),
    // External API keys
    OPENAI_API_KEY: Joi.string().optional(),
    GEMINI_API_KEY: Joi.when('AI_TRANSCRIPTION_PROVIDER', {
      is: 'gemini',
      then: Joi.string().required(),
      otherwise: Joi.string().optional()
    }),
    // DB credentials
    DATABASE_URL: Joi.string().optional(),
    DB_SSL: Joi.string().optional(),
    DB_HOST: Joi.when('DATABASE_URL', {
      is: Joi.exist(),
      then: Joi.string().optional(),
      otherwise: Joi.string().required()
    }),
    DB_PORT: Joi.when('DATABASE_URL', {
      is: Joi.exist(),
      then: Joi.number().integer().min(1).max(65535).optional(),
      otherwise: Joi.number().integer().min(1).max(65535).required()
    }),
    DB_NAME: Joi.when('DATABASE_URL', {
      is: Joi.exist(),
      then: Joi.string().optional(),
      otherwise: Joi.string().required()
    }),
    DB_USER: Joi.when('DATABASE_URL', {
      is: Joi.exist(),
      then: Joi.string().optional(),
      otherwise: Joi.string().required()
    }),
    DB_PASSWORD: Joi.when('DATABASE_URL', {
      is: Joi.exist(),
      then: Joi.string().optional(),
      otherwise: Joi.string().required()
    })
  }).unknown(true)
}
