import { cn } from '@/utils/cn'
import { initials } from '@/utils/format'

export function Avatar({
  name,
  size = 'md',
  className,
  tone = 'brand',
}: {
  name: string | null | undefined
  size?: 'sm' | 'md' | 'lg'
  className?: string
  tone?: 'brand' | 'dark' | 'light'
}) {
  const sizes = {
    sm: 'size-7 text-[11px]',
    md: 'size-9 text-[13px]',
    lg: 'size-11 text-sm',
  } as const

  const tones = {
    brand: 'bg-brand-100 text-brand-800',
    dark: 'bg-ink-900 text-white',
    light: 'bg-white/15 text-white',
  } as const

  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center rounded-full font-bold uppercase',
        sizes[size],
        tones[tone],
        className,
      )}
      aria-hidden="true"
      title={name ?? undefined}
    >
      {initials(name)}
    </span>
  )
}
