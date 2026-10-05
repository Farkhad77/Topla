import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { bookingService, stadiumService } from '@/services'
import { queryKeys } from '@/hooks/queryKeys'
import { toast } from '@/hooks/useToast'
import { errorMessage } from '@/api'
import type {
  BookingCreatePayload,
  BookingPreviewPayload,
  OwnerBookingFilters,
} from '@/types'

export function useAvailableSlots(stadiumId: string | undefined, date: string) {
  return useQuery({
    queryKey: queryKeys.bookings.slots(stadiumId ?? '', date),
    queryFn: () => bookingService.availableSlots(stadiumId as string, date),
    enabled: !!stadiumId && !!date,
    staleTime: 20_000,
    refetchOnWindowFocus: true,
  })
}

export function useMyBookings() {
  return useQuery({
    queryKey: queryKeys.bookings.mine,
    queryFn: () => bookingService.mine(),
    staleTime: 15_000,
  })
}

export function useBookingPreview() {
  return useMutation({
    mutationFn: (payload: BookingPreviewPayload) => bookingService.preview(payload),
  })
}

export function useCreateBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: BookingCreatePayload) => bookingService.create(payload),
    onSuccess: (_id, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.mine })
      queryClient.invalidateQueries({
        queryKey: queryKeys.bookings.slots(variables.stadiumId, variables.startDateTime.slice(0, 10)),
      })
    },
    // Xəta mesajı çağıran səhifədə göstərilir (kontekstli mətnlə).
  })
}

export function useCancelBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (bookingId: string) => bookingService.cancel(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all })
      toast.success('Rezervasiya ləğv edildi')
    },
    onError: (error) => toast.error('Ləğv edilmədi', errorMessage(error)),
  })
}

export function useOwnerBookings(filters: OwnerBookingFilters, enabled = true) {
  return useQuery({
    queryKey: queryKeys.bookings.owner(filters),
    queryFn: () => stadiumService.ownerBookings(filters),
    enabled,
    staleTime: 15_000,
  })
}

export function useRejectBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ bookingId, reason }: { bookingId: string; reason: string }) =>
      bookingService.reject(bookingId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all })
      toast.success('Rezervasiya rədd edildi', 'Səbəb istifadəçiyə bildiriş kimi göndərildi.')
    },
    onError: (error) => toast.error('Rədd edilmədi', errorMessage(error)),
  })
}

export function useAdminBookings(page: number, pageSize: number) {
  return useQuery({
    queryKey: queryKeys.bookings.admin(page, pageSize),
    queryFn: () => bookingService.all(page, pageSize),
    staleTime: 30_000,
  })
}
