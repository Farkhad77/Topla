import { Ban, ShieldCheck } from 'lucide-react'
import { Badge, Button, Table, TableScroller, Td, Th, Tr } from '@/components/ui'
import { formatPrice } from '@/utils/format'
import type { StadiumListItem } from '@/types'

export interface StadiumModerationProps {
  stadiums: StadiumListItem[]
  /** 1 = Verified, 2 = Rejected (backend enum). */
  onVerify: (stadium: StadiumListItem, status: 1 | 2) => void
  busyId: string | null
  busy: boolean
}

function VerifyActions({ stadium, onVerify, busyId, busy }: StadiumModerationProps & { stadium: StadiumListItem }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onVerify(stadium, 1)}
        loading={busyId === stadium.id}
        disabled={busy}
      >
        <ShieldCheck aria-hidden="true" />
        Təsdiqi saxla
      </Button>
      <Button
        variant="danger-soft"
        size="sm"
        onClick={() => onVerify(stadium, 2)}
        disabled={busy}
      >
        <Ban aria-hidden="true" />
        Kataloqdan çıxar
      </Button>
    </div>
  )
}

export function StadiumModerationTable(props: StadiumModerationProps) {
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
                <Th>Ölçü</Th>
                <Th>Saatlıq qiymət</Th>
                <Th>Status</Th>
                <Th className="text-right">Əməliyyat</Th>
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
                  <Td className="py-2.5 text-ink-600">{stadium.size || '—'}</Td>
                  <Td className="py-2.5 whitespace-nowrap tabular-nums text-ink-800">
                    {formatPrice(stadium.pricePerHour, true)}
                  </Td>
                  <Td className="py-2.5">
                    <Badge tone="success" size="sm" dot>
                      Təsdiqlənib
                    </Badge>
                  </Td>
                  <Td className="py-2.5">
                    <VerifyActions {...props} stadium={stadium} />
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
              <Badge tone="success" size="sm" dot>
                Təsdiqlənib
              </Badge>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ink-600">
              <Badge tone="outline" size="sm">
                {stadium.size || 'Ölçü qeyd olunmayıb'}
              </Badge>
              <span className="tabular-nums font-semibold text-ink-800">
                {formatPrice(stadium.pricePerHour, true)}
              </span>
            </div>

            <div className="mt-3">
              <VerifyActions {...props} stadium={stadium} />
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
