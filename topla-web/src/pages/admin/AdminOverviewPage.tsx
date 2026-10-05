import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  CheckCheck,
  MapPin,
  Star,
  Ticket,
  UserCheck,
  Users,
} from 'lucide-react'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  ErrorState,
  SkeletonRows,
  StatCard,
} from '@/components/ui'
import { AdminPageHeader } from '@/features/admin/AdminPageHeader'
import { OwnerRequestCards } from '@/features/admin/OwnerRequestTable'
import { OwnerRequestDialogs } from '@/features/admin/OwnerRequestDialogs'
import { useOwnerRequestModeration } from '@/features/admin/useOwnerRequestModeration'
import { useOwnerRequests, usePlatformStats } from '@/hooks/queries/useAdminQueries'
import { usePageMeta } from '@/hooks/usePageMeta'
import { errorMessage } from '@/api'
import { formatNumber } from '@/utils/format'
import { ApprovalStatus } from '@/types'

const SECTIONS = [
  {
    to: '/admin/owner-requests',
    label: 'Sahibkar sorğuları',
    description: 'Müraciətləri təsdiqlə və ya rədd et',
    icon: UserCheck,
  },
  {
    to: '/admin/stadiums',
    label: 'Stadionlar',
    description: 'Kataloqu yoxla, verifikasiyanı dəyiş',
    icon: MapPin,
  },
  {
    to: '/admin/bookings',
    label: 'Rezervasiyalar',
    description: 'Platforma üzrə bütün bronlar',
    icon: Ticket,
  },
  {
    to: '/admin/users',
    label: 'İstifadəçilər',
    description: 'Blok və blokdan çıxarma',
    icon: Users,
  },
  { to: '/admin/reviews', label: 'Rəylər', description: 'Rəy moderasiyası', icon: Star },
  { to: '/admin/stats', label: 'Statistika', description: 'Platforma göstəriciləri', icon: BarChart3 },
]

export default function AdminOverviewPage() {
  usePageMeta({ title: 'Ümumi baxış — Admin' })

  const stats = usePlatformStats()
  const queue = useOwnerRequests(1, 5)
  const moderation = useOwnerRequestModeration()

  const pending = (queue.data?.items ?? []).filter(
    (request) => request.status === ApprovalStatus.Pending,
  )
  const statValue = (value: number | undefined) =>
    stats.isError || value == null ? '—' : formatNumber(value)

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Ümumi baxış"
        description="Moderasiya növbəsi və platformanın əsas göstəriciləri. İş buradan başlayır."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Gözləyən owner sorğuları"
          value={statValue(stats.data?.pendingOwnerRequests)}
          hint="Moderasiya növbəsindəki müraciətlər"
          icon={<UserCheck />}
          tone={stats.data?.pendingOwnerRequests ? 'warning' : 'default'}
          loading={stats.isLoading}
        />
        <StatCard
          label="Ümumi rezervasiyalar"
          value={statValue(stats.data?.totalBookings)}
          hint="Platforma üzrə bütün bronlar"
          icon={<Ticket />}
          loading={stats.isLoading}
        />
        <StatCard
          label="Dərc olunmuş stadionlar"
          value={statValue(stats.data?.publishedStadiums)}
          hint="Aktiv və təsdiqlənmiş stadionlar"
          icon={<MapPin />}
          loading={stats.isLoading}
        />
      </div>

      <Card>
        <CardHeader
          title="Növbədə"
          description="Ən son gələn owner müraciətləri — buradan birbaşa cavablandıra bilərsən."
          action={
            <Button asChild variant="secondary" size="sm">
              <Link to="/admin/owner-requests">
                Hamısına bax
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          }
        />
        <CardBody>
          {queue.isLoading ? (
            <SkeletonRows rows={3} columns={4} />
          ) : queue.isError ? (
            <ErrorState
              title="Növbə yüklənmədi"
              description={errorMessage(queue.error)}
              onRetry={() => void queue.refetch()}
            />
          ) : pending.length === 0 ? (
            <EmptyState
              icon={<CheckCheck />}
              title="Növbə təmizdir"
              description="Cavab gözləyən owner sorğusu yoxdur. Yeni müraciət gələn kimi burada görünəcək."
              compact
            />
          ) : (
            <OwnerRequestCards
              requests={pending}
              onApprove={moderation.setApproveTarget}
              onReject={moderation.setRejectTarget}
              onDetail={moderation.setDetailTarget}
              busyId={moderation.busyId}
              busy={moderation.busy}
            />
          )}
        </CardBody>
      </Card>

      <section aria-label="Bölmələr">
        <h3 className="mb-3 text-sm font-bold text-ink-900">Bölmələr</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SECTIONS.map((section) => (
            <Link
              key={section.to}
              to={section.to}
              className="card-hover flex items-center gap-3 rounded-lg border border-line bg-surface p-4 shadow-card"
            >
              <span
                className="grid size-9 shrink-0 place-items-center rounded-md bg-ink-900 text-white"
                aria-hidden="true"
              >
                <section.icon className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[13.5px] font-bold text-ink-900">
                  {section.label}
                </span>
                <span className="block truncate text-xs text-ink-500">{section.description}</span>
              </span>
              <ArrowRight className="ml-auto size-4 shrink-0 text-ink-400" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <OwnerRequestDialogs moderation={moderation} />
    </div>
  )
}
