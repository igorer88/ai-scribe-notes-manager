import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { FileStorageService } from './file-storage.service'
import { LocalFileStorageService } from './local-file-storage.service'

@Module({
  imports: [ConfigModule],
  providers: [FileStorageService, LocalFileStorageService],
  exports: [FileStorageService]
})
export class FileStorageModule {}
