import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { patientService } from '@/lib/services'
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
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
