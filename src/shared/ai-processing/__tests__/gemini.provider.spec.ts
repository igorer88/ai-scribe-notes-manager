import { GoogleGenAI } from '@google/genai'
import { ConfigService } from '@nestjs/config'

import { GeminiProvider } from '../providers/gemini.provider'

jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: jest.fn()
    }
  }))
}))

const mockedGoogleGenAI = GoogleGenAI as unknown as jest.Mock

describe('GeminiProvider', () => {
  let provider: GeminiProvider
  let mockConfigService: { get: jest.Mock }
  let genaiClient: {
    models: { generateContent: jest.Mock }
  }

  const mockAudioFile = {
    originalname: 'test.mp3',
    size: 1024,
    mimetype: 'audio/mpeg',
    buffer: Buffer.from('mock audio data')
  } as Express.Multer.File

  beforeEach(() => {
    jest.clearAllMocks()
    mockConfigService = {
      get: jest
        .fn()
        .mockReturnValue('gemini-2.5-flash')
        .mockReturnValueOnce('test-api-key')
        .mockReturnValueOnce('gemini-2.5-flash')
    }
    provider = new GeminiProvider(mockConfigService as unknown as ConfigService)
    genaiClient = mockedGoogleGenAI.mock.results[0].value
  })

  it('should transcribe audio and return a TranscriptionResult', async () => {
    // Arrange
    genaiClient.models.generateContent.mockResolvedValue({
      text: '  Hello patient, take this medication twice daily.  '
    })

    // Act
    const result = await provider.transcribe(mockAudioFile)

    // Assert
    expect(result).toEqual({
      text: 'Hello patient, take this medication twice daily.',
      metadata: {
        provider: 'gemini',
        model: 'gemini-2.5-flash',
        processingTime: expect.any(Number)
      }
    })
    expect(genaiClient.models.generateContent).toHaveBeenCalledWith({
      model: 'gemini-2.5-flash',
      contents: [
        {
          inlineData: {
            data: mockAudioFile.buffer.toString('base64'),
            mimeType: 'audio/mpeg'
          }
        },
        expect.stringContaining('Transcribe the speech')
      ]
    })
  })

  it('should throw for an unsupported audio type', async () => {
    // Arrange
    const invalidFile = {
      ...mockAudioFile,
      mimetype: 'image/png',
      size: 1024
    } as Express.Multer.File

    // Act & Assert
    await expect(provider.transcribe(invalidFile)).rejects.toThrow(
      'Unsupported audio type: image/png'
    )
    expect(genaiClient.models.generateContent).not.toHaveBeenCalled()
  })

  it('should throw for audio exceeding the inline size limit', async () => {
    // Arrange
    const oversizedFile = {
      ...mockAudioFile,
      size: 20 * 1024 * 1024 + 1
    } as Express.Multer.File

    // Act & Assert
    await expect(provider.transcribe(oversizedFile)).rejects.toThrow(
      'exceeds the'
    )
    expect(genaiClient.models.generateContent).not.toHaveBeenCalled()
  })

  it('should throw when the Gemini API call fails', async () => {
    // Capture the provider's error log and replay it tagged as expected so
    // the test output stays consistent (single-line logs, no stack trace).
    const logger = provider['logger']
    const originalLog = logger.log.bind(logger)
    const loggerErrorSpy = jest
      .spyOn(logger, 'error')
      .mockImplementation(() => undefined)

    // Arrange
    genaiClient.models.generateContent.mockRejectedValue(new Error('API error'))

    // Act & Assert
    await expect(provider.transcribe(mockAudioFile)).rejects.toThrow(
      'Gemini transcription failed: API error'
    )

    originalLog('[Expected] Gemini transcription failed: API error')

    // Restore logger
    loggerErrorSpy.mockRestore()
  })
})
