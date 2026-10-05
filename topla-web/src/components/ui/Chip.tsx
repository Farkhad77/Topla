import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

/** Filtr üçün seçilə bilən çip — checkbox semantikası ilə. */
export function FilterChip({
  active,
  onClick,
  children,
  className,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={active}
      onClick={onClick}
      className={cn(
        'rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors',
        active
          ? 'border-brand-700 bg-brand-700 text-white'
          : 'border-line-strong bg-surface text-ink-700 hover:border-brand-300 hover:bg-brand-50',
        className,
      )}
    >
      {children}
    </button>
  )
}

/** Bir-birini istisna edən az sayda seçim üçün (radiogroup). */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
  ariaLabel,
}: {
  value: T
  onChange: (value: T) => void
  options: { value: T; label: string; count?: number }[]
  className?: string
  ariaLabel: string
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn('inline-flex items-center gap-1 rounded-md bg-ink-100 p-1', className)}
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex items-center gap-1.5 whitespace-nowrap rounded-sm px-3 py-1.5 text-[13px] font-semibold transition-colors',
              active
                ? 'bg-surface text-brand-800 shadow-card'
                : 'text-ink-600 hover:text-ink-900',
            )}
          >
            {option.label}
            {typeof option.count === 'number' ? (
              <span
                className={cn(
                  'rounded-full px-1.5 text-2xs tabular-nums',
                  active ? 'bg-brand-50 text-brand-700' : 'bg-ink-200 text-ink-600',
                )}
              >
                {option.count}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
