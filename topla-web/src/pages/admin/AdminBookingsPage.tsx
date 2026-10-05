import { useMemo, useState } from 'react'
import { Search, Ticket } from 'lucide-react'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  ErrorState,
  InlineNote,
  Input,
  Pagination,
  Segmented,
  SkeletonRows,
} from '@/components/ui'
import { AdminPageHeader } from '@/features/admin/AdminPageHeader'
import { BookingTable, type BookingRow } from '@/features/admin/BookingTable'
import { useAdminBookings } from '@/hooks/queries/useBookingQueries'
import { usePageMeta } from '@/hooks/usePageMeta'
import { errorMessage } from '@/api'
import { resolveBookingState } from '@/utils/booking'
import type { BookingUiStatus } from '@/types'

const PAGE_SIZE = 15

// «rejected» burada yaranmır: bu endpoint rədd səbəbini qaytarmır.
type BookingFilter = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'

export default function AdminBookingsPage() {
  usePageMeta({ title: 'Rezervasiyalar — Admin' })

  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState<BookingFilter>('all')
  const [search, setSearch] = useState('')
  const query = useAdminBookings(page, PAGE_SIZE)

  const rows = useMemo<BookingRow[]>(
    () =>
      (query.data?.items ?? []).map((booking) => ({
        booking,
        state: resolveBookingState({ status: booking.status, endDateTime: booking.endDateTime }),
      })),
    [query.data],
  )

  const visible = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase('az')
    return rows.filter((row) => {
      if (filter !== 'all' && row.state !== filter) return false
      if (!needle) return true
      return [row.booking.stadiumName, row.booking.userId, row.booking.id].some((value) =>
        (value ?? '').toLocaleLowerCase('az').includes(needle),
      )
    })
  }, [rows, filter, search])

  const countOf = (state: BookingUiStatus) => rows.filter((row) => row.state === state).length

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Rezervasiyalar"
        description="Platforma üzrə bütün bronlar. Status backend dəyərindən və oyun vaxtından hesablanır."
      />

      <Card>
        <CardHeader
          title="Bütün rezervasiyalar"
          description={
            query.data
              ? `Cəmi ${query.data.totalCount} bron · ${page}/${Math.max(query.data.totalPages, 1)} səhifə`
              : 'Yüklənir…'
          }
          action={
            <div className="w-64 max-w-full sm:w-72">
              <Input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Bu səhifədə axtar: stadion, id"
                aria-label="Bu səhifədə rezervasiya axtar"
                leading={<Search />}
              />
            </div>
          }
        />

        <CardBody className="space-y-4">
          <div className="space-y-2">
            {/* Mobil ekranda çip sırası kəsilməsin deyə üfüqi sürüşür. */}
            <div className="w-full overflow-x-auto pb-1">
              <Segmented
                value={filter}
                onChange={setFilter}
                ariaLabel="Status üzrə filtr"
                options={[
                  { value: 'all', label: 'Hamısı', count: rows.length },
                  { value: 'pending', label: 'Gözləyir', count: countOf('pending') },
                  { value: 'confirmed', label: 'Təsdiqlənib', count: countOf('confirmed') },
                  { value: 'completed', label: 'Tamamlandı', count: countOf('completed') },
                  { value: 'cancelled', label: 'Ləğv edilib', count: countOf('cancelled') },
                ]}
              />
            </div>
            <p className="text-xs text-ink-500">
              Filtr və axtarış <strong className="font-semibold text-ink-700">bu səhifədə</strong>{' '}
              işləyir — backend süzgəc dəstəkləmir.
            </p>
          </div>

          {query.isLoading ? (
            <SkeletonRows rows={8} columns={5} />
          ) : query.isError ? (
            <ErrorState
              title="Rezervasiyalar yüklənmədi"
              description={errorMessage(query.error)}
              onRetry={() => void query.refetch()}
            />
          ) : visible.length === 0 ? (
            <EmptyState
              icon={<Ticket />}
              title={rows.length ? 'Bu səhifədə uyğun bron yoxdur' : 'Rezervasiya yoxdur'}
              description={
                rows.length
                  ? 'Seçdiyin filtrə uyğun nəticə tapılmadı. Filtri sıfırla və ya başqa səhifəyə keç.'
                  : 'Platformada hələ rezervasiya edilməyib.'
              }
              action={
                rows.length ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setFilter('all')
                      setSearch('')
                    }}
                  >
                    Filtri sıfırla
                  </Button>
                ) : null
              }
              compact
            />
          ) : (
            <BookingTable rows={visible} />
          )}

          {query.data ? (
            <Pagination
              page={page}
              totalPages={query.data.totalPages}
              totalCount={query.data.totalCount}
              onChange={setPage}
            />
          ) : null}

          <InlineNote tone="info">
            «Tamamlandı» statusu backend-də yoxdur — təsdiqlənmiş və vaxtı keçmiş bronlar üçün
            interfeysdə hesablanır.
          </InlineNote>
        </CardBody>
      </Card>
    </div>
  )
}
