import { Module } from '@nestjs/common'

import { NoteModule } from './note/note.module'
import { PatientModule } from './patient/patient.module'
import { UserModule } from './user/user.module'

@Module({
  imports: [UserModule, PatientModule, NoteModule],
  exports: [UserModule, PatientModule, NoteModule]
})
export class DomainModule {}
