import { http, endpoints, unwrap } from '@/api'
import type { Worker, WorkerBusiness } from '@/types'

export const workerService = {
  async mine(): Promise<Worker[]> {
    const data = await http.get<unknown>(endpoints.workers.mine)
    return unwrap<Worker[]>(data) ?? []
  },

  async assign(workerEmail: string): Promise<void> {
    await http.post<unknown>(endpoints.workers.assign, { workerEmail })
  },

  async remove(workerUserId: string): Promise<void> {
    await http.delete<unknown>(endpoints.workers.remove(workerUserId))
  },

  /** Worker rolu üçün: aid olduğu biznes və stadionlar. */
  async myBusiness(): Promise<WorkerBusiness | null> {
    const data = await http.get<unknown>(endpoints.workers.myBusiness)
    return unwrap<WorkerBusiness | null>(data) ?? null
  },
}
