import { http, endpoints, unwrap } from '@/api'
import type { StadiumImage, StadiumImagesResponse } from '@/types'

export const imageService = {
  async byStadium(stadiumId: string): Promise<StadiumImage[]> {
    const data = await http.get<unknown>(endpoints.images.byStadium(stadiumId))
    const response = unwrap<StadiumImagesResponse | StadiumImage[]>(data)
    if (Array.isArray(response)) return response
    return response?.images ?? []
  },

  async upload(stadiumId: string, files: File[]): Promise<StadiumImage[]> {
    const form = new FormData()
    files.forEach((file) => form.append('files', file))
    const data = await http.post<unknown>(endpoints.images.upload(stadiumId), form)
    const response = unwrap<StadiumImagesResponse | StadiumImage[]>(data)
    if (Array.isArray(response)) return response
    return response?.images ?? []
  },

  async remove(imageId: string): Promise<void> {
    await http.delete<unknown>(endpoints.images.remove(imageId))
  },

  async setMain(imageId: string): Promise<void> {
    await http.put<unknown>(endpoints.images.setMain(imageId), {})
  },

  async reorder(stadiumId: string, images: { imageId: string; order: number }[]): Promise<void> {
    await http.put<unknown>(endpoints.images.reorder, { stadiumId, images })
  },
}
