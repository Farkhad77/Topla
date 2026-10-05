import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { PageLoader } from '@/components/ui'
import { hasRole } from '@/utils/permissions'
import type { Role } from '@/types'

/**
 * Marşrut mühafizəsi YALNIZ UX üçündür — həqiqi səlahiyyət yoxlaması backend-dədir.
 * Rol uyğun deyilsə istifadəçi öz "ev" səhifəsinə deyil, 403 səhifəsinə göndərilir ki,
 * nə baş verdiyini başa düşsün.
 */
export function ProtectedRoute({ roles }: { roles?: Role[] }) {
  const { status, user } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <PageLoader />

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />
  }

  if (roles?.length && !hasRole(user, ...roles)) {
    return <Navigate to="/forbidden" replace />
  }

  return <Outlet />
}

/** Artıq daxil olmuş istifadəçi login/register səhifəsini görməsin. */
export function GuestOnlyRoute() {
  const { status, user } = useAuth()

  if (status === 'loading') return <PageLoader />
  if (user) return <Navigate to="/" replace />

  return <Outlet />
}
