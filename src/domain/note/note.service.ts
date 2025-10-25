import {
  Injectable,
  NotFoundException,
  ConflictException
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { PatientService } from '@/domain/patient/patient.service'
import { UserService } from '@/domain/user/user.service'

import { CreateNoteDto, UpdateNoteDto } from './dto'
import { Note } from './entities/note.entity'

@Injectable()
export class NoteService {
  constructor(
    @InjectRepository(Note)
    private notesRepository: Repository<Note>,
    private readonly patientService: PatientService,
    private readonly userService: UserService
  ) {}

  async create(createNoteDto: CreateNoteDto, patientId: string): Promise<Note> {
    const patient = await this.patientService.findOne(patientId)
    if (!patient) {
      throw new NotFoundException(`Patient with ID "${patientId}" not found`)
    }

    const user = await this.userService.findOne(createNoteDto.userId)
    if (!user) {
      throw new NotFoundException(
        `User with ID "${createNoteDto.userId}" not found`
      )
    }

    const note = this.notesRepository.create({
      ...createNoteDto,
      patient,
      user
    })
    return this.notesRepository.save(note)
  }

  async findAll(): Promise<Note[]> {
    return this.notesRepository.find()
  }

  async findAllByPatientId(patientId: string): Promise<Note[]> {
    return this.notesRepository.find({ where: { patient: { id: patientId } } })
  }

  async findOne(id: string): Promise<Note> {
    const note = await this.notesRepository.findOneBy({ id })
    if (!note) {
      throw new NotFoundException(`Note with ID "${id}" not found`)
    }
    return note
  }

  async update(id: string, updateNoteDto: UpdateNoteDto): Promise<Note> {
    const note = await this.notesRepository.findOneBy({ id })
    if (!note) {
      throw new NotFoundException(`Note with ID "${id}" not found`)
    }
    await this.notesRepository.update(id, updateNoteDto)
    return this.notesRepository.findOneBy({ id })
  }

  async remove(id: string): Promise<void> {
    const note = await this.notesRepository.findOneBy({ id })
    if (!note) {
      throw new NotFoundException(`Note with ID "${id}" not found`)
    }
    await this.notesRepository.softDelete(id)
  }

  async recover(id: string): Promise<void> {
    const note = await this.notesRepository.findOne({
      where: { id },
      withDeleted: true
    })
    if (!note) {
      throw new NotFoundException(`Note with ID "${id}" not found`)
    }
    if (note.deletedAt === null) {
      throw new ConflictException(`Note with ID "${id}" is not deleted`)
    }
    await this.notesRepository.recover({ id })
  }
}
