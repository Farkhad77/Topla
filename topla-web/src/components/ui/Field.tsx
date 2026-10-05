import type * as React from 'react'
import { useId, type ReactElement, type ReactNode } from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'
import { cn } from '@/utils/cn'

export function Label({
  className,
  required,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & { required?: boolean }) {
  return (
    <LabelPrimitive.Root
      className={cn('block text-[13px] font-semibold text-ink-800', className)}
      {...props}
    >
      {children}
      {required ? (
        <span className="ml-0.5 text-danger" aria-hidden="true">
          *
        </span>
      ) : null}
    </LabelPrimitive.Root>
  )
}

interface FieldProps {
  label?: string
  hint?: string
  error?: string
  required?: boolean
  className?: string
  /** İd və aria bağlantıları avtomatik qurulur. */
  children: (ids: { id: string; describedBy: string | undefined; invalid: boolean }) => ReactElement
}

export function Field({ label, hint, error, required, className, children }: FieldProps) {
  const id = useId()
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const describedBy = error ? errorId : hint ? hintId : undefined

  return (
    <div className={cn('space-y-1.5', className)}>
      {label ? (
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
      ) : null}
      {children({ id, describedBy, invalid: !!error })}
      {error ? (
        <p id={errorId} role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs text-ink-500">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export function FormRow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('grid gap-4 sm:grid-cols-2', className)}>{children}</div>
}
