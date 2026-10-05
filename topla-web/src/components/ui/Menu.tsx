import type * as React from 'react'
import { forwardRef } from 'react'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { cn } from '@/utils/cn'

export const DropdownMenu = DropdownMenuPrimitive.Root
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

export const DropdownMenuContent = forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(function DropdownMenuContent({ className, sideOffset = 8, align = 'end', ...props }, ref) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'z-50 min-w-52 overflow-hidden rounded-md border border-line bg-surface p-1 shadow-overlay',
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
})

export const DropdownMenuItem = forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & { danger?: boolean }
>(function DropdownMenuItem({ className, danger, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.Item
      ref={ref}
      className={cn(
        'flex cursor-pointer select-none items-center gap-2.5 rounded-sm px-3 py-2 text-[13px] font-medium outline-none',
        '[&_svg]:size-4 [&_svg]:shrink-0 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        danger
          ? 'text-danger data-[highlighted]:bg-danger-soft'
          : 'text-ink-700 data-[highlighted]:bg-ink-100 data-[highlighted]:text-ink-900',
        className,
      )}
      {...props}
    />
  )
})

export function DropdownMenuLabel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-3 py-2 text-2xs font-bold uppercase tracking-wide text-ink-400', className)} {...props} />
}

export const DropdownMenuSeparator = forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(function DropdownMenuSeparator({ className, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.Separator
      ref={ref}
      className={cn('my-1 h-px bg-line', className)}
      {...props}
    />
  )
})
