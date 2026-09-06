import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { PatientService } from '@/domain/patient/patient.service'
import type { User } from '@/domain/user/entities/user.entity'
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
    private readonly fileStorageService: FileStorageService,
    private readonly aiTranscriptionService: AiTranscriptionService,
    private readonly transcriptionService: TranscriptionService
  ) {}

  private async findOwnedById(id: string, userId: string): Promise<Note> {
    const note = await this.notesRepository.findOneBy({
      id,
      user: { id: userId }
    })
    if (!note) {
      throw new NotFoundException(`Note with ID "${id}" not found`)
    }
    return note
  }

  async create(
    createNoteDto: CreateNoteDto,
    patientId: string,
    userId: string,
    audioFile?: Express.Multer.File
  ): Promise<Note> {
    const patient = await this.patientService.findOne(patientId, userId)

    // Create the note first to get the TypeORM-generated ID
    const note = new Note()
    note.patient = patient
    note.user = { id: userId } as User
    note.content = createNoteDto.content
    note.audioFilePath = createNoteDto.audioFilePath
    note.isVoiceNote = !!audioFile

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

  async findAll(userId: string): Promise<Note[]> {
    return this.notesRepository.find({
      where: { user: { id: userId } },
      relations: ['patient', 'transcription'],
      order: { createdAt: 'DESC' }
    })
  }

  async findAllByPatientId(patientId: string, userId: string): Promise<Note[]> {
    return this.notesRepository.find({
      where: { patient: { id: patientId }, user: { id: userId } }
    })
  }

  async findOne(id: string, userId: string): Promise<Note> {
    const note = await this.notesRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['patient', 'transcription']
    })
    if (!note) {
      throw new NotFoundException(`Note with ID "${id}" not found`)
    }
    return note
  }

  async update(
    id: string,
    updateNoteDto: UpdateNoteDto,
    userId: string
  ): Promise<Note> {
    await this.findOwnedById(id, userId)
    await this.notesRepository.update(id, updateNoteDto)
    return this.findOne(id, userId)
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOwnedById(id, userId)
    await this.notesRepository.softDelete(id)
  }

  async recover(id: string, userId: string): Promise<void> {
    const note = await this.notesRepository.findOne({
      where: { id, user: { id: userId } },
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

  async getTranscription(
    id: string,
    userId: string
  ): Promise<Transcription | null> {
    // Verify the note exists and belongs to the user
    await this.findOne(id, userId)

    return this.transcriptionService.findOneByNoteId(id)
  }

  async getAudioFile(id: string, userId: string): Promise<string> {
    const note = await this.findOne(id, userId)

    if (!note.isVoiceNote) {
      throw new NotFoundException(`Note with ID "${id}" is not a voice note`)
    }

    if (!note.audioFilePath) {
      throw new NotFoundException(
        `Audio file not found for note with ID "${id}"`
      )
    }

    return this.fileStorageService.getFilePath(note.audioFilePath)
  }
}
