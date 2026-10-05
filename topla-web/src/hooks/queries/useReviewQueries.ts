import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { reviewService } from '@/services'
import { queryKeys } from '@/hooks/queryKeys'
import { toast } from '@/hooks/useToast'
import { errorMessage } from '@/api'
import type { ReviewCreatePayload, ReviewUpdatePayload } from '@/types'

export function useStadiumReviews(stadiumId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.reviews.byStadium(stadiumId ?? ''),
    queryFn: () => reviewService.byStadium(stadiumId as string),
    enabled: !!stadiumId,
    staleTime: 60_000,
  })
}

export function useCreateReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ReviewCreatePayload) => reviewService.create(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.byStadium(variables.stadiumId) })
      toast.success('Rəyin üçün təşəkkür!')
    },
    onError: (error) => toast.error('Rəy göndərilmədi', errorMessage(error)),
  })
}

export function useUpdateReview(stadiumId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ reviewId, payload }: { reviewId: string; payload: ReviewUpdatePayload }) =>
      reviewService.update(reviewId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.byStadium(stadiumId) })
      toast.success('Rəy yeniləndi')
    },
    onError: (error) => toast.error('Rəy yenilənmədi', errorMessage(error)),
  })
}

export function useDeleteMyReview(stadiumId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (reviewId: string) => reviewService.removeMine(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.byStadium(stadiumId) })
      toast.success('Rəy silindi')
    },
    onError: (error) => toast.error('Rəy silinmədi', errorMessage(error)),
  })
}
