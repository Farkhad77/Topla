import { useContext } from 'react'
import { AuthContext, type AuthContextValue } from '@/contexts/auth-context'

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth yalnız <AuthProvider> daxilində istifadə oluna bilər')
  return context
}
