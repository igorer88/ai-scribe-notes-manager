import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { NotesListPage } from './pages/NotesListPage'
import { NoteDetailPage } from './pages/NoteDetailPage'
import { CreateNotePage } from './pages/CreateNotePage'

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground w-full">
      <Layout>
        <Routes>
          <Route path="/" element={<NotesListPage />} />
          <Route path="/notes/:id" element={<NoteDetailPage />} />
          <Route path="/create" element={<CreateNotePage />} />
        </Routes>
      </Layout>
    </div>
  )
}

export default App
