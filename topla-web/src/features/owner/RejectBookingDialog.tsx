import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  Field,
  InlineNote,
  Textarea,
} from '@/components/ui'
import { rejectReasonSchema, type RejectReasonFormValues } from '@/schemas/misc'
import { formatDateTime } from '@/utils/format'
import type { OwnerBooking } from '@/types'

/** Radix bağlı olanda məzmunu söküb atır — forma hər açılışda təmiz başlayır. */
function RejectForm({
  booking,
  loading,
  onCancel,
  onSubmit,
}: {
  booking: OwnerBooking
  loading: boolean
  onCancel: () => void
  onSubmit: (reason: string) => void
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RejectReasonFormValues>({
    resolver: zodResolver(rejectReasonSchema),
    defaultValues: { reason: '' },
  })

  return (
    <form onSubmit={handleSubmit((values) => onSubmit(values.reason.trim()))} noValidate>
      <DialogBody className="space-y-4">
        <InlineNote tone="warning">
          Rədd edilmiş bron geri qaytarıla bilmir. Yazdığın səbəb müştəriyə olduğu kimi göndərilir.
        </InlineNote>

        <dl className="rounded-md border border-line bg-ink-50/60 px-3.5 py-3 text-[13px]">
          <div className="flex justify-between gap-3">
            <dt className="text-ink-500">Müştəri</dt>
            <dd className="font-semibold text-ink-900">{booking.customerName || '—'}</dd>
          </div>
          <div className="mt-1.5 flex justify-between gap-3">
            <dt className="text-ink-500">Vaxt</dt>
            <dd className="font-semibold text-ink-900">
              {formatDateTime(booking.startDateTime)}
            </dd>
          </div>
        </dl>

        <Field label="Rədd səbəbi" required error={errors.reason?.message}>
          {({ id, describedBy, invalid }) => (
            <Textarea
              id={id}
              aria-describedby={describedBy}
              invalid={invalid}
              placeholder="Məsələn: həmin saatda təmir işləri planlaşdırılıb."
              {...register('reason')}
            />
          )}
        </Field>
      </DialogBody>

      <DialogFooter>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          İmtina
        </Button>
        <Button type="submit" variant="danger" loading={loading}>
          Rədd et
        </Button>
      </DialogFooter>
    </form>
  )
}

export function RejectBookingDialog({
  booking,
  loading = false,
  onOpenChange,
  onSubmit,
}: {
  booking: OwnerBooking | null
  loading?: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (booking: OwnerBooking, reason: string) => void
}) {
  return (
    <Dialog open={!!booking} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader
          title="Rezervasiyanı rədd et"
          description="Səbəbi izah et — müştəri bunu bildiriş kimi alacaq."
        />
        {booking ? (
          <RejectForm
            booking={booking}
            loading={loading}
            onCancel={() => onOpenChange(false)}
            onSubmit={(reason) => onSubmit(booking, reason)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
