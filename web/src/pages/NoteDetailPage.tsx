import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { format } from 'date-fns'
import { ArrowLeft, Mic, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useNoteStore } from '@/stores/noteStore'
import { usePatientStore } from '@/stores/patientStore'
import { noteService } from '@/lib/services'
import type { Note, Transcription } from '@/lib/types'

export function NoteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [note, setNote] = useState<Note | null>(null)
  const [transcription, setTranscription] = useState<Transcription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { getNoteById } = useNoteStore()
  const { getPatientById } = usePatientStore()

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

        // Load transcription if it's a voice note
        if (noteData?.isVoiceNote) {
          const transcriptionData = await noteService.getTranscription(id)
          setTranscription(transcriptionData)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load note')
      } finally {
        setIsLoading(false)
      }
    }

    loadNote()
  }, [id, getNoteById])

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

  const patient = getPatientById(note.patientId)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Notes
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Note Details</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Note Content */}
        <div className="md:col-span-2">
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
                Created {format(new Date(note.createdAt), 'MMM dd, yyyy HH:mm')}
              </div>
            </CardHeader>
            <CardContent>
              {note.isVoiceNote ? (
                <div className="space-y-4">
                  {note.audioFilePath && (
                    <div>
                      <audio controls className="w-full">
                        <source src={note.audioFilePath} type="audio/*" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold mb-2">Transcription:</h3>
                    <div className="bg-muted p-4 rounded-md">
                      {transcription?.content || 'Transcription not available yet'}
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

        {/* Patient Information */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <div className="font-medium">{patient?.name || 'Unknown'}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                <div className="font-medium">
                  {patient ? format(new Date(patient.dateOfBirth), 'MMM dd, yyyy') : 'Unknown'}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Patient ID</label>
                <div className="font-medium font-mono text-sm">{note.patientId}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
