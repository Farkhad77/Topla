import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, MessageSquare, Star, TrendingDown } from 'lucide-react'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  ErrorState,
  Field,
  InlineNote,
  SimpleSelect,
  Skeleton,
  StatCard,
} from '@/components/ui'
import { OwnerPageHeader } from '@/features/owner/OwnerPageHeader'
import { useOwnerStadiums } from '@/features/owner/useOwnerStadiums'
import { useOwnerReviews } from '@/features/owner/useOwnerReviews'
import { RatingSummary, ReviewList } from '@/features/reviews/ReviewList'
import { usePageMeta } from '@/hooks/usePageMeta'
import { errorMessage } from '@/api'
import { formatNumber, toDate } from '@/utils/format'

const LOW_RATING = 3

export default function OwnerReviewsPage() {
  usePageMeta({ title: 'Rəylər — Sahibkar paneli' })

  const stadiums = useOwnerStadiums()
  const [stadiumId, setStadiumId] = useState('all')

  const stadiumIds = useMemo(
    () => stadiums.options.map((option) => option.value),
    [stadiums.options],
  )
  const reviews = useOwnerReviews(stadiumIds)

  const visible = useMemo(() => {
    const list =
      stadiumId === 'all'
        ? reviews.reviews
        : reviews.reviews.filter((review) => review.stadiumId === stadiumId)

    return [...list].sort(
      (a, b) => (toDate(b.createdAt)?.getTime() ?? 0) - (toDate(a.createdAt)?.getTime() ?? 0),
    )
  }, [reviews.reviews, stadiumId])

  const lowCount = visible.filter((review) => review.rating <= LOW_RATING).length
  const average = visible.length
    ? visible.reduce((sum, review) => sum + review.rating, 0) / visible.length
    : 0

  const isLoading = stadiums.isLoading || reviews.isLoading

  if (stadiums.isError) {
    return (
      <div className="space-y-5">
        <OwnerPageHeader title="Rəylər" />
        <ErrorState
          title="Stadionlar yüklənmədi"
          description={errorMessage(stadiums.error)}
          onRetry={stadiums.refetch}
        />
      </div>
    )
  }

  if (!stadiums.isLoading && stadiumIds.length === 0) {
    return (
      <div className="space-y-5">
        <OwnerPageHeader title="Rəylər" />
        <EmptyState
          icon={<MapPin />}
          title="Rəy üçün stadion lazımdır"
          description="Rəylər stadion-stadion oxunur. İlk meydançanı əlavə edəndən sonra müştəri rəyləri burada toplanacaq."
          action={
            <Button asChild>
              <Link to="/owner/stadiums/new">Stadion əlavə et</Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <OwnerPageHeader
        title="Rəylər"
        description="Müştərilərin qiymətləndirməsi. Aşağı reytinqlərə diqqət yetir — problemi tez həll etmək reytinqi bərpa edir."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Orta reytinq"
          value={visible.length ? average.toFixed(1) : '—'}
          hint={visible.length ? '5 ballıq şkala üzrə' : 'Hələ rəy yoxdur'}
          icon={<Star />}
          tone="brand"
          loading={isLoading}
        />
        <StatCard
          label="Rəy sayı"
          value={formatNumber(visible.length)}
          hint={stadiumId === 'all' ? 'Bütün stadionlar' : 'Seçilmiş stadion'}
          icon={<MessageSquare />}
          loading={isLoading}
        />
        <StatCard
          label="Aşağı reytinqlər"
          value={formatNumber(lowCount)}
          hint={`${LOW_RATING} ulduz və aşağı`}
          icon={<TrendingDown />}
          tone={lowCount > 0 ? 'warning' : 'default'}
          loading={isLoading}
        />
      </div>

      <Card>
        <CardHeader title="Filtr" />
        <CardBody>
          <Field label="Stadion">
            {({ id }) => (
              <SimpleSelect
                id={id}
                ariaLabel="Stadion üzrə filtr"
                value={stadiumId}
                onValueChange={setStadiumId}
                options={[{ value: 'all', label: 'Bütün stadionlar' }, ...stadiums.options]}
                className="sm:max-w-sm"
              />
            )}
          </Field>
        </CardBody>
      </Card>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-28 w-full rounded-lg" />
        </div>
      ) : reviews.isError ? (
        <ErrorState
          title="Rəylər yüklənmədi"
          description="Rəy sorğuları uğursuz oldu. Bir azdan yenidən cəhd et."
        />
      ) : (
        <div className="space-y-4">
          {visible.length ? <RatingSummary reviews={visible} /> : null}

          <Card>
            <CardHeader
              title="Bütün rəylər"
              description={visible.length ? `${visible.length} rəy, ən yenidən başlayaraq` : undefined}
            />
            <CardBody>
              <ReviewList reviews={visible} />
            </CardBody>
          </Card>
        </div>
      )}

      <InlineNote tone="info">
        Sahibkar üçün ümumi rəy endpoint-i yoxdur — rəylər hər stadion üçün ayrıca sorğu ilə yığılır
        və burada birləşdirilir.
      </InlineNote>
    </div>
  )
}
