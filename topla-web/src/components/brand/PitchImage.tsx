import { useState } from 'react'
import { cn } from '@/utils/cn'
import { mediaUrl } from '@/utils/env'

/**
 * Stadion şəkli. Şəkil yoxdursa və ya yüklənmirsə CSS meydança teksturası göstərilir —
 * beləliklə heç vaxt "sınıq şəkil" ikonu görünmür.
 */
export function PitchImage({
  src,
  alt,
  className,
  eager = false,
}: {
  src?: string | null
  alt: string
  className?: string
  eager?: boolean
}) {
  const [failed, setFailed] = useState(false)
  const resolved = mediaUrl(src)

  if (!resolved || failed) {
    return (
      <div className={cn('pitch-surface', className)} role="img" aria-label={alt}>
        <span className="sr-only">{alt}</span>
      </div>
    )
  }

  return (
    <img
      src={resolved}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(true)}
      className={cn('size-full object-cover', className)}
    />
  )
}
