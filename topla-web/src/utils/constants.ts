import type { Role } from '@/types'

export const APP_NAME = 'Topla'
export const APP_TAGLINE = 'Meydançanı bir neçə klikə bron et'
export const CURRENCY = '₼'

export const STORAGE_KEYS = {
  accessToken: 'topla.access_token',
  refreshToken: 'topla.refresh_token',
  pendingEmail: 'topla.pending_email',
  lastBookingIntent: 'topla.booking_intent',
} as const

/** Backend `Size` sahəsi sərbəst mətndir; UI-da təklif olunan dəyərlər. */
export const STADIUM_SIZES = ['5x5', '6x6', '7x7', '8x8', '11x11'] as const
export const SURFACE_TYPES = [
  'Süni örtük',
  'Təbii çəmən',
  'Örtülü zal',
  'Rezin örtük',
] as const
export const CITIES = [
  'Bakı',
  'Sumqayıt',
  'Gəncə',
  'Mingəçevir',
  'Şəki',
  'Lənkəran',
  'Naxçıvan',
  'Şirvan',
] as const

/** Bron müddəti yalnız tam saatlarla ola bilər. */
export const DURATION_OPTIONS = [60, 120, 180, 240] as const

export const ROLE_LABELS: Record<Role, string> = {
  Admin: 'Administrator',
  Moderator: 'Moderator',
  User: 'İstifadəçi',
  Owner: 'Sahibkar',
  Worker: 'İşçi',
}

/** Rolun default "ev" səhifəsi — login-dən sonra bura yönləndirilir. */
export const ROLE_HOME: Record<Role, string> = {
  Admin: '/admin',
  Moderator: '/admin',
  Owner: '/owner',
  Worker: '/owner',
  User: '/dashboard',
}

/**
 * Backend-də hələ endpoint-i olmayan bölmələr.
 * Bunlar açılanda UI real API-yə keçir — mock heç yerdə komponentin içində deyil.
 */
export const FEATURES = {
  favorites: false,
  notifications: false,
  /** Admin istifadəçi siyahısı: IUserService-də var, controller-də açılmayıb. */
  adminUserList: false,
  /** Admin üçün pending stadion siyahısı endpoint-i yoxdur. */
  adminStadiumQueue: false,
} as const
