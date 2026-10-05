import { http, endpoints, unwrap } from '@/api'
import type { OwnerRequest } from '@/types'

export const ownerRequestService = {
  async create(message: string): Promise<void> {
    await http.post<unknown>(endpoints.ownerRequests.create, { message })
  },

  /** Sorğu yoxdursa backend 404 qaytarır — çağıran tərəf `null`-a çevirir. */
  async mine(): Promise<OwnerRequest | null> {
    const data = await http.get<unknown>(endpoints.ownerRequests.mine)
    return unwrap<OwnerRequest | null>(data) ?? null
  },
}
