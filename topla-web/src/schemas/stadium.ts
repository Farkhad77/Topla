import { z } from 'zod'

const timeString = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Saat HH:mm formatında olmalıdır')

export const stadiumFormSchema = z
  .object({
    name: z.string().min(3, 'Ad ən azı 3 simvol olmalıdır').max(100, 'Ad çox uzundur'),
    description: z
      .string()
      .min(20, 'Ən azı 20 simvolluq təsvir yaz — istifadəçilər bunu oxuyur')
      .max(1500, 'Təsvir çox uzundur'),
    city: z.string().min(2, 'Şəhər tələb olunur'),
    address: z.string().min(5, 'Ünvanı tam yaz'),
    // Koordinatlar UI-da əl ilə yazılmır — xəritədən marker qoyulanda dolur.
    latitude: z.coerce
      .number({ invalid_type_error: 'Xəritədən stadionun yerini seç' })
      .min(-90, 'Enlik -90 ilə 90 arasında olmalıdır')
      .max(90, 'Enlik -90 ilə 90 arasında olmalıdır'),
    longitude: z.coerce
      .number({ invalid_type_error: 'Xəritədən stadionun yerini seç' })
      .min(-180, 'Uzunluq -180 ilə 180 arasında olmalıdır')
      .max(180, 'Uzunluq -180 ilə 180 arasında olmalıdır'),
    pricePerHour: z.coerce
      .number()
      .positive('Qiymət sıfırdan böyük olmalıdır')
      .max(10_000, 'Qiymət çox yüksəkdir'),
    size: z.string().min(2, 'Ölçü tələb olunur'),
    surfaceType: z.string().min(2, 'Örtük növü tələb olunur'),
    openTime: timeString,
    closeTime: timeString,
    minBookingMinutes: z.coerce
      .number()
      .int('Tam ədəd olmalıdır')
      .min(60, 'Minimum 1 saat')
      .max(480, 'Maksimum 8 saat')
      .multipleOf(60, 'Müddət tam saatlarla olmalıdır'),
    maxBookingMinutes: z.coerce
      .number()
      .int('Tam ədəd olmalıdır')
      .min(60, 'Minimum 1 saat')
      .max(720, 'Maksimum 12 saat')
      .multipleOf(60, 'Müddət tam saatlarla olmalıdır'),
  })
  .refine((values) => values.closeTime !== values.openTime, {
    message: 'Açılış və bağlanış saatı eyni ola bilməz',
    path: ['closeTime'],
  })
  .refine((values) => values.maxBookingMinutes >= values.minBookingMinutes, {
    message: 'Maksimum müddət minimumdan kiçik ola bilməz',
    path: ['maxBookingMinutes'],
  })

export type StadiumFormValues = z.infer<typeof stadiumFormSchema>

export const blockedSlotSchema = z
  .object({
    date: z.string().min(1, 'Tarix seç'),
    startTime: timeString,
    endTime: timeString,
    reason: z.string().max(200, 'Səbəb çox uzundur').optional(),
  })
  .refine((values) => values.endTime > values.startTime, {
    message: 'Bitmə saatı başlanğıcdan sonra olmalıdır',
    path: ['endTime'],
  })

export type BlockedSlotFormValues = z.infer<typeof blockedSlotSchema>
