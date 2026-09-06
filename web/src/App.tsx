import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { Layout } from './components/Layout'
import { useAuthStore } from '@/stores/authStore'
import { CreateNotePage } from './pages/CreateNotePage'
import { LoginPage } from './pages/LoginPage'
import { NoteDetailPage } from './pages/NoteDetailPage'
import { NotesListPage } from './pages/NotesListPage'
import { PatientsListPage } from './pages/PatientsListPage'
import { RegisterPage } from './pages/RegisterPage'

function App() {
  const { user, isInitialized, initialize } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground w-full">
      <Layout>
        <Routes>
          <Route path="/" element={<NotesListPage />} />
          <Route path="/notes/:id" element={<NoteDetailPage />} />
          <Route path="/create" element={<CreateNotePage />} />
          <Route path="/patients" element={<PatientsListPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </div>
  )
}

export default App