import type * as React from 'react'
import { forwardRef } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

/** Mobil naviqasiya və filtr panelləri üçün yandan/aşağıdan açılan panel. */
export const Sheet = DialogPrimitive.Root
export const SheetTrigger = DialogPrimitive.Trigger
export const SheetClose = DialogPrimitive.Close
export const SheetTitle = DialogPrimitive.Title

export interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  side?: 'left' | 'right' | 'bottom'
}

export const SheetContent = forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(function SheetContent({ className, children, side = 'left', ...props }, ref) {
  const sides = {
    left: 'inset-y-0 left-0 h-full w-[min(20rem,85vw)] border-r',
    right: 'inset-y-0 right-0 h-full w-[min(22rem,90vw)] border-l',
    bottom: 'inset-x-0 bottom-0 max-h-[85dvh] rounded-t-xl border-t',
  } as const

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink-900/45 backdrop-blur-[2px]" />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'fixed z-50 flex flex-col overflow-y-auto border-line bg-surface shadow-overlay focus:outline-none',
          sides[side],
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className="absolute right-3 top-3 grid size-8 place-items-center rounded-sm text-ink-500 hover:bg-ink-100"
          aria-label="Bağla"
        >
          <X className="size-4" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
})
