import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminService, moderationService, stadiumService } from '@/services'
import { queryKeys } from '@/hooks/queryKeys'
import { toast } from '@/hooks/useToast'
import { errorMessage } from '@/api'

export function useOwnerRequests(page: number, pageSize = 10) {
  return useQuery({
    queryKey: queryKeys.admin.ownerRequests(page, pageSize),
    queryFn: () => moderationService.ownerRequests(page, pageSize),
    staleTime: 20_000,
  })
}

export function useApproveOwnerRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => moderationService.approveOwnerRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.ownerRequestsAll })
      toast.success('Sorğu təsdiqləndi', 'İstifadəçiyə sahibkar rolu verildi.')
    },
    onError: (error) => toast.error('Təsdiqlənmədi', errorMessage(error)),
  })
}

export function useRejectOwnerRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      moderationService.rejectOwnerRequest(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.ownerRequestsAll })
      toast.success('Sorğu rədd edildi', 'Səbəb istifadəçiyə göndərildi.')
    },
    onError: (error) => toast.error('Rədd edilmədi', errorMessage(error)),
  })
}

/** Yalnız Admin: e-poçta görə istifadəçiyə Moderator rolu verir. */
export function useAssignModerator() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (email: string) => moderationService.assignModerator(email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      toast.success(
        'Moderator təyin edildi',
        'Rol istifadəçinin növbəti girişindən sonra qüvvəyə minir.',
      )
    },
    onError: (error) => toast.error('Rol verilmədi', errorMessage(error)),
  })
}

export function useBlockUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      moderationService.blockUser(userId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      toast.success('İstifadəçi bloklandı')
    },
    onError: (error) => toast.error('Bloklanmadı', errorMessage(error)),
  })
}

export function useUnblockUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => moderationService.unblockUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      toast.success('Blok götürüldü')
    },
    onError: (error) => toast.error('Əməliyyat alınmadı', errorMessage(error)),
  })
}

/** Moderator/Admin: təsdiq gözləyən stadionların növbəsi (`GET /api/Stadiums/pending`). */
export function usePendingStadiums() {
  return useQuery({
    queryKey: queryKeys.admin.pendingStadiums,
    queryFn: () => stadiumService.pending(),
    staleTime: 20_000,
  })
}

export function useVerifyStadium() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ stadiumId, status }: { stadiumId: string; status: 1 | 2 }) =>
      stadiumService.verify(stadiumId, status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stadiums.all })
      // Qərar verilən stadion "pending" növbəsindən çıxır
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.pendingStadiums })
      toast.success(variables.status === 1 ? 'Stadion təsdiqləndi' : 'Stadion rədd edildi')
    },
    onError: (error) => toast.error('Əməliyyat alınmadı', errorMessage(error)),
  })
}

export function usePlatformStats() {
  return useQuery({
    queryKey: queryKeys.admin.stats,
    queryFn: () => adminService.platformStats(),
    staleTime: 60_000,
  })
}

export function useAdminUsers(page: number, pageSize: number, search: string) {
  return useQuery({
    queryKey: queryKeys.admin.users(page, pageSize, search),
    queryFn: () => adminService.users({ pageNumber: page, pageSize, search }),
    staleTime: 30_000,
  })
}
