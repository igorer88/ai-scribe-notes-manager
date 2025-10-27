import { Link } from 'react-router-dom'
import { useCounterStore } from '../store'
import { Button } from '@/components/ui/button'

export function HomePage() {
  const { count, increment, decrement } = useCounterStore()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-primary">AI Voice Note Manager</h1>
          <p className="text-muted-foreground text-lg">
            Welcome to your medical notes management system
          </p>
        </div>

        <div className="bg-card rounded-lg p-6 border shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Counter Demo</h2>
          <div className="flex items-center justify-center space-x-4">
            <Button onClick={decrement} variant="outline" size="lg">
              Decrement
            </Button>
            <div className="text-2xl font-mono bg-muted px-4 py-2 rounded">
              {count}
            </div>
            <Button onClick={increment} size="lg">
              Increment
            </Button>
          </div>
        </div>

        <div className="text-center">
          <Link
            to="/about"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2"
          >
            Go to About Page
          </Link>
        </div>
      </div>
    </div>
  )
}
