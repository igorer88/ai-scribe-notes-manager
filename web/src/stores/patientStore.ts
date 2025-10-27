import { create } from 'zustand'
import { patientService } from '@/lib/services'
import type { Patient } from '@/lib/types'

interface PatientState {
  patients: Patient[]
  isLoading: boolean
  error: string | null
  fetchPatients: () => Promise<void>
  getPatientById: (id: string) => Patient | undefined
}

export const usePatientStore = create<PatientState>((set, get) => ({
  patients: [],
  isLoading: false,
  error: null,

  fetchPatients: async () => {
    set({ isLoading: true, error: null })
    try {
      const patients = await patientService.getAll()
      set({ patients, isLoading: false })
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to fetch patients',
        isLoading: false
      })
    }
  },

  getPatientById: (id: string) => {
    return get().patients.find(patient => patient.id === id)
  }
}))
