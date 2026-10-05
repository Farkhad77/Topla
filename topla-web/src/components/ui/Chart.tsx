import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

/**
 * Qrafik tokenləri — bütün diaqramlar eyni dildə danışsın deyə tək mənbə.
 * Qayda: tək seriyalı qrafikdə leqenda YOXDUR (başlıq seriyanı adlandırır),
 * ox və şəbəkə arxa planda qalır, dəyər etiketləri seçmə şəkildə verilir.
 * Rənglər: brend yaşılının bir tonu (ardıcıl/tək hue), ağ fonda kontrast ≥ 3:1.
 */
export const chartTheme = {
  series: '#1f6640',
  seriesStrong: '#14532d',
  seriesSoft: 'rgba(31, 102, 64, 0.14)',
  grid: '#e3e8e4',
  axis: '#6f7d74',
  surface: '#ffffff',
  radius: 4,
} as const

export const axisProps = {
  tickLine: false,
  axisLine: false,
  tick: { fill: chartTheme.axis, fontSize: 11, fontWeight: 500 },
} as const

export function ChartCard({
  title,
  description,
  action,
  children,
  className,
  isEmpty = false,
  emptyLabel = 'Bu dövr üçün məlumat yoxdur',
  height = 260,
}: {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  isEmpty?: boolean
  emptyLabel?: string
  height?: number
}) {
  return (
    <section
      className={cn('rounded-lg border border-line bg-surface shadow-card', className)}
      aria-label={title}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 px-5 pb-2 pt-4">
        <div>
          <h3 className="text-sm font-bold text-ink-900">{title}</h3>
          {description ? <p className="mt-0.5 text-xs text-ink-500">{description}</p> : null}
        </div>
        {action}
      </header>
      <div className="px-2 pb-4" style={{ height }}>
        {isEmpty ? (
          <div className="flex h-full items-center justify-center px-5">
            <p className="text-center text-[13px] text-ink-400">{emptyLabel}</p>
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  )
}

/** Recharts default tooltip-i əvəzləyir — mətn tokenləri, seriya rəngi deyil. */
export function ChartTooltip({
  active,
  payload,
  label,
  formatter,
  unit,
}: {
  active?: boolean
  payload?: { value?: number | string; name?: string }[]
  label?: string | number
  formatter?: (value: number) => string
  unit?: string
}) {
  if (!active || !payload?.length) return null
  const raw = payload[0]?.value
  const numeric = typeof raw === 'number' ? raw : Number(raw ?? 0)

  return (
    <div className="rounded-sm border border-line bg-surface px-3 py-2 shadow-raised">
      <p className="text-2xs font-semibold uppercase tracking-wide text-ink-400">{label}</p>
      <p className="mt-0.5 text-sm font-bold text-ink-900">
        {formatter ? formatter(numeric) : numeric}
        {!formatter && unit ? ` ${unit}` : ''}
      </p>
    </div>
  )
}
