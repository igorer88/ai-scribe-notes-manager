import { useEffect } from 'react'
import { Header } from './Header'
import { useAuthStore } from '@/stores/authStore'
import { usePatientStore } from '@/stores/patientStore'
import { useNoteStore } from '@/stores/noteStore'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { user, initialize } = useAuthStore()
  const { fetchPatients } = usePatientStore()
  const { fetchNotes } = useNoteStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (user) {
      fetchPatients()
      fetchNotes()
    }
  }, [user, fetchPatients, fetchNotes])

  useEffect(() => {
    // Set dark mode by default
    document.documentElement.classList.add('dark')
  }, [])

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex justify-center overflow-auto">
        <div className="max-w-7xl px-4 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
