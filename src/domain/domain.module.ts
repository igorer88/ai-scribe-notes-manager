import { Module } from '@nestjs/common'

import { AuthModule } from './auth/auth.module'
import { NoteModule } from './note/note.module'
import { PatientModule } from './patient/patient.module'
import { UserModule } from './user/user.module'

@Module({
  imports: [UserModule, PatientModule, NoteModule, AuthModule],
  exports: [UserModule, PatientModule, NoteModule, AuthModule]
})
export class DomainModule {}
