import { Controller, type UseFormReturn } from 'react-hook-form'
import {
  Card,
  CardBody,
  CardHeader,
  Field,
  FormRow,
  Input,
  SimpleSelect,
  Textarea,
} from '@/components/ui'
import { LocationPickerMap } from './LocationPickerMap'
import { StadiumPricingFields } from './StadiumPricingFields'
import { CITIES, STADIUM_SIZES, SURFACE_TYPES } from '@/utils/constants'
import type { StadiumFormValues } from '@/schemas/stadium'

const CITY_OPTIONS = CITIES.map((city) => ({ value: city, label: city }))
const SIZE_OPTIONS = STADIUM_SIZES.map((size) => ({ value: size, label: size }))
const SURFACE_OPTIONS = SURFACE_TYPES.map((surface) => ({ value: surface, label: surface }))

export function StadiumFormFields({ form }: { form: UseFormReturn<StadiumFormValues> }) {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = form

  // Form dəyəri string ola bilir — xəritə üçün rəqəmə çevrilir.
  const latitude = Number(watch('latitude'))
  const longitude = Number(watch('longitude'))
  const hasPoint =
    Number.isFinite(latitude) && Number.isFinite(longitude) && (latitude !== 0 || longitude !== 0)

  function handleMapPick(nextLatitude: number, nextLongitude: number) {
    setValue('latitude', nextLatitude, { shouldValidate: true, shouldDirty: true })
    setValue('longitude', nextLongitude, { shouldValidate: true, shouldDirty: true })
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader title="Əsas məlumat" description="Müştəri ilk olaraq bunları görür." />
        <CardBody className="space-y-4">
          <Field label="Stadionun adı" required error={errors.name?.message}>
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                aria-describedby={describedBy}
                invalid={invalid}
                placeholder="Məsələn: Yaşıl Meydan Arena"
                {...register('name')}
              />
            )}
          </Field>

          <Field
            label="Təsvir"
            required
            hint="Duş, avtopark, işıqlandırma — nə varsa yaz."
            error={errors.description?.message}
          >
            {({ id, describedBy, invalid }) => (
              <Textarea
                id={id}
                aria-describedby={describedBy}
                invalid={invalid}
                rows={5}
                placeholder="Meydança, örtük, əlavə imkanlar…"
                {...register('description')}
              />
            )}
          </Field>

          <FormRow>
            <Field label="Ölçü" required error={errors.size?.message}>
              {({ id, invalid }) => (
                <Controller
                  control={control}
                  name="size"
                  render={({ field }) => (
                    <SimpleSelect
                      id={id}
                      invalid={invalid}
                      ariaLabel="Meydança ölçüsü"
                      value={field.value ?? ''}
                      onValueChange={field.onChange}
                      options={SIZE_OPTIONS}
                    />
                  )}
                />
              )}
            </Field>

            <Field label="Örtük növü" required error={errors.surfaceType?.message}>
              {({ id, invalid }) => (
                <Controller
                  control={control}
                  name="surfaceType"
                  render={({ field }) => (
                    <SimpleSelect
                      id={id}
                      invalid={invalid}
                      ariaLabel="Örtük növü"
                      value={field.value ?? ''}
                      onValueChange={field.onChange}
                      options={SURFACE_OPTIONS}
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
          title="Yer"
          description="Stadionun yerini xəritədən klikləyərək seç — marker qoyduğun nöqtə saxlanılır."
        />
        <CardBody className="space-y-4">
          <LocationPickerMap
            latitude={latitude}
            longitude={longitude}
            onPick={handleMapPick}
          />
          <FormRow>
            <Field label="Şəhər" required error={errors.city?.message}>
              {({ id, invalid }) => (
                <Controller
                  control={control}
                  name="city"
                  render={({ field }) => (
                    <SimpleSelect
                      id={id}
                      invalid={invalid}
                      ariaLabel="Şəhər"
                      value={field.value ?? ''}
                      onValueChange={field.onChange}
                      options={CITY_OPTIONS}
                      placeholder="Şəhər seç"
                    />
                  )}
                />
              )}
            </Field>

            <Field label="Ünvan" required error={errors.address?.message}>
              {({ id, describedBy, invalid }) => (
                <Input
                  id={id}
                  aria-describedby={describedBy}
                  invalid={invalid}
                  placeholder="Küçə, bina"
                  {...register('address')}
                />
              )}
            </Field>
          </FormRow>

          {/* Koordinatlar əl ilə daxil edilmir — yalnız xəritədən seçilir.
              Dəyərlər formada gizli saxlanılır ki, RHF onları izləsin. */}
          <input type="hidden" {...register('latitude')} />
          <input type="hidden" {...register('longitude')} />

          {hasPoint ? (
            <p className="text-xs text-ink-500">
              Seçilmiş nöqtə:{' '}
              <span className="font-semibold tabular-nums text-ink-700">
                {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </span>
            </p>
          ) : null}

          {errors.latitude || errors.longitude ? (
            <p className="text-xs font-semibold text-danger">
              Xəritədən stadionun yerini seç — markersiz stadion yadda saxlanılmır.
            </p>
          ) : null}
        </CardBody>
      </Card>

      <StadiumPricingFields form={form} />
    </div>
  )
}
