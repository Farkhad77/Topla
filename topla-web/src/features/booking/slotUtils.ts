import { addMinutes, isBefore } from 'date-fns'
import { bakuNow, toDate } from '@/utils/format'
import type { BookingSlot } from '@/types'

export interface SlotView {
  slot: BookingSlot
  start: Date
  end: Date
  state: 'free' | 'busy' | 'past'
}

export function buildSlotViews(slots: BookingSlot[]): SlotView[] {
  // Backend UTC ("…Z") qaytarır — toDate Bakı divar saatına çevirir,
  // "keçib" yoxlaması da Bakı "indi"si ilə aparılır.
  const now = bakuNow()

  return slots
    .map((slot) => {
      const start = toDate(slot.startTime) ?? new Date(Number.NaN)
      const end = toDate(slot.endTime) ?? new Date(Number.NaN)
      const past = isBefore(start, now)
      return {
        slot,
        start,
        end,
        state: past ? ('past' as const) : slot.isAvailable ? ('free' as const) : ('busy' as const),
      }
    })
    .filter((view) => !Number.isNaN(view.start.getTime()))
    .sort((a, b) => a.start.getTime() - b.start.getTime())
}

/**
 * Seçilmiş müddət bir neçə saatlıq slotu əhatə edə bilər —
 * hamısı boş olmalıdır, əks halda bron mümkün deyil.
 */
export function isRangeAvailable(
  views: SlotView[],
  start: Date,
  durationMinutes: number,
): boolean {
  const end = addMinutes(start, durationMinutes)
  const covered = views.filter((view) => view.start < end && view.end > start)
  if (!covered.length) return false

  // Bütün interval iş saatları daxilində olmalıdır.
  const lastCovered = covered[covered.length - 1]
  if (!lastCovered || lastCovered.end < end) return false

  return covered.every((view) => view.state === 'free')
}

/**
 * PricingService ilə eyni qayda: 18:00–22:00 aralığında başlayan bron 1.5x.
 * `start` Bakı divar saatı daşıyan Date-dir (buildSlotViews-dan gəlir),
 * ona görə getHours() burada məhz Bakı saatını qaytarır.
 */
export function estimatePrice(pricePerHour: number, start: Date, durationMinutes: number): number {
  const hours = durationMinutes / 60
  const base = pricePerHour * hours
  const hour = start.getHours()
  return hour >= 18 && hour < 22 ? base * 1.5 : base
}

export const PEAK_HOURS_LABEL = 'Axşam saatlarına (18:00–22:00) 1.5x tarif tətbiq olunur'
