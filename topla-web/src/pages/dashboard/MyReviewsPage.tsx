import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQueries } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, MessageSquarePlus, Pencil, Star, Trash2 } from 'lucide-react'
import {
  Button,
  ConfirmDialog,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  EmptyState,
  ErrorState,
  Field,
  InlineNote,
  Rating,
  RatingInput,
  Skeleton,
  Textarea,
} from '@/components/ui'
import { ReviewDialog } from '@/features/reviews/ReviewForm'
import { reviewSchema, type ReviewFormValues } from '@/schemas/misc'
import { useDeleteMyReview, useUpdateReview } from '@/hooks/queries/useReviewQueries'
import { useMyBookings } from '@/hooks/queries/useBookingQueries'
import { queryKeys } from '@/hooks/queryKeys'
import { reviewService } from '@/services'
import { useAuth } from '@/hooks/useAuth'
import { usePageMeta } from '@/hooks/usePageMeta'
import { errorMessage } from '@/api'
import { resolveBookingState } from '@/utils/booking'
import { formatDate, formatRelative, toDate } from '@/utils/format'
import type { MyBooking, Review } from '@/types'

const COMMENT_MAX = 1000

function EditReviewDialog({
  review,
  stadiumName,
  onClose,
}: {
  review: Review
  stadiumName: string
  onClose: () => void
}) {
  const updateReview = useUpdateReview(review.stadiumId)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: review.rating, comment: review.comment ?? '' },
  })

  const rating = watch('rating') ?? 0
  const comment = watch('comment') ?? ''
  const pending = isSubmitting || updateReview.isPending

  async function onSubmit(values: ReviewFormValues) {
    setFormError(null)
    try {
      await updateReview.mutateAsync({
        reviewId: review.id,
        payload: { rating: values.rating, comment: values.comment.trim() },
      })
      onClose()
    } catch (error) {
      setFormError(errorMessage(error))
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next && !pending) onClose()
      }}
    >
      <DialogContent>
        <DialogHeader title="Rəyi redaktə et" description={stadiumName} />

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogBody className="space-y-4">
            {formError ? (
              <div role="alert">
                <InlineNote tone="danger" icon={<AlertCircle />}>
                  {formError}
                </InlineNote>
              </div>
            ) : null}

            <Field label="Qiymətləndirmə" error={errors.rating?.message} required>
              {({ id, describedBy }) => (
                <div aria-describedby={describedBy}>
                  <RatingInput
                    id={id}
                    value={rating}
                    onChange={(next) => setValue('rating', next, { shouldValidate: true })}
                  />
                </div>
              )}
            </Field>

            <Field
              label="Rəyin"
              error={errors.comment?.message}
              hint={`${comment.length}/${COMMENT_MAX} simvol`}
              required
            >
              {({ id, describedBy, invalid }) => (
                <Textarea
                  id={id}
                  rows={5}
                  maxLength={COMMENT_MAX}
                  invalid={invalid}
                  aria-describedby={describedBy}
                  {...register('comment')}
                />
              )}
            </Field>
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose} disabled={pending}>
              İmtina
            </Button>
            <Button type="submit" loading={pending}>
              Yadda saxla
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function DeleteReviewDialog({ review, onClose }: { review: Review; onClose: () => void }) {
  const deleteReview = useDeleteMyReview(review.stadiumId)

  async function handleConfirm() {
    try {
      await deleteReview.mutateAsync(review.id)
      onClose()
    } catch {
      // Xəta toast ilə göstərilir — dialoq açıq qalır.
    }
  }

  return (
    <ConfirmDialog
      open
      onOpenChange={(next) => {
        if (!next && !deleteReview.isPending) onClose()
      }}
      title="Rəyi silirsən?"
      description="Rəy stadion səhifəsindən dərhal silinəcək və geri qaytarıla bilməyəcək."
      confirmLabel="Bəli, sil"
      loading={deleteReview.isPending}
      onConfirm={() => void handleConfirm()}
    />
  )
}

export default function MyReviewsPage() {
  usePageMeta({ title: 'Rəylərim' })

  const { user } = useAuth()
  const bookingsQuery = useMyBookings()

  const [editTarget, setEditTarget] = useState<Review | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null)
  const [reviewTarget, setReviewTarget] = useState<MyBooking | null>(null)

  const { stadiumIds, stadiumNames, completed } = useMemo(() => {
    const list = bookingsQuery.data ?? []
    const names = new Map<string, string>()
    const done: MyBooking[] = []

    for (const booking of list) {
      names.set(booking.stadiumId, booking.stadiumName)
      if (resolveBookingState(booking) === 'completed') done.push(booking)
    }

    done.sort(
      (a, b) =>
        (toDate(b.startDateTime)?.getTime() ?? 0) - (toDate(a.startDateTime)?.getTime() ?? 0),
    )

    return {
      stadiumIds: Array.from(names.keys()),
      stadiumNames: names,
      completed: done,
    }
  }, [bookingsQuery.data])

  /**
   * TODO(backend): "mənim rəylərim" üçün endpoint yoxdur.
   * `GET /api/Review/user/{userId}` mövcuddur, amma başqasının profilini açmağa da imkan verir
   * və istifadəçinin bron etmədiyi stadionları əhatə etmir. Ona görə siyahını dürüst şəkildə
   * törədirik: bron edilmiş stadionların rəyləri gətirilir və `userId` üzrə süzülür.
   * Backend `GET /api/Review/my-reviews` açanda bu blok tək sorğu ilə əvəzlənməlidir.
   */
  const reviewQueries = useQueries({
    queries: stadiumIds.map((stadiumId) => ({
      queryKey: queryKeys.reviews.byStadium(stadiumId),
      queryFn: () => reviewService.byStadium(stadiumId),
      staleTime: 60_000,
    })),
  })

  const reviewsLoading = reviewQueries.some((query) => query.isLoading)
  const reviewsFailed = reviewQueries.some((query) => query.isError)

  const myReviews = reviewQueries
    .flatMap((query) => query.data ?? [])
    .filter((review) => !!user && review.userId === user.id)
    .sort(
      (a, b) => (toDate(b.createdAt)?.getTime() ?? 0) - (toDate(a.createdAt)?.getTime() ?? 0),
    )

  const reviewedStadiumIds = new Set(myReviews.map((review) => review.stadiumId))

  // Bitmiş, amma hələ rəy yazılmamış oyunlar — stadion başına bir dəfə.
  const awaitingReview = completed.filter((booking, index, list) => {
    if (reviewedStadiumIds.has(booking.stadiumId)) return false
    return list.findIndex((item) => item.stadiumId === booking.stadiumId) === index
  })

  const loading = bookingsQuery.isLoading || (stadiumIds.length > 0 && reviewsLoading)

  return (
    <div className="space-y-7">
      <header className="space-y-1">
        <h1 className="text-xl font-extrabold tracking-tight text-ink-900">Rəylərim</h1>
        <p className="text-sm text-ink-500">
          Oynadığın meydançalar haqqında yazdıqların — istədiyin vaxt dəyişə və ya silə bilərsən.
        </p>
      </header>

      {bookingsQuery.isError ? (
        <ErrorState
          title="Məlumat yüklənmədi"
          description="Rezervasiyaların gətirilmədiyi üçün rəylərini göstərə bilmirik."
          onRetry={() => void bookingsQuery.refetch()}
        />
      ) : loading ? (
        <div className="space-y-3" aria-busy="true">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          {reviewsFailed ? (
            <div role="alert">
              <InlineNote tone="warning" icon={<AlertCircle />}>
                Bəzi stadionların rəyləri yüklənmədi — siyahı natamam ola bilər.{' '}
                <button
                  type="button"
                  className="font-semibold underline underline-offset-2"
                  onClick={() => {
                    reviewQueries.forEach((query) => void query.refetch())
                  }}
                >
                  Yenidən cəhd et
                </button>
              </InlineNote>
            </div>
          ) : null}

          <section className="space-y-3" aria-labelledby="my-reviews-title">
            <h2 id="my-reviews-title" className="text-sm font-bold text-ink-900">
              Yazdığım rəylər ({myReviews.length})
            </h2>

            {myReviews.length === 0 ? (
              <EmptyState
                compact
                icon={<Star />}
                title="Hələ rəy yazmamısan"
                description="Oyun bitdikdən sonra meydança haqqında fikrini yaz — digər komandalara kömək olur."
                action={
                  <Button asChild variant="secondary">
                    <Link to="/dashboard/bookings">Rezervasiyalarıma bax</Link>
                  </Button>
                }
              />
            ) : (
              <ul className="space-y-3">
                {myReviews.map((review) => {
                  const stadiumName = stadiumNames.get(review.stadiumId) ?? 'Stadion'
                  return (
                    <li
                      key={review.id}
                      className="rounded-lg border border-line bg-surface p-4 shadow-card"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-[15px] font-bold text-ink-900">
                            <Link
                              to={`/stadiums/${review.stadiumId}`}
                              className="underline-offset-4 hover:underline"
                            >
                              {stadiumName}
                            </Link>
                          </h3>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <Rating value={review.rating} size="sm" />
                            <span className="text-xs text-ink-500">
                              {review.rating}/5 · {formatRelative(review.createdAt)}
                            </span>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`${stadiumName} üçün rəyi redaktə et`}
                            onClick={() => setEditTarget(review)}
                          >
                            <Pencil />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`${stadiumName} üçün rəyi sil`}
                            onClick={() => setDeleteTarget(review)}
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </div>

                      {review.comment ? (
                        <p className="mt-3 text-[13.5px] leading-relaxed text-ink-700">
                          {review.comment}
                        </p>
                      ) : null}
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          {awaitingReview.length > 0 ? (
            <section className="space-y-3" aria-labelledby="awaiting-title">
              <h2 id="awaiting-title" className="text-sm font-bold text-ink-900">
                Rəy gözləyən oyunlar ({awaitingReview.length})
              </h2>

              <ul className="space-y-3">
                {awaitingReview.map((booking) => (
                  <li
                    key={booking.id}
                    className="flex flex-col gap-3 rounded-lg border border-dashed border-line-strong bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-[15px] font-bold text-ink-900">{booking.stadiumName}</p>
                      <p className="mt-0.5 text-[13px] text-ink-500">
                        {formatDate(booking.startDateTime)} tarixli oyun
                      </p>
                    </div>
                    <Button onClick={() => setReviewTarget(booking)}>
                      <MessageSquarePlus />
                      Rəy yaz
                    </Button>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      )}

      {editTarget ? (
        <EditReviewDialog
          key={editTarget.id}
          review={editTarget}
          stadiumName={stadiumNames.get(editTarget.stadiumId) ?? 'Stadion'}
          onClose={() => setEditTarget(null)}
        />
      ) : null}

      {deleteTarget ? (
        <DeleteReviewDialog
          key={deleteTarget.id}
          review={deleteTarget}
          onClose={() => setDeleteTarget(null)}
        />
      ) : null}

      {reviewTarget ? (
        <ReviewDialog
          key={reviewTarget.id}
          stadiumId={reviewTarget.stadiumId}
          stadiumName={reviewTarget.stadiumName}
          open
          onOpenChange={(open) => {
            if (!open) setReviewTarget(null)
          }}
        />
      ) : null}
    </div>
  )
}
