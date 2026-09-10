import { createReadStream, type Stats } from 'node:fs'

import { stat } from 'node:fs/promises'

import {
  Controller,
  Get,
  Body,
  Param,
  Patch,
  Delete,
  ParseUUIDPipe,
  NotFoundException,
  Req,
  Res
} from '@nestjs/common'
import { Request, Response } from 'express'

import { CurrentUser } from '@/domain/auth/decorators/current-user.decorator'

import { UpdateNoteDto } from './dto'
import { Note } from './entities/note.entity'
import { Transcription } from './entities/transcription.entity'
import { NoteService } from './note.service'

const AUDIO_MIME_TYPES: Record<string, string> = {
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.oga': 'audio/ogg',
  '.m4a': 'audio/mp4',
  '.aac': 'audio/aac',
  '.flac': 'audio/flac'
}

function getAudioContentType(filePath: string): string {
  const extension = filePath.slice(filePath.lastIndexOf('.')).toLowerCase()
  return AUDIO_MIME_TYPES[extension] ?? 'audio/mpeg'
}

@Controller('notes')
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @Get()
  findAll(@CurrentUser('sub') userId: string): Promise<Note[]> {
    return this.noteService.findAll(userId)
  }

  @Get(':id')
  findOne(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<Note> {
    return this.noteService.findOne(id, userId)
  }

  @Get(':id/transcription')
  getTranscription(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<Transcription | null> {
    return this.noteService.getTranscription(id, userId)
  }

  @Patch(':id')
  update(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateNoteDto: UpdateNoteDto
  ): Promise<Note> {
    return this.noteService.update(id, updateNoteDto, userId)
  }

  @Delete(':id')
  remove(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<void> {
    return this.noteService.remove(id, userId)
  }

  @Get(':id/audio')
  async getAudioFile(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request,
    @Res() response: Response
  ): Promise<void> {
    const filePath = await this.noteService.getAudioFile(id, userId)

    let fileStat: Stats
    try {
      fileStat = await stat(filePath)
    } catch {
      throw new NotFoundException('Audio file not found')
    }

    response.set({
      'Content-Type': getAudioContentType(filePath),
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=31536000'
    })

    const range = request.headers.range
    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range)
      if (match) {
        const fileSize = fileStat.size
        let start: number
        let end: number

        if (match[1] === '') {
          const suffixLength = Number.parseInt(match[2], 10)
          start = Math.max(0, fileSize - suffixLength)
          end = fileSize - 1
        } else {
          start = Number.parseInt(match[1], 10)
          end =
            match[2] === ''
              ? fileSize - 1
              : Math.min(Number.parseInt(match[2], 10), fileSize - 1)
        }

        if (
          Number.isNaN(start) ||
          Number.isNaN(end) ||
          start > end ||
          start >= fileSize
        ) {
          response.status(416).set({ 'Content-Range': `bytes */${fileSize}` })
          response.end()
          return
        }

        response.status(206).set({
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Content-Length': end - start + 1
        })

        createReadStream(filePath, { start, end }).pipe(response)
        return
      }
    }

    response.set({ 'Content-Length': fileStat.size })
    createReadStream(filePath).pipe(response)
  }

  @Patch(':id/recover')
  recover(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<void> {
    return this.noteService.recover(id, userId)
  }
}
