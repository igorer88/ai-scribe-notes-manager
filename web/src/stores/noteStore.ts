import { create } from 'zustand'
import { noteService } from '@/lib/services'
import type { Note, CreateNoteDto } from '@/lib/types'

interface NoteState {
  notes: Note[]
  isLoading: boolean
  error: string | null
  fetchNotes: () => Promise<void>
  getNoteById: (id: string) => Note | undefined
  createNote: (
    patientId: string,
    dto: CreateNoteDto,
    audioFile?: File
  ) => Promise<void>
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  isLoading: false,
  error: null,

  fetchNotes: async () => {
    set({ isLoading: true, error: null })
    try {
      const notes = await noteService.getAll()
      set({ notes, isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch notes',
        isLoading: false
      })
    }
  },

  getNoteById: (id: string) => {
    return get().notes.find(note => note.id === id)
  },

  createNote: async (
    patientId: string,
    dto: CreateNoteDto,
    audioFile?: File
  ) => {
    set({ isLoading: true, error: null })
    try {
      const newNote = await noteService.createForPatient(
        patientId,
        dto,
        audioFile
      )
      set(state => ({
        notes: [newNote, ...state.notes],
        isLoading: false
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create note',
        isLoading: false
      })
    }
  }
}))
