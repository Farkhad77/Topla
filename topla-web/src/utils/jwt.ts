import type { AuthUser, Role } from '@/types'
import { ROLES } from '@/types'

const CLAIM = {
  nameId: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
  email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
  role: 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
} as const

type ClaimValue = string | string[] | number | undefined

function toArray(value: ClaimValue): string[] {
  if (value == null) return []
  return Array.isArray(value) ? value.map(String) : [String(value)]
}

function base64UrlDecode(segment: string): string {
  const padded = segment.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(padded.padEnd(padded.length + ((4 - (padded.length % 4)) % 4), '='))
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new TextDecoder('utf-8').decode(bytes)
}

/**
 * JWT-ni yalnız UI üçün oxuyuruq (rol, ad, bitmə vaxtı).
 * Səlahiyyətin yeganə həqiqi mənbəyi backend-dir — bu, təhlükəsizlik yoxlaması deyil.
 */
export function parseAuthUser(token: string): AuthUser | null {
  try {
    const payloadSegment = token.split('.')[1]
    if (!payloadSegment) return null
    const payload = JSON.parse(base64UrlDecode(payloadSegment)) as Record<string, ClaimValue>

    const id = String(payload[CLAIM.nameId] ?? payload.sub ?? payload.nameid ?? '')
    const email = String(payload[CLAIM.email] ?? payload.email ?? '')
    const rawRoles = [...toArray(payload[CLAIM.role]), ...toArray(payload.role)]
    const roles = rawRoles.filter((value): value is Role =>
      (ROLES as readonly string[]).includes(value),
    )
    const permissions = toArray(payload.Permission)
    const exp = typeof payload.exp === 'number' ? payload.exp : Number(payload.exp ?? 0)

    if (!id) return null

    return {
      id,
      email,
      fullName: String(payload.fullName ?? payload.name ?? email.split('@')[0] ?? 'İstifadəçi'),
      roles: roles.length ? roles : ['User'],
      permissions,
      expiresAt: exp * 1000,
    }
  } catch {
    return null
  }
}

export function isExpired(user: AuthUser | null, skewMs = 15_000): boolean {
  if (!user?.expiresAt) return false
  return Date.now() >= user.expiresAt - skewMs
}
