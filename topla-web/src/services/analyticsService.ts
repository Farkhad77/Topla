import { http, endpoints, unwrap } from '@/api'
import type { OwnerAnalytics, PlatformAnalytics } from '@/types'

/**
 * Analitika artıq BACKEND-də hesablanır (`AnalyticsController`):
 *  - bütün ay/gün/saat qruplaması Bakı təqviminə görədir;
 *  - ləğv edilmiş bronlar gəlirə daxil edilmir;
 *  - fromDate/toDate Bakı təqvim günləridir ("YYYY-MM-DD"), boşdursa son 6 ay.
 * Köhnə client-side `buildOwnerAnalytics` hesablaması bu API ilə əvəzlənib.
 */
export interface AnalyticsPeriod {
  fromDate?: string | null
  toDate?: string | null
}

export const analyticsService = {
  async owner(period?: AnalyticsPeriod): Promise<OwnerAnalytics> {
    const data = await http.get<unknown>(endpoints.analytics.owner, {
      params: {
        fromDate: period?.fromDate ?? undefined,
        toDate: period?.toDate ?? undefined,
      },
    })
    return unwrap<OwnerAnalytics>(data)
  },

  async platform(period?: AnalyticsPeriod): Promise<PlatformAnalytics> {
    const data = await http.get<unknown>(endpoints.analytics.platform, {
      params: {
        fromDate: period?.fromDate ?? undefined,
        toDate: period?.toDate ?? undefined,
      },
    })
    return unwrap<PlatformAnalytics>(data)
  },
}
