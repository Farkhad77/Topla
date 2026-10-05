import { Badge, Table, TableScroller, Td, Th, Tr } from '@/components/ui'
import { BookingStatusBadge } from '@/components/common/StatusBadge'
import { formatDate, formatPrice, formatTimeRange } from '@/utils/format'
import type { BookingDetail, BookingUiStatus } from '@/types'

export interface BookingRow {
  booking: BookingDetail
  state: BookingUiStatus
}

/** Admin rezervasiya siyahısı — desktop-da cədvəl, mobil ekranda kart. */
export function BookingTable({ rows }: { rows: BookingRow[] }) {
  return (
    <>
      <div className="hidden md:block">
        <TableScroller>
          <Table>
            <thead>
              <tr>
                <Th>Stadion</Th>
                <Th>İstifadəçi id</Th>
                <Th>Tarix / saat</Th>
                <Th className="text-right">Məbləğ</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ booking, state }) => (
                <Tr key={booking.id}>
                  <Td className="py-2.5">
                    <span className="block font-semibold text-ink-900">
                      {booking.stadiumName || 'Adsız stadion'}
                    </span>
                    <span className="block font-mono text-2xs text-ink-400">
                      bron: {booking.id.slice(0, 8)}…
                    </span>
                  </Td>
                  <Td className="py-2.5">
                    <span className="font-mono text-xs text-ink-600">{booking.userId}</span>
                  </Td>
                  <Td className="py-2.5 whitespace-nowrap text-ink-700">
                    <span className="block">{formatDate(booking.startDateTime)}</span>
                    <span className="block text-xs text-ink-500">
                      {formatTimeRange(booking.startDateTime, booking.endDateTime)}
                    </span>
                  </Td>
                  <Td className="py-2.5 text-right font-semibold tabular-nums text-ink-900">
                    {formatPrice(booking.totalPrice)}
                  </Td>
                  <Td className="py-2.5">
                    <BookingStatusBadge status={state} />
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </TableScroller>
      </div>

      <ul className="space-y-3 md:hidden">
        {rows.map(({ booking, state }) => (
          <li key={booking.id} className="rounded-md border border-line bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-[13.5px] font-bold text-ink-900">
                  {booking.stadiumName || 'Adsız stadion'}
                </p>
                <p className="text-xs text-ink-500">
                  {formatDate(booking.startDateTime)} ·{' '}
                  {formatTimeRange(booking.startDateTime, booking.endDateTime)}
                </p>
              </div>
              <BookingStatusBadge status={state} />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge tone="outline" size="sm" className="font-mono">
                istifadəçi: {booking.userId.slice(0, 8)}…
              </Badge>
              <span className="ml-auto text-sm font-bold tabular-nums text-ink-900">
                {formatPrice(booking.totalPrice)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
