import { useAuthStore } from '@/stores/authStore'

import { api } from './api'
import type {
  AuthResponse,
  CreateNoteDto,
  LoginCredentials,
  Note,
  Patient,
  Transcription,
  User
} from './types'

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return api.post<AuthResponse>('/auth/login', credentials)
  },

  async register(credentials: LoginCredentials): Promise<AuthResponse> {
    return api.post<AuthResponse>('/auth/register', credentials)
  },

  async getCurrentUser(): Promise<User> {
    return api.get<User>('/auth/me')
  }
}

export const patientService = {
  async getAll(): Promise<Patient[]> {
    return api.get<Patient[]>('/patients')
  },

  async getById(id: string): Promise<Patient> {
    return api.get<Patient>(`/patients/${id}`)
  },

  async getNotes(id: string): Promise<Note[]> {
    return api.get<Note[]>(`/patients/${id}/notes`)
  }
}

export const noteService = {
  async getAll(): Promise<Note[]> {
    return api.get<Note[]>('/notes')
  },

  async getById(id: string): Promise<Note> {
    return api.get<Note>(`/notes/${id}`)
  },

  async getTranscription(id: string): Promise<Transcription | null> {
    return api.get<Transcription | null>(`/notes/${id}/transcription`)
  },

  async getAudioFile(id: string): Promise<string> {
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/notes/${id}/audio`
    return url
  },

  async createForPatient(
    patientId: string,
    dto: CreateNoteDto,
    audioFile?: File
  ): Promise<Note> {
    const user = useAuthStore.getState().user

    if (!user) {
      throw new Error('You must be logged in to create a note')
    }

    if (dto.isVoiceNote) {
      // Voice notes: send as FormData
      const formData = new FormData()
      formData.append('isVoiceNote', dto.isVoiceNote.toString())
      formData.append('userId', user.id)
      if (audioFile) {
        formData.append('audio', audioFile)
      }
      return api.postFormData<Note>(`/patients/${patientId}/notes`, formData)
    } else {
      // Text notes: send as JSON without isVoiceNote
      const payload = {
        content: dto.content || '',
        userId: user.id
      }
      return api.post<Note>(`/patients/${patientId}/notes`, payload)
    }
  }
}