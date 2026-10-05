import { ROLE_HOME, STORAGE_KEYS } from '@/utils/constants'
import { storage } from '@/utils/storage'
import type { AuthUser } from '@/types'

/** BookingPanel qonaq üçün seçilmiş slotu bu formada saxlayır. */
export interface BookingIntent {
  stadiumId: string
  stadiumName: string
  startDateTime: string
  durationMinutes: number
}

export interface PostAuthTarget {
  to: string
  state?: BookingIntent
}

const AUTH_PATHS = ['/login', '/register', '/verify-otp', '/forgot-password', '/reset-password']

function readBookingIntent(): BookingIntent | null {
  const raw = storage.get(STORAGE_KEYS.lastBookingIntent)
  if (!raw) return null

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null

    const value = parsed as Partial<BookingIntent>
    if (
      typeof value.stadiumId !== 'string' ||
      typeof value.startDateTime !== 'string' ||
      typeof value.durationMinutes !== 'number'
    ) {
      return null
    }

    return {
      stadiumId: value.stadiumId,
      stadiumName: typeof value.stadiumName === 'string' ? value.stadiumName : 'Stadion',
      startDateTime: value.startDateTime,
      durationMinutes: value.durationMinutes,
    }
  } catch {
    return null
  }
}

/**
 * Girişdən sonra hara? Qonaq ikən seçilmiş slot hər şeydən üstündür —
 * istifadəçi bron axınının ortasında itməməlidir. Sonra `from`, sonra rolun ev səhifəsi.
 * Açar oxunan kimi silinir ki, köhnə niyyət ikinci dəfə işə düşməsin.
 */
export function resolvePostAuthTarget(user: AuthUser, from?: string | null): PostAuthTarget {
  const intent = readBookingIntent()
  if (intent) {
    storage.remove(STORAGE_KEYS.lastBookingIntent)
    return { to: '/booking/review', state: intent }
  }
  storage.remove(STORAGE_KEYS.lastBookingIntent)

  const isSafeFrom =
    typeof from === 'string' &&
    from.startsWith('/') &&
    !from.startsWith('//') &&
    !AUTH_PATHS.some((path) => from.startsWith(path))

  if (isSafeFrom) return { to: from }

  return { to: ROLE_HOME[user.roles[0]] ?? '/dashboard' }
}
