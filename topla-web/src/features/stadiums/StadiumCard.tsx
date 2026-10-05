import { Link } from 'react-router-dom'
import { MapPin, Star } from 'lucide-react'
import { Badge, Button } from '@/components/ui'
import { PitchImage } from '@/components/brand/PitchImage'
import { useInView } from '@/hooks/useInView'
import { useStadiumCardData } from './useStadiumCardData'
import { formatPrice } from '@/utils/format'
import { cn } from '@/utils/cn'
import type { StadiumListItem } from '@/types'

export function StadiumCard({
  stadium,
  className,
}: {
  stadium: StadiumListItem
  className?: string
}) {
  const { ref, inView } = useInView<HTMLElement>()
  const extras = useStadiumCardData(stadium.id, inView)

  return (
    <article
      ref={ref}
      className={cn(
        // `relative` vacibdir: ad linkinin `after:inset-0` örtüyü məhz bu karta
        // bağlanmalıdır. Onsuz örtük bütün səhifəni tutur və istənilən klik
        // təsadüfi stadion səhifəsini açırdı (filtrlər də daxil).
        'card-hover group relative flex flex-col overflow-hidden rounded-lg border border-line bg-surface',
        className,
      )}
    >
      <div className="relative aspect-16/10 overflow-hidden bg-brand-800">
        <PitchImage
          src={extras.mainImage}
          alt={`${stadium.name} meydançası`}
          className="size-full transition-transform duration-500 group-hover:scale-[1.04]"
        />

        <span className="absolute left-3 top-3 rounded-full bg-ink-900/75 px-2.5 py-1 text-2xs font-bold text-white backdrop-blur-sm">
          {stadium.size}
        </span>

        {extras.averageRating !== null ? (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-surface/95 px-2.5 py-1 text-2xs font-bold text-ink-900 shadow-card">
            <Star className="size-3 fill-volt-500 text-volt-500" aria-hidden="true" />
            {extras.averageRating.toFixed(1)}
            <span className="font-medium text-ink-500">({extras.reviewCount})</span>
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-[15px] font-bold leading-snug text-ink-900">
          <Link to={`/stadiums/${stadium.id}`} className="after:absolute after:inset-0">
            {stadium.name}
          </Link>
        </h3>

        <p className="mt-1 flex items-start gap-1.5 text-[13px] text-ink-500">
          <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          <span className="line-clamp-2">
            {stadium.city}
            {stadium.address ? `, ${stadium.address}` : ''}
          </span>
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <Badge tone="outline" size="sm">
            {stadium.size}
          </Badge>
          {extras.reviewCount > 0 ? (
            <Badge tone="brand" size="sm">
              {extras.reviewCount} rəy
            </Badge>
          ) : (
            <Badge tone="neutral" size="sm">
              Yeni
            </Badge>
          )}
        </div>

        <div className="mt-4 flex items-end justify-between gap-3 border-t border-line pt-3">
          <div>
            <p className="text-lg font-bold leading-none text-brand-700">
              {formatPrice(stadium.pricePerHour)}
            </p>
            <p className="mt-1 text-2xs text-ink-500">saatlıq</p>
          </div>
          <Button size="sm" variant="soft" className="relative z-10" asChild>
            <Link to={`/stadiums/${stadium.id}`}>Saatlara bax</Link>
          </Button>
        </div>
      </div>
    </article>
  )
}

export function StadiumCardCompact({ stadium }: { stadium: StadiumListItem }) {
  return (
    <Link
      to={`/stadiums/${stadium.id}`}
      className="flex items-center gap-3 rounded-md border border-line bg-surface p-2.5 transition-colors hover:border-brand-300 hover:bg-brand-50/40"
    >
      <div className="pitch-surface size-12 shrink-0 rounded-sm" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-bold text-ink-900">{stadium.name}</p>
        <p className="truncate text-xs text-ink-500">{stadium.city}</p>
      </div>
      <p className="shrink-0 text-[13px] font-bold text-brand-700">
        {formatPrice(stadium.pricePerHour)}
      </p>
    </Link>
  )
}
