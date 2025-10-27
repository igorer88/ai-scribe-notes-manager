import { api } from './api'
import type {
  User,
  Patient,
  Note,
  Transcription,
  CreateNoteDto,
  LoginCredentials
} from './types'

export const authService = {
  async login(credentials: LoginCredentials): Promise<User> {
    return api.post<User>('/auth/login', credentials)
  },

  async getCurrentUser(): Promise<User> {
    const users = await api.get<User[]>('/users')
    const [demoUser] = users
    return demoUser
  }
}

export const userService = {
  async getById(id: string): Promise<User> {
    return api.get<User>(`/users/${id}`)
  }
}

export const patientService = {
  async getAll(): Promise<Patient[]> {
    return api.get<Patient[]>('/patients')
  },

  async getById(id: string): Promise<Patient> {
    return api.get<Patient>(`/patients/${id}`)
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

  async createForPatient(
    patientId: string,
    dto: CreateNoteDto,
    audioFile?: File
  ): Promise<Note> {
    const user = await authService.getCurrentUser()
    const formData = new FormData()
    formData.append('content', dto.content || '')
    formData.append('isVoiceNote', dto.isVoiceNote.toString())
    formData.append('userId', user.id)
    if (audioFile) {
      formData.append('audio', audioFile)
    }
    return api.postFormData<Note>(`/patients/${patientId}/notes`, formData)
  }
}
