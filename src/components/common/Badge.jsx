import clsx from 'clsx'

const TONES = {
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  warning: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  danger: 'bg-red-50 text-red-700 ring-red-600/20',
  neutral: 'bg-ink-100 text-ink-600 ring-ink-500/10',
  info: 'bg-brand-50 text-brand-700 ring-brand-600/20',
}

const toneForStatus = (status) => {
  const s = String(status || '').toLowerCase()
  if (['active', 'paid', 'in stock'].includes(s)) return 'success'
  if (['pending', 'low stock', 'partial'].includes(s)) return 'warning'
  if (['inactive', 'cancelled', 'out of stock'].includes(s)) return 'danger'
  return 'neutral'
}

export default function Badge({ children, tone }) {
  const resolvedTone = tone || toneForStatus(children)
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset',
        TONES[resolvedTone]
      )}
    >
      {children}
    </span>
  )
}
