import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { addMinutes, parseISO } from 'date-fns'
import { az } from 'date-fns/locale'
import { format } from 'date-fns'
import { ArrowLeft, CalendarDays, CheckCircle2, Clock, Info, MapPin, Wallet } from 'lucide-react'
import { Button, Card, InlineNote, Skeleton } from '@/components/ui'
import { useBookingPreview, useCreateBooking } from '@/hooks/queries/useBookingQueries'
import { usePageMeta } from '@/hooks/usePageMeta'
import { errorMessage } from '@/api'
import { toast } from '@/hooks/useToast'
import { formatDuration, formatPrice, toWallClockIso } from '@/utils/format'
import { storage } from '@/utils/storage'
import { STORAGE_KEYS } from '@/utils/constants'
import type { BookingPreview } from '@/types'

interface BookingIntent {
  stadiumId: string
  stadiumName: string
  startDateTime: string
  durationMinutes: number
}

function readIntent(state: unknown): BookingIntent | null {
  const candidate = state as Partial<BookingIntent> | null
  if (candidate?.stadiumId && candidate.startDateTime && candidate.durationMinutes) {
    return {
      stadiumId: candidate.stadiumId,
      stadiumName: candidate.stadiumName ?? 'Stadion',
      startDateTime: candidate.startDateTime,
      durationMinutes: candidate.durationMinutes,
    }
  }

  const stored = storage.get(STORAGE_KEYS.lastBookingIntent)
  if (!stored) return null
  try {
    const parsed = JSON.parse(stored) as Partial<BookingIntent>
    if (!parsed.stadiumId || !parsed.startDateTime || !parsed.durationMinutes) return null
    return {
      stadiumId: parsed.stadiumId,
      stadiumName: parsed.stadiumName ?? 'Stadion',
      startDateTime: parsed.startDateTime,
      durationMinutes: parsed.durationMinutes,
    }
  } catch {
    return null
  }
}

/** Bron axınının 2-ci mərhələsi: yekun baxış və təsdiq. */
export default function BookingReviewPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const intent = useRef(readIntent(location.state)).current

  const [preview, setPreview] = useState<BookingPreview | null>(null)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const previewMutation = useBookingPreview()
  const createMutation = useCreateBooking()
  const { mutateAsync: runPreview } = previewMutation

  usePageMeta({ title: 'Rezervasiyanı təsdiqlə' })

  useEffect(() => {
    if (!intent) return
    let cancelled = false

    runPreview({
      stadiumId: intent.stadiumId,
      startDateTime: intent.startDateTime,
      durationMinutes: intent.durationMinutes,
    })
      .then((result) => {
        if (!cancelled) setPreview(result)
      })
      .catch((error: unknown) => {
        if (!cancelled) setPreviewError(errorMessage(error))
      })

    return () => {
      cancelled = true
    }
  }, [intent, runPreview])

  if (!intent) return <Navigate to="/stadiums" replace />

  const start = parseISO(intent.startDateTime)
  const end = addMinutes(start, intent.durationMinutes)
  const total = preview?.totalPrice ?? null
  const unavailable = preview !== null && !preview.isAvailable

  async function handleConfirm() {
    if (!intent) return
    setSubmitError(null)
    try {
      const bookingId = await createMutation.mutateAsync({
        stadiumId: intent.stadiumId,
        startDateTime: intent.startDateTime,
        durationMinutes: intent.durationMinutes,
      })
      storage.remove(STORAGE_KEYS.lastBookingIntent)
      toast.success('Rezervasiya göndərildi')
      navigate(`/booking/success/${bookingId}`, {
        state: {
          stadiumId: intent.stadiumId,
          stadiumName: preview?.stadiumName ?? intent.stadiumName,
          startDateTime: intent.startDateTime,
          // toISOString() brauzer qurşağına görə UTC-yə sürüşdürərdi —
          // Bakı divar saatı olduğu kimi ötürülür.
          endDateTime: toWallClockIso(end),
          durationMinutes: intent.durationMinutes,
          totalPrice: total,
        },
        replace: true,
      })
    } catch (error) {
      setSubmitError(errorMessage(error))
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-5 sm:px-6 sm:py-8">
      <Steps current={1} />

      <Card className="mt-5 overflow-hidden sm:mt-6">
        <div className="pitch-surface h-16 sm:h-24" aria-hidden="true" />

        <div className="p-4 sm:p-5">
          <h1 className="text-xl font-bold tracking-tight text-ink-900">
            {preview?.stadiumName ?? intent.stadiumName}
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-[13px] text-ink-500">
            <MapPin className="size-3.5" aria-hidden="true" />
            <Link to={`/stadiums/${intent.stadiumId}`} className="hover:text-brand-700">
              Stadion səhifəsinə bax
            </Link>
          </p>

          <dl className="mt-4 space-y-3 border-t border-line pt-4 text-[13.5px] sm:mt-5 sm:pt-5">
            <div className="flex items-center justify-between gap-4">
              <dt className="flex items-center gap-2 text-ink-500">
                <CalendarDays className="size-4" aria-hidden="true" />
                Tarix
              </dt>
              <dd className="font-semibold text-ink-900">
                {format(start, 'd MMMM yyyy, EEEE', { locale: az })}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="flex items-center gap-2 text-ink-500">
                <Clock className="size-4" aria-hidden="true" />
                Saat
              </dt>
              <dd className="font-semibold text-ink-900">
                {format(start, 'HH:mm')} – {format(end, 'HH:mm')}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-ink-500">Müddət</dt>
              <dd className="font-semibold text-ink-900">
                {formatDuration(intent.durationMinutes)}
              </dd>
            </div>
            {preview ? (
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-500">Saatlıq tarif</dt>
                <dd className="font-semibold text-ink-900">{formatPrice(preview.pricePerHour)}</dd>
              </div>
            ) : null}
          </dl>

          <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
            <span className="flex items-center gap-2 text-sm font-semibold text-ink-700">
              <Wallet className="size-4 text-ink-400" aria-hidden="true" />
              Yekun məbləğ
            </span>
            {previewMutation.isPending ? (
              <Skeleton className="h-7 w-24" />
            ) : (
              <span className="text-xl font-bold text-brand-700">
                {total !== null ? formatPrice(total) : '—'}
              </span>
            )}
          </div>
        </div>
      </Card>

      {previewError ? (
        <InlineNote tone="danger" icon={<Info />} className="mt-4">
          {previewError}
        </InlineNote>
      ) : null}

      {unavailable ? (
        <InlineNote tone="danger" icon={<Info />} className="mt-4">
          Bu saat artıq tutulub. Stadion səhifəsinə qayıdıb başqa slot seç.
        </InlineNote>
      ) : null}

      {submitError ? (
        <InlineNote tone="danger" icon={<Info />} className="mt-4">
          {submitError}
        </InlineNote>
      ) : null}

      <InlineNote tone="brand" icon={<CheckCircle2 />} className="mt-4">
        Slot boşdursa rezervasiya dərhal təsdiqlənir — əlavə gözləmə yoxdur. Statusu
        «Rezervasiyalarım» bölməsindən izləyə bilərsən.
      </InlineNote>

      <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row">
        <Button variant="secondary" asChild className="sm:flex-1">
          <Link to={`/stadiums/${intent.stadiumId}`}>
            <ArrowLeft />
            Geri qayıt
          </Link>
        </Button>
        <Button
          className="sm:flex-2"
          size="lg"
          loading={createMutation.isPending}
          disabled={previewMutation.isPending || unavailable || createMutation.isPending}
          onClick={() => void handleConfirm()}
        >
          Rezervasiyanı təsdiqlə
        </Button>
      </div>
    </div>
  )
}

function Steps({ current }: { current: 0 | 1 | 2 }) {
  const steps = ['Saat seçimi', 'Yekun baxış', 'Təsdiq']

  return (
    <ol className="flex items-center gap-2" aria-label="Bron addımları">
      {steps.map((label, index) => {
        const done = index < current
        const active = index === current
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={
                done || active
                  ? 'grid size-6 shrink-0 place-items-center rounded-full bg-brand-700 text-2xs font-bold text-white'
                  : 'grid size-6 shrink-0 place-items-center rounded-full bg-ink-200 text-2xs font-bold text-ink-500'
              }
              aria-current={active ? 'step' : undefined}
            >
              {done ? '✓' : index + 1}
            </span>
            <span
              className={
                active
                  ? 'hidden text-xs font-bold text-ink-900 sm:block'
                  : 'hidden text-xs font-medium text-ink-500 sm:block'
              }
            >
              {label}
            </span>
            {index < steps.length - 1 ? (
              <span
                className={done ? 'h-0.5 flex-1 bg-brand-700' : 'h-0.5 flex-1 bg-line'}
                aria-hidden="true"
              />
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}
