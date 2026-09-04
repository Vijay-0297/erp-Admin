import { AlertTriangle, RotateCw } from 'lucide-react'
import Button from '../ui/Button.jsx'

export default function ErrorState({
  message = 'Something went wrong while loading this data.',
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
        <AlertTriangle size={22} />
      </div>
      <p className="max-w-sm text-sm text-ink-600">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" icon={RotateCw} onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
