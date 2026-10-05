import { createContext } from 'react'
import type { AuthUser, LoginPayload, TokenResponse } from '@/types'

export interface AuthContextValue {
  user: AuthUser | null
  status: 'loading' | 'authenticated' | 'guest'
  isAuthenticated: boolean
  login: (payload: LoginPayload) => Promise<AuthUser>
  applyTokens: (tokens: TokenResponse) => AuthUser | null
  logout: (options?: { silent?: boolean }) => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
