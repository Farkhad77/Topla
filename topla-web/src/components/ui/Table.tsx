import type { HTMLAttributes, ReactNode, ThHTMLAttributes, TdHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

/** Mobil: üfüqi sürüşmə + kənar kölgəsi. Desktop: adi cədvəl. */
export function TableScroller({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('scroll-shadow-x -mx-px overflow-x-auto', className)}>
      <div className="min-w-[46rem]">{children}</div>
    </div>
  )
}

export function Table({ className, ...props }: HTMLAttributes<HTMLTableElement>) {
  return <table className={cn('w-full border-collapse text-left', className)} {...props} />
}

export function Th({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope="col"
      className={cn(
        'border-b border-line bg-ink-50/70 px-4 py-3 text-2xs font-bold uppercase tracking-[0.06em] text-ink-500',
        className,
      )}
      {...props}
    />
  )
}

export function Td({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn('border-b border-line px-4 py-3.5 align-middle text-[13.5px] text-ink-800', className)}
      {...props}
    />
  )
}

export function Tr({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn('transition-colors hover:bg-ink-50/60', className)} {...props} />
}
