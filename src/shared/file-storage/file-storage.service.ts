import * as path from 'node:path'

import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { FileStorageProvider } from './interfaces/file-storage-provider.interface'
import { LocalFileStorageService } from './local-file-storage.service'

@Injectable()
export class FileStorageService {
  private activeProvider: FileStorageProvider

  constructor(
    private configService: ConfigService,
    private localFileStorageService: LocalFileStorageService
  ) {
    const storageType = this.configService.get<string>('storage.type')

    switch (storageType) {
      case 'local':
        this.activeProvider = this.localFileStorageService
        break
      default:
        throw new Error(`Unknown storage type: ${storageType}`)
    }
  }

  private generateFilename(noteId: string, fileExtension: string): string {
    return `${Date.now()}-${noteId}${fileExtension}`
  }

  private generateFilePath(
    patientId: string,
    noteId: string,
    fileExtension: string
  ): string {
    const filename = this.generateFilename(noteId, fileExtension)
    return path.join(patientId, filename)
  }

  async saveFile(
    file: Express.Multer.File,
    patientId: string,
    noteId: string
  ): Promise<string> {
    const fileExtension = path.extname(file.originalname)
    const filePath = this.generateFilePath(patientId, noteId, fileExtension)
    return this.activeProvider.saveFile(file, filePath)
  }
}
