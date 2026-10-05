import { z } from 'zod'

export const reviewSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, 'Reytinq seç')
    .max(5, 'Maksimum 5 ulduz'),
  comment: z
    .string()
    .min(10, 'Ən azı 10 simvol yaz')
    .max(1000, 'Rəy çox uzundur'),
})
export type ReviewFormValues = z.infer<typeof reviewSchema>

export const rejectReasonSchema = z.object({
  reason: z
    .string()
    .min(10, 'Səbəbi ən azı 10 simvolla izah et — istifadəçi bunu görəcək')
    .max(500, 'Səbəb çox uzundur'),
})
export type RejectReasonFormValues = z.infer<typeof rejectReasonSchema>

export const ownerRequestSchema = z.object({
  message: z
    .string()
    .min(30, 'Stadionun və biznesin haqqında ən azı 30 simvol yaz')
    .max(1000, 'Mətn çox uzundur'),
})
export type OwnerRequestFormValues = z.infer<typeof ownerRequestSchema>

export const inviteWorkerSchema = z.object({
  workerEmail: z
    .string()
    .min(1, 'E-poçt tələb olunur')
    .email('E-poçt ünvanı düzgün deyil'),
})
export type InviteWorkerFormValues = z.infer<typeof inviteWorkerSchema>
