import { useState } from 'react'
import { useApproveOwnerRequest, useRejectOwnerRequest } from '@/hooks/queries/useAdminQueries'
import type { OwnerRequest } from '@/types'

/**
 * Owner sorğularının təsdiq/rədd axını iki səhifədə (ümumi baxış + sorğular)
 * eyni davranışla işləsin deyə tək yerdə saxlanılır.
 */
export function useOwnerRequestModeration() {
  const approve = useApproveOwnerRequest()
  const reject = useRejectOwnerRequest()

  const [approveTarget, setApproveTarget] = useState<OwnerRequest | null>(null)
  const [rejectTarget, setRejectTarget] = useState<OwnerRequest | null>(null)
  const [detailTarget, setDetailTarget] = useState<OwnerRequest | null>(null)

  const busy = approve.isPending || reject.isPending
  const busyId = approve.isPending
    ? (approveTarget?.id ?? null)
    : reject.isPending
      ? (rejectTarget?.id ?? null)
      : null

  const confirmApprove = () => {
    if (!approveTarget) return
    // Xəta halında da dialoqu bağlayırıq — mesajı toast göstərir.
    approve.mutate(approveTarget.id, { onSettled: () => setApproveTarget(null) })
  }

  const confirmReject = (reason: string) => {
    if (!rejectTarget) return
    // Xəta olarsa dialoq açıq qalır ki, yazılan səbəb itməsin.
    reject.mutate({ id: rejectTarget.id, reason }, { onSuccess: () => setRejectTarget(null) })
  }

  return {
    approveTarget,
    rejectTarget,
    detailTarget,
    setApproveTarget,
    setRejectTarget,
    setDetailTarget,
    confirmApprove,
    confirmReject,
    approvePending: approve.isPending,
    rejectPending: reject.isPending,
    busy,
    busyId,
  }
}

export type OwnerRequestModeration = ReturnType<typeof useOwnerRequestModeration>
