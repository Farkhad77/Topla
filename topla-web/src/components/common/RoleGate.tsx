import type { ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { hasRole } from '@/utils/permissions'
import type { Role } from '@/types'

/** UI elementini rola görə gizlədir. Təhlükəsizlik deyil — yalnız səliqə üçün. */
export function RoleGate({
  roles,
  children,
  fallback = null,
}: {
  roles: Role[]
  children: ReactNode
  fallback?: ReactNode
}) {
  const { user } = useAuth()
  return hasRole(user, ...roles) ? <>{children}</> : <>{fallback}</>
}
