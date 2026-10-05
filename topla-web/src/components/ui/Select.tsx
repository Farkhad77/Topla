import type * as React from 'react'
import { forwardRef } from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'

/**
 * Radix Select-in məlum "click-through" bagı (radix-ui/primitives #1658):
 * dropdown portal ilə siyahının ÜSTÜNDƏ açılır; variant seçiləndə Select
 * pointerup-da bağlanır, brauzerin yaratdığı növbəti `click` hadisəsi isə
 * eyni koordinatda altda qalan elementə düşür. Stadion kartı bütöv link
 * olduğu üçün (after:absolute after:inset-0) filtr seçimi istifadəçini
 * stadion səhifəsinə atırdı. Həll: bağlanan anda növbəti klik udulur.
 */
function suppressNextClick() {
  const swallow = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    window.removeEventListener('click', swallow, true)
  }
  window.addEventListener('click', swallow, true)
  // Ghost-klik gəlməsə (məs. klaviatura ilə seçim), guard asılı qalıb
  // istifadəçinin NÖVBƏTİ real klikini udmasın deyə qısa müddətdə silinir.
  window.setTimeout(() => window.removeEventListener('click', swallow, true), 150)
}

export function Select({ onOpenChange, ...props }: SelectPrimitive.SelectProps) {
  return (
    <SelectPrimitive.Root
      {...props}
      onOpenChange={(open) => {
        if (!open) suppressNextClick()
        onOpenChange?.(open)
      }}
    />
  )
}

export const SelectValue = SelectPrimitive.Value

export const SelectTrigger = forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & { invalid?: boolean }
>(function SelectTrigger({ className, children, invalid, ...props }, ref) {
  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        'flex h-10 w-full items-center justify-between gap-2 rounded-md border bg-surface px-3 text-sm text-ink-900',
        'transition-[border-color,box-shadow] duration-150 data-[placeholder]:text-ink-400',
        'focus:outline-none focus:border-brand-600 focus:ring-3 focus:ring-brand-100',
        'disabled:cursor-not-allowed disabled:bg-ink-50',
        invalid ? 'border-danger' : 'border-line-strong',
        className,
      )}
      {...props}
    >
      <span className="truncate text-left">{children}</span>
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="size-4 shrink-0 text-ink-400" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
})

export const SelectContent = forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(function SelectContent({ className, children, position = 'popper', ...props }, ref) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        position={position}
        sideOffset={6}
        className={cn(
          'z-50 max-h-72 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md border border-line bg-surface shadow-overlay',
          className,
        )}
        {...props}
      >
        <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
})

export const SelectItem = forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(function SelectItem({ className, children, ...props }, ref) {
  return (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        'relative flex cursor-pointer select-none items-center rounded-sm py-2 pl-3 pr-8 text-sm text-ink-800 outline-none',
        'data-[highlighted]:bg-brand-50 data-[highlighted]:text-brand-800',
        'data-[state=checked]:font-semibold data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="absolute right-2.5">
        <Check className="size-4 text-brand-700" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
})

/** Sadə hallar üçün qısa yol: options massivi ilə tam select. */
export function SimpleSelect({
  value,
  onValueChange,
  options,
  placeholder = 'Seç…',
  id,
  className,
  invalid,
  ariaLabel,
}: {
  value: string
  onValueChange: (value: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
  id?: string
  className?: string
  invalid?: boolean
  ariaLabel?: string
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger id={id} className={className} invalid={invalid} aria-label={ariaLabel}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
