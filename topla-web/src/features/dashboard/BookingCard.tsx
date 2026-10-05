import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Clock, Timer } from 'lucide-react'
import { BookingStatusBadge } from '@/components/common/StatusBadge'
import { resolveBookingState } from '@/utils/booking'
import { formatDate, formatDuration, formatPrice, formatTimeRange, toDate } from '@/utils/format'
import { cn } from '@/utils/cn'
import type { MyBooking } from '@/types'

function bookingDurationMinutes(booking: MyBooking): number {
  const start = toDate(booking.startDateTime)
  const end = toDate(booking.endDateTime)
  if (!start || !end) return 0
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 60_000))
}

interface BookingCardProps {
  booking: MyBooking
  /** Sağ tərəfdə (mobil: altda) yerləşən əməliyyat düymələri. */
  actions?: ReactNode
  /** Kartın altındakı izah zolağı — məsələn ləğvin niyə bağlı olduğu. */
  note?: ReactNode
  className?: string
}

/** Rezervasiya kartı: mobil ekranda yığılır, ≥sm-də üfüqi sıralanır. */
export function BookingCard({ booking, actions, note, className }: BookingCardProps) {
  const state = resolveBookingState(booking)
  const minutes = bookingDurationMinutes(booking)

  return (
    <article className={cn('rounded-lg border border-line bg-surface shadow-card', className)}>
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="min-w-0 text-[15px] font-bold text-ink-900">
              <Link
                to={`/stadiums/${booking.stadiumId}`}
                className="underline-offset-4 hover:underline"
              >
                {booking.stadiumName}
              </Link>
            </h3>
            <BookingStatusBadge status={state} />
          </div>

          <dl className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-ink-600">
            <div className="flex items-center gap-1.5">
              <CalendarDays className="size-4 shrink-0 text-ink-400" aria-hidden="true" />
              <dt className="sr-only">Tarix</dt>
              <dd>{formatDate(booking.startDateTime)}</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="size-4 shrink-0 text-ink-400" aria-hidden="true" />
              <dt className="sr-only">Saat</dt>
              <dd className="tabular-nums">
                {formatTimeRange(booking.startDateTime, booking.endDateTime)}
              </dd>
            </div>
            {minutes > 0 ? (
              <div className="flex items-center gap-1.5">
                <Timer className="size-4 shrink-0 text-ink-400" aria-hidden="true" />
                <dt className="sr-only">Müddət</dt>
                <dd>{formatDuration(minutes)}</dd>
              </div>
            ) : null}
          </dl>
        </div>

        <div className="flex shrink-0 flex-col gap-3 sm:items-end">
          <p className="text-lg font-bold tracking-tight text-brand-700 tabular-nums">
            {formatPrice(booking.totalPrice)}
          </p>
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      </div>

      {note ? (
        <div className="border-t border-line px-4 py-2.5 text-xs leading-relaxed text-ink-500">
          {note}
        </div>
      ) : null}
    </article>
  )
}
