/**
 * Arenio backend-in vahid cavab zərfləri.
 * BaseResponse<T> — bütün servis metodları; PagedResult<T> — səhifələnmiş siyahılar.
 * Diqqət: bəzi endpoint-lər (Stadiums/View, Booking GetAll) BaseResponse-suz,
 * birbaşa PagedResult qaytarır — `unwrap.ts` hər iki formanı normalize edir.
 */
export interface BaseResponse<T> {
  success: boolean
  message: string | null
  data: T
  statusCode: number
}

export interface PagedResult<T> {
  items: T[]
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export interface PaginationRequest {
  pageNumber: number
  pageSize: number
}

export const DEFAULT_PAGE_SIZE = 12

export function emptyPage<T>(pageSize = DEFAULT_PAGE_SIZE): PagedResult<T> {
  return { items: [], pageNumber: 1, pageSize, totalCount: 0, totalPages: 0 }
}

/** UI-a çatan normalize olunmuş xəta. Backend exception mətni heç vaxt göstərilmir. */
export interface ApiErrorShape {
  status: number
  message: string
  kind:
    | 'network'
    | 'timeout'
    | 'validation'
    | 'unauthorized'
    | 'forbidden'
    | 'notfound'
    | 'conflict'
    | 'ratelimit'
    | 'server'
    | 'unknown'
  fieldErrors?: Record<string, string>
}
