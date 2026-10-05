import type * as React from 'react'
import { forwardRef, type ReactNode } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close

const Overlay = forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(function Overlay({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn(
        'fixed inset-0 z-50 bg-ink-900/45 backdrop-blur-[2px]',
        className,
      )}
      {...props}
    />
  )
})

export interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  size?: 'sm' | 'md' | 'lg'
}

/** Radix fokus tələsi, Esc və ekran oxuyucu dəstəyini hazır verir. */
export const DialogContent = forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(function DialogContent({ className, children, size = 'md', ...props }, ref) {
  const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl' } as const

  return (
    <DialogPrimitive.Portal>
      <Overlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2',
          'max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-xl border border-line bg-surface shadow-overlay',
          'focus:outline-none animate-fade-up',
          sizes[size],
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className="absolute right-4 top-4 grid size-8 place-items-center rounded-sm text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-800"
          aria-label="Bağla"
        >
          <X className="size-4" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
})

export function DialogHeader({
  title,
  description,
  className,
}: {
  title: ReactNode
  description?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('space-y-1 border-b border-line px-5 py-4 pr-14', className)}>
      <DialogPrimitive.Title className="text-base font-bold text-ink-900">
        {title}
      </DialogPrimitive.Title>
      {description ? (
        <DialogPrimitive.Description className="text-[13px] leading-relaxed text-ink-500">
          {description}
        </DialogPrimitive.Description>
      ) : null}
    </div>
  )
}

export function DialogBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 py-4', className)} {...props} />
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex flex-col-reverse gap-2 border-t border-line px-5 py-4 sm:flex-row sm:justify-end',
        className,
      )}
      {...props}
    />
  )
}
