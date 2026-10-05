import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { analyticsService, ownerRequestService, stadiumService, workerService } from '@/services'
import type { AnalyticsPeriod } from '@/services/analyticsService'
import { queryKeys } from '@/hooks/queryKeys'
import { toast } from '@/hooks/useToast'
import { errorMessage } from '@/api'
import type { BlockedSlotCreatePayload } from '@/types'

/**
 * Owner analitikası — `GET /api/Analytics/owner`.
 * Dövr verilməzsə backend son 6 ayı qaytarır (Bakı təqvimi ilə).
 */
export function useOwnerAnalytics(period?: AnalyticsPeriod) {
  return useQuery({
    queryKey: [
      ...queryKeys.owner.analytics,
      period?.fromDate ?? null,
      period?.toDate ?? null,
    ],
    queryFn: () => analyticsService.owner(period),
    staleTime: 30_000,
  })
}

export function useMyOwnerRequest(enabled = true) {
  return useQuery({
    queryKey: queryKeys.owner.request,
    queryFn: async () => {
      try {
        return await ownerRequestService.mine()
      } catch (error) {
        // Sorğu göndərilməyibsə backend 404 verir — bu, xəta deyil.
        if ((error as { status?: number }).status === 404) return null
        throw error
      }
    },
    enabled,
    staleTime: 30_000,
    retry: false,
  })
}

export function useCreateOwnerRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (message: string) => ownerRequestService.create(message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.owner.request })
      toast.success('Sorğun göndərildi', 'Moderator baxışı adətən 24 saat çəkir.')
    },
    onError: (error) => toast.error('Sorğu göndərilmədi', errorMessage(error)),
  })
}

export function useWorkers(enabled = true) {
  return useQuery({
    queryKey: queryKeys.owner.workers,
    queryFn: () => workerService.mine(),
    enabled,
    staleTime: 30_000,
  })
}

export function useAssignWorker() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (workerEmail: string) => workerService.assign(workerEmail),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.owner.workers })
      toast.success('İşçi əlavə edildi')
    },
    onError: (error) => toast.error('İşçi əlavə edilmədi', errorMessage(error)),
  })
}

export function useRemoveWorker() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (workerUserId: string) => workerService.remove(workerUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.owner.workers })
      toast.success('İşçinin təyinatı ləğv edildi')
    },
    onError: (error) => toast.error('Əməliyyat alınmadı', errorMessage(error)),
  })
}

export function useWorkerBusiness(enabled = true) {
  return useQuery({
    queryKey: queryKeys.owner.business,
    queryFn: () => workerService.myBusiness(),
    enabled,
    staleTime: 60_000,
    retry: false,
  })
}

export function useBlockedSlots(stadiumId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.stadiums.blockedSlots(stadiumId ?? ''),
    queryFn: () => stadiumService.blockedSlots(stadiumId as string),
    enabled: !!stadiumId,
    staleTime: 20_000,
  })
}

export function useBlockSlot(stadiumId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: BlockedSlotCreatePayload) => stadiumService.blockSlot(stadiumId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stadiums.blockedSlots(stadiumId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all })
      toast.success('Vaxt bloklandı', 'Bu interval istifadəçilərə əlçatmaz görünəcək.')
    },
    onError: (error) => toast.error('Bloklanmadı', errorMessage(error)),
  })
}

export function useUnblockSlot(stadiumId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (blockedSlotId: string) => stadiumService.unblockSlot(blockedSlotId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stadiums.blockedSlots(stadiumId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all })
      toast.success('Blok götürüldü')
    },
    onError: (error) => toast.error('Blok götürülmədi', errorMessage(error)),
  })
}
