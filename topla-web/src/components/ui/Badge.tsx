import { cva, type VariantProps } from 'class-variance-authority'
import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full font-semibold whitespace-nowrap',
  {
    variants: {
      tone: {
        neutral: 'bg-ink-100 text-ink-700',
        brand: 'bg-brand-50 text-brand-800',
        success: 'bg-success-soft text-success',
        warning: 'bg-warning-soft text-warning',
        danger: 'bg-danger-soft text-danger',
        info: 'bg-info-soft text-info',
        dark: 'bg-ink-900 text-white',
        outline: 'border border-line-strong bg-surface text-ink-700',
      },
      size: {
        sm: 'px-2 py-0.5 text-2xs',
        md: 'px-2.5 py-1 text-xs',
      },
    },
    defaultVariants: { tone: 'neutral', size: 'md' },
  },
)

export interface BadgeProps extends VariantProps<typeof badgeVariants> {
  children: ReactNode
  className?: string
  dot?: boolean
}

export function Badge({ children, className, tone, size, dot }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone, size }), className)}>
      {dot ? <span className="size-1.5 rounded-full bg-current" aria-hidden="true" /> : null}
      {children}
    </span>
  )
}
