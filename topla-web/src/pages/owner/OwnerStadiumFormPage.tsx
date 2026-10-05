import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Save } from 'lucide-react'
import { Button, ErrorState, InlineNote, Skeleton } from '@/components/ui'
import { OwnerPageHeader } from '@/features/owner/OwnerPageHeader'
import { StadiumFormFields } from '@/features/owner/StadiumFormFields'
import { StadiumImageUploader } from '@/features/owner/StadiumImageUploader'
import {
  useCreateStadium,
  useStadiumDetail,
  useUpdateStadium,
} from '@/hooks/queries/useStadiumQueries'
import { usePageMeta } from '@/hooks/usePageMeta'
import { errorMessage } from '@/api'
import { stadiumFormSchema, type StadiumFormValues } from '@/schemas/stadium'
import { formatTimeOnly } from '@/utils/format'
import { STADIUM_SIZES, SURFACE_TYPES } from '@/utils/constants'
import type { StadiumWritePayload } from '@/types'

/** Backend TimeOnly gözləyir: "HH:mm" → "HH:mm:ss". */
function toTimeOnly(value: string): string {
  return `${value}:00`
}

export default function OwnerStadiumFormPage() {
  const { stadiumId } = useParams<{ stadiumId: string }>()
  const isEdit = !!stadiumId
  const navigate = useNavigate()

  usePageMeta({ title: isEdit ? 'Stadionu redaktə et' : 'Yeni stadion' })

  const detailQuery = useStadiumDetail(stadiumId)
  const createStadium = useCreateStadium()
  const updateStadium = useUpdateStadium()

  const form = useForm<StadiumFormValues>({
    resolver: zodResolver(stadiumFormSchema),
    defaultValues: {
      name: '',
      description: '',
      city: '',
      address: '',
      size: STADIUM_SIZES[0],
      surfaceType: SURFACE_TYPES[0],
      openTime: '09:00',
      closeTime: '23:00',
      minBookingMinutes: 60,
      maxBookingMinutes: 120,
    },
  })

  const { reset, handleSubmit } = form
  const detail = detailQuery.data

  // Redaktə rejimində forma yalnız data gələndən sonra doldurulur.
  useEffect(() => {
    if (!detail) return
    reset({
      name: detail.name,
      description: detail.description ?? '',
      city: detail.city,
      address: detail.address,
      latitude: detail.latitude,
      longitude: detail.longitude,
      pricePerHour: detail.pricePerHour,
      size: detail.size,
      surfaceType: detail.surfaceType,
      openTime: formatTimeOnly(detail.openTime),
      closeTime: formatTimeOnly(detail.closeTime),
      minBookingMinutes: detail.minBookingMinutes,
      maxBookingMinutes: detail.maxBookingMinutes,
    })
  }, [detail, reset])

  async function onSubmit(values: StadiumFormValues) {
    const payload: StadiumWritePayload = {
      name: values.name.trim(),
      description: values.description.trim(),
      city: values.city,
      address: values.address.trim(),
      latitude: values.latitude,
      longitude: values.longitude,
      pricePerHour: values.pricePerHour,
      size: values.size,
      surfaceType: values.surfaceType,
      openTime: toTimeOnly(values.openTime),
      closeTime: toTimeOnly(values.closeTime),
      minBookingMinutes: values.minBookingMinutes,
      maxBookingMinutes: values.maxBookingMinutes,
    }

    try {
      if (isEdit && stadiumId) {
        await updateStadium.mutateAsync({ ...payload, stadiumId })
      } else {
        await createStadium.mutateAsync(payload)
      }
      navigate('/owner/stadiums')
    } catch {
      // Xəta mesajı mutation hook-unda toast kimi göstərilir.
    }
  }

  const isSaving = createStadium.isPending || updateStadium.isPending

  return (
    <div className="space-y-5">
      <OwnerPageHeader
        title={isEdit ? 'Stadionu redaktə et' : 'Yeni stadion'}
        description={
          isEdit
            ? 'Dəyişikliklər yadda saxlandıqdan sonra saytda dərhal görünür.'
            : 'Stadion yaradıldıqdan sonra moderator təsdiqi ilə kataloqa düşür. Şəkilləri yaratdıqdan sonra əlavə edəcəksən.'
        }
        action={
          <Button variant="secondary" asChild>
            <Link to="/owner/stadiums">
              <ArrowLeft />
              Siyahıya qayıt
            </Link>
          </Button>
        }
      />

      {isEdit && detailQuery.isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-56 w-full rounded-lg" />
          ))}
        </div>
      ) : isEdit && detailQuery.isError ? (
        <ErrorState
          title="Stadion məlumatı yüklənmədi"
          description={errorMessage(detailQuery.error)}
          onRetry={() => void detailQuery.refetch()}
        />
      ) : (
        <>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <StadiumFormFields form={form} />

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="secondary" asChild>
                <Link to="/owner/stadiums">İmtina</Link>
              </Button>
              <Button type="submit" loading={isSaving}>
                <Save />
                {isEdit ? 'Dəyişiklikləri saxla' : 'Stadionu yarat'}
              </Button>
            </div>
          </form>

          {isEdit && stadiumId ? (
            <StadiumImageUploader stadiumId={stadiumId} />
          ) : (
            <InlineNote tone="info">
              Şəkilləri stadion yaradıldıqdan sonra əlavə edə biləcəksən — backend yükləmə üçün
              mövcud stadion id-si tələb edir.
            </InlineNote>
          )}
        </>
      )}
    </div>
  )
}
