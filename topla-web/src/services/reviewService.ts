import { http, endpoints, unwrap } from '@/api'
import type { Review, ReviewCreatePayload, ReviewUpdatePayload } from '@/types'

export const reviewService = {
  async byStadium(stadiumId: string): Promise<Review[]> {
    const data = await http.get<unknown>(endpoints.reviews.byStadium(stadiumId))
    return unwrap<Review[]>(data) ?? []
  },

  async byUser(userId: string): Promise<Review[]> {
    const data = await http.get<unknown>(endpoints.reviews.byUser(userId))
    return unwrap<Review[]>(data) ?? []
  },

  async create(payload: ReviewCreatePayload): Promise<void> {
    await http.post<unknown>(endpoints.reviews.create, payload)
  },

  async update(reviewId: string, payload: ReviewUpdatePayload): Promise<void> {
    await http.put<unknown>(endpoints.reviews.update(reviewId), payload)
  },

  async removeMine(reviewId: string): Promise<void> {
    await http.delete<unknown>(endpoints.reviews.removeMine(reviewId))
  },

  async removeAsAdmin(reviewId: string): Promise<void> {
    await http.delete<unknown>(endpoints.reviews.remove(reviewId))
  },
}
