import { Link } from 'react-router-dom'
import { CalendarDays, CalendarClock, Gauge, MapPin, Plus, Star, Wallet } from 'lucide-react'
import { Button, EmptyState, ErrorState, InlineNote, Skeleton, StatCard } from '@/components/ui'
import { OwnerPageHeader } from '@/features/owner/OwnerPageHeader'
import { CountBarChart, RevenueAreaChart } from '@/features/owner/OwnerCharts'
import { useOwnerStadiums } from '@/features/owner/useOwnerStadiums'
import { useOwnerAnalytics } from '@/hooks/queries/useOwnerQueries'
import { usePageMeta } from '@/hooks/usePageMeta'
import { errorMessage } from '@/api'
import { formatNumber, formatPercent, formatPrice } from '@/utils/format'

/**
 * Bütün göstəricilər backend `GET /api/Analytics/owner` endpoint-indən gəlir:
 * Bakı təqviminə görə qruplaşdırılıb, ləğv edilən bronlar gəlirə daxil deyil.
 * Owner təsdiqi funksiyası silinib — "gözləyən bronlar" paneli artıq yoxdur.
 */
export default function OwnerOverviewPage() {
  usePageMeta({ title: 'Ümumi baxış — Sahibkar paneli' })

  const stadiums = useOwnerStadiums()
  const analyticsQuery = useOwnerAnalytics()

  const isLoading = analyticsQuery.isLoading || stadiums.isLoading

  if (analyticsQuery.isError) {
    return (
      <div className="space-y-5">
        <OwnerPageHeader title="Ümumi baxış" />
        <ErrorState
          title="Panel məlumatı yüklənmədi"
          description={errorMessage(analyticsQuery.error)}
          onRetry={() => void analyticsQuery.refetch()}
        />
      </div>
    )
  }

  if (!isLoading && stadiums.entries.length === 0) {
    return (
      <div className="space-y-5">
        <OwnerPageHeader
          title="Ümumi baxış"
          description="Panel real rezervasiya datası üzərində işləyir — ilk stadionu əlavə edən kimi rəqəmlər burada canlanacaq."
        />
        <EmptyState
          icon={<MapPin />}
          title="Hələ stadionun yoxdur"
          description="İlk meydançanı əlavə et: ad, ünvan, qiymət və iş saatları — 2 dəqiqəlik iş."
          action={
            <Button asChild>
              <Link to="/owner/stadiums/new">Stadion əlavə et</Link>
            </Button>
          }
        />
      </div>
    )
  }

  const analytics = analyticsQuery.data
  const kpis = analytics?.kpis

  return (
    <div className="space-y-5">
      <OwnerPageHeader
        title="Ümumi baxış"
        description="Göstəricilər backend analitika servisindən gəlir — son 6 ayın mənzərəsi, Bakı vaxtı ilə."
        action={
          <Button asChild>
            <Link to="/owner/stadiums/new">
              <Plus />
              Stadion əlavə et
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Bugünkü bronlar"
          value={formatNumber(kpis?.todayBookings ?? 0)}
          hint="Bu gün başlayan rezervasiyalar"
          icon={<CalendarDays />}
          loading={isLoading}
        />
        <StatCard
          label="Gələcək bronlar"
          value={formatNumber(kpis?.upcomingBookings ?? 0)}
          hint="Başlama vaxtı hələ çatmayıb"
          icon={<CalendarClock />}
          loading={isLoading}
        />
        <StatCard
          label="Bu ayın gəliri"
          value={formatPrice(kpis?.revenueThisMonth ?? 0)}
          hint="Ləğv edilənlər sayılmır"
          icon={<Wallet />}
          tone="brand"
          loading={isLoading}
        />
        <StatCard
          label="Doluluk"
          value={formatPercent(kpis?.occupancyRate ?? 0)}
          hint="Bu ayın iş saatlarına nisbətən"
          icon={<Gauge />}
          loading={isLoading}
        />
        <StatCard
          label="Orta reytinq"
          value={kpis?.totalReviews ? kpis.averageRating.toFixed(1) : '—'}
          hint={kpis?.totalReviews ? `${formatNumber(kpis.totalReviews)} rəy` : 'Hələ rəy yoxdur'}
          icon={<Star />}
          loading={isLoading}
        />
      </div>

      {isLoading || !analytics ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-[17rem] w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <RevenueAreaChart
            title="Gəlir (aylıq)"
            description="Son 6 ay, manatla"
            data={analytics.revenueByMonth}
            emptyLabel="Bu dövrdə gəlir qeydə alınmayıb"
            formatter={(value) => formatPrice(value)}
          />
          <CountBarChart
            title="Rezervasiyalar (aylıq)"
            description="Son 6 ayda bronların sayı"
            data={analytics.bookingsByMonth}
            emptyLabel="Bu dövrdə rezervasiya yoxdur"
            formatter={(value) => `${formatNumber(value)} bron`}
          />
          <CountBarChart
            title="Həftənin günləri üzrə bronlar"
            description="Hansı günlər daha çox dolur"
            data={analytics.bookingsByWeekday}
            emptyLabel="Gün üzrə paylanma üçün data yoxdur"
            formatter={(value) => `${formatNumber(value)} bron`}
          />
          <CountBarChart
            title="Pik saatlar"
            description="Bronların başlama saatı üzrə paylanması"
            data={analytics.peakHours}
            emptyLabel="Saat üzrə paylanma üçün data yoxdur"
            formatter={(value) => `${formatNumber(value)} bron`}
          />
        </div>
      )}

      <InlineNote tone="info">
        Rezervasiyalar avtomatik təsdiqlənir və vaxtı bitəndə sistem onları «Tamamlandı» statusuna
        keçirir. Doluluk göstəricisi stadionların iş saatları və bu ayın keçmiş günləri əsasında
        hesablanır.
      </InlineNote>
    </div>
  )
}
