import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { stadiumService, imageService } from '@/services'
import { queryKeys } from '@/hooks/queryKeys'
import { toast } from '@/hooks/useToast'
import { errorMessage } from '@/api'
import { DEFAULT_PAGE_SIZE } from '@/types'
import type { StadiumUpdatePayload, StadiumWritePayload } from '@/types'

export function useStadiumList(page: number, pageSize: number = DEFAULT_PAGE_SIZE) {
  return useQuery({
    queryKey: queryKeys.stadiums.list(page, pageSize),
    queryFn: () => stadiumService.list(page, pageSize),
    staleTime: 60_000,
  })
}

/** Böyük kataloq üçün: bütün səhifələri yığıb client-side filtr etməyə imkan verir. */
export function useAllStadiums(enabled = true) {
  return useQuery({
    queryKey: [...queryKeys.stadiums.all, 'catalog'],
    queryFn: async () => {
      const first = await stadiumService.list(1, 100)
      if (first.totalPages <= 1) return first.items

      const rest = await Promise.all(
        Array.from({ length: first.totalPages - 1 }, (_, index) =>
          stadiumService.list(index + 2, 100),
        ),
      )
      return [...first.items, ...rest.flatMap((page) => page.items)]
    },
    staleTime: 120_000,
    enabled,
  })
}

/** Publik səhifələr üçün: icazə tələb etmir, backend-də cache-lidir. */
export function useStadiumViewDetail(stadiumId: string | undefined) {
  return useQuery({
    queryKey: [...queryKeys.stadiums.detail(stadiumId ?? ''), 'public'],
    queryFn: () => stadiumService.viewDetail(stadiumId as string),
    enabled: !!stadiumId,
    staleTime: 5 * 60_000,
    retry: (failureCount, error) => {
      const status = (error as { status?: number }).status
      if (status === 404) return false
      return failureCount < 2
    },
  })
}

/** Owner paneli üçün: təsdiqlənməmiş/deaktiv stadionu da qaytarır (icazə tələb edir). */
export function useStadiumDetail(stadiumId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.stadiums.detail(stadiumId ?? ''),
    queryFn: () => stadiumService.detail(stadiumId as string),
    enabled: !!stadiumId,
    staleTime: 60_000,
    retry: (failureCount, error) => {
      // 401/403 → icazə problemidir, təkrar cəhdin mənası yoxdur.
      const status = (error as { status?: number }).status
      if (status === 401 || status === 403 || status === 404) return false
      return failureCount < 2
    },
  })
}

export function useMyStadiums() {
  return useQuery({
    queryKey: queryKeys.stadiums.mine,
    queryFn: () => stadiumService.mine(),
    staleTime: 30_000,
  })
}

export function useStadiumImages(stadiumId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.stadiums.images(stadiumId ?? ''),
    queryFn: () => imageService.byStadium(stadiumId as string),
    enabled: !!stadiumId,
    staleTime: 120_000,
  })
}

export function useStadiumSearch(query: string) {
  return useQuery({
    queryKey: queryKeys.stadiums.search(query),
    queryFn: () => stadiumService.search(query),
    enabled: query.trim().length >= 2,
    staleTime: 30_000,
  })
}

export function useCreateStadium() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: StadiumWritePayload) => stadiumService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stadiums.all })
      toast.success('Stadion yaradıldı', 'Moderator təsdiqindən sonra siyahıda görünəcək.')
    },
    onError: (error) => toast.error('Stadion yaradılmadı', errorMessage(error)),
  })
}

export function useUpdateStadium() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: StadiumUpdatePayload) => stadiumService.update(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stadiums.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.stadiums.detail(variables.stadiumId) })
      toast.success('Dəyişikliklər yadda saxlanıldı')
    },
    onError: (error) => toast.error('Yadda saxlanmadı', errorMessage(error)),
  })
}

export function useToggleStadiumActive() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ stadiumId, active }: { stadiumId: string; active: boolean }) =>
      active ? stadiumService.activate(stadiumId) : stadiumService.deactivate(stadiumId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stadiums.all })
      toast.success(variables.active ? 'Stadion aktivləşdirildi' : 'Stadion deaktiv edildi')
    },
    onError: (error) => toast.error('Status dəyişmədi', errorMessage(error)),
  })
}

export function useDeleteStadium() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (stadiumId: string) => stadiumService.remove(stadiumId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stadiums.all })
      toast.success('Stadion silindi')
    },
    onError: (error) => toast.error('Silinmədi', errorMessage(error)),
  })
}

export function useUploadStadiumImages(stadiumId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (files: File[]) => imageService.upload(stadiumId, files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stadiums.images(stadiumId) })
      toast.success('Şəkillər yükləndi')
    },
    onError: (error) => toast.error('Şəkil yüklənmədi', errorMessage(error)),
  })
}

export function useDeleteStadiumImage(stadiumId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (imageId: string) => imageService.remove(imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stadiums.images(stadiumId) })
      toast.success('Şəkil silindi')
    },
    onError: (error) => toast.error('Şəkil silinmədi', errorMessage(error)),
  })
}

export function useSetMainStadiumImage(stadiumId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (imageId: string) => imageService.setMain(imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stadiums.images(stadiumId) })
      toast.success('Əsas şəkil dəyişdirildi')
    },
    onError: (error) => toast.error('Dəyişiklik alınmadı', errorMessage(error)),
  })
}
