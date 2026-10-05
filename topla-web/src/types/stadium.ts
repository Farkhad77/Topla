/** Backend enum: 0 Pending, 1 Verified, 2 Rejected */
export const StadiumVerificationStatus = {
  Pending: 0,
  Verified: 1,
  Rejected: 2,
} as const
export type StadiumVerificationStatusValue =
  (typeof StadiumVerificationStatus)[keyof typeof StadiumVerificationStatus]

/** `GET /api/Stadiums/View` — siyahı elementi (backend: ViewStadiumDto) */
export interface StadiumListItem {
  id: string
  name: string
  city: string
  address: string
  pricePerHour: number
  size: string
}

/** `GET /api/Stadiums/{id}` — backend StadiumGetByIdDto (id sahəsi yoxdur, route-dan gəlir) */
export interface StadiumDetail {
  id: string
  stadiumOwnerProfileId: string
  name: string
  description: string
  city: string
  address: string
  latitude: number
  longitude: number
  pricePerHour: number
  size: string
  surfaceType: string
  /** "HH:mm:ss" formatında TimeOnly */
  openTime: string
  closeTime: string
  minBookingMinutes: number
  maxBookingMinutes: number
}

/**
 * `GET /api/Stadiums/view-detail/{id}` — publik detal (backend: StadiumViewDetailDto).
 * Anonim istifadəçiyə də açıqdır və Redis-də cache-lənir.
 * Boş saatlar bu cavabda YOXDUR — availability real-time endpoint-dən gəlir.
 */
export interface StadiumViewDetail {
  id: string
  name: string
  description: string
  city: string
  address: string
  latitude: number
  longitude: number
  pricePerHour: number
  size: string
  surfaceType: string
  /** "HH:mm:ss" formatında TimeOnly */
  openTime: string
  closeTime: string
  minBookingMinutes: number
  maxBookingMinutes: number
  isActive: boolean
  verificationStatus: StadiumVerificationStatusValue
  averageRating: number
  totalReviews: number
  /** Əsas şəkilin nisbi URL-i ("Storage/Stadiums/xxx.webp") və ya null. */
  mainImageUrl: string | null
}

/** Owner-in öz stadionları eyni DTO ilə gəlir (`GET /api/Stadiums/my`). */
export type OwnerStadium = StadiumViewDetail

/**
 * `GET /api/Stadiums/pending` — moderator/admin üçün təsdiq gözləyən stadionlar
 * (backend: StadiumPendingDto). Qeyd: backend hazırda `createdAt` və `ownerId`
 * sahələrini doldurmur — onlara arxalanma.
 */
export interface PendingStadium {
  id: string
  name: string
  description: string | null
  city: string
  address: string
  pricePerHour: number
  surfaceType: string
  /** "HH:mm:ss" formatında TimeOnly */
  openTime: string
  closeTime: string
  verificationStatus: StadiumVerificationStatusValue
  createdAt?: string
  ownerId?: string | null
}

export interface StadiumImage {
  id: string
  imageUrl: string
  isMain: boolean
  order: number
}

export interface StadiumImagesResponse {
  stadiumId: string
  images: StadiumImage[]
}

export interface StadiumWritePayload {
  name: string
  description: string
  city: string
  address: string
  latitude: number
  longitude: number
  pricePerHour: number
  size: string
  surfaceType: string
  openTime: string
  closeTime: string
  minBookingMinutes: number
  maxBookingMinutes: number
}

export interface StadiumUpdatePayload extends StadiumWritePayload {
  stadiumId: string
}

/** Elasticsearch sənədi — `GET /api/Search/search?q=` */
export interface StadiumSearchDocument {
  id: string
  name: string
  city: string
  pricePerHour: number
  description: string
}

/** Yalnız frontend-də mövcud olan filtr modeli (backend hələ dəstəkləmir). */
export interface StadiumFilters {
  q: string
  city: string | 'all'
  size: string | 'all'
  surface: string | 'all'
  minPrice: number
  maxPrice: number
  sort: StadiumSort
}

export const STADIUM_SORTS = ['popular', 'price-asc', 'price-desc', 'name', 'newest'] as const
export type StadiumSort = (typeof STADIUM_SORTS)[number]
