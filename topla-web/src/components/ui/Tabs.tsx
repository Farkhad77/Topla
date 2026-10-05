import type * as React from 'react'
import { forwardRef } from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '@/utils/cn'

export const Tabs = TabsPrimitive.Root

export const TabsList = forwardRef<
  React.ComponentRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(function TabsList({ className, ...props }, ref) {
  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        'inline-flex items-center gap-1 overflow-x-auto rounded-md bg-ink-100 p-1',
        className,
      )}
      {...props}
    />
  )
})

export const TabsTrigger = forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(function TabsTrigger({ className, ...props }, ref) {
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        'whitespace-nowrap rounded-sm px-3.5 py-1.5 text-[13px] font-semibold text-ink-600 transition-colors',
        'hover:text-ink-900 data-[state=active]:bg-surface data-[state=active]:text-brand-800 data-[state=active]:shadow-card',
        className,
      )}
      {...props}
    />
  )
})

export const TabsContent = forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(function TabsContent({ className, ...props }, ref) {
  return (
    <TabsPrimitive.Content
      ref={ref}
      className={cn('mt-4 focus-visible:outline-none', className)}
      {...props}
    />
  )
})
