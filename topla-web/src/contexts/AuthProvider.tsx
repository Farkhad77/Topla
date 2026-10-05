import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { AUTH_EVENTS, tokenStore } from '@/api'
import { authService } from '@/services'
import { isExpired, parseAuthUser } from '@/utils/jwt'
import { toast } from '@/hooks/useToast'
import type { AuthUser, LoginPayload, TokenResponse } from '@/types'
import { AuthContext, type AuthContextValue } from './auth-context'

function readUserFromStorage(): AuthUser | null {
  const token = tokenStore.access
  if (!token) return null
  const user = parseAuthUser(token)
  if (!user || isExpired(user)) return null
  return user
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [user, setUser] = useState<AuthUser | null>(() => readUserFromStorage())
  const [status, setStatus] = useState<AuthContextValue['status']>('loading')
  const expiryTimer = useRef<number | null>(null)

  const clearSession = useCallback(() => {
    tokenStore.clear()
    setUser(null)
    setStatus('guest')
    queryClient.clear()
  }, [queryClient])

  const applyTokens = useCallback((tokens: TokenResponse): AuthUser | null => {
    if (!tokens?.token) return null
    tokenStore.set(tokens)
    const nextUser = parseAuthUser(tokens.token)
    setUser(nextUser)
    setStatus(nextUser ? 'authenticated' : 'guest')
    return nextUser
  }, [])

  const login = useCallback(
    async (payload: LoginPayload): Promise<AuthUser> => {
      const tokens = await authService.login(payload)
      const nextUser = applyTokens(tokens)
      if (!nextUser) throw new Error('Token oxunmadı')
      return nextUser
    },
    [applyTokens],
  )

  const logout = useCallback(
    async (options?: { silent?: boolean }) => {
      try {
        if (tokenStore.access) await authService.logout()
      } catch {
        // Server logout uğursuz olsa belə lokal sessiya bağlanmalıdır.
      } finally {
        clearSession()
        if (!options?.silent) toast.success('Hesabdan çıxdın.')
      }
    },
    [clearSession],
  )

  // İlk yüklənmə: saxlanmış token varsa oxu.
  useEffect(() => {
    const stored = readUserFromStorage()
    setUser(stored)
    setStatus(stored ? 'authenticated' : 'guest')
  }, [])

  // 401 → refresh alınmadı → avtomatik çıxış.
  useEffect(() => {
    function handleUnauthorized() {
      setUser((current) => {
        if (current) toast.error('Sessiyanın vaxtı bitdi. Yenidən daxil ol.')
        return null
      })
      setStatus('guest')
      queryClient.clear()
    }

    function handleTokensUpdated() {
      setUser(readUserFromStorage())
    }

    window.addEventListener(AUTH_EVENTS.unauthorized, handleUnauthorized)
    window.addEventListener(AUTH_EVENTS.tokensUpdated, handleTokensUpdated)
    return () => {
      window.removeEventListener(AUTH_EVENTS.unauthorized, handleUnauthorized)
      window.removeEventListener(AUTH_EVENTS.tokensUpdated, handleTokensUpdated)
    }
  }, [queryClient])

  // Token bitəndə sessiyanı avtomatik bağla.
  useEffect(() => {
    if (expiryTimer.current) window.clearTimeout(expiryTimer.current)
    if (!user?.expiresAt) return

    const delay = user.expiresAt - Date.now()
    if (delay <= 0) {
      clearSession()
      return
    }
    expiryTimer.current = window.setTimeout(() => {
      clearSession()
      toast.error('Sessiyanın vaxtı bitdi. Yenidən daxil ol.')
    }, Math.min(delay, 2_147_483_000))

    return () => {
      if (expiryTimer.current) window.clearTimeout(expiryTimer.current)
    }
  }, [user, clearSession])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      isAuthenticated: !!user,
      login,
      applyTokens,
      logout,
    }),
    [user, status, login, applyTokens, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
