import axios from 'axios'
import type { ApiErrorShape } from '@/types'

/** İstifadəçiyə göstərilən mesajlar — backend exception mətni heç vaxt sızmır. */
const STATUS_MESSAGES: Record<number, string> = {
  400: 'Göndərilən məlumat düzgün deyil. Xanaları yoxlayıb yenidən cəhd et.',
  401: 'Sessiyanın vaxtı bitib. Zəhmət olmasa yenidən daxil ol.',
  403: 'Bu əməliyyat üçün icazən yoxdur.',
  404: 'Axtardığın məlumat tapılmadı.',
  409: 'Bu vaxt artıq tutulub. Başqa slot seç.',
  422: 'Məlumatlar tam doldurulmayıb.',
  429: 'Çox sayda cəhd etdin. Bir az gözləyib yenidən yoxla.',
  500: 'Serverdə gözlənilməz xəta baş verdi. Bir azdan yenidən cəhd et.',
  502: 'Server müvəqqəti əlçatan deyil.',
  503: 'Xidmət müvəqqəti dayandırılıb. Bir azdan yenidən cəhd et.',
}

function kindFor(status: number): ApiErrorShape['kind'] {
  if (status === 400 || status === 422) return 'validation'
  if (status === 401) return 'unauthorized'
  if (status === 403) return 'forbidden'
  if (status === 404) return 'notfound'
  if (status === 409) return 'conflict'
  if (status === 429) return 'ratelimit'
  if (status >= 500) return 'server'
  return 'unknown'
}

/** Backend mətnində .NET exception izi varsa göstərmirik. */
function isSafeMessage(message: unknown): message is string {
  if (typeof message !== 'string') return false
  const trimmed = message.trim()
  if (trimmed.length < 3 || trimmed.length > 300) return false
  return !/(System\.|Exception|at [A-Z][\w.]+\(|Stack ?trace|Microsoft\.)/i.test(trimmed)
}

export class ApiError extends Error implements ApiErrorShape {
  readonly status: number
  readonly kind: ApiErrorShape['kind']
  readonly fieldErrors?: Record<string, string>

  constructor(shape: ApiErrorShape) {
    super(shape.message)
    this.name = 'ApiError'
    this.status = shape.status
    this.kind = shape.kind
    this.fieldErrors = shape.fieldErrors
  }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error

  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') {
      return new ApiError({
        status: 0,
        kind: 'timeout',
        message: 'Sorğu çox uzun çəkdi. İnternet bağlantını yoxlayıb yenidən cəhd et.',
      })
    }

    if (!error.response) {
      return new ApiError({
        status: 0,
        kind: 'network',
        message: 'Serverə qoşulmaq mümkün olmadı. İnternet bağlantını yoxla.',
      })
    }

    const status = error.response.status
    const body = error.response.data as { message?: unknown; errors?: unknown } | undefined
    const backendMessage = isSafeMessage(body?.message) ? body.message : null

    const fieldErrors =
      body?.errors && typeof body.errors === 'object' && !Array.isArray(body.errors)
        ? Object.fromEntries(
            Object.entries(body.errors as Record<string, unknown>).map(([key, value]) => [
              key.charAt(0).toLowerCase() + key.slice(1),
              Array.isArray(value) ? String(value[0]) : String(value),
            ]),
          )
        : undefined

    return new ApiError({
      status,
      kind: kindFor(status),
      message: backendMessage ?? STATUS_MESSAGES[status] ?? 'Gözlənilməz xəta baş verdi.',
      fieldErrors,
    })
  }

  return new ApiError({
    status: 0,
    kind: 'unknown',
    message: 'Gözlənilməz xəta baş verdi. Bir azdan yenidən cəhd et.',
  })
}

export function errorMessage(error: unknown): string {
  return toApiError(error).message
}
