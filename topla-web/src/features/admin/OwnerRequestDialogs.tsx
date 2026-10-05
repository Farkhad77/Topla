import { Check, X } from 'lucide-react'
import {
  Badge,
  Button,
  ConfirmDialog,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '@/components/ui'
import { ApprovalStatusBadge } from '@/components/common/StatusBadge'
import { RejectRequestDialog } from './RejectRequestDialog'
import type { OwnerRequestModeration } from './useOwnerRequestModeration'
import { formatDateTime } from '@/utils/format'
import { ApprovalStatus, type OwnerRequest } from '@/types'

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line py-2 last:border-b-0">
      <span className="text-xs font-semibold text-ink-500">{label}</span>
      <span className="min-w-0 break-words text-right text-[13px] text-ink-800">{value}</span>
    </div>
  )
}

function OwnerRequestDetailDialog({
  request,
  busy,
  onClose,
  onApprove,
  onReject,
}: {
  request: OwnerRequest | null
  busy: boolean
  onClose: () => void
  onApprove: (request: OwnerRequest) => void
  onReject: (request: OwnerRequest) => void
}) {
  return (
    <Dialog open={!!request} onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="lg">
        <DialogHeader
          title="Sahibkar sorğusu"
          description={request ? request.fullName : undefined}
        />

        {request ? (
          <>
            <DialogBody className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <ApprovalStatusBadge status={request.status} />
                <Badge tone="outline" size="sm">
                  ID: {request.id.slice(0, 8)}…
                </Badge>
              </div>

              <div>
                <p className="mb-1.5 text-xs font-semibold text-ink-500">Müraciət mətni</p>
                <p className="whitespace-pre-wrap rounded-md border border-line bg-ink-50/60 p-3.5 text-[13.5px] leading-relaxed text-ink-800">
                  {request.message?.trim() || 'İstifadəçi mesaj yazmayıb.'}
                </p>
              </div>

              <div>
                <DetailRow label="E-poçt" value={request.email} />
                <DetailRow label="İstifadəçi id" value={request.userId} />
                <DetailRow label="Göndərilib" value={formatDateTime(request.createdAt)} />
                {request.rejectReason ? (
                  <DetailRow label="Rədd səbəbi" value={request.rejectReason} />
                ) : null}
              </div>
            </DialogBody>

            <DialogFooter>
              <Button variant="secondary" onClick={onClose}>
                Bağla
              </Button>
              {request.status === ApprovalStatus.Pending ? (
                <>
                  <Button variant="danger-soft" onClick={() => onReject(request)} disabled={busy}>
                    <X aria-hidden="true" />
                    Rədd et
                  </Button>
                  <Button onClick={() => onApprove(request)} disabled={busy}>
                    <Check aria-hidden="true" />
                    Təsdiqlə
                  </Button>
                </>
              ) : null}
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

/** Təsdiq / rədd / detal dialoqları — hər iki admin səhifəsi eyni dəsti işlədir. */
export function OwnerRequestDialogs({ moderation }: { moderation: OwnerRequestModeration }) {
  return (
    <>
      <ConfirmDialog
        open={!!moderation.approveTarget}
        onOpenChange={(open) => !open && moderation.setApproveTarget(null)}
        title="Sorğunu təsdiqləyirsən?"
        description={
          moderation.approveTarget
            ? `${moderation.approveTarget.fullName} istifadəçisinə "Sahibkar" rolu veriləcək. Bu əməliyyat geri qaytarılmır.`
            : undefined
        }
        confirmLabel="Bəli, təsdiqlə"
        tone="primary"
        loading={moderation.approvePending}
        onConfirm={moderation.confirmApprove}
      />

      <RejectRequestDialog
        request={moderation.rejectTarget}
        loading={moderation.rejectPending}
        onClose={() => moderation.setRejectTarget(null)}
        onSubmit={moderation.confirmReject}
      />

      <OwnerRequestDetailDialog
        request={moderation.detailTarget}
        busy={moderation.busy}
        onClose={() => moderation.setDetailTarget(null)}
        onApprove={(request) => {
          moderation.setDetailTarget(null)
          moderation.setApproveTarget(request)
        }}
        onReject={(request) => {
          moderation.setDetailTarget(null)
          moderation.setRejectTarget(request)
        }}
      />
    </>
  )
}
