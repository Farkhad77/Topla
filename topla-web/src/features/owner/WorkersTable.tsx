import { Trash2 } from 'lucide-react'
import { Badge, Button, Table, TableScroller, Td, Th, Tr } from '@/components/ui'
import { formatDate } from '@/utils/format'
import type { Worker } from '@/types'

function StatusBadge({ active }: { active: boolean }) {
  return (
    <Badge tone={active ? 'success' : 'neutral'} dot>
      {active ? 'Aktiv' : 'Deaktiv'}
    </Badge>
  )
}

export function WorkersTable({
  workers,
  onRemove,
}: {
  workers: Worker[]
  onRemove: (worker: Worker) => void
}) {
  return (
    <>
      {/* Mobil: kart siyahısı, desktop: cədvəl. */}
      <ul className="space-y-3 lg:hidden">
        {workers.map((worker) => (
          <li key={worker.userId} className="rounded-md border border-line bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-ink-900">{worker.fullName}</p>
                <p className="truncate text-[13px] text-ink-500">{worker.email}</p>
              </div>
              <StatusBadge active={worker.isActive} />
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3">
              <span className="text-xs text-ink-500">Təyinat: {formatDate(worker.createdAt)}</span>
              <Button
                variant="danger-soft"
                size="sm"
                className="min-h-10"
                onClick={() => onRemove(worker)}
              >
                <Trash2 />
                Çıxar
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <div className="hidden lg:block">
        <TableScroller>
          <Table>
            <caption className="sr-only">Təyin olunmuş işçilər</caption>
            <thead>
              <tr>
                <Th>Ad</Th>
                <Th>E-poçt</Th>
                <Th>Status</Th>
                <Th>Təyinat tarixi</Th>
                <Th className="text-right">Əməliyyat</Th>
              </tr>
            </thead>
            <tbody>
              {workers.map((worker) => (
                <Tr key={worker.userId}>
                  <Td className="font-semibold text-ink-900">{worker.fullName}</Td>
                  <Td>{worker.email}</Td>
                  <Td>
                    <StatusBadge active={worker.isActive} />
                  </Td>
                  <Td>{formatDate(worker.createdAt)}</Td>
                  <Td>
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`${worker.fullName} təyinatını ləğv et`}
                        onClick={() => onRemove(worker)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
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
