import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = 'default',
  className,
  loading = false,
}: {
  label: string
  value: ReactNode
  hint?: ReactNode
  icon?: ReactNode
  tone?: 'default' | 'brand' | 'warning'
  className?: string
  loading?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-lg border bg-surface p-4 shadow-card',
        tone === 'brand' ? 'border-brand-100 bg-brand-50/50' : 'border-line',
        tone === 'warning' && 'border-warning/25 bg-warning-soft/50',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold text-ink-500">{label}</p>
        {icon ? (
          <span
            className={cn(
              'grid size-7 shrink-0 place-items-center rounded-sm [&_svg]:size-3.5',
              tone === 'warning' ? 'bg-warning/10 text-warning' : 'bg-brand-50 text-brand-700',
            )}
            aria-hidden="true"
          >
            {icon}
          </span>
        ) : null}
      </div>
      {loading ? (
        <div className="mt-2 h-7 w-20 animate-pulse rounded-sm bg-ink-100" />
      ) : (
        <p className="mt-1.5 text-2xl font-bold tracking-tight text-ink-900 tabular-nums">{value}</p>
      )}
      {hint ? <p className="mt-1 text-xs text-ink-500">{hint}</p> : null}
    </div>
  )
}
