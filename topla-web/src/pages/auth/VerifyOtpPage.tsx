import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { HelpCircle, MailCheck, Send, ShieldCheck } from 'lucide-react'
import { Button, ErrorState, InlineNote } from '@/components/ui'
import { otpSchema, type OtpFormValues } from '@/schemas/auth'
import { authService } from '@/services'
import { useAuth } from '@/hooks/useAuth'
import { usePageMeta } from '@/hooks/usePageMeta'
import { toast } from '@/hooks/useToast'
import { errorMessage, toApiError } from '@/api'
import { storage } from '@/utils/storage'
import { STORAGE_KEYS } from '@/utils/constants'
import { cn } from '@/utils/cn'
import { FormAlert } from './authFields'
import { resolvePostAuthTarget } from './postAuthRedirect'

const OTP_LENGTH = 6

/** Backend resend endpoint-i IP başına 5 dəqiqədə 3 sorğu ilə məhdudlaşıb —
 *  UI tərəfdə də 60 saniyəlik fasilə qoyuruq ki, limit boş yerə yeyilməsin. */
const RESEND_COOLDOWN_SECONDS = 60

/** 6 xanalı kod sahəsi: avtomatik keçid, backspace ilə geri, yapışdırma bütün xanaları doldurur. */
function OtpInput({
  value,
  onChange,
  disabled,
  invalid,
  describedBy,
}: {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  invalid?: boolean
  describedBy?: string
}) {
  const inputs = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    inputs.current[0]?.focus()
  }, [])

  function focusAt(index: number) {
    const target = inputs.current[Math.max(0, Math.min(index, OTP_LENGTH - 1))]
    target?.focus()
    target?.select()
  }

  function commit(next: string): string {
    const cleaned = next.replace(/\D/g, '').slice(0, OTP_LENGTH)
    onChange(cleaned)
    return cleaned
  }

  function handleChange(index: number, raw: string) {
    const digits = raw.replace(/\D/g, '')

    if (!digits) {
      const next = commit(value.slice(0, index) + value.slice(index + 1))
      focusAt(Math.min(index, next.length))
      return
    }

    const chars = value.split('')
    digits.split('').forEach((digit, offset) => {
      chars[index + offset] = digit
    })
    const next = commit(chars.join(''))
    focusAt(next.length)
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace') {
      event.preventDefault()
      if (value[index]) {
        const next = commit(value.slice(0, index) + value.slice(index + 1))
        focusAt(Math.min(index, next.length))
      } else if (index > 0) {
        commit(value.slice(0, index - 1) + value.slice(index))
        focusAt(index - 1)
      }
      return
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      focusAt(index - 1)
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault()
      focusAt(index + 1)
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    const text = event.clipboardData.getData('text')
    if (!text) return
    event.preventDefault()
    const next = commit(text)
    focusAt(next.length)
  }

  return (
    <div
      role="group"
      aria-label="6 rəqəmli təsdiq kodu"
      aria-describedby={describedBy}
      className="grid grid-cols-6 gap-2"
    >
      {Array.from({ length: OTP_LENGTH }).map((_, index) => (
        <input
          key={index}
          ref={(element) => {
            inputs.current[index] = element
          }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-label={`${index + 1}-ci rəqəm`}
          value={value[index] ?? ''}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          onFocus={(event) => event.target.select()}
          className={cn(
            'h-12 w-full rounded-md border bg-surface text-center text-lg font-bold tabular-nums text-ink-900',
            'transition-[border-color,box-shadow] duration-150',
            'focus:outline-none focus:border-brand-600 focus:ring-3 focus:ring-brand-100',
            'disabled:cursor-not-allowed disabled:bg-ink-50',
            invalid ? 'border-danger focus:border-danger focus:ring-danger-soft' : 'border-line-strong',
          )}
        />
      ))}
    </div>
  )
}

export default function VerifyOtpPage() {
  usePageMeta({ title: 'E-poçtu təsdiqlə' })

  const navigate = useNavigate()
  const location = useLocation()
  const { applyTokens } = useAuth()
  const [formError, setFormError] = useState<string | null>(null)
  const [helpOpen, setHelpOpen] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  // Geri sayım: hər saniyə bir azalır, 0-da dayanır.
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setTimeout(() => setResendCooldown((value) => value - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendCooldown])

  const locationState = location.state as { email?: string } | null
  const email = locationState?.email ?? storage.get(STORAGE_KEYS.pendingEmail) ?? ''

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { email, otp: '' },
  })

  const otp = watch('otp') ?? ''

  async function onSubmit(values: OtpFormValues) {
    setFormError(null)
    try {
      const tokens = await authService.confirmOtp({ email: values.email, otp: values.otp })
      const user = applyTokens(tokens)

      if (!user) {
        setFormError('Kod təsdiqləndi, amma sessiya açılmadı. Yenidən daxil ol.')
        return
      }

      storage.remove(STORAGE_KEYS.pendingEmail)
      toast.success('Hesabın aktivdir', 'Xoş gəldin! Artıq bron edə bilərsən.')

      const target = resolvePostAuthTarget(user, '/dashboard')
      navigate(target.to, { state: target.state, replace: true })
    } catch (error) {
      setFormError(errorMessage(error))
    }
  }

  async function handleResend() {
    if (resending || resendCooldown > 0) return
    setResending(true)
    setFormError(null)
    try {
      await authService.resendOtp(email)
      toast.success('Yeni kod göndərildi', `${email} ünvanını yoxla (spam qovluğu daxil).`)
      setResendCooldown(RESEND_COOLDOWN_SECONDS)
    } catch (error) {
      const apiError = toApiError(error)
      if (apiError.status === 429) {
        setFormError('Çox tez-tez cəhd etdin. Bir neçə dəqiqə gözləyib yenidən yoxla.')
        setResendCooldown(RESEND_COOLDOWN_SECONDS)
      } else {
        // Məs. qeydiyyat sessiyasının vaxtı bitib — backend mesajı olduğu kimi göstərilir
        setFormError(errorMessage(error))
      }
    } finally {
      setResending(false)
    }
  }

  if (!email) {
    return (
      <div className="space-y-5">
        <ErrorState
          title="E-poçt ünvanı tapılmadı"
          description="Təsdiq kodunu hansı ünvana göndərdiyimizi bilmirik. Qeydiyyatı yenidən başlat."
        />
        <Button asChild block variant="secondary">
          <Link to="/register">Qeydiyyata qayıt</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <div className="grid size-11 place-items-center rounded-full bg-brand-50 text-brand-700">
          <MailCheck className="size-5" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">E-poçtunu təsdiqlə</h1>
        <p className="text-sm leading-relaxed text-ink-500">
          <span className="font-semibold text-ink-800">{email}</span> ünvanına 6 rəqəmli kod
          göndərdik. Kodu aşağıda yaz.
        </p>
      </header>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormAlert message={formError} />

        <div className="space-y-1.5">
          <span className="block text-[13px] font-semibold text-ink-800">Təsdiq kodu</span>
          <OtpInput
            value={otp}
            invalid={!!errors.otp}
            describedBy={errors.otp ? 'otp-error' : 'otp-hint'}
            disabled={isSubmitting}
            onChange={(next) => {
              setFormError(null)
              setValue('otp', next, { shouldValidate: false })
            }}
          />
          {errors.otp?.message ? (
            <p id="otp-error" role="alert" className="text-xs font-medium text-danger">
              {errors.otp.message}
            </p>
          ) : (
            <p id="otp-hint" className="text-xs text-ink-500">
              Kodu kopyalayıb birinci xanaya yapışdıra bilərsən.
            </p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          block
          loading={isSubmitting}
          disabled={otp.length !== OTP_LENGTH}
        >
          <ShieldCheck />
          Təsdiqlə və daxil ol
        </Button>
      </form>

      <div className="space-y-3 border-t border-line pt-5">
        <Button
          variant="secondary"
          block
          loading={resending}
          disabled={resendCooldown > 0}
          onClick={() => void handleResend()}
        >
          <Send />
          {resendCooldown > 0
            ? `Yenidən göndər (${resendCooldown}s)`
            : 'Kodu yenidən göndər'}
        </Button>

        <Button
          variant="link"
          onClick={() => setHelpOpen((value) => !value)}
          aria-expanded={helpOpen}
          className="h-10 px-0 text-[13px]"
        >
          <HelpCircle />
          Kod gəlmir?
        </Button>

        {helpOpen ? (
          <InlineNote tone="info">
            Kod gəlməyibsə:
            <ol className="mt-2 list-decimal space-y-1 pl-4">
              <li>Spam və “Promotions” qovluğuna bax.</li>
              <li>Ünvanı düz yazdığından əmin ol: {email}</li>
              <li>Yuxarıdakı «Kodu yenidən göndər» düyməsi ilə təzə kod istə.</li>
              <li>
                “Registration session expired” xətası alırsansa, sessiyanın vaxtı bitib —{' '}
                <Link to="/register" className="font-semibold underline underline-offset-2">
                  yenidən qeydiyyatdan keç
                </Link>
                .
              </li>
            </ol>
          </InlineNote>
        ) : null}

        <p className="text-center text-[13px] text-ink-500">
          Hesabın artıq aktivdir?{' '}
          <Link
            to="/login"
            className="font-semibold text-brand-700 underline-offset-4 hover:underline"
          >
            Daxil ol
          </Link>
        </p>
      </div>
    </div>
  )
}
