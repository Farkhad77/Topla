import type { ReactNode } from 'react'

export function OwnerPageHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-xl font-bold tracking-tight text-ink-900">{title}</h2>
        {description ? (
          <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-ink-500">{description}</p>
        ) : null}
      </div>
      {action ? <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div> : null}
    </div>
  )
}
