import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { FileStorageService } from './file-storage.service'
import { LocalFileStorageService } from './local-file-storage.service'
import { S3FileStorageService } from './s3-file-storage.service'

@Module({
  imports: [ConfigModule],
  providers: [
    FileStorageService,
    LocalFileStorageService,
    S3FileStorageService
  ],
  exports: [FileStorageService]
})
export class FileStorageModule {}
