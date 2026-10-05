/** Backend `UserRole` enum-u ilə eyni adlar (case-sensitive JWT claim dəyərləri). */
export const ROLES = ['Admin', 'Moderator', 'User', 'Owner', 'Worker'] as const
export type Role = (typeof ROLES)[number]

export interface TokenResponse {
  token: string | null
  refreshToken: string | null
  expireDate: string | null
}

/** JWT payload-undan çıxarılan istifadəçi. Backend-də `/me` endpoint-i yoxdur. */
export interface AuthUser {
  id: string
  email: string
  fullName: string
  roles: Role[]
  permissions: string[]
  expiresAt: number
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  fullName: string
  email: string
  password: string
  phoneNumber: string
}

export interface ConfirmOtpPayload {
  email: string
  otp: string
}

export interface ForgotPasswordPayload {
  email: string
}

export interface ResetPasswordPayload {
  userId: string
  token: string
  newPassword: string
}

export interface UserSummary {
  id: string
  fullName: string
  email: string
  lastLoginDate: string | null
}
