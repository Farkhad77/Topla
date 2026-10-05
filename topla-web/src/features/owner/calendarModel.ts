import { isSameDay, setHours, startOfDay } from 'date-fns'
import { BookingStatus } from '@/types'
import { timeOnlyToMinutes } from '@/utils/booking'
import { bakuNow, toDate } from '@/utils/format'
import type { CalendarCell, CalendarColumn } from './CalendarGrid'
import type { BlockedSlot, BookingSlot, OwnerBooking, OwnerStadium } from '@/types'

const DEFAULT_OPEN_HOUR = 8
const DEFAULT_CLOSE_HOUR = 23

function overlaps(start: Date, end: Date, otherStart: string, otherEnd: string): boolean {
  const from = toDate(otherStart)
  const to = toDate(otherEnd)
  if (!from || !to) return false
  return from < end && to > start
}

/** Cədvəlin sətirləri stadionun iş saatlarından qurulur. */
export function resolveHours(stadium: OwnerStadium | null): number[] {
  const open = stadium?.openTime
    ? Math.floor(timeOnlyToMinutes(stadium.openTime) / 60)
    : DEFAULT_OPEN_HOUR
  const close = stadium?.closeTime
    ? Math.ceil(timeOnlyToMinutes(stadium.closeTime) / 60)
    : DEFAULT_CLOSE_HOUR

  if (!Number.isFinite(open) || !Number.isFinite(close) || close <= open) return []
  return Array.from({ length: close - open }, (_, index) => open + index)
}

export function buildCalendarColumns(input: {
  days: Date[]
  hours: number[]
  bookings: OwnerBooking[]
  blockedSlots: BlockedSlot[]
  /** Yalnız `slotsDay` üçün backend-in əlçatanlıq cavabı mövcuddur. */
  slots: BookingSlot[]
  slotsDay: Date
}): CalendarColumn[] {
  const { days, hours, bookings, blockedSlots, slots, slotsDay } = input
  // Bütün hüceyrə/booking tarixləri Bakı divar saatındadır — "indi" də Bakı vaxtı ilə.
  const now = bakuNow()
  const active = bookings.filter((booking) => booking.status !== BookingStatus.Cancelled)

  return days.map((day) => ({
    day,
    cells: hours.map((hour) => {
      const cellStart = setHours(startOfDay(day), hour)
      const cellEnd = setHours(startOfDay(day), hour + 1)

      const booking =
        active.find((item) => overlaps(cellStart, cellEnd, item.startDateTime, item.endDateTime)) ??
        null
      const blocked =
        blockedSlots.find((item) => overlaps(cellStart, cellEnd, item.startTime, item.endTime)) ??
        null

      const slot = isSameDay(day, slotsDay)
        ? slots.find((item) => {
            const start = toDate(item.startTime)
            return !!start && isSameDay(start, day) && start.getHours() === hour
          })
        : undefined

      let state: CalendarCell['state']
      if (booking && blocked) state = 'conflict'
      else if (booking) state = 'booked'
      else if (blocked) state = 'blocked'
      else if (cellEnd <= now) state = 'past'
      else if (slot && !slot.isAvailable) state = 'unavailable'
      else state = 'free'

      return {
        key: `${day.toISOString()}-${hour}`,
        day,
        hour,
        state,
        booking,
        blocked,
        bookingLabel: booking
          ? `${booking.customerName || 'Müştəri'}${
              booking.status === BookingStatus.Pending ? ' · gözləyir' : ''
            }`
          : null,
      }
    }),
  }))
}
