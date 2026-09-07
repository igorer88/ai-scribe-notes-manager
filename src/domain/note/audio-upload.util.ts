import { BadRequestException } from '@nestjs/common'
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface'

const AUDIO_MIME_PREFIX = 'audio/'

export const mbToBytes = (mb: number): number => mb * 1024 * 1024

export const isAudioFile = (
  file: Pick<Express.Multer.File, 'mimetype'>
): boolean => file.mimetype.toLowerCase().startsWith(AUDIO_MIME_PREFIX)

export const audioFileFilter: MulterOptions['fileFilter'] = (
  request,
  file,
  callback
) => {
  void request
  if (!file.mimetype || isAudioFile(file)) {
    return callback(null, true)
  }
  return callback(
    new BadRequestException('Only audio files are allowed'),
    false
  )
}

export const createAudioUploadOptions = (
  maxUploadMb: number
): MulterOptions => ({
  limits: { fileSize: mbToBytes(maxUploadMb) },
  fileFilter: audioFileFilter
})
