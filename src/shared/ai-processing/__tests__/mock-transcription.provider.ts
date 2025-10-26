import {
  TranscriptionProvider,
  TranscriptionResult,
  TranscriptionOptions
} from '../interfaces/transcription-provider.interface'

export class MockTranscriptionProvider implements TranscriptionProvider {
  async transcribe(
    audioFile: Express.Multer.File,
    options?: TranscriptionOptions
  ): Promise<TranscriptionResult> {
    // Use audioFile parameter to avoid unused parameter warning
    const fileSize = audioFile.size || 0
    const fileName = audioFile.originalname || 'test.mp3'

    // Use options parameter to avoid unused parameter warning
    const noteId = options?.noteId || 'test-note'
    const saveRawFiles = options?.saveRawFiles || false

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 50))

    return {
      text: `Mock transcription for ${fileName} (${fileSize} bytes) in note ${noteId}`,
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
        fileSize,
        fileName,
        noteId,
        saveRawFiles
      },
      structuredData: saveRawFiles
        ? {
            segments: [{ start: 0, end: 2, text: 'Mock transcription segment' }]
          }
        : undefined
    }
  }
}
