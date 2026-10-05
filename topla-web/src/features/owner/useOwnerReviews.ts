import { useQueries } from '@tanstack/react-query'
import { reviewService } from '@/services'
import { queryKeys } from '@/hooks/queryKeys'
import type { Review } from '@/types'

export interface OwnerReviewsResult {
  reviews: Review[]
  averageRating: number
  totalReviews: number
  isLoading: boolean
  isError: boolean
}

/**
 * Backend-də "sahibkarın bütün rəyləri" endpoint-i yoxdur — rəylər yalnız
 * stadion-stadion oxunur. Ona görə hər stadion üçün ayrıca sorğu gedir və
 * nəticə burada birləşdirilir (`combine` sayəsində memoizə olunur).
 */
export function useOwnerReviews(stadiumIds: string[]): OwnerReviewsResult {
  return useQueries({
    queries: stadiumIds.map((stadiumId) => ({
      queryKey: queryKeys.reviews.byStadium(stadiumId),
      queryFn: () => reviewService.byStadium(stadiumId),
      staleTime: 5 * 60_000,
      retry: false,
    })),
    combine: (results) => {
      const reviews = results.flatMap((result) => result.data ?? [])
      const totalReviews = reviews.length
      const averageRating = totalReviews
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0

      return {
        reviews,
        averageRating,
        totalReviews,
        isLoading: results.some((result) => result.isLoading),
        isError: results.length > 0 && results.every((result) => result.isError),
      }
    },
  })
}
