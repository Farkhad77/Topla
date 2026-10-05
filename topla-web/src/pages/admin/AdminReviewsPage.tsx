import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { MessageSquare } from 'lucide-react'
import {
  Card,
  CardBody,
  CardHeader,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Field,
  InlineNote,
  SimpleSelect,
  Skeleton,
} from '@/components/ui'
import { RoleGate } from '@/components/common/RoleGate'
import { AdminPageHeader } from '@/features/admin/AdminPageHeader'
import { ReviewModerationList } from '@/features/admin/ReviewModerationList'
import { RatingSummary } from '@/features/reviews/ReviewList'
import { useStadiumReviews } from '@/hooks/queries/useReviewQueries'
import { useStadiumList } from '@/hooks/queries/useStadiumQueries'
import { usePageMeta } from '@/hooks/usePageMeta'
import { queryKeys } from '@/hooks/queryKeys'
import { toast } from '@/hooks/useToast'
import { reviewService } from '@/services'
import { errorMessage } from '@/api'
import type { Review } from '@/types'

export default function AdminReviewsPage() {
  usePageMeta({ title: 'Rəylər — Admin' })

  const queryClient = useQueryClient()
  const stadiums = useStadiumList(1, 100)
  const [stadiumId, setStadiumId] = useState('')
  const [target, setTarget] = useState<Review | null>(null)

  // Backend rəyləri yalnız stadion üzrə qaytarır — ilk stadion avtomatik seçilir.
  useEffect(() => {
    const first = stadiums.data?.items[0]
    if (!stadiumId && first) setStadiumId(first.id)
  }, [stadiumId, stadiums.data])

  const reviews = useStadiumReviews(stadiumId || undefined)

  const remove = useMutation({
    mutationFn: (reviewId: string) => reviewService.removeAsAdmin(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.byStadium(stadiumId) })
      toast.success('Rəy silindi', 'Rəy stadionun səhifəsindən götürüldü.')
    },
    onError: (error) => toast.error('Rəy silinmədi', errorMessage(error)),
  })

  const items = reviews.data ?? []
  const options = (stadiums.data?.items ?? []).map((stadium) => ({
    value: stadium.id,
    label: `${stadium.name} — ${stadium.city}`,
  }))

  const confirmRemove = () => {
    if (!target) return
    remove.mutate(target.id, { onSettled: () => setTarget(null) })
  }

  const listSkeleton = (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} className="h-24 w-full rounded-md" />
      ))}
    </div>
  )

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Rəylər"
        description="Rəylər stadion üzrə yüklənir. Qaydaları pozan rəyi Admin silə bilər."
      />

      <RoleGate
        roles={['Admin']}
        fallback={
          <InlineNote tone="info">
            Moderator kimi rəyləri oxuya bilirsən, silmək isə yalnız Admin rolunda mümkündür.
          </InlineNote>
        }
      >
        <InlineNote tone="warning">
          Silinən rəy geri qaytarılmır və stadionun orta reytinqi dərhal yenilənir.
        </InlineNote>
      </RoleGate>

      <Card>
        <CardHeader
          title="Stadion seç"
          description="Platforma üzrə ümumi rəy siyahısı endpoint-i yoxdur — moderasiya stadion-stadion aparılır."
          action={
            <div className="w-64 max-w-full sm:w-80">
              {stadiums.isLoading ? (
                <Skeleton className="h-10 w-full rounded-md" />
              ) : (
                <Field label="Stadion">
                  {({ id }) => (
                    <SimpleSelect
                      id={id}
                      value={stadiumId}
                      onValueChange={setStadiumId}
                      options={options}
                      placeholder="Stadion seç…"
                      ariaLabel="Rəyləri göstərmək üçün stadion seç"
                    />
                  )}
                </Field>
              )}
            </div>
          }
        />

        <CardBody className="space-y-4">
          {stadiums.isError ? (
            <ErrorState
              title="Stadion siyahısı yüklənmədi"
              description={errorMessage(stadiums.error)}
              onRetry={() => void stadiums.refetch()}
            />
          ) : stadiums.isLoading || reviews.isLoading ? (
            listSkeleton
          ) : options.length === 0 ? (
            <EmptyState
              icon={<MessageSquare />}
              title="Kataloqda stadion yoxdur"
              description="Təsdiqlənmiş stadion olmadığı üçün moderasiya ediləcək rəy də yoxdur."
              compact
            />
          ) : reviews.isError ? (
            <ErrorState
              title="Rəylər yüklənmədi"
              description={errorMessage(reviews.error)}
              onRetry={() => void reviews.refetch()}
            />
          ) : items.length === 0 ? (
            <EmptyState
              icon={<MessageSquare />}
              title="Bu stadionda rəy yoxdur"
              description="Seçilmiş stadion üçün hələ rəy yazılmayıb. Başqa stadion seçib davam et."
              compact
            />
          ) : (
            <>
              <RatingSummary reviews={items} />
              <ReviewModerationList
                reviews={items}
                onDelete={setTarget}
                deletingId={remove.isPending ? (target?.id ?? null) : null}
                busy={remove.isPending}
              />
            </>
          )}
        </CardBody>
      </Card>

      <ConfirmDialog
        open={!!target}
        onOpenChange={(open) => !open && setTarget(null)}
        title="Rəyi silirsən?"
        description="Rəy platformadan tamamilə silinəcək və bərpa oluna bilməyəcək."
        confirmLabel="Bəli, sil"
        loading={remove.isPending}
        onConfirm={confirmRemove}
      >
        {target ? (
          <p className="rounded-md border border-line bg-ink-50/60 p-3 text-[13px] leading-relaxed text-ink-700">
            <span className="font-semibold text-ink-900">{target.userName || 'İstifadəçi'}:</span>{' '}
            {target.comment || 'Mətn yazılmayıb.'}
          </p>
        ) : null}
      </ConfirmDialog>
    </div>
  )
}
