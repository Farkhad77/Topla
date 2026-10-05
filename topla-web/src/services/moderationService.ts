import { http, endpoints, unwrap, unwrapPage } from '@/api'
import type { OwnerRequest, PagedResult } from '@/types'

export const moderationService = {
  async ownerRequests(pageNumber = 1, pageSize = 10): Promise<PagedResult<OwnerRequest>> {
    const data = await http.get<unknown>(endpoints.moderation.ownerRequests, {
      params: { pageNumber, pageSize },
    })
    return unwrapPage<OwnerRequest>(data, pageSize)
  },

  async ownerRequestById(id: string): Promise<OwnerRequest> {
    const data = await http.get<unknown>(endpoints.moderation.ownerRequestById(id))
    return unwrap<OwnerRequest>(data)
  },

  async approveOwnerRequest(id: string): Promise<void> {
    await http.post<unknown>(endpoints.moderation.approveOwnerRequest(id), {})
  },

  async rejectOwnerRequest(id: string, reason: string): Promise<void> {
    await http.post<unknown>(endpoints.moderation.rejectOwnerRequest(id), { reason })
  },

  async blockUser(userId: string, reason: string): Promise<void> {
    await http.put<unknown>(endpoints.moderation.blockUser(userId), { reason })
  },

  async unblockUser(userId: string): Promise<void> {
    await http.put<unknown>(endpoints.moderation.unblockUser(userId), {})
  },

  /** Yalnız Admin: e-poçta görə istifadəçiyə Moderator rolu verir. */
  async assignModerator(email: string): Promise<void> {
    await http.post<unknown>(endpoints.moderation.assignModerator, { email })
  },
}
