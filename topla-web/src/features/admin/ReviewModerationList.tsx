import { Trash2 } from 'lucide-react'
import { Avatar, Badge, Button, Rating } from '@/components/ui'
import { RoleGate } from '@/components/common/RoleGate'
import { formatRelative } from '@/utils/format'
import type { Review } from '@/types'

/** Rəy siyahısı + yalnız Admin üçün silmə. Moderator silə bilmir (backend icazəsi yoxdur). */
export function ReviewModerationList({
  reviews,
  onDelete,
  deletingId,
  busy,
}: {
  reviews: Review[]
  onDelete: (review: Review) => void
  deletingId: string | null
  busy: boolean
}) {
  return (
    <ul className="space-y-3">
      {reviews.map((review) => (
        <li key={review.id} className="rounded-md border border-line bg-surface p-4">
          <div className="flex flex-wrap items-start gap-3">
            <Avatar name={review.userName} size="sm" tone="dark" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13.5px] font-bold text-ink-900">
                {review.userName || 'Adsız istifadəçi'}
              </p>
              <div className="mt-0.5 flex flex-wrap items-center gap-2">
                <Rating value={review.rating} size="sm" />
                <span className="text-2xs text-ink-400">{formatRelative(review.createdAt)}</span>
              </div>
            </div>

            <RoleGate roles={['Admin']}>
              <Button
                variant="danger-soft"
                size="sm"
                onClick={() => onDelete(review)}
                loading={deletingId === review.id}
                disabled={busy}
                aria-label={`${review.userName || 'İstifadəçi'} rəyini sil`}
              >
                <Trash2 aria-hidden="true" />
                Sil
              </Button>
            </RoleGate>
          </div>

          {review.comment ? (
            <p className="mt-2.5 whitespace-pre-wrap text-[13.5px] leading-relaxed text-ink-700">
              {review.comment}
            </p>
          ) : (
            <p className="mt-2.5 text-[13px] italic text-ink-400">Mətn yazılmayıb.</p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge tone="outline" size="sm" className="font-mono">
              istifadəçi: {review.userId.slice(0, 8)}…
            </Badge>
            <span className="text-2xs text-ink-400">
              Blok lazımdırsa tam id-ni «İstifadəçilər» bölməsində istifadə et.
            </span>
          </div>
        </li>
      ))}
    </ul>
  )
}
