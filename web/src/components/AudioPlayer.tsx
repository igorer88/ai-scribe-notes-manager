import { useState, useEffect } from 'react'
import { noteService } from '@/lib/services'

interface AudioPlayerProps {
  noteId: string
  createdAt?: string
}

export function AudioPlayer({
  noteId,
  createdAt
}: AudioPlayerProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadAudio = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const url = await noteService.getAudioFile(noteId)
        setAudioUrl(url)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load audio')
      } finally {
        setIsLoading(false)
      }
    }

    loadAudio()
  }, [noteId])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }


  return (
    <div className="space-y-3">
      {createdAt && (
        <div className="text-xs text-muted-foreground">
          {formatDate(createdAt)}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <div className="text-sm text-muted-foreground">Loading audio...</div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-4">
          <div className="text-sm text-red-500 text-center">Audio unavailable: {error}</div>
        </div>
      ) : audioUrl ? (
        <div className="bg-muted/50 rounded-lg p-3">
          <audio
            controls
            className="w-full h-8"
            preload="metadata"
            crossOrigin="anonymous"
          >
            <source src={audioUrl} type="audio/mpeg" />
            <source src={audioUrl} type="audio/wav" />
            Your browser does not support the audio element.
          </audio>
        </div>
      ) : (
        <div className="flex items-center justify-center py-4">
          <div className="text-sm text-muted-foreground">Audio file not available</div>
        </div>
      )}
    </div>
  )
}
