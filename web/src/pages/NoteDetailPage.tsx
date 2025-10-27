import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { format } from 'date-fns'
import { ArrowLeft, Mic, FileText, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AudioPlayer } from '@/components/AudioPlayer'
import { useNoteStore } from '@/stores/noteStore'
import { noteService } from '@/lib/services'
import type { Note, Transcription } from '@/lib/types'

export function NoteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [note, setNote] = useState<Note | null>(null)
  const [transcription, setTranscription] = useState<Transcription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshingTranscription, setIsRefreshingTranscription] = useState(false)

  const { getNoteById } = useNoteStore()

  useEffect(() => {
    const loadNote = async () => {
      if (!id) return

      setIsLoading(true)
      setError(null)

      try {
        // Try to get from store first
        let noteData = getNoteById(id)

        if (!noteData) {
          // Fetch from API if not in store
          noteData = await noteService.getById(id)
        }

        setNote(noteData)

        // Load transcription if it's a voice note and not already populated
        if (noteData?.isVoiceNote && !noteData.transcription) {
          const transcriptionData = await noteService.getTranscription(id)
          setTranscription(transcriptionData)
        } else if (noteData?.transcription) {
          setTranscription(noteData.transcription)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load note')
      } finally {
        setIsLoading(false)
      }
    }

    loadNote()
  }, [id, getNoteById])

  const refreshTranscription = async () => {
    if (!id || !note?.isVoiceNote) return

    setIsRefreshingTranscription(true)
    try {
      const transcriptionData = await noteService.getTranscription(id)
      setTranscription(transcriptionData)
    } catch (err) {
      console.warn('Failed to refresh transcription:', err)
    } finally {
      setIsRefreshingTranscription(false)
    }
  }

  const formatTranscription = (text: string | null): string => {
    return text ? `"${text}"` : 'Transcription not available yet'
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-muted-foreground">Loading note...</div>
      </div>
    )
  }

  if (error || !note) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 dark:text-red-400 mb-4">
          {error || 'Note not found'}
        </div>
        <Link to="/">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Notes
          </Button>
        </Link>
      </div>
    )
  }

  const patient = note.patient


  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <Link to="/">
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Notes
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Note Details</h1>
      </div>

      {/* Patient Information */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-6">
            <div className="flex-1">
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <div className="font-medium">{patient?.name || 'Unknown'}</div>
            </div>
            <div className="flex-1 text-right">
              <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
              <div className="font-medium">
                {patient ? format(new Date(patient.dateOfBirth), 'MMM dd, yyyy') : 'Unknown'}
              </div>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Patient ID</label>
            <div className="font-medium font-mono text-sm">{patient?.id || note.patientId}</div>
          </div>
        </CardContent>
      </Card>

      {/* Note Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {note.isVoiceNote ? (
              <>
                <Mic className="h-5 w-5" />
                <span>Voice Note</span>
              </>
            ) : (
              <>
                <FileText className="h-5 w-5" />
                <span>Text Note</span>
              </>
            )}
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            Created {format(new Date(note.createdAt), 'MMM dd, yyyy HH:mm')} (UTC)
          </div>
        </CardHeader>
        <CardContent>
          {note.isVoiceNote ? (
            <div className="space-y-4">
              <AudioPlayer
                noteId={note.id}
                createdAt={note.createdAt}
              />
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Transcription:</h3>
                  {!transcription?.text && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={refreshTranscription}
                      disabled={isRefreshingTranscription}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshingTranscription ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  )}
                </div>
                <div className="bg-muted p-4 rounded-md italic">
                  {formatTranscription(transcription?.text || null)}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-muted p-4 rounded-md whitespace-pre-wrap">
              {note.content || 'No content'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
