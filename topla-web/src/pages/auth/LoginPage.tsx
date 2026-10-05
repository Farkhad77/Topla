import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LogIn, Mail } from 'lucide-react'
import { Button, Field, Input } from '@/components/ui'
import { loginSchema, type LoginFormValues } from '@/schemas/auth'
import { useAuth } from '@/hooks/useAuth'
import { usePageMeta } from '@/hooks/usePageMeta'
import { toast } from '@/hooks/useToast'
import { toApiError } from '@/api'
import { storage } from '@/utils/storage'
import { STORAGE_KEYS } from '@/utils/constants'
import { FormAlert, PasswordToggle } from './authFields'
import { resolvePostAuthTarget } from './postAuthRedirect'

/** Backend təsdiqlənməmiş e-poçt üçün 400 qaytarır — mətnə görə OTP səhifəsinə yönləndiririk. */
const NEEDS_CONFIRMATION = /confirm|təsdiq|verif/i

export default function LoginPage() {
  usePageMeta({ title: 'Daxil ol', description: 'Topla hesabına daxil ol və bronlarını idarə et.' })

  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [formError, setFormError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const locationState = location.state as { from?: string } | null

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: storage.get(STORAGE_KEYS.pendingEmail) ?? '', password: '' },
  })

  async function onSubmit(values: LoginFormValues) {
    setFormError(null)
    try {
      const user = await login({ email: values.email.trim(), password: values.password })
      storage.remove(STORAGE_KEYS.pendingEmail)

      const target = resolvePostAuthTarget(user, locationState?.from)
      navigate(target.to, { state: target.state, replace: true })
    } catch (error) {
      const apiError = toApiError(error)

      if (apiError.status === 400 && NEEDS_CONFIRMATION.test(apiError.message)) {
        const email = values.email.trim()
        storage.set(STORAGE_KEYS.pendingEmail, email)
        toast.info('E-poçtun təsdiqlənməyib', 'Sənə göndərilən 6 rəqəmli kodu daxil et.')
        navigate('/verify-otp', { state: { email } })
        return
      }

      setFormError(apiError.message)
    }
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Xoş gəldin</h1>
        <p className="text-sm text-ink-500">
          Hesabına daxil ol — bronların, rəylərin və stadionların bir yerdə.
        </p>
      </header>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormAlert message={formError} />

        <Field label="E-poçt" error={errors.email?.message} required>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="ad@nümunə.com"
              leading={<Mail />}
              invalid={invalid}
              aria-describedby={describedBy}
              {...register('email')}
            />
          )}
        </Field>

        <Field label="Şifrə" error={errors.password?.message} required>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              invalid={invalid}
              aria-describedby={describedBy}
              trailing={
                <PasswordToggle
                  shown={showPassword}
                  onToggle={() => setShowPassword((value) => !value)}
                />
              }
              {...register('password')}
            />
          )}
        </Field>

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-[13px] font-semibold text-brand-700 underline-offset-4 hover:underline"
          >
            Şifrəni unutdun?
          </Link>
        </div>

        <Button type="submit" size="lg" block loading={isSubmitting}>
          <LogIn />
          Daxil ol
        </Button>
      </form>

      <p className="text-center text-[13px] text-ink-500">
        Hesabın yoxdur?{' '}
        <Link
          to="/register"
          className="font-semibold text-brand-700 underline-offset-4 hover:underline"
        >
          Qeydiyyatdan keç
        </Link>
      </p>
    </div>
  )
}
