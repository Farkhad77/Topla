import { Badge } from '@/components/ui'
import { BOOKING_STATUS_LABELS } from '@/utils/booking'
import { ApprovalStatus, type ApprovalStatusValue, type BookingUiStatus } from '@/types'

const BOOKING_TONES: Record<BookingUiStatus, 'success' | 'warning' | 'neutral' | 'danger' | 'brand'> =
  {
    confirmed: 'success',
    pending: 'warning',
    completed: 'neutral',
    cancelled: 'neutral',
    rejected: 'danger',
  }

export function BookingStatusBadge({ status }: { status: BookingUiStatus }) {
  return (
    <Badge tone={BOOKING_TONES[status]} dot>
      {BOOKING_STATUS_LABELS[status]}
    </Badge>
  )
}

const APPROVAL_LABELS: Record<ApprovalStatusValue, string> = {
  [ApprovalStatus.Pending]: 'Gözləyir',
  [ApprovalStatus.Approved]: 'Təsdiqləndi',
  [ApprovalStatus.Rejected]: 'Rədd edildi',
}

export function ApprovalStatusBadge({ status }: { status: ApprovalStatusValue }) {
  const tone =
    status === ApprovalStatus.Approved
      ? 'success'
      : status === ApprovalStatus.Rejected
        ? 'danger'
        : 'warning'

  return (
    <Badge tone={tone} dot>
      {APPROVAL_LABELS[status]}
    </Badge>
  )
}
