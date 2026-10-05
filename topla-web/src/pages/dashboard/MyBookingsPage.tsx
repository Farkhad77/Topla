import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarSearch, Info, Star, X } from 'lucide-react'
import {
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Segmented,
  Skeleton,
} from '@/components/ui'
import { BookingCard } from '@/features/dashboard/BookingCard'
import { ReviewDialog } from '@/features/reviews/ReviewForm'
import { useCancelBooking, useMyBookings } from '@/hooks/queries/useBookingQueries'
import { usePageMeta } from '@/hooks/usePageMeta'
import { CANCEL_WINDOW_HOURS, canCancel, resolveBookingState } from '@/utils/booking'
import { formatDate, formatTimeRange, toDate } from '@/utils/format'
import type { MyBooking } from '@/types'

type BookingFilter = 'all' | 'upcoming' | 'past' | 'cancelled'

function startTime(booking: MyBooking): number {
  return toDate(booking.startDateTime)?.getTime() ?? 0
}

export default function MyBookingsPage() {
  usePageMeta({ title: 'Rezervasiyalarım' })

  const bookingsQuery = useMyBookings()
  const cancelBooking = useCancelBooking()

  const [filter, setFilter] = useState<BookingFilter>('all')
  const [cancelTarget, setCancelTarget] = useState<MyBooking | null>(null)
  const [reviewTarget, setReviewTarget] = useState<MyBooking | null>(null)

  const groups = useMemo(() => {
    const upcoming: MyBooking[] = []
    const past: MyBooking[] = []
    const cancelled: MyBooking[] = []

    for (const booking of bookingsQuery.data ?? []) {
      const state = resolveBookingState(booking)
      if (state === 'completed') past.push(booking)
      else if (state === 'cancelled' || state === 'rejected') cancelled.push(booking)
      else upcoming.push(booking)
    }

    upcoming.sort((a, b) => startTime(a) - startTime(b))
    past.sort((a, b) => startTime(b) - startTime(a))
    cancelled.sort((a, b) => startTime(b) - startTime(a))

    return { upcoming, past, cancelled, all: [...upcoming, ...past, ...cancelled] }
  }, [bookingsQuery.data])

  const visible = groups[filter]

  async function handleCancel() {
    if (!cancelTarget) return
    try {
      await cancelBooking.mutateAsync(cancelTarget.id)
      setCancelTarget(null)
    } catch {
      // Xəta mesajı `useCancelBooking` içindəki toast ilə göstərilir, dialoq açıq qalır.
    }
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-extrabold tracking-tight text-ink-900">Rezervasiyalarım</h1>
        <p className="text-sm text-ink-500">
          Gələcək oyunlarını izlə, keçmiş oyunlara rəy yaz.
        </p>
      </header>

      <div className="overflow-x-auto pb-1">
        <Segmented
          ariaLabel="Rezervasiya filtri"
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'Hamısı', count: groups.all.length },
            { value: 'upcoming', label: 'Gələcək', count: groups.upcoming.length },
            { value: 'past', label: 'Keçmiş', count: groups.past.length },
            { value: 'cancelled', label: 'Ləğv edilmiş', count: groups.cancelled.length },
          ]}
        />
      </div>

      {bookingsQuery.isLoading ? (
        <div className="space-y-3" aria-busy="true">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-32 rounded-lg sm:h-24" />
          ))}
        </div>
      ) : bookingsQuery.isError ? (
        <ErrorState
          title="Rezervasiyalar yüklənmədi"
          description="Bağlantını yoxlayıb yenidən cəhd et."
          onRetry={() => void bookingsQuery.refetch()}
        />
      ) : groups.all.length === 0 ? (
        <EmptyState
          icon={<CalendarSearch />}
          title="Hələ rezervasiyan yoxdur"
          description="Meydançalara bax, boş saatı seç və ilk oyununu bron et."
          action={
            <Button asChild>
              <Link to="/stadiums">Meydançalara bax</Link>
            </Button>
          }
        />
      ) : visible.length === 0 ? (
        <EmptyState
          compact
          icon={<CalendarSearch />}
          title="Bu filtrdə nəticə yoxdur"
          description="Başqa bölməyə keç və ya yeni bir oyun bron et."
          action={
            <Button variant="secondary" onClick={() => setFilter('all')}>
              Hamısını göstər
            </Button>
          }
        />
      ) : (
        <ul className="space-y-3">
          {visible.map((booking) => {
            const state = resolveBookingState(booking)
            const isOpen = state === 'pending' || state === 'confirmed'
            const cancellable = isOpen && canCancel(booking)

            return (
              <li key={booking.id}>
                <BookingCard
                  booking={booking}
                  note={
                    isOpen && !cancellable ? (
                      <span className="flex items-start gap-1.5">
                        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                        Oyuna {CANCEL_WINDOW_HOURS} saatdan az qalıb — onlayn ləğv bağlıdır.
                        Zərurət varsa stadionla birbaşa əlaqə saxla.
                      </span>
                    ) : null
                  }
                  actions={
                    <>
                      {state === 'completed' ? (
                        <Button variant="secondary" onClick={() => setReviewTarget(booking)}>
                          <Star />
                          Rəy yaz
                        </Button>
                      ) : null}
                      {isOpen ? (
                        <Button
                          variant="danger-soft"
                          disabled={!cancellable}
                          onClick={() => setCancelTarget(booking)}
                        >
                          <X />
                          Ləğv et
                        </Button>
                      ) : null}
                    </>
                  }
                />
              </li>
            )
          })}
        </ul>
      )}

      <ConfirmDialog
        open={!!cancelTarget}
        onOpenChange={(open) => {
          if (!open && !cancelBooking.isPending) setCancelTarget(null)
        }}
        title="Rezervasiyanı ləğv edirsən?"
        description="Bu əməliyyat geri qaytarılmır — slot dərhal başqa istifadəçilərə açılacaq."
        confirmLabel="Bəli, ləğv et"
        cancelLabel="Fikrimi dəyişdim"
        loading={cancelBooking.isPending}
        onConfirm={() => void handleCancel()}
      >
        {cancelTarget ? (
          <div className="rounded-md bg-ink-50 px-3.5 py-3 text-[13px] text-ink-700">
            <p className="font-bold text-ink-900">{cancelTarget.stadiumName}</p>
            <p className="mt-0.5">
              {formatDate(cancelTarget.startDateTime)} ·{' '}
              {formatTimeRange(cancelTarget.startDateTime, cancelTarget.endDateTime)}
            </p>
          </div>
        ) : null}
      </ConfirmDialog>

      {reviewTarget ? (
        <ReviewDialog
          key={reviewTarget.id}
          stadiumId={reviewTarget.stadiumId}
          stadiumName={reviewTarget.stadiumName}
          open
          onOpenChange={(open) => {
            if (!open) setReviewTarget(null)
          }}
        />
      ) : null}
    </div>
  )
}
