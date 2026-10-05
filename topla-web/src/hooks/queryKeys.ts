import type { OwnerBookingFilters } from '@/types'

/** Bütün query açarları tək yerdə — invalidate zamanı səhv açar riskini aradan qaldırır. */
export const queryKeys = {
  stadiums: {
    all: ['stadiums'] as const,
    list: (page: number, pageSize: number) => ['stadiums', 'list', page, pageSize] as const,
    detail: (id: string) => ['stadiums', 'detail', id] as const,
    mine: ['stadiums', 'mine'] as const,
    images: (id: string) => ['stadiums', 'images', id] as const,
    blockedSlots: (id: string) => ['stadiums', 'blocked-slots', id] as const,
    search: (query: string) => ['stadiums', 'search', query] as const,
  },
  bookings: {
    all: ['bookings'] as const,
    mine: ['bookings', 'mine'] as const,
    detail: (id: string) => ['bookings', 'detail', id] as const,
    slots: (stadiumId: string, date: string) => ['bookings', 'slots', stadiumId, date] as const,
    owner: (filters: OwnerBookingFilters) => ['bookings', 'owner', filters] as const,
    ownerAll: ['bookings', 'owner'] as const,
    admin: (page: number, pageSize: number) => ['bookings', 'admin', page, pageSize] as const,
  },
  reviews: {
    byStadium: (stadiumId: string) => ['reviews', 'stadium', stadiumId] as const,
    byUser: (userId: string) => ['reviews', 'user', userId] as const,
  },
  owner: {
    request: ['owner', 'request'] as const,
    workers: ['owner', 'workers'] as const,
    business: ['owner', 'business'] as const,
    analytics: ['owner', 'analytics'] as const,
  },
  admin: {
    ownerRequests: (page: number, pageSize: number) =>
      ['admin', 'owner-requests', page, pageSize] as const,
    ownerRequestsAll: ['admin', 'owner-requests'] as const,
    pendingStadiums: ['admin', 'pending-stadiums'] as const,
    stats: ['admin', 'stats'] as const,
    users: (page: number, pageSize: number, search: string) =>
      ['admin', 'users', page, pageSize, search] as const,
  },
} as const
