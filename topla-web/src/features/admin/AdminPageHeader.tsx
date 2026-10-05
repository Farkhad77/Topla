import type { ReactNode } from 'react'

/** Admin bölmələrində eyni başlıq ritmi — "idarəetmə otağı" hissi üçün sıx və ink-ağırlıqlı. */
export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <header className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4">
      <div className="min-w-0">
        <h2 className="text-lg font-bold tracking-tight text-ink-900 sm:text-xl">{title}</h2>
        {description ? (
          <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-ink-500">{description}</p>
        ) : null}
      </div>
      {action ? <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div> : null}
    </header>
  )
}
