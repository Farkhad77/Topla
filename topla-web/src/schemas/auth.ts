import { z } from 'zod'

const email = z
  .string()
  .min(1, 'E-poçt tələb olunur')
  .email('E-poçt ünvanı düzgün deyil')

/** Backend Identity qaydası: minimum 8 simvol, rəqəm + böyük/kiçik hərf. */
const password = z
  .string()
  .min(8, 'Şifrə ən azı 8 simvol olmalıdır')
  .regex(/[A-Z]/, 'Ən azı bir böyük hərf olmalıdır')
  .regex(/[a-z]/, 'Ən azı bir kiçik hərf olmalıdır')
  .regex(/[0-9]/, 'Ən azı bir rəqəm olmalıdır')

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Şifrə tələb olunur'),
})
export type LoginFormValues = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(3, 'Ad və soyadı tam yaz')
      .max(80, 'Ad çox uzundur'),
    email,
    phoneNumber: z
      .string()
      .min(9, 'Nömrə düzgün deyil')
      .regex(/^[+0-9\s()-]+$/, 'Nömrədə yalnız rəqəm və + işarəsi ola bilər'),
    password,
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Şifrələr uyğun gəlmir',
    path: ['confirmPassword'],
  })
export type RegisterFormValues = z.infer<typeof registerSchema>

export const otpSchema = z.object({
  email,
  otp: z
    .string()
    .min(4, 'Kod tam deyil')
    .max(8, 'Kod çox uzundur')
    .regex(/^[0-9]+$/, 'Kod yalnız rəqəmlərdən ibarətdir'),
})
export type OtpFormValues = z.infer<typeof otpSchema>

export const forgotPasswordSchema = z.object({ email })
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z
  .object({
    userId: z.string().min(1, 'Link etibarsızdır'),
    token: z.string().min(1, 'Link etibarsızdır'),
    newPassword: password,
    confirmPassword: z.string(),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'Şifrələr uyğun gəlmir',
    path: ['confirmPassword'],
  })
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>
