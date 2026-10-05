import { useMemo, useState } from 'react'
import { Inbox, UserCheck } from 'lucide-react'
import {
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  ErrorState,
  InlineNote,
  Pagination,
  Segmented,
  SkeletonRows,
} from '@/components/ui'
import { AdminPageHeader } from '@/features/admin/AdminPageHeader'
import { OwnerRequestDialogs } from '@/features/admin/OwnerRequestDialogs'
import { OwnerRequestTable } from '@/features/admin/OwnerRequestTable'
import { useOwnerRequestModeration } from '@/features/admin/useOwnerRequestModeration'
import { useOwnerRequests } from '@/hooks/queries/useAdminQueries'
import { usePageMeta } from '@/hooks/usePageMeta'
import { errorMessage } from '@/api'
import { ApprovalStatus, type ApprovalStatusValue, type OwnerRequest } from '@/types'

const PAGE_SIZE = 10

type StatusFilter = 'pending' | 'approved' | 'rejected' | 'all'

const FILTER_STATUS: Record<Exclude<StatusFilter, 'all'>, ApprovalStatusValue> = {
  pending: ApprovalStatus.Pending,
  approved: ApprovalStatus.Approved,
  rejected: ApprovalStatus.Rejected,
}

function countBy(requests: OwnerRequest[], filter: StatusFilter): number {
  if (filter === 'all') return requests.length
  return requests.filter((request) => request.status === FILTER_STATUS[filter]).length
}

export default function AdminOwnerRequestsPage() {
  usePageMeta({ title: 'Sahibkar sorğuları — Admin' })

  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState<StatusFilter>('pending')
  const query = useOwnerRequests(page, PAGE_SIZE)
  const moderation = useOwnerRequestModeration()

  const items = useMemo(() => query.data?.items ?? [], [query.data])
  const visible = useMemo(
    () =>
      filter === 'all'
        ? items
        : items.filter((request) => request.status === FILTER_STATUS[filter]),
    [items, filter],
  )

  const options = [
    { value: 'pending' as const, label: 'Gözləyən', count: countBy(items, 'pending') },
    { value: 'approved' as const, label: 'Təsdiqlənən', count: countBy(items, 'approved') },
    { value: 'rejected' as const, label: 'Rədd edilən', count: countBy(items, 'rejected') },
    { value: 'all' as const, label: 'Hamısı', count: items.length },
  ]

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Sahibkar sorğuları"
        description="İstifadəçilərin sahibkar olmaq üçün müraciətləri. Təsdiq etdikdə istifadəçiyə sahibkar rolu verilir."
      />

      <Card>
        <CardHeader
          title="Müraciətlər"
          description={
            query.data
              ? `Cəmi ${query.data.totalCount} sorğu · ${page}/${Math.max(query.data.totalPages, 1)} səhifə`
              : 'Yüklənir…'
          }
        />

        <CardBody className="space-y-4">
          {/* Mobil ekranda çip sırası kəsilməsin deyə üfüqi sürüşür. */}
          <div className="w-full overflow-x-auto pb-1">
            <Segmented
              value={filter}
              onChange={setFilter}
              options={options}
              ariaLabel="Status üzrə filtr"
            />
          </div>

          <InlineNote tone="info">
            Status filtri yalnız <strong>bu səhifədəki</strong> sorğulara tətbiq olunur — backend
            status üzrə süzgəc dəstəkləmir. Digər statusları görmək üçün səhifələr arasında keç.
          </InlineNote>

          {query.isLoading ? (
            <SkeletonRows rows={6} columns={5} />
          ) : query.isError ? (
            <ErrorState
              title="Sorğular yüklənmədi"
              description={errorMessage(query.error)}
              onRetry={() => void query.refetch()}
            />
          ) : visible.length === 0 ? (
            <EmptyState
              icon={items.length ? <Inbox /> : <UserCheck />}
              title={items.length ? 'Bu filtrdə sorğu yoxdur' : 'Hələ müraciət yoxdur'}
              description={
                items.length
                  ? 'Bu səhifədə seçdiyin statusda sorğu tapılmadı. Başqa statusu və ya növbəti səhifəni yoxla.'
                  : 'İstifadəçilər «Stadion sahibi ol» formasını doldurduqda müraciətlər burada görünəcək.'
              }
              compact
            />
          ) : (
            <OwnerRequestTable
              requests={visible}
              onApprove={moderation.setApproveTarget}
              onReject={moderation.setRejectTarget}
              onDetail={moderation.setDetailTarget}
              busyId={moderation.busyId}
              busy={moderation.busy}
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

      <OwnerRequestDialogs moderation={moderation} />
    </div>
  )
}
