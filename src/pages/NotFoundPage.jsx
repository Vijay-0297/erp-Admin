import { Link } from 'react-router-dom'
import Button from '../components/ui/Button.jsx'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-ink-50 text-center">
      <p className="text-6xl font-bold text-ink-200">404</p>
      <h1 className="text-lg font-semibold text-ink-800">Page not found</h1>
      <p className="max-w-sm text-sm text-ink-500">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/dashboard">
        <Button className="mt-2">Back to dashboard</Button>
      </Link>
    </div>
  )
}
