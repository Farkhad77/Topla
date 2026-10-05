import { Check, Eye, X } from 'lucide-react'
import { Avatar, Button, Table, TableScroller, Td, Th, Tr } from '@/components/ui'
import { ApprovalStatusBadge } from '@/components/common/StatusBadge'
import { cn } from '@/utils/cn'
import { formatDateTime } from '@/utils/format'
import { ApprovalStatus, type OwnerRequest } from '@/types'

export interface OwnerRequestListProps {
  requests: OwnerRequest[]
  onApprove: (request: OwnerRequest) => void
  onReject: (request: OwnerRequest) => void
  onDetail: (request: OwnerRequest) => void
  /** Yalnız mutasiya gedən sətirdə spinner görünsün deyə. */
  busyId: string | null
  busy: boolean
  className?: string
}

type RowProps = Omit<OwnerRequestListProps, 'requests' | 'className'> & { request: OwnerRequest }

function messagePreview(message: string | null): string {
  const trimmed = message?.trim()
  return trimmed && trimmed.length > 0 ? trimmed : 'Mesaj yazılmayıb'
}

function RowActions({ request, onApprove, onReject, busyId, busy }: RowProps) {
  if (request.status !== ApprovalStatus.Pending) {
    return <span className="text-2xs font-semibold text-ink-400">Baxılıb</span>
  }

  return (
    <div className="flex items-center gap-1.5">
      <Button
        size="sm"
        onClick={() => onApprove(request)}
        loading={busyId === request.id}
        disabled={busy}
      >
        <Check aria-hidden="true" />
        Təsdiq
      </Button>
      <Button size="sm" variant="danger-soft" onClick={() => onReject(request)} disabled={busy}>
        <X aria-hidden="true" />
        Rədd
      </Button>
    </div>
  )
}

/** Mobil görünüş — eyni məlumat, kart formasında (üfüqi sürüşmə yoxdur). */
export function OwnerRequestCards({
  requests,
  onApprove,
  onReject,
  onDetail,
  busyId,
  busy,
  className,
}: OwnerRequestListProps) {
  return (
    <ul className={cn('space-y-3', className)}>
      {requests.map((request) => (
        <li key={request.id} className="rounded-md border border-line bg-surface p-4">
          <div className="flex items-start gap-3">
            <Avatar name={request.fullName} size="sm" tone="dark" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13.5px] font-bold text-ink-900">{request.fullName}</p>
              <p className="truncate text-xs text-ink-500">{request.email}</p>
            </div>
            <ApprovalStatusBadge status={request.status} />
          </div>

          <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-ink-600">
            {messagePreview(request.message)}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-2xs text-ink-400">{formatDateTime(request.createdAt)}</span>
            <div className="ml-auto flex flex-wrap items-center gap-1.5">
              <Button variant="ghost" size="sm" onClick={() => onDetail(request)}>
                <Eye aria-hidden="true" />
                Ətraflı
              </Button>
              <RowActions
                request={request}
                onApprove={onApprove}
                onReject={onReject}
                onDetail={onDetail}
                busyId={busyId}
                busy={busy}
              />
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

/** Desktop-da cədvəl, mobil ekranda avtomatik kartlara keçir. */
export function OwnerRequestTable(props: OwnerRequestListProps) {
  const { requests, onApprove, onReject, onDetail, busyId, busy } = props

  return (
    <>
      <div className="hidden md:block">
        <TableScroller>
          <Table>
            <thead>
              <tr>
                <Th>İstifadəçi</Th>
                <Th>E-poçt</Th>
                <Th>Mesaj</Th>
                <Th>Tarix</Th>
                <Th>Status</Th>
                <Th className="text-right">Əməliyyat</Th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <Tr key={request.id}>
                  <Td className="py-2.5">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={request.fullName} size="sm" tone="dark" />
                      <span className="font-semibold text-ink-900">{request.fullName}</span>
                    </div>
                  </Td>
                  <Td className="py-2.5 text-ink-600">{request.email}</Td>
                  <Td className="py-2.5">
                    <button
                      type="button"
                      onClick={() => onDetail(request)}
                      className="block max-w-[20rem] truncate text-left text-ink-600 underline-offset-4 hover:text-brand-700 hover:underline"
                      title="Tam mətni aç"
                    >
                      {messagePreview(request.message)}
                    </button>
                  </Td>
                  <Td className="py-2.5 whitespace-nowrap text-ink-600">
                    {formatDateTime(request.createdAt)}
                  </Td>
                  <Td className="py-2.5">
                    <ApprovalStatusBadge status={request.status} />
                  </Td>
                  <Td className="py-2.5">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onDetail(request)}
                        aria-label={`${request.fullName} sorğusunun detalları`}
                      >
                        <Eye />
                      </Button>
                      <RowActions
                        request={request}
                        onApprove={onApprove}
                        onReject={onReject}
                        onDetail={onDetail}
                        busyId={busyId}
                        busy={busy}
                      />
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </TableScroller>
      </div>

      <OwnerRequestCards {...props} className={cn('md:hidden', props.className)} />
    </>
  )
}
