import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { patientService, noteService } from '@/lib/services'
import type { Patient, Note } from '@/lib/types'
import { FileText, Mic, Calendar, User } from 'lucide-react'

interface PatientDetailsModalProps {
  patient: Patient | null
  isOpen: boolean
  onClose: () => void
}

export function PatientDetailsModal({
  patient,
  isOpen,
  onClose
}: PatientDetailsModalProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPatientNotes = async () => {
      if (!patient) return

      setIsLoading(true)
      setError(null)
      try {
        const patientNotes = await patientService.getNotes(patient.id)
        setNotes(patientNotes)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load notes')
      } finally {
        setIsLoading(false)
      }
    }

    if (patient && isOpen) {
      loadPatientNotes()
    }
  }, [patient, isOpen])

  const calculateStats = () => {
    const totalNotes = notes.length
    const textNotes = notes.filter(note => !note.isVoiceNote).length
    const voiceNotes = notes.filter(note => note.isVoiceNote).length

    return { totalNotes, textNotes, voiceNotes }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const { totalNotes, textNotes, voiceNotes } = calculateStats()

  return (
    <Dialog open={isOpen}  onOpenChange={onClose}>
      <DialogContent className="overflow-y-auto max-w-fit">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Patient Details
          </DialogTitle>
        </DialogHeader>

        {patient && (
          <div className="sm:max-w-[320px] max-h-[85vh] space-y-4">
            {/* Patient Basic Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{patient.name}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Born: {formatDate(patient.dateOfBirth)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Notes Statistics */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Notes Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {isLoading ? (
                  <div className="text-center py-4 text-sm">Loading notes...</div>
                ) : error ? (
                  <div className="text-center py-4 text-red-500 text-sm">Error: {error}</div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 px-3 bg-muted/50 rounded-md">
                      <span className="text-sm font-medium">Total Notes</span>
                      <Badge variant="default" className="text-xs px-2 py-1">
                        {totalNotes}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-3 p-3 border rounded-md">
                        <FileText className="h-5 w-5 text-blue-500 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-muted-foreground">Text Notes</div>
                          <div className="text-lg font-bold text-blue-600">{textNotes}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 border rounded-md">
                        <Mic className="h-5 w-5 text-green-500 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-muted-foreground">Voice Notes</div>
                          <div className="text-lg font-bold text-green-600">{voiceNotes}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Audio Playback Section */}
            {notes.some(note => note.isVoiceNote) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Mic className="h-4 w-4" />
                    Voice Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {notes
                      .filter(note => note.isVoiceNote)
                      .map(note => (
                        <AudioPlayer key={note.id} note={note} />
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Future: Summaries Section */}
            <Card className="border-dashed">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm opacity-60">Summaries</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground">
                  AI-generated summaries will appear here in future updates.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

interface AudioPlayerProps {
  note: Note
}

function AudioPlayer({ note }: AudioPlayerProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadAudio = async () => {
      if (!note.audioFilePath) return

      setIsLoading(true)
      setError(null)
      try {
        const url = await noteService.getAudioFile(note.id)
        setAudioUrl(url)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load audio')
      } finally {
        setIsLoading(false)
      }
    }

    loadAudio()
  }, [note.id, note.audioFilePath])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="p-3 border rounded-md bg-muted/20">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-muted-foreground">
          {formatDate(note.createdAt)}
        </div>
        {note.transcription && (
          <Badge variant="outline" className="text-xs">
            Transcribed
          </Badge>
        )}
      </div>

      {note.transcription && (
        <div className="mb-3">
          <p className="text-sm text-muted-foreground italic">
            &ldquo;{note.transcription.text}&rdquo;
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="text-xs text-muted-foreground">Loading audio...</div>
      ) : error ? (
        <div className="text-xs text-red-500">Audio unavailable</div>
      ) : audioUrl ? (
        <audio
          controls
          className="w-full h-8"
          preload="none"
        >
          <source src={audioUrl} type="audio/mpeg" />
          <source src={audioUrl} type="audio/wav" />
          Your browser does not support the audio element.
        </audio>
      ) : (
        <div className="text-xs text-muted-foreground">Audio file not available</div>
      )}
    </div>
  )
}
