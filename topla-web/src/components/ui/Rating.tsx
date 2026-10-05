import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/utils/cn'

export function Rating({
  value,
  size = 'md',
  className,
}: {
  value: number
  size?: 'sm' | 'md'
  className?: string
}) {
  const rounded = Math.round(value)
  const dimension = size === 'sm' ? 'size-3.5' : 'size-4'

  return (
    <span
      className={cn('inline-flex items-center gap-0.5', className)}
      aria-label={`${value.toFixed(1)} / 5 ulduz`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            dimension,
            star <= rounded ? 'fill-volt-500 text-volt-500' : 'fill-ink-200 text-ink-200',
          )}
          aria-hidden="true"
        />
      ))}
    </span>
  )
}

export function RatingInput({
  value,
  onChange,
  id,
}: {
  value: number
  onChange: (value: number) => void
  id?: string
}) {
  const [hovered, setHovered] = useState(0)
  const active = hovered || value

  return (
    <div
      id={id}
      role="radiogroup"
      aria-label="Reytinq seç"
      className="inline-flex items-center gap-1"
      onMouseLeave={() => setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} ulduz`}
          onMouseEnter={() => setHovered(star)}
          onClick={() => onChange(star)}
          className="rounded-xs p-0.5 transition-transform hover:scale-110"
        >
          <Star
            className={cn(
              'size-7',
              star <= active ? 'fill-volt-500 text-volt-500' : 'fill-ink-100 text-ink-300',
            )}
          />
        </button>
      ))}
    </div>
  )
}
