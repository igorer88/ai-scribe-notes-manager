import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useNoteStore } from '@/stores/noteStore'
import type { Note } from '@/lib/types'

const getDisplayContent = (note: Note): string => {
  return note.isVoiceNote
    ? (note.transcription?.text || 'Voice note - transcription pending')
    : (note.content || 'No content')
}

const getPreview = (content: string): string => {
  return content.length > 100
    ? `${content.substring(0, 100)}...`
    : content
}

function NoteCard({ note }: { note: Note }) {
  const displayContent = getDisplayContent(note)
  const preview = getPreview(displayContent)

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <Link to={`/notes/${note.id}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            {note.patient?.name || 'Unknown Patient'}
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            {format(new Date(note.createdAt), 'MMM dd, yyyy HH:mm')} (UTC)
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {preview}
          </p>
          {note.isVoiceNote && (
            <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
              🎤 Voice Note
            </div>
          )}
        </CardContent>
      </Link>
    </Card>
  )
}

export function NotesListPage() {
  const { notes, isLoading, error, fetchNotes } = useNoteStore()

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-muted-foreground">Loading notes...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 dark:text-red-400 mb-4">
          Error loading notes: {error}
        </div>
        <button
          onClick={fetchNotes}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (notes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground mb-4">
          No notes found. Create your first note!
        </div>
        <Link
          to="/create"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Create Note
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Notes</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchNotes}
            disabled={isLoading}
            className="flex-1 sm:flex-none"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link
            to="/create"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex-1 sm:flex-none text-center"
          >
            New Note
          </Link>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {notes.map((note) => (
          <NoteCard key={note.id} note={note} />
        ))}
      </div>
    </div>
  )
}
