import { registerAs } from '@nestjs/config'

export const storageConfig = registerAs('storage', () => ({
  type: process.env.FILE_STORAGE_TYPE || 'local',
  localPath: process.env.FILE_STORAGE_LOCAL_PATH || 'config/data/uploads'
}))
