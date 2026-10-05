import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'

export function Breadcrumbs({
  items,
  className,
}: {
  items: { label: string; to?: string }[]
  className?: string
}) {
  return (
    <nav aria-label="Naviqasiya izi" className={cn('flex items-center gap-1 text-xs', className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <span key={`${item.label}-${index}`} className="flex items-center gap-1">
            {item.to && !isLast ? (
              <Link to={item.to} className="font-medium text-ink-500 transition-colors hover:text-brand-700">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'font-semibold text-ink-800' : 'text-ink-500'} aria-current={isLast ? 'page' : undefined}>
                {item.label}
              </span>
            )}
            {!isLast ? <ChevronRight className="size-3.5 text-ink-300" aria-hidden="true" /> : null}
          </span>
        )
      })}
    </nav>
  )
}
