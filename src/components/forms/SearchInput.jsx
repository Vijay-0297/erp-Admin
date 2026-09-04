import { Search, X } from 'lucide-react'

export default function SearchInput({ value, onChange, placeholder = 'Search…' }) {
  return (
    <div className="relative w-full sm:w-72">
      <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-ink-200 bg-white py-2 pl-9 pr-8 text-sm text-ink-900 placeholder:text-ink-400 transition-colors hover:border-ink-300 focus-ring"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
