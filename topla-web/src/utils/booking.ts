import { BookingStatus, type BookingStatusValue, type BookingUiStatus } from '@/types'
import { bakuNow, toDate } from './format'

/**
 * Backend statusu: Pending/Confirmed/Cancelled/Completed.
 * Completed real statusdur (background job verir); job hələ işləməyibsə
 * vaxtı bitmiş Confirmed bron UI-da yenə "Tamamlandı" görünür.
 * "Rədd edildi" ləğv səbəbindən törədilir.
 */
export function resolveBookingState(input: {
  status: BookingStatusValue
  endDateTime: string
  rejectReason?: string | null
}): BookingUiStatus {
  const end = toDate(input.endDateTime)
  // Tarixlər Bakı divar saatındadır — "indi" də Bakı vaxtı ilə götürülür.
  const now = bakuNow()

  if (input.status === BookingStatus.Completed) return 'completed'
  if (input.status === BookingStatus.Cancelled) {
    return input.rejectReason ? 'rejected' : 'cancelled'
  }
  if (input.status === BookingStatus.Confirmed && end && end < now) return 'completed'
  // Köhnə qalıq Pending sətirləri: vaxtı keçibsə ləğv edilmiş sayılır.
  if (input.status === BookingStatus.Pending && end && end < now) return 'cancelled'
  return input.status === BookingStatus.Confirmed ? 'confirmed' : 'pending'
}

export const BOOKING_STATUS_LABELS: Record<BookingUiStatus, string> = {
  pending: 'Gözləyir',
  confirmed: 'Təsdiqlənib',
  cancelled: 'Ləğv edilib',
  completed: 'Tamamlandı',
  rejected: 'Rədd edilib',
}

export function isUpcoming(startDateTime: string): boolean {
  const start = toDate(startDateTime)
  return !!start && start.getTime() > bakuNow().getTime()
}

/** Oyuna 6 saatdan az qalıbsa istifadəçi ləğv edə bilməz (məhsul qaydası). */
export const CANCEL_WINDOW_HOURS = 6

export function canCancel(input: { status: BookingStatusValue; startDateTime: string }): boolean {
  if (input.status === BookingStatus.Cancelled) return false
  const start = toDate(input.startDateTime)
  if (!start) return false
  const hoursLeft = (start.getTime() - bakuNow().getTime()) / 3_600_000
  return hoursLeft >= CANCEL_WINDOW_HOURS
}

export function hoursUntil(startDateTime: string): number {
  const start = toDate(startDateTime)
  if (!start) return 0
  return (start.getTime() - bakuNow().getTime()) / 3_600_000
}

/** "18:00:00" → dəqiqə. */
export function timeOnlyToMinutes(value: string): number {
  const [h = '0', m = '0'] = value.split(':')
  return Number(h) * 60 + Number(m)
}

/**
 * Bron müddəti yalnız tam saatlarla seçilir (backend validatoru da bunu tələb edir).
 * Stadionun min-i tam saata yuvarlaqlaşdırılır (90 → 120), max-ı aşağı salınır (150 → 120);
 * yuxarı hədd stadionun öz MaxBookingMinutes dəyəridir — süni limit yoxdur.
 */
export function durationOptionsFor(min: number, max: number): number[] {
  const step = 60
  const safeMin = Math.max(step, Math.ceil((min || step) / step) * step)
  const safeMax = Math.max(safeMin, Math.floor((max || safeMin) / step) * step)
  const options: number[] = []
  for (let value = safeMin; value <= safeMax; value += step) options.push(value)
  return options.length ? options : [safeMin]
}
