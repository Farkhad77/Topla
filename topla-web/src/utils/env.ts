/**
 * Bütün mühit dəyişənləri yalnız buradan oxunur.
 * Frontend-ə heç bir gizli açar qoyulmur — yalnız public ünvanlar.
 */
const rawApiBase = import.meta.env.VITE_API_BASE_URL?.trim() ?? ''
const rawMediaBase = import.meta.env.VITE_MEDIA_BASE_URL?.trim() ?? ''

export const env = {
  /** Boşdursa dev-də Vite proxy-si işləyir (nisbi `/api`). */
  apiBaseUrl: rawApiBase.replace(/\/+$/, ''),
  mediaBaseUrl: (rawMediaBase || rawApiBase).replace(/\/+$/, ''),
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const

/** Backend `Storage/...` nisbi yolunu tam URL-ə çevirir. */
export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null
  if (/^https?:\/\//i.test(path)) return path
  const normalized = path.replace(/\\/g, '/').replace(/^\/+/, '')
  return `${env.mediaBaseUrl}/${normalized}`
}
