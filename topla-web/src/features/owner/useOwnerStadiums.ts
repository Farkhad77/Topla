import { useMemo } from 'react'
import { useMyStadiums } from '@/hooks/queries/useStadiumQueries'
import { useOwnerBookings } from '@/hooks/queries/useBookingQueries'
import type { OwnerBooking, OwnerBookingFilters, OwnerStadium } from '@/types'

/**
 * Owner panelinin bütün səhifələri eyni sorğu açarını paylaşsın deyə filtrlər
 * modul səviyyəsində sabitdir — react-query eyni cavabı təkrar yükləmir.
 */
export const OWNER_BOOKINGS_SAMPLE: OwnerBookingFilters = {
  status: null,
  stadiumId: null,
  fromDate: null,
  toDate: null,
  pageNumber: 1,
  pageSize: 100,
}

export interface OwnerStadiumEntry {
  stadium: OwnerStadium
  /**
   * Backend `StadiumViewDetailDto`-ya `Id` əlavə olunandan sonra id birbaşa gəlir.
   * Köhnə cavab formatı ilə işləyən mühitlər üçün ad→id bərpası ehtiyat yol kimi qalır;
   * heç bir halda uydurma id yaradılmır.
   */
  id: string | null
  /** id olmadığı üçün React açarı ad + ünvandan qurulur. */
  key: string
}

export function stadiumKeyOf(stadium: OwnerStadium): string {
  return `${stadium.name}__${stadium.address}`
}

function recoverIdsByName(bookings: OwnerBooking[]): Map<string, string> {
  const map = new Map<string, string>()
  for (const booking of bookings) {
    if (booking.stadiumName && booking.stadiumId) map.set(booking.stadiumName, booking.stadiumId)
  }
  return map
}

export function useOwnerStadiums() {
  const stadiumsQuery = useMyStadiums()
  const bookingsQuery = useOwnerBookings(OWNER_BOOKINGS_SAMPLE)

  const entries = useMemo<OwnerStadiumEntry[]>(() => {
    const stadiums = stadiumsQuery.data ?? []
    const recovered = recoverIdsByName(bookingsQuery.data?.items ?? [])

    return stadiums.map((stadium) => {
      // Tip `id`-ni tələb edir, backend isə həmişə göndərmir — ona görə yoxlanılır.
      const declared = stadium.id as string | undefined
      return {
        stadium,
        id: declared ?? recovered.get(stadium.name) ?? null,
        key: stadiumKeyOf(stadium),
      }
    })
  }, [stadiumsQuery.data, bookingsQuery.data])

  const options = useMemo(
    () =>
      entries
        .filter((entry): entry is OwnerStadiumEntry & { id: string } => Boolean(entry.id))
        .map((entry) => ({ value: entry.id, label: entry.stadium.name })),
    [entries],
  )

  const missingIdCount = entries.filter((entry) => !entry.id).length

  return {
    entries,
    options,
    missingIdCount,
    isLoading: stadiumsQuery.isLoading,
    isError: stadiumsQuery.isError,
    error: stadiumsQuery.error,
    refetch: () => {
      void stadiumsQuery.refetch()
    },
  }
}
