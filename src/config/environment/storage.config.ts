import { registerAs } from '@nestjs/config'

export const storageConfig = registerAs('storage', () => ({
  type: process.env.FILE_STORAGE_TYPE || 'local',
  localPath: process.env.FILE_STORAGE_LOCAL_PATH || 'config/data/uploads',
  s3: {
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION || 'us-east-1',
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    bucket: process.env.S3_BUCKET || 'ai-scribe-notes'
  }
}))
