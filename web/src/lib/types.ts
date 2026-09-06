export interface User {
  id: string
  username: string
  createdAt: string
  updatedAt: string
}

export interface Patient {
  id: string
  name: string
  dateOfBirth: string
  createdAt: string
  updatedAt: string
}

export interface Note {
  id: string
  content: string | null
  audioFilePath: string | null
  isVoiceNote: boolean
  createdAt: string
  updatedAt: string
  userId: string
  patientId: string
  patient?: Patient
  transcription?: Transcription | null
}

export interface Transcription {
  id: string
  text: string
  noteId: string
  createdAt: string
  updatedAt: string
}

export interface CreateNoteDto {
  content?: string
  isVoiceNote: boolean
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  user: User
}