import type { AuthUser, Role } from '@/types'

export function hasRole(user: AuthUser | null, ...roles: Role[]): boolean {
  if (!user) return false
  return roles.some((role) => user.roles.includes(role))
}

export function hasPermission(user: AuthUser | null, permission: string): boolean {
  if (!user) return false
  if (user.roles.includes('Admin')) return true
  return user.permissions.includes(permission)
}

/** Owner paneli: sahibkar və ona təyin olunmuş işçi. İşçi owner DEYİL. */
export function canAccessOwnerArea(user: AuthUser | null): boolean {
  return hasRole(user, 'Owner', 'Worker')
}

export function isOwnerNotWorker(user: AuthUser | null): boolean {
  return hasRole(user, 'Owner')
}

export function canAccessAdminArea(user: AuthUser | null): boolean {
  return hasRole(user, 'Admin', 'Moderator')
}
