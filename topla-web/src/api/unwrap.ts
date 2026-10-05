import type { BaseResponse, PagedResult } from '@/types'

function isBaseResponse<T>(value: unknown): value is BaseResponse<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    'statusCode' in value &&
    'data' in value
  )
}

function isPagedResult<T>(value: unknown): value is PagedResult<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    Array.isArray((value as PagedResult<T>).items) &&
    typeof (value as PagedResult<T>).totalCount === 'number'
  )
}

/**
 * Bəzi endpoint-lər `BaseResponse<T>`, bəziləri birbaşa `T` qaytarır.
 * Servis qatı həmişə xam `T` ilə işləsin deyə burada normalize edirik.
 */
export function unwrap<T>(payload: unknown): T {
  if (isBaseResponse<T>(payload)) return payload.data
  return payload as T
}

/** Səhifələnmiş cavabı hər iki formadan çıxarır. */
export function unwrapPage<T>(payload: unknown, fallbackPageSize: number): PagedResult<T> {
  const value = isBaseResponse<PagedResult<T>>(payload) ? payload.data : payload

  if (isPagedResult<T>(value)) return value
  if (Array.isArray(value)) {
    return {
      items: value as T[],
      pageNumber: 1,
      pageSize: value.length || fallbackPageSize,
      totalCount: value.length,
      totalPages: 1,
    }
  }
  return { items: [], pageNumber: 1, pageSize: fallbackPageSize, totalCount: 0, totalPages: 0 }
}
