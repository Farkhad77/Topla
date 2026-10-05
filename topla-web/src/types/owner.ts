/** Backend enum: 0 Pending, 1 Approved, 2 Rejected */
export const ApprovalStatus = {
  Pending: 0,
  Approved: 1,
  Rejected: 2,
} as const
export type ApprovalStatusValue = (typeof ApprovalStatus)[keyof typeof ApprovalStatus]

export interface OwnerRequest {
  id: string
  userId: string
  fullName: string
  email: string
  message: string | null
  status: ApprovalStatusValue
  createdAt: string
  rejectReason: string | null
}

export interface BlockedSlot {
  id: string
  stadiumId: string
  startTime: string
  endTime: string
  reason: string | null
}

export interface BlockedSlotCreatePayload {
  startTime: string
  endTime: string
  reason?: string
}

export interface Worker {
  userId: string
  fullName: string
  email: string
  isActive: boolean
  createdAt: string
}

export interface WorkerBusiness {
  ownerProfileId: string
  stadiums: { id: string; name: string; city: string }[]
}

/** `GET /api/Analytics/owner` — backend OwnerKpisDto. */
export interface OwnerKpis {
  totalBookings: number
  todayBookings: number
  upcomingBookings: number
  completedBookings: number
  cancelledBookings: number
  revenueTotal: number
  revenueThisMonth: number
  occupancyRate: number
  averageRating: number
  totalReviews: number
}

export interface TimeSeriesPoint {
  label: string
  value: number
}

/** `GET /api/Analytics/owner` — backend OwnerAnalyticsDto. */
export interface OwnerAnalytics {
  kpis: OwnerKpis
  revenueByMonth: TimeSeriesPoint[]
  bookingsByMonth: TimeSeriesPoint[]
  bookingsByWeekday: TimeSeriesPoint[]
  peakHours: TimeSeriesPoint[]
  revenueByStadium: TimeSeriesPoint[]
}

/** `GET /api/Analytics/platform` — backend PlatformKpisDto (Admin/Moderator). */
export interface PlatformKpis {
  totalUsers: number
  totalOwners: number
  publishedStadiums: number
  pendingStadiums: number
  pendingOwnerRequests: number
  totalBookings: number
  confirmedBookings: number
  completedBookings: number
  cancelledBookings: number
  revenueTotal: number
}

/** `GET /api/Analytics/platform` — backend PlatformAnalyticsDto. */
export interface PlatformAnalytics {
  kpis: PlatformKpis
  bookingsByMonth: TimeSeriesPoint[]
  revenueByMonth: TimeSeriesPoint[]
  bookingsByStatus: TimeSeriesPoint[]
}
