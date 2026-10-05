import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Lock, Mail, ShieldCheck, UserPlus, Users } from 'lucide-react'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Field,
  InlineNote,
  Input,
  SkeletonRows,
} from '@/components/ui'
import { OwnerPageHeader } from '@/features/owner/OwnerPageHeader'
import { WorkersTable } from '@/features/owner/WorkersTable'
import { useAssignWorker, useRemoveWorker, useWorkers } from '@/hooks/queries/useOwnerQueries'
import { useAuth } from '@/hooks/useAuth'
import { usePageMeta } from '@/hooks/usePageMeta'
import { errorMessage } from '@/api'
import { inviteWorkerSchema, type InviteWorkerFormValues } from '@/schemas/misc'
import { isOwnerNotWorker } from '@/utils/permissions'
import type { Worker } from '@/types'

export default function OwnerStaffPage() {
  usePageMeta({ title: 'İşçilər — Sahibkar paneli' })

  const { user } = useAuth()
  const isOwner = isOwnerNotWorker(user)

  const workersQuery = useWorkers(isOwner)
  const assignWorker = useAssignWorker()
  const removeWorker = useRemoveWorker()
  const [removeTarget, setRemoveTarget] = useState<Worker | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteWorkerFormValues>({
    resolver: zodResolver(inviteWorkerSchema),
    defaultValues: { workerEmail: '' },
  })

  async function onSubmit(values: InviteWorkerFormValues) {
    try {
      await assignWorker.mutateAsync(values.workerEmail.trim())
      reset({ workerEmail: '' })
    } catch {
      // Xəta mutation hook-unda toast kimi göstərilir.
    }
  }

  async function handleRemove() {
    if (!removeTarget) return
    try {
      await removeWorker.mutateAsync(removeTarget.userId)
      setRemoveTarget(null)
    } catch {
      // Dialoq açıq qalır.
    }
  }

  // İşçi owner deyil: bu bölmə yalnız sahibkara açıqdır.
  if (!isOwner) {
    return (
      <div className="space-y-5">
        <OwnerPageHeader title="İşçilər" />
        <EmptyState
          icon={<Lock />}
          title="Bu bölmə yalnız sahibkara açıqdır"
          description="İşçilər bölməsini yalnız stadion sahibi idarə edə bilər. Sən işçi girişindəsən — rezervasiya, təqvim və bloklar sənə açıqdır."
        />
      </div>
    )
  }

  const workers = workersQuery.data ?? []

  return (
    <div className="space-y-5">
      <OwnerPageHeader
        title="İşçilər"
        description="Administratoruna ayrıca giriş ver — hesabının parolunu paylaşmağa ehtiyac qalmır."
      />

      <InlineNote tone="info" icon={<ShieldCheck />}>
        İşçi sənin <strong className="font-semibold">bütün stadionlarını</strong> idarə edə bilir:
        bronları təsdiqləyir, təqvimi və blokları dəyişir. Amma o, sahibkar deyil — stadion yarada,
        silə və işçi təyin edə bilməz.
      </InlineNote>

      <Card>
        <CardHeader
          title="İşçi əlavə et"
          description="İstifadəçi əvvəlcədən Topla-da qeydiyyatdan keçmiş olmalıdır."
        />
        <CardBody>
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="flex flex-col gap-3 sm:flex-row sm:items-start"
          >
            <Field
              label="İşçinin e-poçtu"
              required
              error={errors.workerEmail?.message}
              className="flex-1"
            >
              {({ id, describedBy, invalid }) => (
                <Input
                  id={id}
                  type="email"
                  autoComplete="email"
                  aria-describedby={describedBy}
                  invalid={invalid}
                  placeholder="isci@numune.az"
                  leading={<Mail />}
                  {...register('workerEmail')}
                />
              )}
            </Field>

            <Button type="submit" loading={assignWorker.isPending} className="sm:mt-6">
              <UserPlus />
              Təyin et
            </Button>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Komanda"
          description={workers.length ? `${workers.length} işçi təyin olunub` : undefined}
        />
        <CardBody>
          {workersQuery.isLoading ? (
            <SkeletonRows rows={3} columns={4} />
          ) : workersQuery.isError ? (
            <ErrorState
              title="İşçilər yüklənmədi"
              description={errorMessage(workersQuery.error)}
              onRetry={() => void workersQuery.refetch()}
            />
          ) : workers.length === 0 ? (
            <EmptyState
              icon={<Users />}
              title="Hələ işçin yoxdur"
              description="Yuxarıdakı formaya e-poçt yazaraq ilk işçini təyin et — o, bronları sənin yerinə idarə edə biləcək."
              compact
            />
          ) : (
            <WorkersTable workers={workers} onRemove={setRemoveTarget} />
          )}
        </CardBody>
      </Card>

      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={(open) => {
          if (!open) setRemoveTarget(null)
        }}
        title="İşçi çıxarılsın?"
        description={
          removeTarget
            ? `${removeTarget.fullName} bundan sonra sahibkar panelinə girə bilməyəcək. Təyinatı yenidən verə bilərsən.`
            : undefined
        }
        confirmLabel="Çıxar"
        loading={removeWorker.isPending}
        onConfirm={() => void handleRemove()}
      />
    </div>
  )
}
