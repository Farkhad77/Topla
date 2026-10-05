import { useMemo, useState } from 'react'
import {
  differenceInCalendarDays,
  eachDayOfInterval,
  eachMonthOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from 'date-fns'
import { az } from 'date-fns/locale'
import { CalendarX2, Receipt, Ticket, Wallet } from 'lucide-react'
import { ErrorState, InlineNote, Skeleton, StatCard } from '@/components/ui'
import { OwnerPageHeader } from '@/features/owner/OwnerPageHeader'
import { CountBarChart, RevenueAreaChart } from '@/features/owner/OwnerCharts'
import {
  REVENUE_PERIOD_LABELS,
  RevenuePeriodFilter,
} from '@/features/owner/RevenuePeriodFilter'
import { OWNER_BOOKINGS_SAMPLE } from '@/features/owner/useOwnerStadiums'
import { useOwnerBookings } from '@/hooks/queries/useBookingQueries'
import { usePageMeta } from '@/hooks/usePageMeta'
import { errorMessage } from '@/api'
import { BookingStatus } from '@/types'
import { bakuNow, formatNumber, formatPrice, toDate } from '@/utils/format'
import type { RevenuePeriod } from '@/features/owner/RevenuePeriodFilter'
import type { OwnerBooking, TimeSeriesPoint } from '@/types'

/** Bu qədər gündən qısa interval günlük, uzun interval aylıq buketlərlə göstərilir. */
const DAY_LIMIT = 62

interface DatedBooking {
  booking: OwnerBooking
  start: Date
}

function periodRange(period: RevenuePeriod): { from: Date | null; to: Date | null } {
  // Dövrlər (bugün/həftə/ay/il) Bakı təqviminə görə hesablanır.
  const now = bakuNow()
  if (period === 'today') return { from: startOfDay(now), to: endOfDay(now) }
  if (period === 'week') {
    return { from: startOfWeek(now, { weekStartsOn: 1 }), to: endOfWeek(now, { weekStartsOn: 1 }) }
  }
  if (period === 'month') return { from: startOfMonth(now), to: endOfMonth(now) }
  if (period === 'year') return { from: startOfYear(now), to: endOfYear(now) }
  return { from: null, to: null }
}

function buildSeries(entries: DatedBooking[], from: Date, to: Date): TimeSeriesPoint[] {
  const useDays = differenceInCalendarDays(to, from) <= DAY_LIMIT
  const keyOf = (date: Date) => format(date, useDays ? 'yyyy-MM-dd' : 'yyyy-MM')
  const labelOf = (date: Date) => format(date, useDays ? 'd MMM' : 'LLL yy', { locale: az })

  const totals = new Map<string, number>()
  entries.forEach((entry) => {
    const key = keyOf(entry.start)
    totals.set(key, (totals.get(key) ?? 0) + entry.booking.totalPrice)
  })

  const steps = useDays
    ? eachDayOfInterval({ start: from, end: to })
    : eachMonthOfInterval({ start: from, end: to })

  return steps.map((step) => ({
    label: labelOf(step),
    value: Math.round(totals.get(keyOf(step)) ?? 0),
  }))
}

export default function OwnerRevenuePage() {
  usePageMeta({ title: 'Gəlir — Sahibkar paneli' })

  const query = useOwnerBookings(OWNER_BOOKINGS_SAMPLE)
  const [period, setPeriod] = useState<RevenuePeriod>('month')
  const [customFrom, setCustomFrom] = useState<Date | null>(null)
  const [customTo, setCustomTo] = useState<Date | null>(null)

  const hasCustomRange = !!customFrom && !!customTo

  const dated = useMemo<DatedBooking[]>(
    () =>
      (query.data?.items ?? [])
        .map((booking) => ({ booking, start: toDate(booking.startDateTime) }))
        .filter((entry): entry is DatedBooking => entry.start !== null),
    [query.data],
  )

  const range = useMemo(() => {
    if (customFrom && customTo) return { from: startOfDay(customFrom), to: endOfDay(customTo) }
    return periodRange(period)
  }, [period, customFrom, customTo])

  const filtered = useMemo(
    () =>
      dated.filter((entry) => {
        if (range.from && entry.start < range.from) return false
        if (range.to && entry.start > range.to) return false
        return true
      }),
    [dated, range],
  )

  const paid = useMemo(
    () => filtered.filter((entry) => entry.booking.status !== BookingStatus.Cancelled),
    [filtered],
  )

  const totals = useMemo(() => {
    const revenue = paid.reduce((sum, entry) => sum + entry.booking.totalPrice, 0)
    return {
      revenue,
      bookings: filtered.length,
      cancelled: filtered.length - paid.length,
      average: paid.length ? revenue / paid.length : 0,
    }
  }, [filtered, paid])

  const series = useMemo(() => {
    if (!paid.length) return []
    const times = paid.map((entry) => entry.start.getTime())
    const from = range.from ?? new Date(Math.min(...times))
    const to = range.to ?? new Date(Math.max(...times))
    if (to < from) return []
    return buildSeries(paid, from, to)
  }, [paid, range])

  const byStadium = useMemo<TimeSeriesPoint[]>(() => {
    const totalsByName = new Map<string, number>()
    paid.forEach((entry) => {
      const name = entry.booking.stadiumName || 'Adsız stadion'
      totalsByName.set(name, (totalsByName.get(name) ?? 0) + entry.booking.totalPrice)
    })
    return [...totalsByName.entries()]
      .map(([label, value]) => ({ label, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)
  }, [paid])

  const periodLabel = hasCustomRange ? 'seçilmiş aralıq' : REVENUE_PERIOD_LABELS[period]

  if (query.isError) {
    return (
      <div className="space-y-5">
        <OwnerPageHeader title="Gəlir" />
        <ErrorState
          title="Gəlir məlumatı yüklənmədi"
          description={errorMessage(query.error)}
          onRetry={() => void query.refetch()}
        />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <OwnerPageHeader
        title="Gəlir"
        description="Bütün rəqəmlər real rezervasiya datasından hesablanır — ləğv edilmiş bronlar gəlirə daxil edilmir."
      />

      <RevenuePeriodFilter
        period={period}
        from={customFrom}
        to={customTo}
        onPeriodChange={setPeriod}
        onFromChange={setCustomFrom}
        onToChange={setCustomTo}
        onClearRange={() => {
          setCustomFrom(null)
          setCustomTo(null)
        }}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={`Gəlir (${periodLabel})`}
          value={formatPrice(totals.revenue)}
          hint="Ləğv edilənlər çıxılıb"
          icon={<Wallet />}
          tone="brand"
          loading={query.isLoading}
        />
        <StatCard
          label="Rezervasiya sayı"
          value={formatNumber(totals.bookings)}
          hint="Bütün statuslar"
          icon={<Ticket />}
          loading={query.isLoading}
        />
        <StatCard
          label="Orta çek"
          value={totals.average ? formatPrice(totals.average) : '—'}
          hint="Bir bron üzrə orta məbləğ"
          icon={<Receipt />}
          loading={query.isLoading}
        />
        <StatCard
          label="Ləğv edilənlər"
          value={formatNumber(totals.cancelled)}
          hint="Gəlirə daxil deyil"
          icon={<CalendarX2 />}
          tone={totals.cancelled > 0 ? 'warning' : 'default'}
          loading={query.isLoading}
        />
      </div>

      {query.isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-[17rem] w-full rounded-lg" />
          <Skeleton className="h-[17rem] w-full rounded-lg" />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <RevenueAreaChart
            title="Gəlir dinamikası"
            description={`Seçilmiş dövr: ${periodLabel}`}
            data={series}
            emptyLabel="Bu dövrdə gəlir qeydə alınmayıb"
            formatter={(value) => formatPrice(value)}
          />
          <CountBarChart
            title="Stadionlar üzrə gəlir"
            description="Ən çox gəlir gətirən 6 meydança"
            data={byStadium}
            emptyLabel="Bu dövrdə heç bir stadion gəlir gətirməyib"
            formatter={(value) => formatPrice(value)}
          />
        </div>
      )}

      <InlineNote tone="info">
        Hesablama son 100 rezervasiya üzərində aparılır — backend gəlir üzrə ayrıca analitika
        endpoint-i vermir. Daha uzun tarixçə lazım olanda bu bölmə real API-yə keçəcək.
      </InlineNote>
    </div>
  )
}
