import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mic, FileText, Upload } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { usePatientStore } from '@/stores/patientStore'
import { useNoteStore } from '@/stores/noteStore'
import type { CreateNoteDto } from '@/lib/types'

type NoteType = 'text' | 'voice'

export function CreateNotePage() {
  const navigate = useNavigate()
  const { patients } = usePatientStore()
  const { createNote, isLoading, error } = useNoteStore()

  const [noteType, setNoteType] = useState<NoteType>('text')
  const [selectedPatientId, setSelectedPatientId] = useState<string>('')
  const [content, setContent] = useState('')
  const [audioFile, setAudioFile] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedPatientId) {
      alert('Please select a patient')
      return
    }

    if (noteType === 'text' && !content.trim()) {
      alert('Please enter some content')
      return
    }

    if (noteType === 'voice' && !audioFile) {
      alert('Please select an audio file')
      return
    }

    const dto: CreateNoteDto = {
      content: noteType === 'text' ? content : undefined,
      isVoiceNote: noteType === 'voice',
      userId: '', // Will be set in the service
    }

    try {
      await createNote(selectedPatientId, dto, audioFile || undefined)
      navigate('/')
    } catch (err) {
      // Error is handled by the store
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file)
    } else {
      alert('Please select a valid audio file')
      e.target.value = ''
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold">Create New Note</h1>
        <p className="text-muted-foreground">
          Add a new clinical note for a patient
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Note Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Patient Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Patient *</label>
              <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Note Type Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Note Type</label>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant={noteType === 'text' ? 'default' : 'outline'}
                  onClick={() => setNoteType('text')}
                  className="flex items-center justify-center space-x-2 h-12"
                >
                  <FileText className="h-4 w-4" />
                  <span>Text Note</span>
                </Button>
                <Button
                  type="button"
                  variant={noteType === 'voice' ? 'default' : 'outline'}
                  onClick={() => setNoteType('voice')}
                  className="flex items-center justify-center space-x-2 h-12"
                >
                  <Mic className="h-4 w-4" />
                  <span>Voice Note</span>
                </Button>
              </div>
            </div>

            {/* Content Input */}
            {noteType === 'text' ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">Content *</label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter your clinical notes here..."
                  rows={6}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium">Audio File *</label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground mb-2">
                    {audioFile ? audioFile.name : 'Click to upload audio file'}
                  </div>
                  <Input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileChange}
                    className="max-w-xs mx-auto"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="text-red-600 dark:text-red-400 text-sm">
                Error: {error}
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
              <Button type="button" variant="outline" onClick={() => navigate('/')} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? 'Creating...' : 'Create Note'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
