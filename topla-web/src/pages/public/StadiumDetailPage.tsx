import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Clock,
  Info,
  Layers,
  MapPin,
  Ruler,
  ShieldCheck,
  Star,
} from 'lucide-react'
import {
  Badge,
  Breadcrumbs,
  Button,
  EmptyState,
  ErrorState,
  InlineNote,
  Rating,
  Skeleton,
} from '@/components/ui'
import { StadiumGallery } from '@/features/stadiums/StadiumGallery'
import { StadiumMap } from '@/features/stadiums/StadiumMap'
import { BookingPanel } from '@/features/booking/BookingPanel'
import { RatingSummary, ReviewList } from '@/features/reviews/ReviewList'
import {
  useAllStadiums,
  useStadiumImages,
  useStadiumViewDetail,
} from '@/hooks/queries/useStadiumQueries'
import { useStadiumReviews } from '@/hooks/queries/useReviewQueries'
import { usePageMeta } from '@/hooks/usePageMeta'
import { formatPrice, formatTimeOnly } from '@/utils/format'
import { formatDuration } from '@/utils/format'

export default function StadiumDetailPage() {
  const { stadiumId = '' } = useParams()

  // Publik detal endpoint-i: icazə tələb etmir, backend-də Redis cache-lidir.
  const detail = useStadiumViewDetail(stadiumId)
  const images = useStadiumImages(stadiumId)
  // Boş saatlar qəsdən ayrı sorğudur (BookingPanel) — availability real-time olmalıdır.
  const reviews = useStadiumReviews(stadiumId)
  // Detal 404 verərsə (məs. stadion deaktiv edilib) kataloq datası ehtiyat qalır.
  const catalog = useAllStadiums()

  const fallback = useMemo(
    () => catalog.data?.find((item) => item.id === stadiumId) ?? null,
    [catalog.data, stadiumId],
  )

  const name = detail.data?.name ?? fallback?.name ?? 'Stadion'
  const city = detail.data?.city ?? fallback?.city ?? ''
  const address = detail.data?.address ?? fallback?.address ?? ''
  const price = detail.data?.pricePerHour ?? fallback?.pricePerHour ?? 0
  const size = detail.data?.size ?? fallback?.size ?? ''

  // Rəy siyahısı gəlibsə ondan hesablanır; yoxdursa backend-in saxladığı orta reytinq.
  const averageRating = reviews.data?.length
    ? reviews.data.reduce((sum, review) => sum + review.rating, 0) / reviews.data.length
    : detail.data?.totalReviews
      ? detail.data.averageRating
      : null
  const reviewCount = reviews.data?.length ?? detail.data?.totalReviews ?? 0

  usePageMeta({
    title: name,
    description: address
      ? `${name} — ${city}, ${address}. Saatlıq ${formatPrice(price)}. Boş saatları gör və onlayn bron et.`
      : `${name} meydançasını Topla ilə onlayn bron et.`,
  })

  const isResolving = detail.isLoading && catalog.isLoading
  const notFound = !detail.data && !fallback && !isResolving && !catalog.isLoading

  if (isResolving) {
    return (
      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        <Skeleton className="h-64 rounded-lg sm:h-80" />
        <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
          <div className="space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-28 w-full" />
          </div>
          <Skeleton className="h-96 rounded-lg" />
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState
          icon={<MapPin />}
          title="Stadion tapılmadı"
          description="Bu meydança silinmiş və ya deaktiv edilmiş ola bilər."
          action={
            <Button asChild>
              <Link to="/stadiums">Bütün stadionlara bax</Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-6">
      <Breadcrumbs
        className="mb-3 sm:mb-4"
        items={[{ label: 'Ana səhifə', to: '/' }, { label: 'Stadionlar', to: '/stadiums' }, { label: name }]}
      />

      <StadiumGallery
        images={images.data ?? []}
        stadiumName={name}
        loading={images.isLoading}
      />

      <div className="mt-5 grid items-start gap-6 sm:mt-7 lg:grid-cols-[1fr_22rem] lg:gap-8">
        <div className="min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight text-ink-900 sm:text-3xl">{name}</h1>
              <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13.5px] text-ink-500">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4" aria-hidden="true" />
                  {[city, address].filter(Boolean).join(', ') || 'Ünvan göstərilməyib'}
                </span>
                {averageRating !== null ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Rating value={averageRating} size="sm" />
                    <span className="font-semibold text-ink-800">{averageRating.toFixed(1)}</span>
                    <span>({reviewCount} rəy)</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5">
                    <Star className="size-4" aria-hidden="true" />
                    Hələ rəy yoxdur
                  </span>
                )}
              </p>
            </div>

            <Button variant="ghost" size="sm" asChild>
              <Link to="/stadiums">
                <ArrowLeft />
                Siyahıya qayıt
              </Link>
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {size ? (
              <Badge tone="dark">
                <Ruler className="size-3.5" aria-hidden="true" />
                {size}
              </Badge>
            ) : null}
            {detail.data?.surfaceType ? (
              <Badge tone="outline">
                <Layers className="size-3.5" aria-hidden="true" />
                {detail.data.surfaceType}
              </Badge>
            ) : null}
            {detail.data ? (
              <Badge tone="brand">
                <Clock className="size-3.5" aria-hidden="true" />
                {formatTimeOnly(detail.data.openTime)} – {formatTimeOnly(detail.data.closeTime)}
              </Badge>
            ) : null}
            <Badge tone="success" dot>
              Yoxlanılıb
            </Badge>
          </div>

          {detail.isError && fallback ? (
            <InlineNote tone="info" icon={<Info />} className="mt-5">
              Bu meydançanın tam təsviri hazırda əlçatan deyil. Boş saatlar və rəylər aşağıda
              göstərilir.
            </InlineNote>
          ) : null}

          {detail.data?.description ? (
            <section className="mt-6" aria-labelledby="about-heading">
              <h2 id="about-heading" className="text-base font-bold text-ink-900">
                Meydança haqqında
              </h2>
              <p className="mt-2 max-w-2xl whitespace-pre-line text-[14.5px] leading-relaxed text-ink-700">
                {detail.data.description}
              </p>
            </section>
          ) : null}

          {detail.data ? (
            <section className="mt-6" aria-labelledby="rules-heading">
              <h2 id="rules-heading" className="text-base font-bold text-ink-900">
                Bron şərtləri
              </h2>
              <dl className="mt-3 grid gap-3 sm:grid-cols-3">
                <div className="rounded-md border border-line bg-surface p-4">
                  <dt className="text-xs font-semibold text-ink-500">Saatlıq qiymət</dt>
                  <dd className="mt-1 text-[15px] font-bold text-ink-900">{formatPrice(price)}</dd>
                </div>
                <div className="rounded-md border border-line bg-surface p-4">
                  <dt className="text-xs font-semibold text-ink-500">Minimum müddət</dt>
                  <dd className="mt-1 text-[15px] font-bold text-ink-900">
                    {formatDuration(detail.data.minBookingMinutes)}
                  </dd>
                </div>
                <div className="rounded-md border border-line bg-surface p-4">
                  <dt className="text-xs font-semibold text-ink-500">Maksimum müddət</dt>
                  <dd className="mt-1 text-[15px] font-bold text-ink-900">
                    {formatDuration(detail.data.maxBookingMinutes)}
                  </dd>
                </div>
              </dl>
            </section>
          ) : null}

          <section className="mt-6" aria-labelledby="map-heading">
            <h2 id="map-heading" className="mb-3 text-base font-bold text-ink-900">
              Yerləşmə
            </h2>
            <StadiumMap
              latitude={detail.data?.latitude ?? 0}
              longitude={detail.data?.longitude ?? 0}
              address={[city, address].filter(Boolean).join(', ')}
              name={name}
            />
          </section>

          <section className="mt-8" aria-labelledby="reviews-heading">
            <h2 id="reviews-heading" className="mb-3 text-base font-bold text-ink-900">
              Rəylər {reviews.data?.length ? `(${reviews.data.length})` : ''}
            </h2>

            {reviews.isError ? (
              <ErrorState
                title="Rəylər yüklənmədi"
                onRetry={() => void reviews.refetch()}
              />
            ) : (
              <div className="space-y-4">
                <RatingSummary reviews={reviews.data ?? []} />
                <ReviewList reviews={reviews.data ?? []} loading={reviews.isLoading} />
              </div>
            )}
          </section>
        </div>

        {/* Bron paneli — səhifənin əsas hərəkəti, desktopda yapışqan qalır.
            `min-w-0` vacibdir: içindəki DateStrip üfüqi sürüşən lentdir və bu
            olmadan grid sütunu lentin tam eninə açılıb səhifəni mobildə
            ekrandan enli edirdi (zoom-out simptomu). */}
        <div className="min-w-0 lg:sticky lg:top-24">
          <BookingPanel
            stadiumId={stadiumId}
            stadiumName={name}
            pricePerHour={price}
            minBookingMinutes={detail.data?.minBookingMinutes ?? 60}
            maxBookingMinutes={detail.data?.maxBookingMinutes ?? 180}
          />

          <p className="mt-3 flex items-start gap-2 px-1 text-2xs leading-relaxed text-ink-500">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-brand-600" aria-hidden="true" />
            Rezervasiya göndərilən kimi avtomatik təsdiqlənir. Ödəniş şərtləri stadionla
            razılaşdırılır.
          </p>
        </div>
      </div>
    </div>
  )
}
