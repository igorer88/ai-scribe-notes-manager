import {
  Controller,
  Get,
  Body,
  Param,
  Patch,
  Delete,
  ParseUUIDPipe
} from '@nestjs/common'

import { UpdateNoteDto } from './dto'
import { Note } from './entities/note.entity'
import { Transcription } from './entities/transcription.entity'
import { NoteService } from './note.service'

@Controller('notes')
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @Get()
  findAll(): Promise<Note[]> {
    return this.noteService.findAll()
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Note> {
    return this.noteService.findOne(id)
  }

  @Get(':id/transcription')
  getTranscription(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<Transcription | null> {
    return this.noteService.getTranscription(id)
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateNoteDto: UpdateNoteDto
  ): Promise<Note> {
    return this.noteService.update(id, updateNoteDto)
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.noteService.remove(id)
  }

  @Patch(':id/recover')
  recover(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.noteService.recover(id)
  }
}
