import { Link } from 'react-router-dom'

export function AboutPage() {
  return (
    <div>
      <h1>About Page</h1>
      <p>This is the about page.</p>
      <Link to="/">Go to Home Page</Link>
    </div>
  )
}
