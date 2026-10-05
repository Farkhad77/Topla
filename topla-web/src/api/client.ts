import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios'
import { env } from '@/utils/env'
import { storage } from '@/utils/storage'
import { STORAGE_KEYS } from '@/utils/constants'
import { endpoints } from './endpoints'

/**
 * Bu endpoint-lərdən gələn 401 "sessiya bitdi" demək DEYİL — səhv şifrə,
 * yanlış OTP və s. deməkdir. Onlarda refresh/logout axını işə salınmamalıdır.
 */
const AUTH_ENDPOINTS: readonly string[] = [
  endpoints.auth.login,
  endpoints.auth.register,
  endpoints.auth.confirmOtp,
  endpoints.auth.refresh,
  endpoints.auth.forgotPassword,
  endpoints.auth.resetPassword,
]

function isAuthEndpoint(url: string | undefined): boolean {
  if (!url) return false
  return AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint))
}

/**
 * Dev-də ən çox vaxt aparan tələ: backend `UseHttpsRedirection()` sorğunu başqa
 * origin-ə (məs. https://localhost:7171) yönləndirir, brauzer isə cross-origin
 * yönləndirmədə `Authorization` başlığını silir → hər sorğu 401 alır.
 * Səbəbi konsolda açıq yazırıq ki, saatlarla axtarılmasın.
 */
function warnIfCrossOriginRedirect(error: AxiosError): void {
  if (!import.meta.env.DEV) return

  const request = error.request as { responseURL?: string } | undefined
  const finalUrl = request?.responseURL
  if (!finalUrl) return

  try {
    if (new URL(finalUrl, window.location.href).origin !== window.location.origin) {
      console.warn(
        `[Topla] Sorğu başqa origin-ə yönləndirildi: ${finalUrl}\n` +
          'Brauzer cross-origin yönləndirmədə Authorization başlığını silir — buna görə 401 alırsan.\n' +
          'Həll: backend-də Development mühitində app.UseHttpsRedirection() söndürülməlidir, ' +
          'və ya VITE_API_PROXY_TARGET backend-in HTTPS ünvanına (https://localhost:7171) yönəldilməlidir.',
      )
    }
  } catch {
    /* URL parse edilə bilmədi — əhəmiyyətsizdir */
  }
}
import { toApiError } from './errors'
import type { TokenResponse } from '@/types'

/** Auth vəziyyəti dəyişəndə AuthContext-i xəbərdar edən hadisə adları. */
export const AUTH_EVENTS = {
  unauthorized: 'topla:auth:unauthorized',
  tokensUpdated: 'topla:auth:tokens-updated',
} as const

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean; _skipAuth?: boolean }

export const apiClient: AxiosInstance = axios.create({
  // Boş baseURL → nisbi `/api/...` (dev-də Vite proxy, prod-da eyni origin/reverse proxy)
  baseURL: env.apiBaseUrl || undefined,
  timeout: 20_000,
  headers: { Accept: 'application/json' },
})

export const tokenStore = {
  get access(): string | null {
    return storage.get(STORAGE_KEYS.accessToken)
  },
  get refresh(): string | null {
    return storage.get(STORAGE_KEYS.refreshToken)
  },
  set(tokens: TokenResponse): void {
    if (tokens.token) storage.set(STORAGE_KEYS.accessToken, tokens.token)
    if (tokens.refreshToken) storage.set(STORAGE_KEYS.refreshToken, tokens.refreshToken)
    window.dispatchEvent(new CustomEvent(AUTH_EVENTS.tokensUpdated))
  },
  clear(): void {
    storage.remove(STORAGE_KEYS.accessToken)
    storage.remove(STORAGE_KEYS.refreshToken)
  },
}

apiClient.interceptors.request.use((config: RetriableConfig) => {
  const token = tokenStore.access
  if (token && !config._skipAuth) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

/** Eyni anda gələn 401-lər üçün tək refresh sorğusu. */
let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const accessToken = tokenStore.access
  const refreshToken = tokenStore.refresh
  if (!accessToken || !refreshToken) return null

  try {
    const { data } = await axios.post<{ data?: TokenResponse } & Partial<TokenResponse>>(
      `${env.apiBaseUrl}${endpoints.auth.refresh}`,
      { accessToken, refreshToken },
      { headers: { Authorization: `Bearer ${accessToken}` }, timeout: 15_000 },
    )
    const tokens: TokenResponse | null =
      (data as { data?: TokenResponse }).data ?? (data as TokenResponse) ?? null

    if (!tokens?.token) return null
    tokenStore.set(tokens)
    return tokens.token
  } catch {
    return null
  }
}

function forceLogout(): void {
  tokenStore.clear()
  window.dispatchEvent(new CustomEvent(AUTH_EVENTS.unauthorized))
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined
    const status = error.response?.status

    if (status === 401) warnIfCrossOriginRedirect(error)

    if (
      status === 401 &&
      config &&
      !config._retried &&
      !config._skipAuth &&
      !isAuthEndpoint(config.url) &&
      tokenStore.access
    ) {
      config._retried = true
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null
      })
      const newToken = await refreshPromise

      if (newToken) {
        config.headers.set('Authorization', `Bearer ${newToken}`)
        return apiClient.request(config)
      }
      forceLogout()
    }

    return Promise.reject(toApiError(error))
  },
)

/** Servis qatı üçün nazik köməkçilər — komponentlər birbaşa axios çağırmır. */
export const http = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<T>(url, config).then((response) => response.data),
  post: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    apiClient.post<T>(url, body, config).then((response) => response.data),
  put: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    apiClient.put<T>(url, body, config).then((response) => response.data),
  patch: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    apiClient.patch<T>(url, body, config).then((response) => response.data),
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<T>(url, config).then((response) => response.data),
}
