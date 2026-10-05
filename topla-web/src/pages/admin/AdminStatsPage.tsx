import { MapPin, ShieldAlert, Ticket, UserCheck, Users, Wallet } from 'lucide-react'
import { Card, CardBody, CardHeader, ErrorState, Skeleton, StatCard } from '@/components/ui'
import { BookingStatusBadge } from '@/components/common/StatusBadge'
import { AdminPageHeader } from '@/features/admin/AdminPageHeader'
import { CountBarChart, RevenueAreaChart } from '@/features/owner/OwnerCharts'
import { usePlatformStats } from '@/hooks/queries/useAdminQueries'
import { usePageMeta } from '@/hooks/usePageMeta'
import { errorMessage } from '@/api'
import { formatNumber, formatPrice } from '@/utils/format'
import type { BookingUiStatus } from '@/types'

/**
 * Bütün göstəricilər real `GET /api/Analytics/platform` endpoint-indən gəlir:
 * aylar Bakı təqviminə görə qruplaşdırılıb, ləğv edilən bronlar gəlirə daxil deyil.
 * Dövr: son 6 ay (backend default-u).
 */
export default function AdminStatsPage() {
  usePageMeta({ title: 'Statistika — Admin' })

  const stats = usePlatformStats()

  const analytics = stats.data?.analytics
  const kpis = analytics?.kpis

  const statValue = (value: number | undefined) =>
    stats.isError || value == null ? '—' : formatNumber(value)

  const statusTiles: { state: BookingUiStatus; value: number }[] = kpis
    ? [
        { state: 'confirmed', value: kpis.confirmedBookings },
        { state: 'completed', value: kpis.completedBookings },
        { state: 'cancelled', value: kpis.cancelledBookings },
        {
          state: 'pending',
          value: Math.max(
            0,
            kpis.totalBookings -
              kpis.confirmedBookings -
              kpis.completedBookings -
              kpis.cancelledBookings,
          ),
        },
      ]
    : []

  if (stats.isError) {
    return (
      <div className="space-y-5">
        <AdminPageHeader title="Statistika" />
        <ErrorState
          title="Analitika yüklənmədi"
          description={errorMessage(stats.error)}
          onRetry={() => void stats.refetch()}
        />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Statistika"
        description="Real analitika endpoint-indən (son 6 ay, Bakı vaxtı ilə). Gəlirə ləğv edilən bronlar daxil deyil."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="İstifadəçilər"
          value={statValue(kpis?.totalUsers)}
          hint="Qeydiyyatdan keçənlər"
          icon={<Users />}
          loading={stats.isLoading}
        />
        <StatCard
          label="Biznes hesabları"
          value={statValue(kpis?.totalOwners)}
          hint="Sahibkar profilləri"
          icon={<UserCheck />}
          loading={stats.isLoading}
        />
        <StatCard
          label="Dərc olunmuş stadionlar"
          value={statValue(kpis?.publishedStadiums)}
          hint="Aktiv və təsdiqlənmiş"
          icon={<MapPin />}
          loading={stats.isLoading}
        />
        <StatCard
          label="Moderasiya növbəsi"
          value={statValue(
            kpis ? kpis.pendingStadiums + kpis.pendingOwnerRequests : undefined,
          )}
          hint="Gözləyən stadion + sahibkar sorğusu"
          icon={<ShieldAlert />}
          tone={
            kpis && kpis.pendingStadiums + kpis.pendingOwnerRequests > 0
              ? 'warning'
              : 'default'
          }
          loading={stats.isLoading}
        />
        <StatCard
          label="Rezervasiyalar"
          value={statValue(kpis?.totalBookings)}
          hint="Seçilmiş dövr üzrə"
          icon={<Ticket />}
          loading={stats.isLoading}
        />
        <StatCard
          label="Gəlir"
          value={kpis ? formatPrice(kpis.revenueTotal) : '—'}
          hint="Dövr üzrə, ləğvlər çıxılıb"
          icon={<Wallet />}
          tone="brand"
          loading={stats.isLoading}
        />
      </div>

      {stats.isLoading || !analytics ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-[19rem] w-full rounded-lg" />
          <Skeleton className="h-[19rem] w-full rounded-lg" />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <CountBarChart
            title="Rezervasiyalar (aylıq)"
            description="Platforma üzrə bütün bronlar, Bakı təqvimi ilə"
            data={analytics.bookingsByMonth}
            emptyLabel="Bu dövrdə rezervasiya yoxdur"
            formatter={(value) => `${formatNumber(value)} rezervasiya`}
          />
          <RevenueAreaChart
            title="Gəlir (aylıq)"
            description="Ləğv edilən bronlar daxil deyil"
            data={analytics.revenueByMonth}
            emptyLabel="Bu dövrdə gəlir qeydə alınmayıb"
            formatter={(value) => formatPrice(value)}
          />
        </div>
      )}

      <Card>
        <CardHeader
          title="Status paylanması"
          description="Seçilmiş dövrdəki bronların backend statusları."
        />
        <CardBody>
          {stats.isLoading ? (
            <Skeleton className="h-16 w-full rounded-md" />
          ) : !kpis || kpis.totalBookings === 0 ? (
            <p className="text-[13px] text-ink-500">Hesablamaq üçün rezervasiya yoxdur.</p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {statusTiles.map((tile) => (
                <li
                  key={tile.state}
                  className="flex items-center justify-between gap-3 rounded-md border border-line bg-ink-50/50 px-3.5 py-3"
                >
                  <BookingStatusBadge status={tile.state} />
                  <span className="text-lg font-bold tabular-nums text-ink-900">
                    {formatNumber(tile.value)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
