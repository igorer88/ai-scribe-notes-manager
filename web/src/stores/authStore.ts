import { create } from 'zustand'
import { authService } from '@/lib/services'
import type { User } from '@/lib/types'

interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,

  login: async (_email: string, _password: string) => {
    set({ isLoading: true, error: null })
    try {
      const user = await authService.getCurrentUser()
      set({ user, isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Login failed',
        isLoading: false
      })
    }
  },

  logout: () => {
    set({ user: null, error: null })
  },

  initialize: async () => {
    const { user } = get()
    if (user) return

    set({ isLoading: true, error: null })
    try {
      // Mock login for demo
      const demoUser = await authService.getCurrentUser()
      set({ user: demoUser, isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to initialize',
        isLoading: false
      })
    }
  }
}))
