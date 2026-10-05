import { format, formatDistanceToNowStrict, isValid, parseISO, startOfDay } from 'date-fns'
import { az } from 'date-fns/locale'
import { CURRENCY } from './constants'

/**
 * ARENIO SAAT QURŞAĞI QAYDALARI
 * ─────────────────────────────
 * İstifadəçiyə görünən BÜTÜN stadion/booking vaxtları Bakı (Asia/Baku) vaxtıdır —
 * brauzerin yerli saat qurşağından ASILI DEYİL.
 *
 * Backend-dən gələn dəyərlər iki formada ola bilər:
 *  - UTC anı ("2026-08-21T14:00:00Z") → Intl ilə Bakı divar saatına çevrilir (18:00);
 *  - qurşaqsız divar saatı ("2026-08-21T18:00:00") → artıq Bakı vaxtıdır, olduğu kimi oxunur.
 *
 * Tətbiq daxilində bütün Date obyektləri "Bakı divar saatı" kimi işlədilir.
 * Heç vaxt əl ilə +4/-4 saat əlavə edilmir — çevirmə yalnız Intl.DateTimeFormat ilə aparılır.
 */
export const BAKU_TIMEZONE = 'Asia/Baku'

/** Dəyərin sonunda saat qurşağı göstəricisi (Z və ya ±hh:mm) varmı? */
const HAS_TZ_SUFFIX = /(?:Z|[+-]\d{2}:?\d{2})$/i

const bakuPartsFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: BAKU_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})

/**
 * Həqiqi zaman anını (Date/epoch) Bakı divar saatını daşıyan Date obyektinə çevirir.
 * Qaytarılan Date-in sahələri (getHours və s.) Bakı vaxtını göstərir.
 */
export function instantToBakuWall(instant: Date): Date {
  const parts = bakuPartsFormatter.formatToParts(instant)
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0)
  // Intl bəzi mühitlərdə 24:00 qaytara bilər — 00:00 kimi normallaşdırırıq.
  const hour = get('hour') % 24
  return new Date(get('year'), get('month') - 1, get('day'), hour, get('minute'), get('second'))
}

/** Bakı divar saatı ilə "indi". Bütün "bu an" müqayisələri bununla aparılmalıdır. */
export function bakuNow(): Date {
  return instantToBakuWall(new Date())
}

/** Bakı təqviminə görə bugünkü günün başlanğıcı. */
export function bakuToday(): Date {
  return startOfDay(bakuNow())
}

/**
 * API dəyərini Bakı divar saatı daşıyan Date-ə çevirir:
 *  - "…Z" / "…+02:00" → Intl ilə Bakı divar saatına;
 *  - qurşaqsız string → olduğu kimi (backend kontraktına görə artıq Bakı vaxtıdır);
 *  - Date obyekti → tətbiq daxilində artıq divar saatı sayılır, toxunulmur.
 */
export function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null
  if (value instanceof Date) return isValid(value) ? value : null
  const parsed = parseISO(value)
  if (!isValid(parsed)) return null
  return HAS_TZ_SUFFIX.test(value.trim()) ? instantToBakuWall(parsed) : parsed
}

/** Backend-ə göndərmək üçün: saat qurşağı sonluğu OLMADAN yerli divar saatı. */
export function toWallClockIso(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm:ss")
}

export function toDateParam(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function formatDate(value: string | Date | null | undefined): string {
  const date = toDate(value)
  return date ? format(date, 'd MMMM yyyy', { locale: az }) : '—'
}

export function formatShortDate(value: string | Date | null | undefined): string {
  const date = toDate(value)
  return date ? format(date, 'd MMM', { locale: az }) : '—'
}

export function formatWeekday(value: string | Date | null | undefined): string {
  const date = toDate(value)
  return date ? format(date, 'EEEE', { locale: az }) : '—'
}

export function formatTime(value: string | Date | null | undefined): string {
  const date = toDate(value)
  return date ? format(date, 'HH:mm') : '—'
}

export function formatDateTime(value: string | Date | null | undefined): string {
  const date = toDate(value)
  return date ? format(date, 'd MMM yyyy, HH:mm', { locale: az }) : '—'
}

export function formatTimeRange(
  start: string | Date | null | undefined,
  end: string | Date | null | undefined,
): string {
  const from = formatTime(start)
  const to = formatTime(end)
  if (from === '—' || to === '—') return '—'
  return `${from}–${to}`
}

export function formatRelative(value: string | Date | null | undefined): string {
  const date = toDate(value)
  if (!date) return '—'
  // `date` Bakı divar saatıdır, formatDistanceToNowStrict isə brauzer "indi"si ilə
  // müqayisə edir. Fərq eyni qalsın deyə dəyəri brauzer vaxtına sürüşdürürük.
  const browserEquivalent = new Date(Date.now() + (date.getTime() - bakuNow().getTime()))
  return `${formatDistanceToNowStrict(browserEquivalent, { locale: az })} əvvəl`
}

export function formatPrice(value: number | null | undefined, withUnit = false): string {
  if (value == null || Number.isNaN(value)) return '—'
  const rounded = Math.round(value * 100) / 100
  const text = new Intl.NumberFormat('az-AZ', {
    minimumFractionDigits: Number.isInteger(rounded) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(rounded)
  return `${text} ${CURRENCY}${withUnit ? '/saat' : ''}`
}

export function formatNumber(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat('az-AZ').format(value)
}

export function formatPercent(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—'
  return `${Math.round(value)}%`
}

/** "18:00:00" → "18:00" */
export function formatTimeOnly(value: string | null | undefined): string {
  if (!value) return '—'
  const [h = '00', m = '00'] = value.split(':')
  return `${h.padStart(2, '0')}:${m}`
}

export function initials(name: string | null | undefined): string {
  if (!name) return '?'
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

/**
 * Mərkəzi Bakı formatlayıcıları — formatTime/formatDate/formatDateTime artıq
 * Bakı vaxtında işləyir (toDate çevirməni aparır); bu adlar açıq niyyət üçündür.
 */
export const formatBakuTime = formatTime
export const formatBakuDate = formatDate
export const formatBakuDateTime = formatDateTime

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} dəq`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest === 0 ? `${hours} saat` : `${hours} saat ${rest} dəq`
}
