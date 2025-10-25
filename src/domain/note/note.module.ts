import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { PatientModule } from '@/domain/patient/patient.module'
import { UserModule } from '@/domain/user/user.module'

import { Note } from './entities/note.entity'
import { NoteController } from './note.controller'
import { NoteService } from './note.service'

@Module({
  imports: [TypeOrmModule.forFeature([Note]), PatientModule, UserModule],
  providers: [NoteService],
  controllers: [NoteController],
  exports: [NoteService]
})
export class NoteModule {}
