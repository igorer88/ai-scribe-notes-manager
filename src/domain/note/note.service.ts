import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { PatientService } from '@/domain/patient/patient.service'
import { UserService } from '@/domain/user/user.service'
import { AiTranscriptionService } from '@/shared/ai-processing/services/transcription.service'
import { FileStorageService } from '@/shared/file-storage/file-storage.service'

import { CreateNoteDto, UpdateNoteDto } from './dto'
import { Note } from './entities/note.entity'
import { Transcription } from './entities/transcription.entity'
import { TranscriptionService } from './transcription.service'

@Injectable()
export class NoteService {
  private readonly logger = new Logger(this.constructor.name)
  constructor(
    @InjectRepository(Note)
    private notesRepository: Repository<Note>,
    private readonly patientService: PatientService,
    private readonly userService: UserService,
    private readonly fileStorageService: FileStorageService,
    private readonly aiTranscriptionService: AiTranscriptionService,
    private readonly transcriptionService: TranscriptionService
  ) {}

  async create(
    createNoteDto: CreateNoteDto,
    patientId: string,
    audioFile?: Express.Multer.File
  ): Promise<Note> {
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

    // Create the note first to get the TypeORM-generated ID
    const note = new Note()
    note.patient = patient
    note.user = user
    note.content = createNoteDto.content
    note.audioFilePath = createNoteDto.audioFilePath
    note.isVoiceNote = audioFile ? true : createNoteDto.isVoiceNote || false

    const savedNote = await this.notesRepository.save(note)

    // If there's an audio file, save it using the actual note ID and update the note
    if (audioFile) {
      const finalAudioFilePath = await this.fileStorageService.saveFile(
        audioFile,
        patientId,
        savedNote.id
      )

      // Update the note with the file path (isVoiceNote is already set to true)
      savedNote.audioFilePath = finalAudioFilePath
      const updatedNote = await this.notesRepository.save(savedNote)

      // Process transcription asynchronously
      setImmediate(() => {
        this.aiTranscriptionService
          .transcribeAudio(savedNote.id, audioFile)
          .catch(error =>
            this.logger.error(
              `Transcription failed for note ${savedNote.id}`,
              error
            )
          )
      })

      return updatedNote
    }

    // For text notes, no additional AI processing needed

    return savedNote
  }

  async findAll(): Promise<Note[]> {
    return this.notesRepository.find({ relations: ['patient'] })
  }

  async findAllByPatientId(patientId: string): Promise<Note[]> {
    return this.notesRepository.find({ where: { patient: { id: patientId } } })
  }

  async findOne(id: string): Promise<Note> {
    const note = await this.notesRepository.findOne({
      where: { id },
      relations: ['patient', 'transcription']
    })
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

  async getTranscription(id: string): Promise<Transcription | null> {
    // Verify the note exists (findOne throws NotFoundException if not found)
    await this.findOne(id)

    return this.transcriptionService.findOneByNoteId(id)
  }
}
