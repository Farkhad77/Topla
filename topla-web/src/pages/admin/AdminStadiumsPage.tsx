import { useMemo, useState } from 'react'
import { Info, MapPin, Search, ShieldCheck } from 'lucide-react'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  InlineNote,
  Input,
  Pagination,
  SkeletonRows,
} from '@/components/ui'
import { AdminPageHeader } from '@/features/admin/AdminPageHeader'
import { PendingStadiumsTable } from '@/features/admin/PendingStadiumsTable'
import { StadiumModerationTable } from '@/features/admin/StadiumModerationTable'
import { usePendingStadiums, useVerifyStadium } from '@/hooks/queries/useAdminQueries'
import { useStadiumList } from '@/hooks/queries/useStadiumQueries'
import { usePageMeta } from '@/hooks/usePageMeta'
import { errorMessage } from '@/api'

const PAGE_SIZE = 12

interface VerifyTarget {
  id: string
  name: string
  status: 1 | 2
}

export default function AdminStadiumsPage() {
  usePageMeta({ title: 'Stadionlar — Admin' })

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [target, setTarget] = useState<VerifyTarget | null>(null)

  const query = useStadiumList(page, PAGE_SIZE)
  const pendingQuery = usePendingStadiums()
  const verify = useVerifyStadium()

  const items = useMemo(() => query.data?.items ?? [], [query.data])
  const visible = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase('az')
    if (!needle) return items
    return items.filter((stadium) =>
      [stadium.name, stadium.city, stadium.address].some((value) =>
        (value ?? '').toLocaleLowerCase('az').includes(needle),
      ),
    )
  }, [items, search])

  const pendingItems = pendingQuery.data ?? []

  const confirmVerify = () => {
    if (!target) return
    verify.mutate({ stadiumId: target.id, status: target.status }, { onSettled: () => setTarget(null) })
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Stadionlar"
        description="Kataloqda dərc olunmuş stadionlar və onların verifikasiya statusu."
      />

      <Card>
        <CardHeader
          title="Təsdiq gözləyən stadionlar"
          description={
            pendingQuery.isLoading
              ? 'Yüklənir…'
              : `${pendingItems.length} stadion moderator qərarı gözləyir`
          }
        />
        <CardBody className="space-y-4">
          {pendingQuery.isLoading ? (
            <SkeletonRows rows={3} columns={5} />
          ) : pendingQuery.isError ? (
            <ErrorState
              title="Növbə yüklənmədi"
              description={errorMessage(pendingQuery.error)}
              onRetry={() => void pendingQuery.refetch()}
            />
          ) : pendingItems.length === 0 ? (
            <EmptyState
              icon={<ShieldCheck />}
              title="Növbə boşdur"
              description="Hazırda təsdiq gözləyən stadion yoxdur. Sahibkar yeni stadion əlavə edəndə burada görünəcək."
              compact
            />
          ) : (
            <PendingStadiumsTable
              stadiums={pendingItems}
              onDecide={(stadium, status) =>
                setTarget({ id: stadium.id, name: stadium.name, status })
              }
              busyId={verify.isPending ? (target?.id ?? null) : null}
              busy={verify.isPending}
            />
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Dərc olunmuş stadionlar"
          description={
            query.data
              ? `Cəmi ${query.data.totalCount} stadion · ${page}/${Math.max(query.data.totalPages, 1)} səhifə`
              : 'Yüklənir…'
          }
          action={
            <div className="w-64 max-w-full sm:w-72">
              <Input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Bu səhifədə axtar: ad, şəhər, ünvan"
                aria-label="Bu səhifədə stadion axtar"
                leading={<Search />}
              />
            </div>
          }
        />

        <CardBody className="space-y-4">
          <InlineNote tone="info" icon={<Info />}>
            Bu siyahı <strong>yalnız təsdiqlənmiş və aktiv</strong> stadionları qaytarır. Axtarış da
            server tərəfdə deyil — yalnız açıq olan səhifədəki nəticələr süzülür.
          </InlineNote>

          {query.isLoading ? (
            <SkeletonRows rows={6} columns={5} />
          ) : query.isError ? (
            <ErrorState
              title="Stadionlar yüklənmədi"
              description={errorMessage(query.error)}
              onRetry={() => void query.refetch()}
            />
          ) : visible.length === 0 ? (
            <EmptyState
              icon={<MapPin />}
              title={items.length ? 'Axtarışa uyğun stadion yoxdur' : 'Kataloq boşdur'}
              description={
                items.length
                  ? 'Bu səhifədə uyğun nəticə tapılmadı. Axtarışı təmizlə və ya növbəti səhifəyə keç.'
                  : 'Təsdiqlənmiş stadion yoxdur. Sahibkar stadion əlavə edib təsdiq aldıqdan sonra burada görünəcək.'
              }
              action={
                items.length ? (
                  <Button variant="secondary" size="sm" onClick={() => setSearch('')}>
                    Axtarışı təmizlə
                  </Button>
                ) : null
              }
              compact
            />
          ) : (
            <StadiumModerationTable
              stadiums={visible}
              onVerify={(stadium, status) =>
                setTarget({ id: stadium.id, name: stadium.name, status })
              }
              busyId={verify.isPending ? (target?.id ?? null) : null}
              busy={verify.isPending}
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

      <ConfirmDialog
        open={!!target}
        onOpenChange={(open) => !open && setTarget(null)}
        title={target?.status === 2 ? 'Stadionu rədd edirsən?' : 'Stadionu təsdiqləyirsən?'}
        description={
          target?.status === 2
            ? `«${target.name}» rədd edilmiş kimi işarələnəcək və axtarışdan silinəcək. Sahibkar yenidən müraciət etməlidir.`
            : target
              ? `«${target.name}» təsdiqlənmiş kimi qeyd olunacaq.`
              : undefined
        }
        confirmLabel={target?.status === 2 ? 'Bəli, çıxar' : 'Bəli, təsdiqlə'}
        tone={target?.status === 2 ? 'danger' : 'primary'}
        loading={verify.isPending}
        onConfirm={confirmVerify}
      />
    </div>
  )
}
