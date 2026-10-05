import { format } from 'date-fns'
import { cn } from '@/utils/cn'
import type { SlotView } from './slotUtils'

export function SlotGrid({
  views,
  selected,
  onSelect,
  className,
}: {
  views: SlotView[]
  selected: Date | null
  onSelect: (start: Date) => void
  className?: string
}) {
  return (
    <div
      className={cn('grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5', className)}
      role="radiogroup"
      aria-label="Boş saatlar"
    >
      {views.map((view) => {
        const isSelected = !!selected && view.start.getTime() === selected.getTime()
        const disabled = view.state !== 'free'

        return (
          <button
            key={view.start.toISOString()}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={disabled}
            onClick={() => onSelect(view.start)}
            title={
              view.state === 'busy'
                ? 'Bu saat artıq tutulub'
                : view.state === 'past'
                  ? 'Bu saat keçib'
                  : undefined
            }
            className={cn(
              'h-10 rounded-md border text-[13px] font-bold transition-colors sm:h-11 sm:text-[13.5px]',
              isSelected && 'border-brand-700 bg-brand-700 text-white',
              !isSelected &&
                view.state === 'free' &&
                'border-brand-200 bg-brand-50 text-brand-800 hover:border-brand-400 hover:bg-brand-100',
              view.state === 'busy' &&
                'cursor-not-allowed border-line bg-ink-100 text-ink-400 line-through',
              view.state === 'past' && 'cursor-not-allowed border-dashed border-line bg-surface text-ink-300',
            )}
          >
            {format(view.start, 'HH:mm')}
          </button>
        )
      })}
    </div>
  )
}

export function SlotLegend() {
  const items = [
    { label: 'Boş', className: 'border-brand-200 bg-brand-50' },
    { label: 'Tutulub', className: 'border-line bg-ink-100' },
    { label: 'Keçib', className: 'border-dashed border-line bg-surface' },
  ]

  return (
    <ul className="flex flex-wrap items-center gap-4">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5 text-xs text-ink-500">
          <span className={cn('size-3 rounded-xs border', item.className)} aria-hidden="true" />
          {item.label}
        </li>
      ))}
    </ul>
  )
}
