import Joi from 'joi'

import { Environment } from '../enums'

export const getValidationSchema = (): Joi.ObjectSchema => {
  return Joi.object({
    NODE_ENV: Joi.string()
      .default(Environment.Development)
      .valid(Environment.Development, Environment.Production),
    API_PORT: Joi.number().integer().min(1).max(65535).default(3000).required(),
    API_SECRET_KEY: Joi.string().required(),
    FILE_STORAGE_TYPE: Joi.string().valid('local').default('local'),
    FILE_STORAGE_LOCAL_PATH: Joi.string().default('config/data/uploads'),
    // AI configuration
    AI_TRANSCRIPTION_PROVIDER: Joi.string()
      .valid('whisperApi', 'openai')
      .default('whisperApi'),
    AI_TRANSCRIPTION_WHISPER_API_URL: Joi.string().default(
      'http://localhost:9000'
    ),
    AI_TRANSCRIPTION_OPENAI_MODEL: Joi.string().default('whisper-1'),
    // External API keys
    OPENAI_API_KEY: Joi.string().optional(),
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
