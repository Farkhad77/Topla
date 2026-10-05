import { useEffect } from 'react'
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
import type { OwnerRequest } from '@/types'

export function RejectRequestDialog({
  request,
  loading,
  onClose,
  onSubmit,
}: {
  /** null olduqda dialoq bağlıdır — hədəf sorğu eyni zamanda "açıq" siqnalıdır. */
  request: OwnerRequest | null
  loading: boolean
  onClose: () => void
  onSubmit: (reason: string) => void
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RejectReasonFormValues>({
    resolver: zodResolver(rejectReasonSchema),
    defaultValues: { reason: '' },
  })

  useEffect(() => {
    if (request) reset({ reason: '' })
  }, [request, reset])

  return (
    <Dialog
      open={!!request}
      onOpenChange={(open) => {
        if (!open && !loading) onClose()
      }}
    >
      <DialogContent size="md">
        <DialogHeader
          title="Sorğunu rədd et"
          description={
            request
              ? `${request.fullName} (${request.email}) üçün rədd səbəbini yaz.`
              : 'Rədd səbəbini yaz.'
          }
        />

        <form onSubmit={handleSubmit((values) => onSubmit(values.reason.trim()))} noValidate>
          <DialogBody className="space-y-4">
            <InlineNote tone="warning">
              Səbəb istifadəçiyə göndərilir. Konkret yaz — hansı sənəd və ya məlumat çatışmır.
            </InlineNote>

            <Field
              label="Rədd səbəbi"
              required
              error={errors.reason?.message}
              hint="Ən azı 10 simvol."
            >
              {({ id, describedBy, invalid }) => (
                <Textarea
                  id={id}
                  aria-describedby={describedBy}
                  invalid={invalid}
                  rows={5}
                  placeholder="Məsələn: Göndərilən biznes məlumatları natamamdır — stadionun ünvanı və əlaqə nömrəsi qeyd olunmayıb."
                  {...register('reason')}
                />
              )}
            </Field>
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
              İmtina
            </Button>
            <Button type="submit" variant="danger" loading={loading}>
              Rədd et
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
