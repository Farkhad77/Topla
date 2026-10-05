import { analyticsService } from './analyticsService'
import { FEATURES } from '@/utils/constants'
import type { PagedResult, StadiumListItem, UserSummary } from '@/types'
import { emptyPage } from '@/types'

/**
 * ADMIN QATI — API BOŞLUQLARI
 * ----------------------------------------------------------------------
 * Backend-də `IUserService.GetAllAsync` və pending stadion siyahısı MÖVCUDDUR,
 * amma heç bir controller onları açmır. Ona görə burada tipli interfeys saxlanılır
 * və endpoint gələnə qədər boş nəticə qaytarılır (uydurma data DEYİL).
 *
 * Endpoint əlavə olunanda: FEATURES.adminUserList = true et və aşağıdakı
 * `http.get(...)` sətrini şərhdən çıxar — komponentlərdə heç nə dəyişmir.
 */
export interface AdminUserQuery {
  pageNumber: number
  pageSize: number
  search?: string
}

export const adminService = {
  async users(query: AdminUserQuery): Promise<PagedResult<UserSummary>> {
    if (!FEATURES.adminUserList) return emptyPage<UserSummary>(query.pageSize)
    // TODO(backend): `GET /api/Users?pageNumber=&pageSize=` açılanda:
    // const data = await http.get<unknown>('/api/Users', { params: query })
    // return unwrapPage<UserSummary>(data, query.pageSize)
    return emptyPage<UserSummary>(query.pageSize)
  },

  async pendingStadiums(): Promise<StadiumListItem[]> {
    if (!FEATURES.adminStadiumQueue) return []
    // TODO(backend): `GET /api/Moderators/stadiums?status=Pending` açılmalıdır.
    return []
  },

  /**
   * Platforma statistikası — artıq real `GET /api/Analytics/platform`
   * endpoint-indən gəlir. Köhnə sahə adları saxlanılıb ki, mövcud səhifələr
   * dəyişmədən işləsin; tam analitika `analytics` sahəsindədir.
   */
  async platformStats() {
    const analytics = await analyticsService.platform()

    return {
      pendingOwnerRequests: analytics.kpis.pendingOwnerRequests,
      totalBookings: analytics.kpis.totalBookings,
      publishedStadiums: analytics.kpis.publishedStadiums,
      analytics,
    }
  },
}
