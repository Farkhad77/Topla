import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Info, Mail, MailCheck, Send } from 'lucide-react'
import { Button, Field, InlineNote, Input } from '@/components/ui'
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/schemas/auth'
import { authService } from '@/services'
import { usePageMeta } from '@/hooks/usePageMeta'
import { toApiError } from '@/api'
import { FormAlert } from './authFields'

export default function ForgotPasswordPage() {
  usePageMeta({ title: 'Şifrəni bərpa et' })

  const [formError, setFormError] = useState<string | null>(null)
  const [sentTo, setSentTo] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  async function onSubmit(values: ForgotPasswordFormValues) {
    setFormError(null)
    const email = values.email.trim()

    try {
      await authService.forgotPassword({ email })
      setSentTo(email)
    } catch (error) {
      const apiError = toApiError(error)

      // Endpoint dəqiqədə 3 sorğu ilə məhdudlaşıb.
      if (apiError.status === 429) {
        setFormError('Çox tez-tez cəhd etdin. Bir dəqiqə gözlə və yenidən yoxla.')
        return
      }

      setFormError(apiError.message)
    }
  }

  if (sentTo) {
    return (
      <div className="space-y-6">
        <header className="space-y-1.5">
          <div className="grid size-11 place-items-center rounded-full bg-success-soft text-success">
            <MailCheck className="size-5" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">
            Linki e-poçtuna göndərdik
          </h1>
          <p className="text-sm leading-relaxed text-ink-500">
            <span className="font-semibold text-ink-800">{sentTo}</span> ünvanına şifrə bərpa linki
            göndərildi. Linkə keçib yeni şifrəni təyin et.
          </p>
        </header>

        <InlineNote tone="info" icon={<Info />}>
          Məktub 1-2 dəqiqəyə gəlir. Görünmürsə spam qovluğuna bax. Link məhdud müddət keçərlidir.
        </InlineNote>

        <div className="space-y-2">
          <Button asChild block size="lg">
            <Link to="/login">Girişə qayıt</Link>
          </Button>
          <Button
            variant="ghost"
            block
            onClick={() => {
              setSentTo(null)
              reset({ email: sentTo })
            }}
          >
            Başqa ünvan yaz
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Şifrəni unutdun?</h1>
        <p className="text-sm leading-relaxed text-ink-500">
          E-poçt ünvanını yaz — şifrəni yeniləmək üçün sənə link göndərək.
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

        <Button type="submit" size="lg" block loading={isSubmitting}>
          <Send />
          Bərpa linkini göndər
        </Button>
      </form>

      <Link
        to="/login"
        className="flex items-center justify-center gap-1.5 text-[13px] font-semibold text-ink-600 underline-offset-4 hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Girişə qayıt
      </Link>
    </div>
  )
}
