import { http, endpoints, unwrap } from '@/api'
import type {
  ConfirmOtpPayload,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  TokenResponse,
} from '@/types'

export const authService = {
  /** Qeydiyyat → e-poçta OTP göndərilir, hesab hələ yaradılmır. */
  async register(payload: RegisterPayload): Promise<string> {
    const data = await http.post<unknown>(endpoints.auth.register, payload)
    return unwrap<string>(data)
  },

  async login(payload: LoginPayload): Promise<TokenResponse> {
    const data = await http.post<unknown>(endpoints.auth.login, payload)
    return unwrap<TokenResponse>(data)
  },

  /** OTP təsdiqi uğurlu olarsa backend birbaşa token qaytarır (avtomatik giriş). */
  async confirmOtp(payload: ConfirmOtpPayload): Promise<TokenResponse> {
    const data = await http.post<unknown>(endpoints.auth.confirmOtp, payload)
    return unwrap<TokenResponse>(data)
  },

  async forgotPassword(payload: ForgotPasswordPayload): Promise<string | null> {
    const data = await http.post<unknown>(endpoints.auth.forgotPassword, payload)
    return unwrap<string | null>(data)
  },

  /** OTP kodunu yenidən göndərir — yalnız qeydiyyat sessiyası hələ aktivdirsə işləyir. */
  async resendOtp(email: string): Promise<string | null> {
    const data = await http.post<unknown>(endpoints.auth.resendOtp, { email })
    return unwrap<string | null>(data)
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<string | null> {
    const data = await http.post<unknown>(endpoints.auth.resetPassword, payload)
    return unwrap<string | null>(data)
  },

  async logout(): Promise<void> {
    await http.post<unknown>(endpoints.auth.logout, {})
  },
}
