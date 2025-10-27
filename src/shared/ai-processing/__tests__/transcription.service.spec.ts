import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'

import { Transcription } from '@/domain/note/entities/transcription.entity'

import { MockTranscriptionProvider } from './mock-transcription.provider'
import { WhisperApiProvider } from '../providers/whisper-api.provider'
import { AiTranscriptionService } from '../services/transcription.service'

describe('AiTranscriptionService', () => {
  let service: AiTranscriptionService

  const mockTranscriptionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn()
  }

  const mockConfigService = {
    get: jest.fn()
  }

  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiTranscriptionService,
        {
          provide: getRepositoryToken(Transcription),
          useValue: mockTranscriptionRepository
        },
        {
          provide: ConfigService,
          useValue: mockConfigService
        },
        {
          provide: WhisperApiProvider,
          useClass: MockTranscriptionProvider
        }
      ]
    })
      .overrideProvider(Logger)
      .useValue(mockLogger)
      .compile()

    service = module.get<AiTranscriptionService>(AiTranscriptionService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('transcribeAudio', () => {
    it('should transcribe audio and save to database', async () => {
      // Arrange
      const noteId = 'test-note-123'
      const mockAudioFile = {
        originalname: 'test.mp3',
        size: 1024,
        buffer: Buffer.from('mock audio data')
      } as Express.Multer.File

      const mockTranscriptionResult = {
        text: 'Mock transcription for test.mp3 (1024 bytes) in note test-note-123',
        segments: [
          {
            id: 0,
            start: 0,
            end: 2,
            text: 'Mock transcription segment',
            confidence: 0.95
          }
        ],
        language: 'en',
        metadata: {
          provider: 'mock-transcription',
          processingTime: 50,
          fileSize: 1024,
          fileName: 'test.mp3',
          noteId: 'test-note-123',
          saveRawFiles: true
        },
        structuredData: {
          segments: [{ start: 0, end: 2, text: 'Mock transcription segment' }]
        }
      }

      const mockSavedTranscription = {
        id: 'transcription-123',
        text: mockTranscriptionResult.text,
        segments: mockTranscriptionResult.segments,
        language: mockTranscriptionResult.language,
        metadata: mockTranscriptionResult.metadata,
        structuredData: mockTranscriptionResult.structuredData
      }

      // Mock the provider call - since we're using a mock provider in the module,
      // we need to mock the service's internal provider selection
      mockConfigService.get.mockReturnValue('mock')
      // The actual provider mocking would need to be done differently for this test setup

      // Mock repository calls
      mockTranscriptionRepository.create.mockReturnValue(mockSavedTranscription)
      mockTranscriptionRepository.save.mockResolvedValue(mockSavedTranscription)

      // Mock config to use mock provider
      mockConfigService.get.mockReturnValue('mock')

      // Act
      const result = await service.transcribeAudio(noteId, mockAudioFile)

      // Assert - simplified test since we're using mock provider in module
      expect(mockTranscriptionRepository.create).toHaveBeenCalled()
      expect(mockTranscriptionRepository.save).toHaveBeenCalled()
      expect(mockTranscriptionRepository.create).toHaveBeenCalledWith({
        text: mockTranscriptionResult.text,
        segments: mockTranscriptionResult.segments,
        structuredData: mockTranscriptionResult.structuredData,
        language: mockTranscriptionResult.language,
        metadata: mockTranscriptionResult.metadata,
        note: { id: noteId }
      })
      expect(result).toEqual(mockSavedTranscription)
    })

    it('should handle transcription errors', async () => {
      // Arrange
      const noteId = 'test-note-123'
      const mockAudioFile = {
        originalname: 'test.mp3',
        size: 1024
      } as Express.Multer.File

      // Mock config to use mock provider
      mockConfigService.get.mockReturnValue('mock')

      // Mock repository to throw error
      mockTranscriptionRepository.create.mockImplementation(() => {
        throw new Error('Database error')
      })

      // Spy on logger.error to suppress error logs during test
      const loggerErrorSpy = jest
        .spyOn(service['logger'], 'error')
        .mockImplementation(() => undefined)

      // Act & Assert
      await expect(
        service.transcribeAudio(noteId, mockAudioFile)
      ).rejects.toThrow()

      // Restore logger.error
      loggerErrorSpy.mockRestore()
    })
  })
})
