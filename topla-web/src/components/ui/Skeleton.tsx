import { cn } from '@/utils/cn'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded-sm bg-ink-100', className)}
      aria-hidden="true"
    />
  )
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn('h-3.5', index === lines - 1 ? 'w-2/3' : 'w-full')}
        />
      ))}
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface">
      <Skeleton className="h-40 rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-4 w-3/5" />
        <Skeleton className="h-3 w-2/5" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  )
}

export function SkeletonRows({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="divide-y divide-line">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex items-center gap-4 px-4 py-3.5">
          {Array.from({ length: columns }).map((_, columnIndex) => (
            <Skeleton
              key={columnIndex}
              className={cn('h-3.5', columnIndex === 0 ? 'w-32' : 'flex-1')}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
