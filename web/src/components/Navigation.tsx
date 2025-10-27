import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, List, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Navigation() {
  const [showText, setShowText] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setShowText(window.innerWidth >= 1024) // lg breakpoint
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)

    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  return (
    <nav className="flex items-center space-x-2 px-4">
      <Button
        variant="ghost"
        size="sm"
        asChild
      >
        <Link to="/" className="flex items-center space-x-2">
          <List className="h-4 w-4" />
          {showText && <span>Notes</span>}
        </Link>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        asChild
      >
        <Link to="/patients" className="flex items-center space-x-2">
          <Users className="h-4 w-4" />
          {showText && <span>Patients</span>}
        </Link>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        asChild
      >
        <Link to="/create" className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          {showText && <span>New Note</span>}
        </Link>
      </Button>
    </nav>
  )
}
