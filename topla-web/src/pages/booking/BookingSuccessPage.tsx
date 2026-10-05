import { Link, useLocation, useParams } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { az } from 'date-fns/locale'
import { CalendarCheck, CheckCircle2, Clock, Ticket } from 'lucide-react'
import { Badge, Button, Card, InlineNote } from '@/components/ui'
import { usePageMeta } from '@/hooks/usePageMeta'
import { formatDuration, formatPrice } from '@/utils/format'

interface SuccessState {
  stadiumId?: string
  stadiumName?: string
  startDateTime?: string
  endDateTime?: string
  durationMinutes?: number
  totalPrice?: number | null
}

export default function BookingSuccessPage() {
  const { bookingId = '' } = useParams()
  const state = (useLocation().state ?? {}) as SuccessState

  usePageMeta({ title: 'Rezervasiya göndərildi' })

  const start = state.startDateTime ? parseISO(state.startDateTime) : null
  const end = state.endDateTime ? parseISO(state.endDateTime) : null

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-8 text-center sm:px-6 sm:py-12">
      <div className="mx-auto grid size-16 place-items-center rounded-full bg-brand-50 text-brand-700">
        <CheckCircle2 className="size-8" strokeWidth={2.2} />
      </div>

      <h1 className="mt-5 text-2xl font-bold tracking-tight text-ink-900">
        Rezervasiya təsdiqləndi
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-500">
        {state.stadiumName ? <span className="font-semibold text-ink-700">{state.stadiumName}</span> : 'Meydança'}{' '}
        üçün bronun hazırdır — slot sənin adına bağlandı.
      </p>

      <Card className="mt-6 text-left">
        <div className="space-y-3 p-5 text-[13.5px]">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-ink-500">
              <Ticket className="size-4" aria-hidden="true" />
              Bron nömrəsi
            </span>
            <span className="max-w-40 truncate font-mono text-xs font-semibold text-ink-800">
              {bookingId || '—'}
            </span>
          </div>

          {start ? (
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-ink-500">
                <CalendarCheck className="size-4" aria-hidden="true" />
                Tarix
              </span>
              <span className="font-semibold text-ink-900">
                {format(start, 'd MMMM yyyy', { locale: az })}
              </span>
            </div>
          ) : null}

          {start && end ? (
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-ink-500">
                <Clock className="size-4" aria-hidden="true" />
                Saat
              </span>
              <span className="font-semibold text-ink-900">
                {format(start, 'HH:mm')} – {format(end, 'HH:mm')}
                {state.durationMinutes ? ` · ${formatDuration(state.durationMinutes)}` : ''}
              </span>
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-4">
            <span className="text-ink-500">Status</span>
            <Badge tone="success" dot>
              Təsdiqlənib
            </Badge>
          </div>

          {typeof state.totalPrice === 'number' ? (
            <div className="flex items-center justify-between gap-4 border-t border-line pt-3">
              <span className="font-semibold text-ink-700">Məbləğ</span>
              <span className="text-lg font-bold text-brand-700">
                {formatPrice(state.totalPrice)}
              </span>
            </div>
          ) : null}
        </div>
      </Card>

      <InlineNote tone="brand" className="mt-4 text-left" icon={<CheckCircle2 />}>
        Oyuna 6 saatdan çox varsa rezervasiyanı istənilən vaxt panelindən ləğv edə bilərsən.
      </InlineNote>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
        <Button variant="secondary" asChild className="sm:flex-1">
          <Link to="/stadiums">Yeni axtarış</Link>
        </Button>
        <Button asChild className="sm:flex-1">
          <Link to="/dashboard/bookings">Rezervasiyalarım</Link>
        </Button>
      </div>
    </div>
  )
}
