import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { NoteModule } from '@/domain/note/note.module'

import { Patient } from './entities/patient.entity'
import { PatientController } from './patient.controller'
import { PatientService } from './patient.service'

@Module({
  imports: [TypeOrmModule.forFeature([Patient]), forwardRef(() => NoteModule)],
  providers: [PatientService],
  controllers: [PatientController],
  exports: [PatientService]
})
export class PatientModule {}
