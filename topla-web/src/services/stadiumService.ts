import { http, endpoints, unwrap, unwrapPage } from '@/api'
import { DEFAULT_PAGE_SIZE } from '@/types'
import type {
  BlockedSlot,
  BlockedSlotCreatePayload,
  OwnerBooking,
  OwnerBookingFilters,
  OwnerStadium,
  PagedResult,
  PendingStadium,
  StadiumDetail,
  StadiumListItem,
  StadiumSearchDocument,
  StadiumUpdatePayload,
  StadiumViewDetail,
  StadiumWritePayload,
} from '@/types'

export const stadiumService = {
  /** Public siyahı — yalnız aktiv + təsdiqlənmiş stadionlar. */
  async list(pageNumber = 1, pageSize = DEFAULT_PAGE_SIZE): Promise<PagedResult<StadiumListItem>> {
    const data = await http.get<unknown>(endpoints.stadiums.view, {
      params: { PageNumber: pageNumber, PageSize: pageSize },
    })
    return unwrapPage<StadiumListItem>(data, pageSize)
  },

  /**
   * Publik detal — anonim istifadəçi üçün də açıqdır, backend-də Redis cache-lidir.
   * Yalnız aktiv + təsdiqlənmiş stadionlar qaytarılır (əks halda 404).
   */
  async viewDetail(stadiumId: string): Promise<StadiumViewDetail> {
    const data = await http.get<unknown>(endpoints.stadiums.viewDetail(stadiumId))
    return unwrap<StadiumViewDetail>(data)
  },

  /**
   * Səlahiyyətli detal (`Stadium.GetById`). Owner panelində istifadə olunur,
   * çünki hələ təsdiqlənməmiş/deaktiv stadionu da qaytarır.
   */
  async detail(stadiumId: string): Promise<StadiumDetail> {
    const data = await http.get<unknown>(endpoints.stadiums.byId(stadiumId))
    const detail = unwrap<Omit<StadiumDetail, 'id'>>(data)
    return { ...detail, id: stadiumId }
  },

  async mine(): Promise<OwnerStadium[]> {
    const data = await http.get<unknown>(endpoints.stadiums.mine)
    return unwrap<OwnerStadium[]>(data) ?? []
  },

  async byUser(userId: string): Promise<OwnerStadium[]> {
    const data = await http.get<unknown>(endpoints.stadiums.byUser(userId))
    return unwrap<OwnerStadium[]>(data) ?? []
  },

  async create(payload: StadiumWritePayload): Promise<string | null> {
    const data = await http.post<unknown>(endpoints.stadiums.create, payload)
    return unwrap<string | null>(data)
  },

  async update(payload: StadiumUpdatePayload): Promise<string | null> {
    const data = await http.put<unknown>(endpoints.stadiums.update, payload)
    return unwrap<string | null>(data)
  },

  async remove(stadiumId: string): Promise<void> {
    await http.delete<unknown>(endpoints.stadiums.remove, { data: { stadiumId } })
  },

  async activate(stadiumId: string): Promise<void> {
    await http.patch<unknown>(endpoints.stadiums.activate, { stadiumId })
  },

  async deactivate(stadiumId: string): Promise<void> {
    await http.patch<unknown>(endpoints.stadiums.deactivate, { stadiumId })
  },

  /** Moderator/Admin: stadionu təsdiqlə və ya rədd et (1 = Verified, 2 = Rejected). */
  async verify(stadiumId: string, verificationStatus: number): Promise<void> {
    await http.patch<unknown>(endpoints.stadiums.verify, { stadiumId, verificationStatus })
  },

  /** Moderator/Admin: təsdiq gözləyən stadionların növbəsi. */
  async pending(): Promise<PendingStadium[]> {
    const data = await http.get<unknown>(endpoints.stadiums.pending)
    return unwrap<PendingStadium[]>(data) ?? []
  },

  async ownerBookings(filters: OwnerBookingFilters): Promise<PagedResult<OwnerBooking>> {
    const data = await http.get<unknown>(endpoints.stadiums.myBookings, {
      params: {
        Status: filters.status ?? undefined,
        StadiumId: filters.stadiumId ?? undefined,
        FromDate: filters.fromDate ?? undefined,
        ToDate: filters.toDate ?? undefined,
        PageNumber: filters.pageNumber,
        PageSize: filters.pageSize,
      },
    })
    return unwrapPage<OwnerBooking>(data, filters.pageSize)
  },

  async blockedSlots(stadiumId: string): Promise<BlockedSlot[]> {
    const data = await http.get<unknown>(endpoints.stadiums.blockedSlots(stadiumId))
    return unwrap<BlockedSlot[]>(data) ?? []
  },

  async blockSlot(stadiumId: string, payload: BlockedSlotCreatePayload): Promise<BlockedSlot> {
    const data = await http.post<unknown>(endpoints.stadiums.blockedSlots(stadiumId), payload)
    return unwrap<BlockedSlot>(data)
  },

  async unblockSlot(blockedSlotId: string): Promise<void> {
    await http.delete<unknown>(endpoints.stadiums.unblock(blockedSlotId))
  },

  /** Axtarış (backend-də PostgreSQL üzərində) — ad/şəhər/təsvir üzrə. */
  async search(query: string): Promise<StadiumSearchDocument[]> {
    if (!query.trim()) return []
    const data = await http.get<unknown>(endpoints.search, { params: { q: query } })
    return unwrap<StadiumSearchDocument[]>(data) ?? []
  },
}
