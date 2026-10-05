import { cn } from '@/utils/cn'

/**
 * Topla loqosu: yuvarlaqlaşdırılmış meydança + top.
 * Kiçik ölçüdə (16–24px) də oxunaqlı qalsın deyə detallar minimaldır.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn('size-8', className)}
      role="img"
      aria-label="Topla"
      fill="none"
    >
      <rect width="32" height="32" rx="9" className="fill-brand-700" />
      <g stroke="currentColor" className="text-white/25" strokeWidth="1.2" fill="none">
        <rect x="4.5" y="4.5" width="23" height="23" rx="4" />
        <path d="M16 4.5v23" />
        <circle cx="16" cy="16" r="5" />
      </g>
      <circle cx="16" cy="16" r="3.4" className="fill-white" />
      <path
        d="M16 13.4l1.9 1.38-.73 2.24h-2.34l-.73-2.24L16 13.4z"
        className="fill-brand-800"
      />
    </svg>
  )
}

export function Logo({
  className,
  tone = 'brand',
  showWordmark = true,
}: {
  className?: string
  tone?: 'brand' | 'light'
  showWordmark?: boolean
}) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark className="size-8" />
      {showWordmark ? (
        <span
          className={cn(
            'text-[22px] font-extrabold leading-none tracking-[-0.045em]',
            tone === 'light' ? 'text-white' : 'text-brand-700',
          )}
        >
          topla
        </span>
      ) : null}
    </span>
  )
}
