import { create } from 'zustand'

import { authService } from '@/lib/services'
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken
} from '@/lib/token'
import type { LoginCredentials, User } from '@/lib/types'

interface AuthState {
  user: User | null
  isLoading: boolean
  isInitialized: boolean
  error: string | null
  login: (credentials: LoginCredentials) => Promise<void>
  register: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null })
    try {
      const { accessToken, user } = await authService.login(credentials)
      setAccessToken(accessToken)
      set({ user, isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Login failed',
        isLoading: false
      })
    }
  },

  register: async (credentials) => {
    set({ isLoading: true, error: null })
    try {
      const { accessToken, user } = await authService.register(credentials)
      setAccessToken(accessToken)
      set({ user, isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Registration failed',
        isLoading: false
      })
    }
  },

  logout: () => {
    clearAccessToken()
    set({ user: null, error: null })
  },

  initialize: async () => {
    const { user, isInitialized } = get()
    if (user || isInitialized) return

    set({ isLoading: true, error: null })

    const token = getAccessToken()
    if (!token) {
      set({ isLoading: false, isInitialized: true })
      return
    }

    try {
      const currentUser = await authService.getCurrentUser()
      set({ user: currentUser, isLoading: false, isInitialized: true })
    } catch {
      clearAccessToken()
      set({
        user: null,
        isLoading: false,
        isInitialized: true,
        error: null
      })
    }
  }
}))