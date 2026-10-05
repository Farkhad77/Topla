import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './Button'
import { cn } from '@/utils/cn'

function pageWindow(current: number, total: number): (number | 'gap')[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, 'gap', total]
  if (current >= total - 3) return [1, 'gap', total - 4, total - 3, total - 2, total - 1, total]
  return [1, 'gap', current - 1, current, current + 1, 'gap', total]
}

export function Pagination({
  page,
  totalPages,
  totalCount,
  onChange,
  className,
}: {
  page: number
  totalPages: number
  totalCount?: number
  onChange: (page: number) => void
  className?: string
}) {
  if (totalPages <= 1) return null

  return (
    <nav
      aria-label="Səhifələmə"
      className={cn('flex flex-wrap items-center justify-between gap-3', className)}
    >
      {typeof totalCount === 'number' ? (
        <p className="text-xs text-ink-500">
          Cəmi <span className="font-semibold text-ink-700">{totalCount}</span> nəticə
        </p>
      ) : (
        <span />
      )}

      <div className="flex items-center gap-1">
        <Button
          variant="secondary"
          size="icon-sm"
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          aria-label="Əvvəlki səhifə"
        >
          <ChevronLeft />
        </Button>

        {pageWindow(page, totalPages).map((item, index) =>
          item === 'gap' ? (
            <span key={`gap-${index}`} className="px-1.5 text-sm text-ink-400">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onChange(item)}
              aria-current={item === page ? 'page' : undefined}
              className={cn(
                'size-8 rounded-sm text-[13px] font-semibold transition-colors',
                item === page
                  ? 'bg-brand-700 text-white'
                  : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900',
              )}
            >
              {item}
            </button>
          ),
        )}

        <Button
          variant="secondary"
          size="icon-sm"
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Növbəti səhifə"
        >
          <ChevronRight />
        </Button>
      </div>
    </nav>
  )
}
