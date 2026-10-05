import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Ban, LockOpen, ShieldPlus } from 'lucide-react'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  ConfirmDialog,
  Field,
  Input,
  Textarea,
} from '@/components/ui'
import { useAssignModerator, useBlockUser, useUnblockUser } from '@/hooks/queries/useAdminQueries'

// Backend id-ləri GUID-dir, amma formatı sərt yoxlamırıq ki, düzgün dəyər səhvən rədd olunmasın.
const blockSchema = z.object({
  userId: z.string().trim().min(8, 'İstifadəçi id-sini tam yapışdır'),
  reason: z
    .string()
    .trim()
    .min(10, 'Səbəbi ən azı 10 simvolla izah et — qeyd jurnalda saxlanılır')
    .max(500, 'Səbəb çox uzundur'),
})
type BlockFormValues = z.infer<typeof blockSchema>

const unblockSchema = z.object({
  userId: z.string().trim().min(8, 'İstifadəçi id-sini tam yapışdır'),
})
type UnblockFormValues = z.infer<typeof unblockSchema>

const assignModeratorSchema = z.object({
  email: z.string().trim().email('Düzgün e-poçt ünvanı yaz'),
})
type AssignModeratorFormValues = z.infer<typeof assignModeratorSchema>

function IdSummary({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-[13px] text-ink-600">
      <span className="font-semibold text-ink-800">{label}:</span>{' '}
      <span className="break-all font-mono text-[12px]">{value}</span>
    </p>
  )
}

export function BlockUserCard() {
  const blockUser = useBlockUser()
  const [pending, setPending] = useState<BlockFormValues | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BlockFormValues>({
    resolver: zodResolver(blockSchema),
    defaultValues: { userId: '', reason: '' },
  })

  const confirm = () => {
    if (!pending) return
    blockUser.mutate(pending, {
      onSuccess: () => reset({ userId: '', reason: '' }),
      onSettled: () => setPending(null),
    })
  }

  return (
    <Card>
      <CardHeader
        title="İstifadəçini blokla"
        description="Bloklanan istifadəçi sistemə daxil ola və rezervasiya edə bilmir."
      />
      <CardBody>
        <form className="space-y-4" onSubmit={handleSubmit((values) => setPending(values))} noValidate>
          <Field
            label="İstifadəçi id"
            required
            error={errors.userId?.message}
            hint="Id-ni sorğu detalından və ya rezervasiya cədvəlindən kopyala."
          >
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                aria-describedby={describedBy}
                invalid={invalid}
                autoComplete="off"
                spellCheck={false}
                placeholder="3f0a1c8e-…"
                className="font-mono text-[13px]"
                {...register('userId')}
              />
            )}
          </Field>

          <Field label="Blok səbəbi" required error={errors.reason?.message}>
            {({ id, describedBy, invalid }) => (
              <Textarea
                id={id}
                aria-describedby={describedBy}
                invalid={invalid}
                rows={3}
                placeholder="Məsələn: Təkrarlanan saxta rezervasiyalar və stadion sahibinə qarşı təhqiramiz davranış."
                {...register('reason')}
              />
            )}
          </Field>

          <Button type="submit" variant="danger" loading={blockUser.isPending}>
            <Ban aria-hidden="true" />
            Blokla
          </Button>
        </form>
      </CardBody>

      <ConfirmDialog
        open={!!pending}
        onOpenChange={(open) => !open && setPending(null)}
        title="İstifadəçini bloklayırsan?"
        description="İstifadəçi dərhal sistemdən kənarlaşdırılacaq. Blok sonradan geri götürülə bilər."
        confirmLabel="Bəli, blokla"
        loading={blockUser.isPending}
        onConfirm={confirm}
      >
        {pending ? (
          <div className="space-y-1.5">
            <IdSummary label="İstifadəçi" value={pending.userId} />
            <p className="text-[13px] leading-relaxed text-ink-600">
              <span className="font-semibold text-ink-800">Səbəb:</span> {pending.reason}
            </p>
          </div>
        ) : null}
      </ConfirmDialog>
    </Card>
  )
}

export function UnblockUserCard() {
  const unblockUser = useUnblockUser()
  const [pending, setPending] = useState<UnblockFormValues | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UnblockFormValues>({
    resolver: zodResolver(unblockSchema),
    defaultValues: { userId: '' },
  })

  const confirm = () => {
    if (!pending) return
    unblockUser.mutate(pending.userId, {
      onSuccess: () => reset({ userId: '' }),
      onSettled: () => setPending(null),
    })
  }

  return (
    <Card>
      <CardHeader
        title="Blokdan çıxar"
        description="Blok götürüldükdən sonra istifadəçi hesabına yenidən daxil ola bilir."
      />
      <CardBody>
        <form className="space-y-4" onSubmit={handleSubmit((values) => setPending(values))} noValidate>
          <Field label="İstifadəçi id" required error={errors.userId?.message}>
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                aria-describedby={describedBy}
                invalid={invalid}
                autoComplete="off"
                spellCheck={false}
                placeholder="3f0a1c8e-…"
                className="font-mono text-[13px]"
                {...register('userId')}
              />
            )}
          </Field>

          <Button type="submit" variant="secondary" loading={unblockUser.isPending}>
            <LockOpen aria-hidden="true" />
            Bloku götür
          </Button>
        </form>
      </CardBody>

      <ConfirmDialog
        open={!!pending}
        onOpenChange={(open) => !open && setPending(null)}
        title="Bloku götürürsən?"
        description="İstifadəçi platformaya tam giriş əldə edəcək."
        confirmLabel="Bəli, bloku götür"
        tone="primary"
        loading={unblockUser.isPending}
        onConfirm={confirm}
      >
        {pending ? <IdSummary label="İstifadəçi" value={pending.userId} /> : null}
      </ConfirmDialog>
    </Card>
  )
}

/** Yalnız Admin görür: e-poçta görə istifadəçiyə Moderator rolu verir. */
export function AssignModeratorCard() {
  const assignModerator = useAssignModerator()
  const [pending, setPending] = useState<AssignModeratorFormValues | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AssignModeratorFormValues>({
    resolver: zodResolver(assignModeratorSchema),
    defaultValues: { email: '' },
  })

  const confirm = () => {
    if (!pending) return
    assignModerator.mutate(pending.email, {
      onSuccess: () => reset({ email: '' }),
      onSettled: () => setPending(null),
    })
  }

  return (
    <Card>
      <CardHeader
        title="Moderator təyin et"
        description="İstifadəçi e-poçtuna görə tapılır və ona Moderator rolu verilir."
      />
      <CardBody>
        <form
          className="space-y-4"
          onSubmit={handleSubmit((values) => setPending(values))}
          noValidate
        >
          <Field
            label="İstifadəçi e-poçtu"
            required
            error={errors.email?.message}
            hint="Rol dəyişikliyi istifadəçinin növbəti girişindən sonra qüvvəyə minir."
          >
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                type="email"
                aria-describedby={describedBy}
                invalid={invalid}
                autoComplete="off"
                spellCheck={false}
                placeholder="istifadeci@nümunə.az"
                {...register('email')}
              />
            )}
          </Field>

          <Button type="submit" loading={assignModerator.isPending}>
            <ShieldPlus aria-hidden="true" />
            Moderator et
          </Button>
        </form>
      </CardBody>

      <ConfirmDialog
        open={!!pending}
        onOpenChange={(open) => !open && setPending(null)}
        title="Moderator rolu verirsən?"
        description="Bu istifadəçi moderasiya panelinə giriş əldə edəcək: sahibkar sorğuları, stadion təsdiqi və rəy moderasiyası."
        confirmLabel="Bəli, moderator et"
        tone="primary"
        loading={assignModerator.isPending}
        onConfirm={confirm}
      >
        {pending ? <IdSummary label="E-poçt" value={pending.email} /> : null}
      </ConfirmDialog>
    </Card>
  )
}
