import type { ReactNode } from 'react'
import { MessageSquare } from 'lucide-react'
import { Avatar, EmptyState, Rating, Skeleton } from '@/components/ui'
import { formatRelative } from '@/utils/format'
import type { Review } from '@/types'

export function RatingSummary({ reviews }: { reviews: Review[] }) {
  if (!reviews.length) return null

  const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((review) => review.rating === star).length,
  }))

  return (
    <div className="grid gap-6 rounded-lg border border-line bg-surface p-5 sm:grid-cols-[auto_1fr]">
      <div className="text-center sm:border-r sm:border-line sm:pr-6">
        <p className="text-4xl font-bold tracking-tight text-ink-900">{average.toFixed(1)}</p>
        <Rating value={average} className="mt-1.5 justify-center" />
        <p className="mt-1 text-xs text-ink-500">{reviews.length} rəy</p>
      </div>

      <ul className="space-y-1.5">
        {distribution.map((row) => {
          const percent = reviews.length ? (row.count / reviews.length) * 100 : 0
          return (
            <li key={row.star} className="flex items-center gap-3 text-xs">
              <span className="w-8 shrink-0 font-semibold text-ink-600">{row.star} ★</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-100">
                <div className="h-full rounded-full bg-brand-600" style={{ width: `${percent}%` }} />
              </div>
              <span className="w-6 shrink-0 text-right tabular-nums text-ink-500">{row.count}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function ReviewList({
  reviews,
  loading = false,
  emptyAction,
}: {
  reviews: Review[]
  loading?: boolean
  emptyAction?: ReactNode
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-md border border-line bg-surface p-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-3 h-3 w-full" />
            <Skeleton className="mt-2 h-3 w-2/3" />
          </div>
        ))}
      </div>
    )
  }

  if (!reviews.length) {
    return (
      <EmptyState
        icon={<MessageSquare />}
        title="Hələ rəy yoxdur"
        description="Bu meydançada oynadıqdan sonra ilk rəyi sən yaza bilərsən."
        action={emptyAction}
        compact
      />
    )
  }

  return (
    <ul className="space-y-3">
      {reviews.map((review) => (
        <li key={review.id} className="rounded-md border border-line bg-surface p-4">
          <div className="flex items-center gap-3">
            <Avatar name={review.userName} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-[13.5px] font-bold text-ink-900">{review.userName}</p>
              <Rating value={review.rating} size="sm" />
            </div>
            <span className="ml-auto shrink-0 text-2xs text-ink-400">
              {formatRelative(review.createdAt)}
            </span>
          </div>
          {review.comment ? (
            <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-700">{review.comment}</p>
          ) : null}
        </li>
      ))}
    </ul>
  )
}
