import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { KeyRound } from 'lucide-react'
import { Button, ErrorState, Field, Input } from '@/components/ui'
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/schemas/auth'
import { authService } from '@/services'
import { usePageMeta } from '@/hooks/usePageMeta'
import { toast } from '@/hooks/useToast'
import { errorMessage } from '@/api'
import { FormAlert, PasswordToggle } from './authFields'

export default function ResetPasswordPage() {
  usePageMeta({ title: 'Yeni şifrə təyin et' })

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [formError, setFormError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // Bərpa linki e-poçtda gəlir: /reset-password?userId=…&token=…
  const userId = searchParams.get('userId') ?? ''
  const token = searchParams.get('token') ?? ''
  const linkValid = !!userId && !!token

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { userId, token, newPassword: '', confirmPassword: '' },
  })

  async function onSubmit(values: ResetPasswordFormValues) {
    setFormError(null)
    try {
      await authService.resetPassword({
        userId: values.userId,
        token: values.token,
        newPassword: values.newPassword,
      })

      toast.success('Şifrə yeniləndi', 'İndi yeni şifrə ilə daxil ola bilərsən.')
      navigate('/login', { replace: true })
    } catch (error) {
      setFormError(errorMessage(error))
    }
  }

  if (!linkValid) {
    return (
      <div className="space-y-5">
        <ErrorState
          title="Link etibarsızdır"
          description="Bu ünvanda şifrə bərpası üçün lazım olan məlumat yoxdur. Link natamam köçürülə və ya vaxtı keçmiş ola bilər."
        />
        <div className="space-y-2">
          <Button asChild block size="lg">
            <Link to="/forgot-password">Yeni bərpa linki al</Link>
          </Button>
          <Button asChild variant="ghost" block>
            <Link to="/login">Girişə qayıt</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <div className="grid size-11 place-items-center rounded-full bg-brand-50 text-brand-700">
          <KeyRound className="size-5" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Yeni şifrə təyin et</h1>
        <p className="text-sm leading-relaxed text-ink-500">
          Şifrəni dəyişdikdən sonra köhnə şifrə işləməyəcək.
        </p>
      </header>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormAlert message={formError} />

        <input type="hidden" {...register('userId')} />
        <input type="hidden" {...register('token')} />

        <Field
          label="Yeni şifrə"
          error={errors.newPassword?.message}
          hint="Ən azı 8 simvol, bir böyük hərf, bir kiçik hərf və bir rəqəm."
          required
        >
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              invalid={invalid}
              aria-describedby={describedBy}
              trailing={
                <PasswordToggle
                  shown={showPassword}
                  onToggle={() => setShowPassword((value) => !value)}
                />
              }
              {...register('newPassword')}
            />
          )}
        </Field>

        <Field label="Şifrənin təkrarı" error={errors.confirmPassword?.message} required>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              invalid={invalid}
              aria-describedby={describedBy}
              trailing={
                <PasswordToggle
                  shown={showConfirm}
                  onToggle={() => setShowConfirm((value) => !value)}
                />
              }
              {...register('confirmPassword')}
            />
          )}
        </Field>

        <Button type="submit" size="lg" block loading={isSubmitting}>
          Şifrəni yenilə
        </Button>
      </form>

      <p className="text-center text-[13px] text-ink-500">
        Fikrini dəyişdin?{' '}
        <Link to="/login" className="font-semibold text-brand-700 underline-offset-4 hover:underline">
          Girişə qayıt
        </Link>
      </p>
    </div>
  )
}
