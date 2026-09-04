import clsx from 'clsx'
import { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'

const Select = forwardRef(function Select(
  { label, error, hint, options = [], placeholder = 'Select…', required, className, containerClassName, ...rest },
  ref
) {
  return (
    <div className={clsx('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label className="label-text">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={clsx(
            'w-full appearance-none rounded-lg border bg-white px-3 py-2 pr-9 text-sm text-ink-900 transition-colors focus-ring',
            error ? 'border-red-400' : 'border-ink-200 hover:border-ink-300',
            className
          )}
          {...rest}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={15}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-400"
        />
      </div>
      {error ? (
        <span className="text-xs text-red-600">{error}</span>
      ) : (
        hint && <span className="text-xs text-ink-400">{hint}</span>
      )}
    </div>
  )
})

export default Select
