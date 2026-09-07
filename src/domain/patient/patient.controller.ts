import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'

import { resolveMaxAudioUploadMb } from '@/config/environment/api.config'
import { CurrentUser } from '@/domain/auth/decorators/current-user.decorator'
import { createAudioUploadOptions } from '@/domain/note/audio-upload.util'
import { CreateNoteDto } from '@/domain/note/dto'
import { Note } from '@/domain/note/entities/note.entity'
import { NoteService } from '@/domain/note/note.service'

import { CreatePatientDto } from './dto/create-patient.dto'
import { UpdatePatientDto } from './dto/update-patient.dto'
import { Patient } from './entities/patient.entity'
import { PatientService } from './patient.service'

@Controller('patients')
export class PatientController {
  constructor(
    private readonly patientService: PatientService,
    private readonly noteService: NoteService
  ) {}

  @Post()
  create(
    @CurrentUser('sub') userId: string,
    @Body() createPatientDto: CreatePatientDto
  ): Promise<Patient> {
    return this.patientService.create(createPatientDto, userId)
  }

  @Get()
  findAll(@CurrentUser('sub') userId: string): Promise<Patient[]> {
    return this.patientService.findAll(userId)
  }

  @Get(':id')
  findOne(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<Patient> {
    return this.patientService.findOne(id, userId)
  }

  @Patch(':id')
  update(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePatientDto: UpdatePatientDto
  ): Promise<Patient> {
    return this.patientService.update(id, updatePatientDto, userId)
  }

  @Delete(':id')
  remove(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<void> {
    return this.patientService.remove(id, userId)
  }

  @Patch(':id/recover')
  recover(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<void> {
    return this.patientService.recover(id, userId)
  }

  @Post(':patientId/notes')
  @UseInterceptors(
    FileInterceptor(
      'audio',
      createAudioUploadOptions(resolveMaxAudioUploadMb())
    )
  )
  createNoteForPatient(
    @CurrentUser('sub') userId: string,
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Body() createNoteDto: CreateNoteDto,
    @UploadedFile() audioFile?: Express.Multer.File
  ): Promise<Note> {
    return this.noteService.create(createNoteDto, patientId, userId, audioFile)
  }

  @Get(':patientId/notes')
  findAllNotesForPatient(
    @CurrentUser('sub') userId: string,
    @Param('patientId', ParseUUIDPipe) patientId: string
  ): Promise<Note[]> {
    return this.noteService.findAllByPatientId(patientId, userId)
  }
}
