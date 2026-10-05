import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Mail, Phone, User, UserPlus } from 'lucide-react'
import { Button, Field, Input } from '@/components/ui'
import { registerSchema, type RegisterFormValues } from '@/schemas/auth'
import { authService } from '@/services'
import { usePageMeta } from '@/hooks/usePageMeta'
import { toast } from '@/hooks/useToast'
import { errorMessage } from '@/api'
import { storage } from '@/utils/storage'
import { STORAGE_KEYS } from '@/utils/constants'
import { cn } from '@/utils/cn'
import { FormAlert, PasswordToggle } from './authFields'

/** Qaydalar `registerSchema`-dakı ilə eynidir — istifadəçi yazdıqca canlı işarələnir. */
const PASSWORD_RULES: { label: string; test: (value: string) => boolean }[] = [
  { label: 'Ən azı 8 simvol', test: (value) => value.length >= 8 },
  { label: 'Bir böyük hərf (A-Z)', test: (value) => /[A-Z]/.test(value) },
  { label: 'Bir kiçik hərf (a-z)', test: (value) => /[a-z]/.test(value) },
  { label: 'Bir rəqəm (0-9)', test: (value) => /[0-9]/.test(value) },
]

export default function RegisterPage() {
  usePageMeta({
    title: 'Qeydiyyat',
    description: 'Topla hesabı yarat və meydançanı bir neçə klikə bron et.',
  })

  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
    },
  })

  const passwordValue = watch('password') ?? ''

  async function onSubmit(values: RegisterFormValues) {
    setFormError(null)
    const email = values.email.trim()

    try {
      await authService.register({
        fullName: values.fullName.trim(),
        email,
        phoneNumber: values.phoneNumber.trim(),
        password: values.password,
      })

      storage.set(STORAGE_KEYS.pendingEmail, email)
      toast.success('Kod göndərildi', `${email} ünvanına 6 rəqəmli təsdiq kodu göndərdik.`)
      navigate('/verify-otp', { state: { email } })
    } catch (error) {
      setFormError(errorMessage(error))
    }
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Hesab yarat</h1>
        <p className="text-sm text-ink-500">
          Bir dəqiqəlik iş — sonra bütün meydançalar bir kliklə əlində.
        </p>
      </header>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormAlert message={formError} />

        <Field label="Ad və soyad" error={errors.fullName?.message} required>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              type="text"
              autoComplete="name"
              placeholder="Rəşad Məmmədov"
              leading={<User />}
              invalid={invalid}
              aria-describedby={describedBy}
              {...register('fullName')}
            />
          )}
        </Field>

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

        <Field
          label="Telefon"
          error={errors.phoneNumber?.message}
          hint="Stadion səninlə bu nömrə ilə əlaqə saxlayacaq."
          required
        >
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+994 50 123 45 67"
              leading={<Phone />}
              invalid={invalid}
              aria-describedby={describedBy}
              {...register('phoneNumber')}
            />
          )}
        </Field>

        <Field label="Şifrə" error={errors.password?.message} required>
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
              {...register('password')}
            />
          )}
        </Field>

        <ul className="grid gap-1.5 rounded-md bg-ink-50 px-3.5 py-3 sm:grid-cols-2">
          {PASSWORD_RULES.map((rule) => {
            const passed = rule.test(passwordValue)
            return (
              <li
                key={rule.label}
                className={cn(
                  'flex items-center gap-2 text-2xs font-medium',
                  passed ? 'text-success' : 'text-ink-500',
                )}
              >
                <span
                  className={cn(
                    'grid size-4 shrink-0 place-items-center rounded-full border',
                    passed ? 'border-success bg-success text-white' : 'border-line-strong',
                  )}
                  aria-hidden="true"
                >
                  {passed ? <Check className="size-2.5" /> : null}
                </span>
                <span>
                  {rule.label}
                  <span className="sr-only">{passed ? ' — tamamlandı' : ' — hələ yoxdur'}</span>
                </span>
              </li>
            )
          })}
        </ul>

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
          <UserPlus />
          Qeydiyyatdan keç
        </Button>

        <p className="text-2xs leading-relaxed text-ink-500">
          Davam etməklə xidmət şərtlərini və məxfilik siyasətini qəbul edirsən.
        </p>
      </form>

      <p className="text-center text-[13px] text-ink-500">
        Artıq hesabın var?{' '}
        <Link to="/login" className="font-semibold text-brand-700 underline-offset-4 hover:underline">
          Daxil ol
        </Link>
      </p>
    </div>
  )
}
