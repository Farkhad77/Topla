import { Controller, type UseFormReturn } from 'react-hook-form'
import { Card, CardBody, CardHeader, Field, FormRow, Input, SimpleSelect } from '@/components/ui'
import { formatDuration } from '@/utils/format'
import type { StadiumFormValues } from '@/schemas/stadium'

/** Bron müddəti yalnız tam saatlarla ola bilər — 1..6 saat seçimi kifayətdir. */
const HOUR_OPTIONS = [60, 120, 180, 240, 300, 360].map((minutes) => ({
  value: String(minutes),
  label: formatDuration(minutes),
}))

export function StadiumPricingFields({ form }: { form: UseFormReturn<StadiumFormValues> }) {
  const {
    register,
    control,
    formState: { errors },
  } = form

  return (
    <>
      <Card>
        <CardHeader
          title="Qiymət və müddət"
          description="Axşam saatlarına (18:00–22:00) sistem avtomatik 1.5x tarif tətbiq edir."
        />
        <CardBody className="space-y-4">
          <Field label="Saatlıq qiymət (₼)" required error={errors.pricePerHour?.message}>
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                type="number"
                step="1"
                min={1}
                inputMode="decimal"
                aria-describedby={describedBy}
                invalid={invalid}
                placeholder="60"
                {...register('pricePerHour')}
              />
            )}
          </Field>

          <FormRow>
            <Field label="Minimum bron müddəti" required error={errors.minBookingMinutes?.message}>
              {({ id, invalid }) => (
                <Controller
                  control={control}
                  name="minBookingMinutes"
                  render={({ field }) => (
                    <SimpleSelect
                      id={id}
                      invalid={invalid}
                      ariaLabel="Minimum bron müddəti"
                      value={String(field.value ?? 60)}
                      onValueChange={(next) => field.onChange(Number(next))}
                      options={HOUR_OPTIONS}
                    />
                  )}
                />
              )}
            </Field>

            <Field label="Maksimum bron müddəti" required error={errors.maxBookingMinutes?.message}>
              {({ id, invalid }) => (
                <Controller
                  control={control}
                  name="maxBookingMinutes"
                  render={({ field }) => (
                    <SimpleSelect
                      id={id}
                      invalid={invalid}
                      ariaLabel="Maksimum bron müddəti"
                      value={String(field.value ?? 120)}
                      onValueChange={(next) => field.onChange(Number(next))}
                      options={HOUR_OPTIONS}
                    />
                  )}
                />
              )}
            </Field>
          </FormRow>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="İş saatları"
          description="Bu aralıqdan kənarda heç kim bron edə bilməyəcək."
        />
        <CardBody>
          <FormRow>
            <Field label="Açılış" required error={errors.openTime?.message}>
              {({ id, describedBy, invalid }) => (
                <Input
                  id={id}
                  type="time"
                  aria-describedby={describedBy}
                  invalid={invalid}
                  {...register('openTime')}
                />
              )}
            </Field>

            <Field label="Bağlanış" required error={errors.closeTime?.message}>
              {({ id, describedBy, invalid }) => (
                <Input
                  id={id}
                  type="time"
                  aria-describedby={describedBy}
                  invalid={invalid}
                  {...register('closeTime')}
                />
              )}
            </Field>
          </FormRow>
        </CardBody>
      </Card>
    </>
  )
}
