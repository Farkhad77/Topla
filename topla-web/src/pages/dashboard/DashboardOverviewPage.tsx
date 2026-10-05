import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQueries } from '@tanstack/react-query'
import {
  ArrowRight,
  CalendarCheck,
  CalendarPlus,
  CheckCircle2,
  Info,
  Star,
  Wallet,
  X,
} from 'lucide-react'
import {
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  InlineNote,
  Skeleton,
  StatCard,
} from '@/components/ui'
import { BookingStatusBadge } from '@/components/common/StatusBadge'
import { BookingCard } from '@/features/dashboard/BookingCard'
import { ReviewDialog } from '@/features/reviews/ReviewForm'
import { useCancelBooking, useMyBookings } from '@/hooks/queries/useBookingQueries'
import { queryKeys } from '@/hooks/queryKeys'
import { reviewService } from '@/services'
import { useAuth } from '@/hooks/useAuth'
import { usePageMeta } from '@/hooks/usePageMeta'
import { BookingStatus } from '@/types'
import { CANCEL_WINDOW_HOURS, canCancel, hoursUntil, resolveBookingState } from '@/utils/booking'
import {
  formatDate,
  formatPrice,
  formatTimeRange,
  formatWeekday,
  toDate,
} from '@/utils/format'
import type { MyBooking } from '@/types'

const RECENT_LIMIT = 4

function startTime(booking: MyBooking): number {
  return toDate(booking.startDateTime)?.getTime() ?? 0
}

function countdownLabel(startDateTime: string): string {
  const hours = hoursUntil(startDateTime)
  if (hours <= 1) return 'Bir saatdan az qalıb'
  if (hours < 24) return `${Math.round(hours)} saat qalıb`
  return `${Math.ceil(hours / 24)} gün qalıb`
}

export default function DashboardOverviewPage() {
  usePageMeta({ title: 'Panelim' })

  const { user } = useAuth()
  const bookingsQuery = useMyBookings()
  const cancelBooking = useCancelBooking()

  const [cancelTarget, setCancelTarget] = useState<MyBooking | null>(null)
  const [reviewTarget, setReviewTarget] = useState<MyBooking | null>(null)

  const summary = useMemo(() => {
    const list = bookingsQuery.data ?? []
    const upcoming: MyBooking[] = []
    const completed: MyBooking[] = []

    for (const booking of list) {
      const state = resolveBookingState(booking)
      if (state === 'completed') completed.push(booking)
      else if (state === 'pending' || state === 'confirmed') upcoming.push(booking)
    }

    upcoming.sort((a, b) => startTime(a) - startTime(b))
    completed.sort((a, b) => startTime(b) - startTime(a))

    const totalSpent = list
      .filter((booking) => booking.status !== BookingStatus.Cancelled)
      .reduce((sum, booking) => sum + (booking.totalPrice ?? 0), 0)

    const recent = completed.slice(0, RECENT_LIMIT)

    return {
      total: list.length,
      next: upcoming[0] ?? null,
      upcomingCount: upcoming.length,
      completedCount: completed.length,
      totalSpent,
      recent,
      recentStadiumIds: Array.from(new Set(recent.map((booking) => booking.stadiumId))),
    }
  }, [bookingsQuery.data])

  // Rəy yazılıb-yazılmadığını yalnız son oyunların stadionları üçün soruşuruq —
  // backend-də "mənim rəylərim" endpoint-i yoxdur (bax: MyReviewsPage).
  const reviewQueries = useQueries({
    queries: summary.recentStadiumIds.map((stadiumId) => ({
      queryKey: queryKeys.reviews.byStadium(stadiumId),
      queryFn: () => reviewService.byStadium(stadiumId),
      staleTime: 60_000,
    })),
  })

  const reviewedStadiumIds = new Set(
    reviewQueries
      .flatMap((query) => query.data ?? [])
      .filter((review) => review.userId === user?.id)
      .map((review) => review.stadiumId),
  )

  const firstName = user?.fullName?.trim().split(/\s+/)[0] ?? 'Dost'

  async function handleCancel() {
    if (!cancelTarget) return
    try {
      await cancelBooking.mutateAsync(cancelTarget.id)
      setCancelTarget(null)
    } catch {
      // Xəta toast ilə göstərilir; dialoq açıq qalır ki, istifadəçi yenidən cəhd edə bilsin.
    }
  }

  const nextBooking = summary.next
  const nextCancellable = nextBooking ? canCancel(nextBooking) : false

  return (
    <div className="space-y-7">
      <header className="space-y-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">
          Salam, {firstName} 👋
        </h1>
        <p className="text-sm text-ink-500">
          Oyunlarını buradan izlə — növbəti bronun ən yuxarıdadır.
        </p>
      </header>

      {bookingsQuery.isLoading ? (
        <div className="space-y-6" aria-busy="true">
          <Skeleton className="h-52 rounded-lg" />
          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-24 rounded-lg" />
            ))}
          </div>
        </div>
      ) : bookingsQuery.isError ? (
        <ErrorState
          title="Panel yüklənmədi"
          description="Rezervasiyalarını gətirə bilmədik. Bağlantını yoxlayıb yenidən cəhd et."
          onRetry={() => void bookingsQuery.refetch()}
        />
      ) : summary.total === 0 ? (
        <EmptyState
          icon={<CalendarPlus />}
          title="İlk oyununu bron et"
          description="Şəhərindəki meydançalara bax, boş saatı seç və komandanı topla."
          action={
            <Button asChild size="lg">
              <Link to="/stadiums">Meydançalara bax</Link>
            </Button>
          }
        />
      ) : (
        <>
          {nextBooking ? (
            <section
              className="overflow-hidden rounded-lg border border-brand-100 bg-surface shadow-raised"
              aria-labelledby="next-booking-title"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-100 bg-brand-50 px-5 py-3">
                <h2 id="next-booking-title" className="text-[13px] font-bold text-brand-800">
                  Növbəti oyunun
                </h2>
                <span className="text-[13px] font-semibold text-brand-700 tabular-nums">
                  {countdownLabel(nextBooking.startDateTime)}
                </span>
              </div>

              <div className="space-y-5 p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xl font-extrabold tracking-tight text-ink-900 sm:text-2xl">
                      <Link
                        to={`/stadiums/${nextBooking.stadiumId}`}
                        className="underline-offset-4 hover:underline"
                      >
                        {nextBooking.stadiumName}
                      </Link>
                    </p>
                    <p className="mt-1 text-sm capitalize text-ink-500">
                      {formatWeekday(nextBooking.startDateTime)},{' '}
                      {formatDate(nextBooking.startDateTime)}
                    </p>
                  </div>
                  <BookingStatusBadge status={resolveBookingState(nextBooking)} />
                </div>

                <div className="grid gap-4 rounded-md bg-ink-50 px-4 py-3.5 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold text-ink-500">Saat aralığı</p>
                    <p className="mt-0.5 text-lg font-bold text-ink-900 tabular-nums">
                      {formatTimeRange(nextBooking.startDateTime, nextBooking.endDateTime)}
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-xs font-semibold text-ink-500">Məbləğ</p>
                    <p className="mt-0.5 text-lg font-bold text-brand-700 tabular-nums">
                      {formatPrice(nextBooking.totalPrice)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button asChild size="lg">
                    <Link to="/dashboard/bookings">
                      Detallara bax
                      <ArrowRight />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="danger-soft"
                    disabled={!nextCancellable}
                    onClick={() => setCancelTarget(nextBooking)}
                  >
                    <X />
                    Ləğv et
                  </Button>
                </div>

                {!nextCancellable ? (
                  <InlineNote tone="warning" icon={<Info />}>
                    Oyuna {CANCEL_WINDOW_HOURS} saatdan az qalıb — onlayn ləğv artıq mümkün deyil.
                    Zərurət varsa stadionla birbaşa əlaqə saxla.
                  </InlineNote>
                ) : null}
              </div>
            </section>
          ) : (
            <EmptyState
              compact
              icon={<CalendarPlus />}
              title="Gələcək oyunun yoxdur"
              description="Növbəti həftə üçün meydançanı indidən tut — populyar saatlar tez dolur."
              action={
                <Button asChild>
                  <Link to="/stadiums">Yeni bron et</Link>
                </Button>
              }
            />
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Gələcək bronlar"
              value={summary.upcomingCount}
              icon={<CalendarCheck />}
              tone="brand"
              hint="Təsdiqlənmiş və gözləyən oyunlar"
            />
            <StatCard
              label="Tamamlanmış oyunlar"
              value={summary.completedCount}
              icon={<CheckCircle2 />}
              hint="Oynanılıb və bitib"
            />
            <StatCard
              label="Ümumi xərc"
              value={formatPrice(summary.totalSpent)}
              icon={<Wallet />}
              hint="Ləğv edilmiş bronlar sayılmır"
            />
          </div>

          <section className="space-y-3" aria-labelledby="recent-title">
            <div className="flex items-center justify-between gap-3">
              <h2 id="recent-title" className="text-sm font-bold text-ink-900">
                Son oyunların
              </h2>
              <Link
                to="/dashboard/bookings"
                className="text-[13px] font-semibold text-brand-700 underline-offset-4 hover:underline"
              >
                Hamısına bax
              </Link>
            </div>

            {summary.recent.length === 0 ? (
              <EmptyState
                compact
                icon={<Star />}
                title="Hələ tamamlanmış oyunun yoxdur"
                description="İlk oyunundan sonra burada rəy yaza biləcəyin siyahı görünəcək."
              />
            ) : (
              <ul className="space-y-3">
                {summary.recent.map((booking) => {
                  const reviewed = reviewedStadiumIds.has(booking.stadiumId)
                  return (
                    <li key={booking.id}>
                      <BookingCard
                        booking={booking}
                        actions={
                          reviewed ? (
                            <span className="flex items-center gap-1.5 text-[13px] font-semibold text-success">
                              <CheckCircle2 className="size-4" aria-hidden="true" />
                              Rəy yazılıb
                            </span>
                          ) : (
                            <Button variant="secondary" onClick={() => setReviewTarget(booking)}>
                              <Star />
                              Rəy yaz
                            </Button>
                          )
                        }
                      />
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </>
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
