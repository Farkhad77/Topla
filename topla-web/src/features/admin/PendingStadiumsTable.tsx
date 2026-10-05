import { Ban, ShieldCheck } from 'lucide-react'
import { Badge, Button, Table, TableScroller, Td, Th, Tr } from '@/components/ui'
import { formatPrice, formatTimeOnly } from '@/utils/format'
import type { PendingStadium } from '@/types'

export interface PendingStadiumsTableProps {
  stadiums: PendingStadium[]
  /** 1 = Verified, 2 = Rejected (backend enum). */
  onDecide: (stadium: PendingStadium, status: 1 | 2) => void
  busyId: string | null
  busy: boolean
}

function DecisionActions({
  stadium,
  onDecide,
  busyId,
  busy,
}: PendingStadiumsTableProps & { stadium: PendingStadium }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onDecide(stadium, 1)}
        loading={busyId === stadium.id}
        disabled={busy}
      >
        <ShieldCheck aria-hidden="true" />
        Təsdiqlə
      </Button>
      <Button variant="danger-soft" size="sm" onClick={() => onDecide(stadium, 2)} disabled={busy}>
        <Ban aria-hidden="true" />
        Rədd et
      </Button>
    </div>
  )
}

/** Stadionun iş saatları YERLİ (Bakı) saatlardır — TimeOnly olduğu kimi göstərilir. */
function workingHours(stadium: PendingStadium): string {
  const open = formatTimeOnly(stadium.openTime)
  const close = formatTimeOnly(stadium.closeTime)
  if (open === '—' || close === '—') return '—'
  return `${open}–${close}`
}

export function PendingStadiumsTable(props: PendingStadiumsTableProps) {
  const { stadiums } = props

  return (
    <>
      <div className="hidden md:block">
        <TableScroller>
          <Table>
            <thead>
              <tr>
                <Th>Stadion</Th>
                <Th>Şəhər</Th>
                <Th>Örtük</Th>
                <Th>İş saatları</Th>
                <Th>Saatlıq qiymət</Th>
                <Th>Status</Th>
                <Th className="text-right">Qərar</Th>
              </tr>
            </thead>
            <tbody>
              {stadiums.map((stadium) => (
                <Tr key={stadium.id}>
                  <Td className="py-2.5">
                    <span className="block font-semibold text-ink-900">{stadium.name}</span>
                    <span className="block truncate text-xs text-ink-500">{stadium.address}</span>
                  </Td>
                  <Td className="py-2.5 text-ink-600">{stadium.city}</Td>
                  <Td className="py-2.5 text-ink-600">{stadium.surfaceType || '—'}</Td>
                  <Td className="py-2.5 whitespace-nowrap tabular-nums text-ink-600">
                    {workingHours(stadium)}
                  </Td>
                  <Td className="py-2.5 whitespace-nowrap tabular-nums text-ink-800">
                    {formatPrice(stadium.pricePerHour, true)}
                  </Td>
                  <Td className="py-2.5">
                    <Badge tone="warning" size="sm" dot>
                      Gözləyir
                    </Badge>
                  </Td>
                  <Td className="py-2.5">
                    <DecisionActions {...props} stadium={stadium} />
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </TableScroller>
      </div>

      <ul className="space-y-3 md:hidden">
        {stadiums.map((stadium) => (
          <li key={stadium.id} className="rounded-md border border-line bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-[13.5px] font-bold text-ink-900">{stadium.name}</p>
                <p className="truncate text-xs text-ink-500">
                  {stadium.city} · {stadium.address}
                </p>
              </div>
              <Badge tone="warning" size="sm" dot>
                Gözləyir
              </Badge>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ink-600">
              <Badge tone="outline" size="sm">
                {stadium.surfaceType || 'Örtük qeyd olunmayıb'}
              </Badge>
              <span className="tabular-nums">{workingHours(stadium)}</span>
              <span className="tabular-nums font-semibold text-ink-800">
                {formatPrice(stadium.pricePerHour, true)}
              </span>
            </div>

            {stadium.description ? (
              <p className="mt-2 line-clamp-2 text-xs text-ink-500">{stadium.description}</p>
            ) : null}

            <div className="mt-3">
              <DecisionActions {...props} stadium={stadium} />
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
