import clsx from 'clsx'
import { forwardRef } from 'react'

const Input = forwardRef(function Input(
  { label, error, hint, icon: Icon, className, containerClassName, required, ...rest },
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
        {Icon && (
          <Icon
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
          />
        )}
        <input
          ref={ref}
          className={clsx(
            'w-full rounded-lg border bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 transition-colors focus-ring',
            Icon && 'pl-9',
            error ? 'border-red-400' : 'border-ink-200 hover:border-ink-300',
            className
          )}
          {...rest}
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

export default Input
