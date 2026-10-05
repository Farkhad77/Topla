import type * as React from 'react'
import { forwardRef, type ReactNode } from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { cn } from '@/utils/cn'

export const TooltipProvider = TooltipPrimitive.Provider

export const TooltipContent = forwardRef<
  React.ComponentRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(function TooltipContent({ className, sideOffset = 6, ...props }, ref) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          'z-50 max-w-64 rounded-sm bg-ink-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-raised',
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  )
})

export function Tooltip({
  content,
  children,
  side = 'top',
}: {
  content: ReactNode
  children: ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
}) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipContent side={side}>{content}</TooltipContent>
    </TooltipPrimitive.Root>
  )
}
