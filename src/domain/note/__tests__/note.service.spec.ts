import { ConflictException, NotFoundException } from '@nestjs/common'

import { PatientService } from '@/domain/patient/patient.service'
import { AiTranscriptionService } from '@/shared/ai-processing/services/transcription.service'
import { FileStorageService } from '@/shared/file-storage/file-storage.service'

import { Note } from '../entities/note.entity'
import { Transcription } from '../entities/transcription.entity'
import { NoteService } from '../note.service'
import { TranscriptionService } from '../transcription.service'

describe('NoteService', () => {
  let service: NoteService

  const mockOwnedNote = {
    id: 'note-1',
    content: 'Clinical note',
    user: { id: 'user-1' },
    patient: { id: 'patient-1' }
  } as Note

  const mockPatient = {
    id: 'patient-1',
    name: 'Audrey Williamson',
    user: { id: 'user-1' }
  }

  const mockNotesRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    recover: jest.fn()
  }

  const mockPatientService = {
    findOne: jest.fn()
  }

  const mockFileStorageService = {
    saveFile: jest.fn(),
    getFilePath: jest.fn()
  }

  const mockAiTranscriptionService = {
    transcribeAudio: jest.fn()
  }

  const mockTranscriptionService = {
    findOneByNoteId: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    service = new NoteService(
      mockNotesRepository as never,
      mockPatientService as unknown as PatientService,
      mockFileStorageService as unknown as FileStorageService,
      mockAiTranscriptionService as unknown as AiTranscriptionService,
      mockTranscriptionService as unknown as TranscriptionService
    )
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('should throw NotFoundException when the patient is not owned', async () => {
      mockPatientService.findOne.mockRejectedValue(
        new NotFoundException(`Patient with ID "patient-1" not found`)
      )

      await expect(
        service.create({ content: 'note' }, 'patient-1', 'user-2')
      ).rejects.toThrow(NotFoundException)

      expect(mockNotesRepository.save).not.toHaveBeenCalled()
    })

    it('should assign the authenticated user as owner of the note', async () => {
      mockPatientService.findOne.mockResolvedValue(mockPatient)
      mockNotesRepository.save.mockImplementation(async n => n)

      const result = await service.create(
        { content: 'Clinical note' },
        'patient-1',
        'user-1'
      )

      expect(mockPatientService.findOne).toHaveBeenCalledWith(
        'patient-1',
        'user-1'
      )
      expect(mockNotesRepository.save).toHaveBeenCalled()
      expect(result.user).toEqual({ id: 'user-1' })
    })
  })

  describe('findAll', () => {
    it('should only return notes owned by the user', async () => {
      mockNotesRepository.find.mockResolvedValue([mockOwnedNote])

      const result = await service.findAll('user-1')

      expect(mockNotesRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { user: { id: 'user-1' } } })
      )
      expect(result).toEqual([mockOwnedNote])
    })
  })

  describe('findOne', () => {
    it('should return an owned note', async () => {
      mockNotesRepository.findOne.mockResolvedValue(mockOwnedNote)

      const result = await service.findOne('note-1', 'user-1')

      expect(mockNotesRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'note-1', user: { id: 'user-1' } }
        })
      )
      expect(result).toEqual(mockOwnedNote)
    })

    it('should throw NotFoundException for another user note', async () => {
      mockNotesRepository.findOne.mockResolvedValue(null)

      await expect(service.findOne('note-1', 'user-2')).rejects.toThrow(
        NotFoundException
      )
    })
  })

  describe('update', () => {
    it('should not update a note owned by another user', async () => {
      mockNotesRepository.findOneBy.mockResolvedValue(null)

      await expect(
        service.update('note-1', { content: 'Hacked' }, 'user-2')
      ).rejects.toThrow(NotFoundException)

      expect(mockNotesRepository.update).not.toHaveBeenCalled()
    })
  })

  describe('remove', () => {
    it('should not delete a note owned by another user', async () => {
      mockNotesRepository.findOneBy.mockResolvedValue(null)

      await expect(service.remove('note-1', 'user-2')).rejects.toThrow(
        NotFoundException
      )
      expect(mockNotesRepository.softDelete).not.toHaveBeenCalled()
    })
  })

  describe('recover', () => {
    it('should not recover a note owned by another user', async () => {
      mockNotesRepository.findOne.mockResolvedValue(null)

      await expect(service.recover('note-1', 'user-2')).rejects.toThrow(
        NotFoundException
      )
      expect(mockNotesRepository.recover).not.toHaveBeenCalled()
    })

    it('should throw ConflictException if the note is not deleted', async () => {
      mockNotesRepository.findOne.mockResolvedValue({
        ...mockOwnedNote,
        deletedAt: null
      })

      await expect(service.recover('note-1', 'user-1')).rejects.toThrow(
        ConflictException
      )
    })
  })

  describe('getTranscription', () => {
    it('should throw NotFoundException for another user note', async () => {
      mockNotesRepository.findOne.mockResolvedValue(null)

      await expect(
        service.getTranscription('note-1', 'user-2')
      ).rejects.toThrow(NotFoundException)

      expect(mockTranscriptionService.findOneByNoteId).not.toHaveBeenCalled()
    })

    it('should return the transcription of an owned note', async () => {
      const transcription = { id: 'tr-1', text: 'transcribed' } as Transcription
      mockNotesRepository.findOne.mockResolvedValue(mockOwnedNote)
      mockTranscriptionService.findOneByNoteId.mockResolvedValue(transcription)

      const result = await service.getTranscription('note-1', 'user-1')

      expect(result).toEqual(transcription)
    })
  })

  describe('getAudioFile', () => {
    it('should throw NotFoundException for another user note', async () => {
      mockNotesRepository.findOne.mockResolvedValue(null)

      await expect(service.getAudioFile('note-1', 'user-2')).rejects.toThrow(
        NotFoundException
      )
    })

    it('should return the audio path for an owned voice note', async () => {
      mockNotesRepository.findOne.mockResolvedValue({
        ...mockOwnedNote,
        isVoiceNote: true,
        audioFilePath: '/uploads/x.mp3'
      })
      mockFileStorageService.getFilePath.mockResolvedValue('/abs/x.mp3')

      const result = await service.getAudioFile('note-1', 'user-1')

      expect(result).toBe('/abs/x.mp3')
    })
  })
})
