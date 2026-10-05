import type { ReactNode } from 'react'
import { ServerCog } from 'lucide-react'
import { Badge } from '@/components/ui'

/**
 * Backend-də hələ açılmayan bölmələr üçün vahid izah paneli.
 * Qayda: uydurma data göstərmirik — nəyin çatışmadığını və indi nə etmək
 * mümkün olduğunu açıq yazırıq.
 */
export function MissingEndpointNotice({
  title,
  description,
  endpoint,
  children,
}: {
  title: string
  description: string
  /** Backend-dən gözlənilən yol — komanda üçün dəqiq istinad. */
  endpoint?: string
  children?: ReactNode
}) {
  return (
    <section
      aria-label={title}
      className="rounded-lg border border-dashed border-line-strong bg-surface p-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <span
          className="grid size-9 shrink-0 place-items-center rounded-md bg-ink-900 text-white"
          aria-hidden="true"
        >
          <ServerCog className="size-4.5" />
        </span>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-ink-900">{title}</h3>
            <Badge tone="dark" size="sm">
              Endpoint hazır deyil
            </Badge>
          </div>

          <p className="max-w-2xl text-[13px] leading-relaxed text-ink-600">{description}</p>

          {endpoint ? (
            <p className="text-xs text-ink-500">
              Gözlənilən yol:{' '}
              <code className="rounded-xs bg-ink-100 px-1.5 py-0.5 font-mono text-[11px] text-ink-800">
                {endpoint}
              </code>
            </p>
          ) : null}

          {children ? <div className="pt-1">{children}</div> : null}
        </div>
      </div>
    </section>
  )
}
