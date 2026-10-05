import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { addDays, eachDayOfInterval, endOfWeek, setHours, startOfDay, startOfWeek } from 'date-fns'
import { CalendarRange, MapPin } from 'lucide-react'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  InlineNote,
  Skeleton,
} from '@/components/ui'
import { OwnerPageHeader } from '@/features/owner/OwnerPageHeader'
import { CalendarGrid, CalendarLegend } from '@/features/owner/CalendarGrid'
import { CalendarToolbar } from '@/features/owner/CalendarToolbar'
import { buildCalendarColumns, resolveHours } from '@/features/owner/calendarModel'
import { useOwnerStadiums } from '@/features/owner/useOwnerStadiums'
import { useAvailableSlots, useOwnerBookings } from '@/hooks/queries/useBookingQueries'
import { useBlockSlot, useBlockedSlots, useUnblockSlot } from '@/hooks/queries/useOwnerQueries'
import { usePageMeta } from '@/hooks/usePageMeta'
import { errorMessage } from '@/api'
import { bakuToday, formatDate, toDateParam, toWallClockIso } from '@/utils/format'
import type { CalendarCell } from '@/features/owner/CalendarGrid'
import type { CalendarView } from '@/features/owner/CalendarToolbar'

export default function OwnerCalendarPage() {
  usePageMeta({ title: 'Təqvim — Sahibkar paneli' })

  const stadiums = useOwnerStadiums()
  const [stadiumId, setStadiumId] = useState('')
  const [view, setView] = useState<CalendarView>('day')
  // "Bugün" Bakı təqviminə görə götürülür — brauzer qurşağından asılı deyil.
  const [date, setDate] = useState(() => bakuToday())
  const [blockTarget, setBlockTarget] = useState<CalendarCell | null>(null)
  const [unblockTarget, setUnblockTarget] = useState<CalendarCell | null>(null)

  // Səhifə açılanda ilk stadion avtomatik seçilir.
  useEffect(() => {
    const first = stadiums.options[0]
    if (!stadiumId && first) setStadiumId(first.value)
  }, [stadiums.options, stadiumId])

  const days = useMemo(
    () =>
      view === 'day'
        ? [startOfDay(date)]
        : eachDayOfInterval({
            start: startOfWeek(date, { weekStartsOn: 1 }),
            end: endOfWeek(date, { weekStartsOn: 1 }),
          }),
    [view, date],
  )

  const firstDay = days[0] ?? startOfDay(date)
  const lastDay = days[days.length - 1] ?? firstDay

  const slotsQuery = useAvailableSlots(stadiumId || undefined, toDateParam(firstDay))
  const blockedQuery = useBlockedSlots(stadiumId || undefined)
  const bookingsQuery = useOwnerBookings(
    {
      status: null,
      stadiumId: stadiumId || null,
      // Sərhəd günü kənarda qalmasın deyə ToDate bir gün irəli verilir.
      fromDate: toDateParam(firstDay),
      toDate: toDateParam(addDays(lastDay, 1)),
      pageNumber: 1,
      pageSize: 100,
    },
    !!stadiumId,
  )

  const blockSlot = useBlockSlot(stadiumId)
  const unblockSlot = useUnblockSlot(stadiumId)

  const stadium = useMemo(
    () => stadiums.entries.find((entry) => entry.id === stadiumId)?.stadium ?? null,
    [stadiums.entries, stadiumId],
  )

  const hours = useMemo(() => resolveHours(stadium), [stadium])

  const columns = useMemo(
    () =>
      buildCalendarColumns({
        days,
        hours,
        bookings: bookingsQuery.data?.items ?? [],
        blockedSlots: blockedQuery.data ?? [],
        slots: slotsQuery.data ?? [],
        slotsDay: firstDay,
      }),
    [days, hours, bookingsQuery.data, blockedQuery.data, slotsQuery.data, firstDay],
  )

  const isLoading = stadiums.isLoading || bookingsQuery.isLoading || blockedQuery.isLoading
  const conflicts = columns.flatMap((column) =>
    column.cells.filter((cell) => cell.state === 'conflict'),
  )

  async function handleBlock() {
    if (!blockTarget) return
    const start = setHours(startOfDay(blockTarget.day), blockTarget.hour)
    const end = setHours(startOfDay(blockTarget.day), blockTarget.hour + 1)
    try {
      await blockSlot.mutateAsync({
        startTime: toWallClockIso(start),
        endTime: toWallClockIso(end),
        reason: 'Təqvimdən bloklandı',
      })
      setBlockTarget(null)
    } catch {
      // Xəta toast kimi göstərilir.
    }
  }

  async function handleUnblock() {
    if (!unblockTarget?.blocked) return
    try {
      await unblockSlot.mutateAsync(unblockTarget.blocked.id)
      setUnblockTarget(null)
    } catch {
      // Dialoq açıq qalır.
    }
  }

  function handleSelect(cell: CalendarCell) {
    if (cell.state === 'free') setBlockTarget(cell)
    else if (cell.blocked) setUnblockTarget(cell)
  }

  if (!stadiums.isLoading && stadiums.options.length === 0) {
    // Stadion var, amma id yoxdursa səbəb backend-dir — istifadəçiyə düzgün izah verilir.
    const hasStadiumsWithoutId = stadiums.entries.length > 0

    return (
      <div className="space-y-5">
        <OwnerPageHeader title="Təqvim" />
        {hasStadiumsWithoutId ? (
          <InlineNote tone="warning">
            Stadionların var, amma backend «mənim stadionlarım» cavabında stadion id-si qaytarmır və
            heç bir rezervasiya da yoxdur — id yalnız bron datasından bərpa oluna bilir. İlk bron
            gələn kimi təqvim işləyəcək.
          </InlineNote>
        ) : (
          <EmptyState
            icon={<MapPin />}
            title="Təqvim üçün stadion lazımdır"
            description="Ən azı bir stadion əlavə et — cədvəl həmin stadionun iş saatlarından qurulur."
            action={
              <Button asChild>
                <Link to="/owner/stadiums/new">Stadion əlavə et</Link>
              </Button>
            }
          />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <OwnerPageHeader
        title="Təqvim"
        description="Bron, blok və boş saatlar bir cədvəldə. Boş xanaya toxunub vaxtı blokla, bloklanmış xanadan bloku götür."
      />

      <CalendarToolbar
        stadiumId={stadiumId}
        stadiumOptions={stadiums.options}
        date={date}
        view={view}
        onStadiumChange={setStadiumId}
        onDateChange={setDate}
        onViewChange={setView}
      />

      <Card>
        <CardHeader
          title={view === 'day' ? formatDate(firstDay) : 'Həftəlik cədvəl'}
          description={
            stadium
              ? `İş saatları: ${stadium.openTime?.slice(0, 5)}–${stadium.closeTime?.slice(0, 5)}`
              : undefined
          }
          action={<CalendarLegend />}
        />
        <CardBody className="space-y-4">
          {conflicts.length ? (
            <InlineNote tone="danger">
              {conflicts.length} xanada həm bron, həm blok var. Toqquşan saatları yoxla — müştəri
              gəldiyi halda meydança bağlı ola bilər.
            </InlineNote>
          ) : null}

          {isLoading ? (
            <Skeleton className="h-96 w-full rounded-lg" />
          ) : bookingsQuery.isError ? (
            <ErrorState
              title="Cədvəl yüklənmədi"
              description={errorMessage(bookingsQuery.error)}
              onRetry={() => void bookingsQuery.refetch()}
            />
          ) : hours.length === 0 ? (
            <EmptyState
              icon={<CalendarRange />}
              title="İş saatları oxunmadı"
              description="Stadionun açılış və bağlanış saatını redaktə səhifəsindən düzəlt — cədvəl bu aralıqdan qurulur."
              compact
            />
          ) : (
            <CalendarGrid columns={columns} hours={hours} onSelect={handleSelect} />
          )}
        </CardBody>
      </Card>

      <ConfirmDialog
        open={!!blockTarget}
        onOpenChange={(open) => {
          if (!open) setBlockTarget(null)
        }}
        title="Vaxtı blokla"
        description={
          blockTarget
            ? `${formatDate(blockTarget.day)}, ${String(blockTarget.hour).padStart(2, '0')}:00–${String(
                blockTarget.hour + 1,
              ).padStart(2, '0')}:00 aralığı istifadəçilərə bağlanacaq.`
            : undefined
        }
        confirmLabel="Blokla"
        tone="primary"
        loading={blockSlot.isPending}
        onConfirm={() => void handleBlock()}
      />

      <ConfirmDialog
        open={!!unblockTarget}
        onOpenChange={(open) => {
          if (!open) setUnblockTarget(null)
        }}
        title="Bloku götür"
        description="Bu interval yenidən bron üçün açılacaq."
        confirmLabel="Bloku götür"
        loading={unblockSlot.isPending}
        onConfirm={() => void handleUnblock()}
      />
    </div>
  )
}
