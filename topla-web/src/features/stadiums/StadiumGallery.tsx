import { useState } from 'react'
import { ImageOff } from 'lucide-react'
import { PitchImage } from '@/components/brand/PitchImage'
import { Dialog, DialogContent } from '@/components/ui'
import { cn } from '@/utils/cn'
import type { StadiumImage } from '@/types'

export function StadiumGallery({
  images,
  stadiumName,
  loading = false,
}: {
  images: StadiumImage[]
  stadiumName: string
  loading?: boolean
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const sorted = [...images].sort((a, b) => Number(b.isMain) - Number(a.isMain) || a.order - b.order)
  const [main, ...rest] = sorted

  if (loading) {
    return <div className="h-64 animate-pulse rounded-lg bg-ink-100 sm:h-80" aria-hidden="true" />
  }

  if (!sorted.length) {
    return (
      <div className="relative h-64 overflow-hidden rounded-lg sm:h-80">
        <div className="pitch-surface size-full" aria-hidden="true" />
        <div className="absolute inset-0 grid place-items-center">
          <p className="flex items-center gap-2 rounded-full bg-ink-900/60 px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm">
            <ImageOff className="size-4" />
            Şəkil hələ əlavə edilməyib
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Mobil: yalnız böyük şəkil (üstündə "+N şəkil" sayğacı) — kiçik ekranda
          4 sütunluq mozaika çox xırda görünürdü. sm-dən yuxarı: tam mozaika. */}
      <div className="grid h-52 grid-cols-4 grid-rows-2 gap-1.5 overflow-hidden rounded-lg sm:h-80">
        <button
          type="button"
          onClick={() => setOpenIndex(0)}
          className={cn(
            'relative col-span-4 row-span-2 overflow-hidden bg-brand-800',
            rest.length ? 'sm:col-span-2' : '',
          )}
          aria-label={`${stadiumName} — böyük şəkil`}
        >
          <PitchImage src={main?.imageUrl} alt={stadiumName} eager className="size-full" />
          {rest.length ? (
            <span className="absolute bottom-2.5 right-2.5 rounded-full bg-ink-900/70 px-2.5 py-1 text-2xs font-bold text-white backdrop-blur-sm sm:hidden">
              +{rest.length} şəkil
            </span>
          ) : null}
        </button>

        {rest.slice(0, 4).map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setOpenIndex(index + 1)}
            className="relative hidden overflow-hidden bg-brand-800 sm:block"
            aria-label={`${stadiumName} — şəkil ${index + 2}`}
          >
            <PitchImage src={image.imageUrl} alt={`${stadiumName} ${index + 2}`} className="size-full" />
            {index === 3 && rest.length > 4 ? (
              <span className="absolute inset-0 grid place-items-center bg-ink-900/60 text-sm font-bold text-white">
                +{rest.length - 4}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <Dialog open={openIndex !== null} onOpenChange={(open) => !open && setOpenIndex(null)}>
        <DialogContent size="lg" className="p-0">
          <div className="aspect-video w-full overflow-hidden rounded-xl bg-brand-800">
            <PitchImage
              src={openIndex !== null ? sorted[openIndex]?.imageUrl : null}
              alt={stadiumName}
              className="size-full"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
