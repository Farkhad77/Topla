import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Lock } from 'lucide-react'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  DatePicker,
  Field,
  FormRow,
  Input,
} from '@/components/ui'
import { blockedSlotSchema, type BlockedSlotFormValues } from '@/schemas/stadium'
import { toDate, toDateParam, toWallClockIso } from '@/utils/format'
import type { BlockedSlotCreatePayload } from '@/types'

const DEFAULT_VALUES: BlockedSlotFormValues = {
  date: '',
  startTime: '10:00',
  endTime: '12:00',
  reason: '',
}

export function BlockedSlotForm({
  disabled,
  loading,
  onSubmit,
}: {
  disabled: boolean
  loading: boolean
  onSubmit: (payload: BlockedSlotCreatePayload) => Promise<boolean>
}) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BlockedSlotFormValues>({
    resolver: zodResolver(blockedSlotSchema),
    defaultValues: DEFAULT_VALUES,
  })

  async function submit(values: BlockedSlotFormValues) {
    const start = toDate(`${values.date}T${values.startTime}:00`)
    const end = toDate(`${values.date}T${values.endTime}:00`)
    if (!start || !end) return

    const ok = await onSubmit({
      // Backend saat qurşağı sonluğu olmadan divar saatı gözləyir.
      startTime: toWallClockIso(start),
      endTime: toWallClockIso(end),
      reason: values.reason?.trim() || undefined,
    })
    if (ok) reset(DEFAULT_VALUES)
  }

  return (
    <Card>
      <CardHeader title="Yeni blok" description="Blok yalnız seçilmiş stadiona tətbiq olunur." />
      <CardBody>
        <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
          <FormRow>
            <Field label="Tarix" required error={errors.date?.message}>
              {({ id }) => (
                <Controller
                  control={control}
                  name="date"
                  render={({ field }) => (
                    <DatePicker
                      id={id}
                      value={toDate(field.value)}
                      onChange={(value) => field.onChange(toDateParam(value))}
                      placeholder="Tarix seç"
                    />
                  )}
                />
              )}
            </Field>

            <Field label="Səbəb" hint="İstəyə bağlı" error={errors.reason?.message}>
              {({ id, describedBy, invalid }) => (
                <Input
                  id={id}
                  aria-describedby={describedBy}
                  invalid={invalid}
                  placeholder="Məsələn: təmir işləri"
                  {...register('reason')}
                />
              )}
            </Field>
          </FormRow>

          <FormRow>
            <Field label="Başlanğıc saatı" required error={errors.startTime?.message}>
              {({ id, describedBy, invalid }) => (
                <Input
                  id={id}
                  type="time"
                  aria-describedby={describedBy}
                  invalid={invalid}
                  {...register('startTime')}
                />
              )}
            </Field>

            <Field label="Bitmə saatı" required error={errors.endTime?.message}>
              {({ id, describedBy, invalid }) => (
                <Input
                  id={id}
                  type="time"
                  aria-describedby={describedBy}
                  invalid={invalid}
                  {...register('endTime')}
                />
              )}
            </Field>
          </FormRow>

          <div className="flex justify-end">
            <Button type="submit" loading={loading} disabled={disabled}>
              <Lock />
              Vaxtı blokla
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  )
}
