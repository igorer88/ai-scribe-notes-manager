import { promises as fsPromises } from 'node:fs'
import * as path from 'node:path'

import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { FileStorageProvider } from './interfaces/file-storage-provider.interface'

@Injectable()
export class LocalFileStorageService
  implements FileStorageProvider, OnModuleInit
{
  private readonly logger = new Logger(this.constructor.name)
  private readonly storagePath: string

  constructor(private configService: ConfigService) {
    this.storagePath = path.join(
      process.cwd(),
      this.configService.get<string>('storage.localPath')
    )
  }

  async onModuleInit(): Promise<void> {
    await fsPromises.mkdir(this.storagePath, { recursive: true })
  }

  async saveFile(file: Express.Multer.File, filePath: string): Promise<string> {
    const fullFilePath = path.join(this.storagePath, filePath)
    const directory = path.dirname(fullFilePath)

    await fsPromises.mkdir(directory, { recursive: true })

    this.logger.debug(`Saving file: ${file.originalname} to ${fullFilePath}`)

    await fsPromises.writeFile(fullFilePath, file.buffer)

    return filePath
  }

  getFilePath(filePath: string): string {
    return path.join(this.storagePath, filePath)
  }
}
