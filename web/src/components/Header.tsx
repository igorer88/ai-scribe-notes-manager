import { useAuthStore } from '@/stores/authStore'
import { Navigation } from './Navigation'

export function Header() {
  const { user } = useAuthStore()

  return (
    <header className="w-full border-b bg-card/50 backdrop-blur-lg shrink-0">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center space-x-4 mx-2">
            <h1 className="text-xl font-bold">AI Scribe Notes</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Navigation />
            {user && (
              <span className="text-sm text-muted-foreground">
                Welcome, {user.name}
              </span>
            )}
          </div>
        </div>
    </header>
  )
}
