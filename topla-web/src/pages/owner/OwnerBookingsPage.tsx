import { useMemo, useState } from 'react'
import { CalendarX2, Search, Ticket } from 'lucide-react'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  ErrorState,
  Pagination,
  SkeletonRows,
} from '@/components/ui'
import { OwnerPageHeader } from '@/features/owner/OwnerPageHeader'
import { OwnerBookingsTable } from '@/features/owner/OwnerBookingsTable'
import { OwnerBookingsFilters } from '@/features/owner/OwnerBookingsFilters'
import { RejectBookingDialog } from '@/features/owner/RejectBookingDialog'
import { BookingDetailDialog } from '@/features/owner/BookingDetailDialog'
import { useOwnerStadiums } from '@/features/owner/useOwnerStadiums'
import { useOwnerBookings, useRejectBooking } from '@/hooks/queries/useBookingQueries'
import { usePageMeta } from '@/hooks/usePageMeta'
import { errorMessage } from '@/api'
import { BookingStatus } from '@/types'
import { toDateParam } from '@/utils/format'
import type {
  BookingStatusFilter,
  OwnerBookingsFilterState,
} from '@/features/owner/OwnerBookingsFilters'
import type { BookingStatusValue, OwnerBooking, OwnerBookingFilters } from '@/types'

const PAGE_SIZE = 15

const STATUS_VALUES: Record<BookingStatusFilter, BookingStatusValue | null> = {
  all: null,
  confirmed: BookingStatus.Confirmed,
  completed: BookingStatus.Completed,
  cancelled: BookingStatus.Cancelled,
}

const INITIAL_FILTERS: OwnerBookingsFilterState = {
  status: 'all',
  stadiumId: 'all',
  fromDate: null,
  toDate: null,
  search: '',
}

export default function OwnerBookingsPage() {
  usePageMeta({ title: 'Rezervasiyalar — Sahibkar paneli' })

  const stadiums = useOwnerStadiums()
  const rejectBooking = useRejectBooking()

  const [ui, setUi] = useState<OwnerBookingsFilterState>(INITIAL_FILTERS)
  const [page, setPage] = useState(1)
  const [detailTarget, setDetailTarget] = useState<OwnerBooking | null>(null)
  const [rejectTarget, setRejectTarget] = useState<OwnerBooking | null>(null)

  // Hər filtr dəyişikliyi səhifəni birinci səhifəyə qaytarır.
  function patchFilters(patch: Partial<OwnerBookingsFilterState>) {
    setUi((current) => ({ ...current, ...patch }))
    setPage(1)
  }

  const filters = useMemo<OwnerBookingFilters>(
    () => ({
      status: STATUS_VALUES[ui.status],
      stadiumId: ui.stadiumId === 'all' ? null : ui.stadiumId,
      fromDate: ui.fromDate ? toDateParam(ui.fromDate) : null,
      toDate: ui.toDate ? toDateParam(ui.toDate) : null,
      pageNumber: page,
      pageSize: PAGE_SIZE,
    }),
    [ui.status, ui.stadiumId, ui.fromDate, ui.toDate, page],
  )

  const query = useOwnerBookings(filters)
  const items = useMemo(() => query.data?.items ?? [], [query.data])

  // Axtarış backend-də dəstəklənmir — yalnız açıq səhifədəki adlar süzülür.
  const visible = useMemo(() => {
    const needle = ui.search.trim().toLocaleLowerCase('az')
    if (!needle) return items
    return items.filter((booking) =>
      (booking.customerName ?? '').toLocaleLowerCase('az').includes(needle),
    )
  }, [items, ui.search])

  const hasFilters =
    ui.status !== 'all' ||
    ui.stadiumId !== 'all' ||
    !!ui.fromDate ||
    !!ui.toDate ||
    !!ui.search

  function resetFilters() {
    setUi(INITIAL_FILTERS)
    setPage(1)
  }

  async function handleReject(booking: OwnerBooking, reason: string) {
    try {
      await rejectBooking.mutateAsync({ bookingId: booking.bookingId, reason })
      setRejectTarget(null)
    } catch {
      // Dialoq açıq qalır ki, yenidən cəhd etmək mümkün olsun.
    }
  }

  return (
    <div className="space-y-5">
      <OwnerPageHeader
        title="Rezervasiyalar"
        description="Bronlar avtomatik təsdiqlənir; lazım olsa başlamamış bronu səbəb göstərərək rədd et."
      />

      <OwnerBookingsFilters
        value={ui}
        stadiumOptions={stadiums.options}
        hasFilters={hasFilters}
        onChange={patchFilters}
        onReset={resetFilters}
      />

      <Card>
        <CardHeader
          title="Rezervasiya siyahısı"
          description={
            query.data
              ? `Cəmi ${query.data.totalCount} bron · ${page}/${Math.max(query.data.totalPages, 1)} səhifə`
              : 'Yüklənir…'
          }
        />
        <CardBody className="space-y-4">
          {query.isLoading ? (
            <SkeletonRows rows={6} columns={6} />
          ) : query.isError ? (
            <ErrorState
              title="Rezervasiyalar yüklənmədi"
              description={errorMessage(query.error)}
              onRetry={() => void query.refetch()}
            />
          ) : visible.length === 0 ? (
            <EmptyState
              icon={items.length ? <Search /> : hasFilters ? <CalendarX2 /> : <Ticket />}
              title={items.length ? 'Axtarışa uyğun müştəri yoxdur' : 'Rezervasiya tapılmadı'}
              description={
                items.length
                  ? 'Bu səhifədə yazdığın ada uyğun bron yoxdur. Axtarışı təmizlə və ya digər səhifəyə keç.'
                  : hasFilters
                    ? 'Seçilmiş filtrlərə uyğun bron yoxdur. Filtri sıfırlayıb yenidən yoxla.'
                    : 'Hələ heç kim stadionlarını bron etməyib. Elanı paylaş — ilk bron tez gələcək.'
              }
              action={
                hasFilters ? (
                  <Button variant="secondary" size="sm" onClick={resetFilters}>
                    Filtri sıfırla
                  </Button>
                ) : null
              }
              compact
            />
          ) : (
            <OwnerBookingsTable
              bookings={visible}
              busyId={rejectBooking.isPending ? (rejectTarget?.bookingId ?? null) : null}
              onOpen={setDetailTarget}
              onReject={setRejectTarget}
            />
          )}

          {query.data ? (
            <Pagination
              page={page}
              totalPages={query.data.totalPages}
              totalCount={query.data.totalCount}
              onChange={setPage}
            />
          ) : null}
        </CardBody>
      </Card>

      <BookingDetailDialog
        booking={detailTarget}
        onOpenChange={(open) => {
          if (!open) setDetailTarget(null)
        }}
      />

      <RejectBookingDialog
        booking={rejectTarget}
        loading={rejectBooking.isPending}
        onOpenChange={(open) => {
          if (!open) setRejectTarget(null)
        }}
        onSubmit={(booking, reason) => void handleReject(booking, reason)}
      />
    </div>
  )
}
