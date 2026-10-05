import type * as React from 'react'
import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/utils/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
  leading?: ReactNode
  trailing?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, leading, trailing, ...props },
  ref,
) {
  const field = (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        'h-10 w-full rounded-md border bg-surface px-3 text-sm text-ink-900',
        'placeholder:text-ink-400 transition-[border-color,box-shadow] duration-150',
        'focus:outline-none focus:border-brand-600 focus:ring-3 focus:ring-brand-100',
        'disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-400',
        invalid ? 'border-danger focus:border-danger focus:ring-danger-soft' : 'border-line-strong',
        leading && 'pl-9',
        trailing && 'pr-9',
        className,
      )}
      {...props}
    />
  )

  if (!leading && !trailing) return field

  return (
    <div className="relative">
      {leading ? (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 [&_svg]:size-4">
          {leading}
        </span>
      ) : null}
      {field}
      {trailing ? (
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400 [&_svg]:size-4">
          {trailing}
        </span>
      ) : null}
    </div>
  )
})

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }
>(function Textarea({ className, invalid, rows = 4, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(
        'w-full rounded-md border bg-surface px-3 py-2.5 text-sm text-ink-900',
        'placeholder:text-ink-400 transition-[border-color,box-shadow] duration-150 resize-y',
        'focus:outline-none focus:border-brand-600 focus:ring-3 focus:ring-brand-100',
        'disabled:cursor-not-allowed disabled:bg-ink-50',
        invalid ? 'border-danger focus:border-danger focus:ring-danger-soft' : 'border-line-strong',
        className,
      )}
      {...props}
    />
  )
})
