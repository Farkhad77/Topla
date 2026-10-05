/**
 * Backend enum: Pending=0, Confirmed=1, Cancelled=2, Completed=3.
 * Pending yalnız köhnə sətirlərdə qalıb — owner təsdiqi funksiyası silinib,
 * yeni bookinqlər dərhal Confirmed yaranır və vaxtı bitəndə background job
 * onları Completed edir.
 */
export const BookingStatus = {
  Pending: 0,
  Confirmed: 1,
  Cancelled: 2,
  Completed: 3,
} as const
export type BookingStatusValue = (typeof BookingStatus)[keyof typeof BookingStatus]

/**
 * UI status modeli. `completed` artıq real backend statusudur;
 * `rejected` frontend-də törədilir (bax: utils/booking.ts → resolveBookingState).
 */
export type BookingUiStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rejected'

export interface BookingSlot {
  startTime: string
  endTime: string
  isAvailable: boolean
}

export interface BookingCreatePayload {
  stadiumId: string
  startDateTime: string
  durationMinutes: number
}

export interface BookingPreviewPayload {
  stadiumId: string
  startDateTime: string
  durationMinutes: number
}

export interface BookingPreview {
  stadiumId: string
  stadiumName: string
  startDateTime: string
  endDateTime: string
  durationMinutes: number
  pricePerHour: number
  totalPrice: number
  isAvailable: boolean
}

/** `GET /api/Booking/my-bookings` */
export interface MyBooking {
  id: string
  stadiumId: string
  stadiumName: string
  startDateTime: string
  endDateTime: string
  totalPrice: number
  status: BookingStatusValue
}

/** `GET /api/Booking/{id}` və admin siyahısı */
export interface BookingDetail extends MyBooking {
  userId: string
}

/** `GET /api/Stadiums/my-stadiums-bookings` */
export interface OwnerBooking {
  bookingId: string
  stadiumId: string
  stadiumName: string
  customerId: string
  customerName: string
  startDateTime: string
  endDateTime: string
  totalPrice: number
  status: BookingStatusValue
}

export interface OwnerBookingFilters {
  status: BookingStatusValue | null
  stadiumId: string | null
  fromDate: string | null
  toDate: string | null
  pageNumber: number
  pageSize: number
}
