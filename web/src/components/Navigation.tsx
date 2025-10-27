import { Link } from 'react-router-dom'
import { Plus, List } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Navigation() {
  return (
    <nav className="flex items-center space-x-2 px-4">
      <Button
        variant="ghost"
        size="sm"
        asChild
      >
        <Link to="/" className="flex items-center space-x-2">
          <List className="h-4 w-4" />
          <span>Notes</span>
        </Link>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        asChild
      >
        <Link to="/create" className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>New Note</span>
        </Link>
      </Button>
    </nav>
  )
}
