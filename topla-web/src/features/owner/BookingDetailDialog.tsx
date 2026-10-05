import { Dialog, DialogBody, DialogContent, DialogHeader } from '@/components/ui'
import { BookingStatusBadge } from '@/components/common/StatusBadge'
import { resolveBookingState } from '@/utils/booking'
import { formatDate, formatDuration, formatPrice, formatTimeRange, toDate } from '@/utils/format'
import type { OwnerBooking } from '@/types'

function durationMinutes(booking: OwnerBooking): number {
  const start = toDate(booking.startDateTime)
  const end = toDate(booking.endDateTime)
  if (!start || !end) return 0
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 60_000))
}

export function BookingDetailDialog({
  booking,
  onOpenChange,
}: {
  booking: OwnerBooking | null
  onOpenChange: (open: boolean) => void
}) {
  const rows: { label: string; value: string }[] = booking
    ? [
        { label: 'Stadion', value: booking.stadiumName || '—' },
        { label: 'Müştəri', value: booking.customerName || '—' },
        { label: 'Tarix', value: formatDate(booking.startDateTime) },
        {
          label: 'Vaxt',
          value: formatTimeRange(booking.startDateTime, booking.endDateTime),
        },
        { label: 'Müddət', value: formatDuration(durationMinutes(booking)) },
        { label: 'Məbləğ', value: formatPrice(booking.totalPrice) },
        { label: 'Bron nömrəsi', value: booking.bookingId },
      ]
    : []

  return (
    <Dialog open={!!booking} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader
          title="Rezervasiya detalları"
          description="Bu məlumat backend-in qaytardığı sahələrdən ibarətdir."
        />
        {booking ? (
          <DialogBody className="space-y-4">
            <BookingStatusBadge
              status={resolveBookingState({
                status: booking.status,
                endDateTime: booking.endDateTime,
              })}
            />

            <dl className="divide-y divide-line rounded-md border border-line">
              {rows.map((row) => (
                <div key={row.label} className="flex items-start justify-between gap-4 px-3.5 py-2.5">
                  <dt className="text-[13px] text-ink-500">{row.label}</dt>
                  <dd className="min-w-0 break-words text-right text-[13px] font-semibold text-ink-900">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>

            <p className="text-xs text-ink-500">
              Müştərinin əlaqə məlumatı backend cavabında yoxdur — yalnız ad göstərilir.
            </p>
          </DialogBody>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
