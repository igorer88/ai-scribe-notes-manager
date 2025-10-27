import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { FileStorageProvider } from './interfaces/file-storage-provider.interface'

@Injectable()
export class S3FileStorageService implements FileStorageProvider {
  private readonly logger = new Logger(this.constructor.name)
  private readonly s3Client: S3Client
  private readonly bucket: string

  constructor(private configService: ConfigService) {
    const s3Config = this.configService.get('storage.s3')

    this.s3Client = new S3Client({
      endpoint: s3Config.endpoint,
      region: s3Config.region,
      credentials: {
        accessKeyId: s3Config.accessKeyId,
        secretAccessKey: s3Config.secretAccessKey
      },
      forcePathStyle: true // Required for MinIO compatibility
    })

    this.bucket = s3Config.bucket
  }

  async saveFile(file: Express.Multer.File, filePath: string): Promise<string> {
    const uploadParams = {
      Bucket: this.bucket,
      Key: filePath,
      Body: file.buffer,
      ContentType: file.mimetype
    }

    try {
      this.logger.debug(
        `Uploading file: ${file.originalname} to S3 path: ${filePath}`
      )
      await this.s3Client.send(new PutObjectCommand(uploadParams))
      return filePath
    } catch (error) {
      this.logger.error(`Failed to upload file to S3: ${error.message}`)
      throw error
    }
  }

  getFilePath(filePath: string): string {
    // For S3, return the signed URL or path for retrieval
    // In a real implementation, generate a signed URL here
    // For now, return the key path
    return filePath
  }
}
