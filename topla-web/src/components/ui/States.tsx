import type { ReactNode } from 'react'
import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Button } from './Button'

export function Spinner({ className }: { className?: string }) {
  return (
    <Loader2
      className={cn('size-5 animate-spin text-brand-600', className)}
      role="status"
      aria-label="Yüklənir"
    />
  )
}

export function PageLoader({ label = 'Yüklənir…' }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
      <Spinner className="size-7" />
      <p className="text-sm text-ink-500">{label}</p>
    </div>
  )
}

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
  compact?: boolean
}

/** Boş vəziyyət həmişə "növbəti addım"ı izah edir — sadəcə "data yoxdur" demir. */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-dashed border-line-strong bg-surface text-center',
        compact ? 'gap-2 px-5 py-8' : 'gap-3 px-6 py-14',
        className,
      )}
    >
      {icon ? (
        <div className="grid size-11 place-items-center rounded-full bg-brand-50 text-brand-700 [&_svg]:size-5">
          {icon}
        </div>
      ) : null}
      <div className="space-y-1">
        <p className="text-sm font-bold text-ink-900">{title}</p>
        {description ? (
          <p className="mx-auto max-w-sm text-[13px] leading-relaxed text-ink-500">{description}</p>
        ) : null}
      </div>
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  )
}

export function ErrorState({
  title = 'Məlumat yüklənmədi',
  description,
  onRetry,
  className,
}: {
  title?: string
  description?: string
  onRetry?: () => void
  className?: string
}) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-danger-soft bg-danger-soft/40 px-6 py-10 text-center',
        className,
      )}
    >
      <div className="grid size-11 place-items-center rounded-full bg-danger-soft text-danger">
        <AlertTriangle className="size-5" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-bold text-ink-900">{title}</p>
        {description ? <p className="max-w-sm text-[13px] text-ink-600">{description}</p> : null}
      </div>
      {onRetry ? (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          <RefreshCw />
          Yenidən cəhd et
        </Button>
      ) : null}
    </div>
  )
}

export function InlineNote({
  tone = 'brand',
  icon,
  children,
  className,
}: {
  tone?: 'brand' | 'warning' | 'danger' | 'info'
  icon?: ReactNode
  children: ReactNode
  className?: string
}) {
  const tones = {
    brand: 'bg-brand-50 text-brand-800 border-brand-100',
    warning: 'bg-warning-soft text-warning border-warning/20',
    danger: 'bg-danger-soft text-danger border-danger/20',
    info: 'bg-info-soft text-info border-info/20',
  } as const

  return (
    <div
      className={cn(
        'flex items-start gap-2.5 rounded-md border px-3.5 py-3 text-[13px] leading-relaxed [&_svg]:mt-0.5 [&_svg]:size-4 [&_svg]:shrink-0',
        tones[tone],
        className,
      )}
    >
      {icon}
      <div className="min-w-0">{children}</div>
    </div>
  )
}
