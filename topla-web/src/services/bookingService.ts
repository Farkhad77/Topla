import { http, endpoints, unwrap, unwrapPage } from '@/api'
import { DEFAULT_PAGE_SIZE } from '@/types'
import type {
  BookingCreatePayload,
  BookingDetail,
  BookingPreview,
  BookingPreviewPayload,
  BookingSlot,
  MyBooking,
  PagedResult,
} from '@/types'

export const bookingService = {
  /** Anonim də çağıra bilər — detal səhifəsindəki slot şəbəkəsi bundan qidalanır. */
  async availableSlots(stadiumId: string, date: string): Promise<BookingSlot[]> {
    const data = await http.get<unknown>(endpoints.bookings.availableSlots, {
      params: { stadiumId, date },
    })
    return unwrap<BookingSlot[]>(data) ?? []
  },

  async preview(payload: BookingPreviewPayload): Promise<BookingPreview> {
    const data = await http.post<unknown>(endpoints.bookings.preview, payload)
    return unwrap<BookingPreview>(data)
  },

  /** Uğurlu olarsa yaradılmış booking-in id-sini qaytarır. */
  async create(payload: BookingCreatePayload): Promise<string> {
    const data = await http.post<unknown>(endpoints.bookings.create, payload)
    return unwrap<string>(data)
  },

  async mine(): Promise<MyBooking[]> {
    const data = await http.get<unknown>(endpoints.bookings.mine)
    return unwrap<MyBooking[]>(data) ?? []
  },

  async byId(id: string): Promise<BookingDetail> {
    const data = await http.get<unknown>(endpoints.bookings.byId(id))
    return unwrap<BookingDetail>(data)
  },

  async cancel(id: string): Promise<void> {
    await http.post<unknown>(endpoints.bookings.cancel(id), {})
  },

  async reject(id: string, rejectReason: string): Promise<void> {
    await http.patch<unknown>(endpoints.bookings.reject(id), { rejectReason })
  },

  async all(pageNumber = 1, pageSize = DEFAULT_PAGE_SIZE): Promise<PagedResult<BookingDetail>> {
    const data = await http.get<unknown>(endpoints.bookings.all, {
      params: { PageNumber: pageNumber, PageSize: pageSize },
    })
    return unwrapPage<BookingDetail>(data, pageSize)
  },

  async remove(id: string): Promise<void> {
    await http.delete<unknown>(endpoints.bookings.remove(id))
  },
}
