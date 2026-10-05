import { useMemo, useState } from 'react'
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { az } from 'date-fns/locale'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { cn } from '@/utils/cn'
import { bakuNow, bakuToday } from '@/utils/format'
import { Button } from './Button'

const WEEK_LABELS = ['B.e', 'Ç.a', 'Ç', 'C.a', 'C', 'Ş', 'B']

export function Calendar({
  value,
  onChange,
  minDate,
  maxDate,
  className,
}: {
  value: Date
  onChange: (date: Date) => void
  minDate?: Date
  maxDate?: Date
  className?: string
}) {
  const [cursor, setCursor] = useState(() => startOfMonth(value))

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 })
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }, [cursor])

  const isDisabled = (day: Date) => {
    if (minDate && isBefore(startOfDay(day), startOfDay(minDate))) return true
    if (maxDate && isBefore(startOfDay(maxDate), startOfDay(day))) return true
    return false
  }

  return (
    <div className={cn('w-72 p-3', className)}>
      <div className="mb-2 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setCursor((current) => subMonths(current, 1))}
          aria-label="Əvvəlki ay"
        >
          <ChevronLeft />
        </Button>
        <p className="text-sm font-bold capitalize text-ink-900">
          {format(cursor, 'LLLL yyyy', { locale: az })}
        </p>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setCursor((current) => addMonths(current, 1))}
          aria-label="Növbəti ay"
        >
          <ChevronRight />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-0.5" role="grid">
        {WEEK_LABELS.map((label) => (
          <div
            key={label}
            className="py-1 text-center text-2xs font-bold uppercase text-ink-400"
            role="columnheader"
          >
            {label}
          </div>
        ))}

        {days.map((day) => {
          const selected = isSameDay(day, value)
          const disabled = isDisabled(day)
          const outside = !isSameMonth(day, cursor)

          return (
            <button
              key={day.toISOString()}
              type="button"
              role="gridcell"
              disabled={disabled}
              aria-selected={selected}
              onClick={() => onChange(startOfDay(day))}
              className={cn(
                'h-9 rounded-sm text-[13px] font-medium transition-colors',
                selected
                  ? 'bg-brand-700 font-bold text-white'
                  : disabled
                    ? 'cursor-not-allowed text-ink-300 line-through'
                    : outside
                      ? 'text-ink-300 hover:bg-ink-100'
                      : 'text-ink-700 hover:bg-brand-50 hover:text-brand-800',
              )}
            >
              {format(day, 'd')}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function DatePicker({
  value,
  onChange,
  minDate,
  maxDate,
  id,
  className,
  placeholder = 'Tarix seç',
}: {
  value: Date | null
  onChange: (date: Date) => void
  minDate?: Date
  maxDate?: Date
  id?: string
  className?: string
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          id={id}
          type="button"
          className={cn(
            'flex h-10 w-full items-center gap-2 rounded-md border border-line-strong bg-surface px-3 text-left text-sm',
            'transition-[border-color,box-shadow] hover:border-line-strong focus:border-brand-600 focus:outline-none focus:ring-3 focus:ring-brand-100',
            className,
          )}
        >
          <CalendarDays className="size-4 shrink-0 text-ink-400" aria-hidden="true" />
          <span className={value ? 'text-ink-900' : 'text-ink-400'}>
            {value ? format(value, 'd MMMM yyyy', { locale: az }) : placeholder}
          </span>
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={6}
          className="z-50 rounded-md border border-line bg-surface shadow-overlay"
        >
          <Calendar
            value={value ?? bakuNow()}
            onChange={(date) => {
              onChange(date)
              setOpen(false)
            }}
            minDate={minDate}
            maxDate={maxDate}
          />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}

/** Tarixi sürətlə dəyişmək üçün üfüqi lent — mobil booking axınında istifadə olunur. */
export function DateStrip({
  value,
  onChange,
  days = 14,
  className,
}: {
  value: Date
  onChange: (date: Date) => void
  days?: number
  className?: string
}) {
  // "Bugün" Bakı təqviminə görə — brauzer qurşağından asılı deyil.
  const today = bakuToday()
  const items = Array.from({ length: days }, (_, index) => addDays(today, index))

  return (
    <div
      className={cn('-mx-1 flex gap-2 overflow-x-auto px-1 pb-1', className)}
      role="tablist"
      aria-label="Tarix seçimi"
    >
      {items.map((day) => {
        const selected = isSameDay(day, value)
        return (
          <button
            key={day.toISOString()}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(day)}
            className={cn(
              'flex min-w-14 shrink-0 flex-col items-center rounded-md border px-3 py-2 transition-colors',
              selected
                ? 'border-brand-700 bg-brand-700 text-white'
                : 'border-line-strong bg-surface text-ink-700 hover:border-brand-300 hover:bg-brand-50',
            )}
          >
            <span className="text-2xs font-semibold uppercase opacity-80">
              {format(day, 'EEEEEE', { locale: az })}
            </span>
            <span className="text-base font-bold leading-tight">{format(day, 'd')}</span>
          </button>
        )
      })}
    </div>
  )
}
