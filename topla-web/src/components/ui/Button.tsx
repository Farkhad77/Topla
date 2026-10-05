import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold',
    'transition-[background-color,border-color,color,box-shadow,transform] duration-150',
    'disabled:pointer-events-none disabled:opacity-55',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600',
    '[&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        primary: 'bg-brand-700 text-white hover:bg-brand-800 active:bg-brand-900 shadow-card',
        secondary:
          'bg-surface text-ink-800 border border-line-strong hover:bg-ink-50 active:bg-ink-100',
        soft: 'bg-brand-50 text-brand-800 hover:bg-brand-100 active:bg-brand-200',
        ghost: 'text-ink-700 hover:bg-ink-100 active:bg-ink-200',
        danger: 'bg-danger text-white hover:brightness-110 active:brightness-95',
        'danger-soft': 'bg-danger-soft text-danger hover:brightness-95',
        dark: 'bg-ink-900 text-white hover:bg-ink-800',
        link: 'text-brand-700 underline-offset-4 hover:underline p-0 h-auto font-semibold',
      },
      size: {
        sm: 'h-8 rounded-sm px-3 text-[13px] [&_svg]:size-3.5',
        md: 'h-10 rounded-md px-4 text-sm [&_svg]:size-4',
        lg: 'h-12 rounded-md px-6 text-[15px] [&_svg]:size-4.5',
        icon: 'size-9 rounded-md [&_svg]:size-4',
        'icon-sm': 'size-8 rounded-sm [&_svg]:size-3.5',
      },
      block: { true: 'w-full', false: '' },
    },
    defaultVariants: { variant: 'primary', size: 'md', block: false },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, block, asChild = false, loading = false, children, disabled, ...props },
  ref,
) {
  const Component = asChild ? Slot : 'button'

  return (
    <Component
      ref={ref}
      className={cn(buttonVariants({ variant, size, block }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin" aria-hidden="true" />
          <span>{children}</span>
        </>
      ) : (
        children
      )}
    </Component>
  )
})

export { buttonVariants }
