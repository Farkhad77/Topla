import { useQuery } from '@tanstack/react-query'
import { imageService, reviewService } from '@/services'
import { queryKeys } from '@/hooks/queryKeys'

/**
 * Siyahı endpoint-i şəkil və reytinq qaytarmır (backend ViewStadiumDto-da yoxdur).
 * Ona görə bu məlumat yalnız kart ekrana yaxınlaşanda, uzun keş müddəti ilə yüklənir —
 * səhifə açılanda 12 əlavə sorğu getmir.
 */
export function useStadiumCardData(stadiumId: string, enabled: boolean) {
  const images = useQuery({
    queryKey: queryKeys.stadiums.images(stadiumId),
    queryFn: () => imageService.byStadium(stadiumId),
    enabled,
    staleTime: 10 * 60_000,
    retry: false,
  })

  const reviews = useQuery({
    queryKey: queryKeys.reviews.byStadium(stadiumId),
    queryFn: () => reviewService.byStadium(stadiumId),
    enabled,
    staleTime: 10 * 60_000,
    retry: false,
  })

  const list = reviews.data ?? []
  const average = list.length
    ? list.reduce((sum, review) => sum + review.rating, 0) / list.length
    : null

  const mainImage =
    images.data?.find((image) => image.isMain)?.imageUrl ?? images.data?.[0]?.imageUrl ?? null

  return {
    mainImage,
    imageCount: images.data?.length ?? 0,
    averageRating: average,
    reviewCount: list.length,
    isLoading: images.isLoading || reviews.isLoading,
  }
}
