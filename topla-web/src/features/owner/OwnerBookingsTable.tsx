import { Eye, X } from 'lucide-react'
import { Button, Table, TableScroller, Td, Th, Tr } from '@/components/ui'
import { BookingStatusBadge } from '@/components/common/StatusBadge'
import { BookingStatus } from '@/types'
import { resolveBookingState } from '@/utils/booking'
import { bakuNow, formatDate, formatPrice, formatTimeRange, toDate } from '@/utils/format'
import type { OwnerBooking } from '@/types'

export interface OwnerBookingsTableProps {
  bookings: OwnerBooking[]
  busyId: string | null
  onOpen: (booking: OwnerBooking) => void
  onReject: (booking: OwnerBooking) => void
}

type RowActionsProps = Omit<OwnerBookingsTableProps, 'bookings'> & { booking: OwnerBooking }

function RowActions({ booking, busyId, onOpen, onReject }: RowActionsProps) {
  // Owner təsdiqi silinib — bookinqlər avtomatik təsdiqlənir. Owner yalnız
  // hələ başlamamış aktiv bronu səbəb göstərməklə rədd (ləğv) edə bilər.
  const start = toDate(booking.startDateTime)
  const canReject =
    booking.status !== BookingStatus.Cancelled &&
    booking.status !== BookingStatus.Completed &&
    !!start &&
    start > bakuNow()
  const busy = busyId === booking.bookingId

  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onOpen(booking)}
        aria-label={`${booking.customerName || 'Rezervasiya'} — detallar`}
      >
        <Eye />
      </Button>
      {canReject ? (
        <Button
          variant="danger-soft"
          size="sm"
          disabled={busy}
          onClick={() => onReject(booking)}
          className="min-h-10"
        >
          <X />
          Rədd et
        </Button>
      ) : null}
    </div>
  )
}

export function OwnerBookingsTable({
  bookings,
  busyId,
  onOpen,
  onReject,
}: OwnerBookingsTableProps) {
  const actionProps = { busyId, onOpen, onReject }

  return (
    <>
      {/* Mobil: cədvəl əvəzinə kart siyahısı — üfüqi sürüşmə olmur. */}
      <ul className="space-y-3 lg:hidden">
        {bookings.map((booking) => (
          <li
            key={booking.bookingId}
            className="rounded-lg border border-line bg-surface p-4 shadow-card"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-ink-900">
                  {booking.customerName || 'Ad göstərilməyib'}
                </p>
                <p className="mt-0.5 truncate text-[13px] text-ink-500">{booking.stadiumName}</p>
              </div>
              <BookingStatusBadge
                status={resolveBookingState({
                  status: booking.status,
                  endDateTime: booking.endDateTime,
                })}
              />
            </div>

            <dl className="mt-3 grid grid-cols-2 gap-2 text-[13px]">
              <div>
                <dt className="text-ink-500">Tarix</dt>
                <dd className="font-semibold text-ink-900">{formatDate(booking.startDateTime)}</dd>
              </div>
              <div>
                <dt className="text-ink-500">Saat</dt>
                <dd className="font-semibold text-ink-900">
                  {formatTimeRange(booking.startDateTime, booking.endDateTime)}
                </dd>
              </div>
              <div>
                <dt className="text-ink-500">Məbləğ</dt>
                <dd className="font-semibold text-ink-900">{formatPrice(booking.totalPrice)}</dd>
              </div>
            </dl>

            <div className="mt-3 border-t border-line pt-3">
              <RowActions {...actionProps} booking={booking} />
            </div>
          </li>
        ))}
      </ul>

      <div className="hidden lg:block">
        <TableScroller>
          <Table>
            <caption className="sr-only">Stadionlarımın rezervasiyaları</caption>
            <thead>
              <tr>
                <Th>Müştəri</Th>
                <Th>Stadion</Th>
                <Th>Tarix və saat</Th>
                <Th>Məbləğ</Th>
                <Th>Status</Th>
                <Th className="text-right">Əməliyyat</Th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <Tr key={booking.bookingId}>
                  <Td className="font-semibold text-ink-900">
                    {booking.customerName || 'Ad göstərilməyib'}
                  </Td>
                  <Td>{booking.stadiumName}</Td>
                  <Td>
                    <span className="block">{formatDate(booking.startDateTime)}</span>
                    <span className="text-xs text-ink-500">
                      {formatTimeRange(booking.startDateTime, booking.endDateTime)}
                    </span>
                  </Td>
                  <Td className="tabular-nums">{formatPrice(booking.totalPrice)}</Td>
                  <Td>
                    <BookingStatusBadge
                      status={resolveBookingState({
                        status: booking.status,
                        endDateTime: booking.endDateTime,
                      })}
                    />
                  </Td>
                  <Td>
                    <RowActions {...actionProps} booking={booking} />
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </TableScroller>
      </div>
    </>
  )
}
