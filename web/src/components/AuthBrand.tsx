import { Stethoscope } from 'lucide-react'

export function AuthBrand() {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Stethoscope className="size-6" />
      </div>
      <div>
        <div className="text-xl font-bold">AI Scribe Notes</div>
        <div className="text-sm text-muted-foreground">
          Clinical notes, transcribed
        </div>
      </div>
    </div>
  )
}
