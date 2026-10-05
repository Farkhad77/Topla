import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addDays, addMinutes, format } from 'date-fns'
import { az } from 'date-fns/locale'
import { CalendarDays, Clock, Info, LogIn } from 'lucide-react'
import {
  Button,
  DateStrip,
  DatePicker,
  Field,
  InlineNote,
  SimpleSelect,
  Skeleton,
  ErrorState,
} from '@/components/ui'
import { useAvailableSlots } from '@/hooks/queries/useBookingQueries'
import { useAuth } from '@/hooks/useAuth'
import { SlotGrid, SlotLegend } from './SlotGrid'
import { buildSlotViews, estimatePrice, isRangeAvailable, PEAK_HOURS_LABEL } from './slotUtils'
import { durationOptionsFor } from '@/utils/booking'
import { bakuNow, bakuToday, formatDuration, formatPrice, toDateParam, toWallClockIso } from '@/utils/format'
import { storage } from '@/utils/storage'
import { STORAGE_KEYS } from '@/utils/constants'

interface BookingPanelProps {
  stadiumId: string
  stadiumName: string
  pricePerHour: number
  minBookingMinutes?: number
  maxBookingMinutes?: number
}

/**
 * Bron axınının 1-ci mərhələsi: tarix → saat → müddət → qiymət.
 * İstifadəçi heç vaxt "saatı hardan seçim?" sualını verməməlidir —
 * ona görə slotlar panelin ən görünən hissəsindədir.
 */
export function BookingPanel({
  stadiumId,
  stadiumName,
  pricePerHour,
  minBookingMinutes = 60,
  maxBookingMinutes = 180,
}: BookingPanelProps) {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  // "Bugün" Bakı təqviminə görə götürülür — brauzer qurşağından asılı deyil.
  const [date, setDate] = useState(() => bakuToday())
  const [selectedStart, setSelectedStart] = useState<Date | null>(null)
  const [duration, setDuration] = useState(minBookingMinutes || 60)

  const dateParam = toDateParam(date)
  const slotsQuery = useAvailableSlots(stadiumId, dateParam)
  const views = useMemo(() => buildSlotViews(slotsQuery.data ?? []), [slotsQuery.data])

  const durations = useMemo(
    () => durationOptionsFor(minBookingMinutes, maxBookingMinutes),
    [minBookingMinutes, maxBookingMinutes],
  )

  useEffect(() => {
    setSelectedStart(null)
  }, [dateParam, stadiumId])

  useEffect(() => {
    if (!durations.includes(duration)) setDuration(durations[0] ?? 60)
  }, [durations, duration])

  const rangeOk = selectedStart ? isRangeAvailable(views, selectedStart, duration) : false
  const total = selectedStart ? estimatePrice(pricePerHour, selectedStart, duration) : 0
  const freeCount = views.filter((view) => view.state === 'free').length
  const pastCount = views.filter((view) => view.state === 'past').length
  // Bütün slotlar keçmişdədirsə bu "dolu" deyil — istifadəçiyə fərqli mesaj lazımdır.
  const allPast = views.length > 0 && pastCount === views.length

  function handleContinue() {
    if (!selectedStart) return

    const intent = {
      stadiumId,
      stadiumName,
      startDateTime: toWallClockIso(selectedStart),
      durationMinutes: duration,
    }

    if (!isAuthenticated) {
      storage.set(STORAGE_KEYS.lastBookingIntent, JSON.stringify(intent))
      navigate('/login', { state: { from: '/booking/review' } })
      return
    }

    navigate('/booking/review', { state: intent })
  }

  return (
    <section
      className="rounded-lg border border-line bg-surface shadow-raised"
      aria-labelledby="booking-panel-title"
    >
      <div className="border-b border-line px-4 py-3.5 sm:px-5 sm:py-4">
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-bold text-brand-700 sm:text-2xl">{formatPrice(pricePerHour)}</span>
          <span className="text-[13px] text-ink-500">/ saat</span>
        </div>
        <h2 id="booking-panel-title" className="mt-1 text-[13px] font-semibold text-ink-600">
          Tarix və saat seç
        </h2>
      </div>

      <div className="space-y-4 px-4 py-4 sm:space-y-5 sm:px-5 sm:py-5">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 text-[13px] font-semibold text-ink-800">
              <CalendarDays className="size-4 text-ink-400" aria-hidden="true" />
              {format(date, 'd MMMM, EEEE', { locale: az })}
            </p>
            <div className="w-36">
              <DatePicker value={date} onChange={setDate} minDate={bakuNow()} />
            </div>
          </div>
          <DateStrip value={date} onChange={setDate} />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-semibold text-ink-800">Boş saatlar</p>
            {!slotsQuery.isLoading && !slotsQuery.isError ? (
              <p className="text-xs text-ink-500">{freeCount} boş slot</p>
            ) : null}
          </div>

          {slotsQuery.isLoading ? (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
              {Array.from({ length: 10 }).map((_, index) => (
                <Skeleton key={index} className="h-11 rounded-md" />
              ))}
            </div>
          ) : slotsQuery.isError ? (
            <ErrorState
              title="Saatlar yüklənmədi"
              description="Bağlantını yoxlayıb yenidən cəhd et."
              onRetry={() => void slotsQuery.refetch()}
            />
          ) : views.length === 0 ? (
            <div className="space-y-2.5">
              <InlineNote tone="warning" icon={<Info />}>
                Bu stadion üçün iş saatları cədvəli qurulmayıb, ona görə boş slot göstərə
                bilmirik. Başqa gün yoxla və ya stadionla əlaqə saxla.
              </InlineNote>
              <Button variant="secondary" size="sm" block onClick={() => setDate(addDays(date, 1))}>
                Növbəti günə bax
              </Button>
            </div>
          ) : allPast ? (
            <div className="space-y-2.5">
              <InlineNote tone="warning" icon={<Info />}>
                Bu günün bütün saatları artıq keçib.
              </InlineNote>
              <Button variant="secondary" size="sm" block onClick={() => setDate(addDays(date, 1))}>
                Sabaha bax
              </Button>
            </div>
          ) : freeCount === 0 ? (
            <div className="space-y-2.5">
              <InlineNote tone="warning" icon={<Info />}>
                Bu gün üçün bütün saatlar tutulub və ya bloklanıb.
              </InlineNote>
              <Button variant="secondary" size="sm" block onClick={() => setDate(addDays(date, 1))}>
                Növbəti günə bax
              </Button>
            </div>
          ) : (
            <>
              <SlotGrid views={views} selected={selectedStart} onSelect={setSelectedStart} />
              <SlotLegend />
            </>
          )}
        </div>

        <Field label="Müddət">
          {({ id }) => (
            <SimpleSelect
              id={id}
              value={String(duration)}
              onValueChange={(next) => setDuration(Number(next))}
              options={durations.map((value) => ({
                value: String(value),
                label: formatDuration(value),
              }))}
            />
          )}
        </Field>

        {selectedStart && !rangeOk ? (
          <InlineNote tone="danger" icon={<Info />}>
            Seçilmiş müddət növbəti saatlarla toqquşur. Daha qısa müddət və ya başqa saat seç.
          </InlineNote>
        ) : null}

        <div className="space-y-2 rounded-md bg-ink-50 px-4 py-3.5">
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-ink-600">Saat</span>
            <span className="font-semibold text-ink-900">
              {selectedStart
                ? `${format(selectedStart, 'HH:mm')} – ${format(addMinutes(selectedStart, duration), 'HH:mm')}`
                : 'Slot seç'}
            </span>
          </div>
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-ink-600">Müddət</span>
            <span className="font-semibold text-ink-900">{formatDuration(duration)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-line pt-2 text-sm">
            <span className="font-semibold text-ink-700">Təxmini məbləğ</span>
            <span className="text-lg font-bold text-brand-700">
              {selectedStart ? formatPrice(total) : '—'}
            </span>
          </div>
        </div>

        <p className="flex items-start gap-1.5 text-2xs leading-relaxed text-ink-500">
          <Clock className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          {PEAK_HOURS_LABEL}. Yekun məbləğ növbəti addımda təsdiqlənir.
        </p>

        <Button block size="lg" disabled={!selectedStart || !rangeOk} onClick={handleContinue}>
          {isAuthenticated ? null : <LogIn />}
          {isAuthenticated ? 'Davam et' : 'Daxil ol və bron et'}
        </Button>
      </div>
    </section>
  )
}
