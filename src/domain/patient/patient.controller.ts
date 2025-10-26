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
  create(@Body() createPatientDto: CreatePatientDto): Promise<Patient> {
    return this.patientService.create(createPatientDto)
  }

  @Get()
  findAll(): Promise<Patient[]> {
    return this.patientService.findAll()
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Patient> {
    return this.patientService.findOne(id)
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePatientDto: UpdatePatientDto
  ): Promise<Patient> {
    return this.patientService.update(id, updatePatientDto)
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.patientService.remove(id)
  }

  @Patch(':id/recover')
  recover(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.patientService.recover(id)
  }

  @Post(':patientId/notes')
  @UseInterceptors(FileInterceptor('audio'))
  createNoteForPatient(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @UploadedFile() audioFile: Express.Multer.File,
    @Body() createNoteDto: CreateNoteDto
  ): Promise<Note> {
    return this.noteService.create(createNoteDto, patientId, audioFile)
  }

  @Get(':patientId/notes')
  findAllNotesForPatient(
    @Param('patientId', ParseUUIDPipe) patientId: string
  ): Promise<Note[]> {
    return this.noteService.findAllByPatientId(patientId)
  }
}
