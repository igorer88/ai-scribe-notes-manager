import { BadRequestException } from '@nestjs/common'

import {
  audioFileFilter,
  createAudioUploadOptions,
  isAudioFile,
  mbToBytes
} from '@/domain/note/audio-upload.util'

describe('AudioUploadUtil', () => {
  const audioFile = (mimetype: string): Express.Multer.File =>
    ({
      mimetype,
      originalname: 'note.mp3',
      encoding: '7bit',
      size: 1024,
      buffer: Buffer.alloc(0),
      fieldname: 'audio',
      stream: null,
      destination: '',
      filename: '',
      path: ''
    }) as Express.Multer.File

  describe('mbToBytes', () => {
    it('converts megabytes to bytes', () => {
      expect(mbToBytes(20)).toBe(20 * 1024 * 1024)
    })
  })

  describe('isAudioFile', () => {
    it.each(['audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg'])(
      'accepts %s',
      mimetype => {
        expect(isAudioFile(audioFile(mimetype))).toBe(true)
      }
    )

    it.each(['text/plain', 'application/pdf', 'image/png'])(
      'rejects %s',
      mimetype => {
        expect(isAudioFile(audioFile(mimetype))).toBe(false)
      }
    )
  })

  describe('audioFileFilter', () => {
    it('accepts audio files', () => {
      const callback = jest.fn()
      audioFileFilter(undefined, audioFile('audio/mp4'), callback)
      expect(callback).toHaveBeenCalledWith(null, true)
    })

    it('accepts files with a missing mimetype', () => {
      const file = audioFile('')
      file.mimetype = undefined
      const callback = jest.fn()
      audioFileFilter(undefined, file, callback)
      expect(callback).toHaveBeenCalledWith(null, true)
    })

    it('rejects non-audio files with a BadRequestException', () => {
      const callback = jest.fn()
      audioFileFilter(undefined, audioFile('application/pdf'), callback)
      expect(callback).toHaveBeenCalledWith(
        new BadRequestException('Only audio files are allowed'),
        false
      )
    })
  })

  describe('createAudioUploadOptions', () => {
    it('builds multer limits from the max upload size', () => {
      const options = createAudioUploadOptions(20)
      expect(options.limits).toEqual({ fileSize: 20 * 1024 * 1024 })
      expect(options.fileFilter).toBe(audioFileFilter)
    })
  })
})
