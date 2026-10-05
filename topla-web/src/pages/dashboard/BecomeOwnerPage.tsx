import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  Clock,
  RefreshCw,
  Send,
  Store,
  Users,
} from 'lucide-react'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  ErrorState,
  Field,
  InlineNote,
  Skeleton,
  Textarea,
} from '@/components/ui'
import { ApprovalStatusBadge } from '@/components/common/StatusBadge'
import { ownerRequestSchema, type OwnerRequestFormValues } from '@/schemas/misc'
import { useCreateOwnerRequest, useMyOwnerRequest } from '@/hooks/queries/useOwnerQueries'
import { useAuth } from '@/hooks/useAuth'
import { usePageMeta } from '@/hooks/usePageMeta'
import { errorMessage } from '@/api'
import { hasRole } from '@/utils/permissions'
import { formatDateTime } from '@/utils/format'
import { ApprovalStatus } from '@/types'
import type { OwnerRequest } from '@/types'

const MESSAGE_MAX = 1000

const BENEFITS: { icon: typeof Store; title: string; text: string }[] = [
  {
    icon: Store,
    title: 'Stadionunu əlavə et',
    text: 'Şəkillər, qiymət, iş saatları və ölçü — hamısı öz nəzarətində.',
  },
  {
    icon: CalendarClock,
    title: 'Cədvəli idarə et',
    text: 'Bronları təsdiqlə, bağlı saatları blokla, təkrarları qarşısını al.',
  },
  {
    icon: BarChart3,
    title: 'Gəliri izlə',
    text: 'Aylıq gəlir, doluluq və pik saatlar bir panelin içində.',
  },
  {
    icon: Users,
    title: 'İşçi təyin et',
    text: 'Administratoruna ayrıca giriş ver — hesabını paylaşmağa ehtiyac yoxdur.',
  },
]

function BenefitsCard() {
  return (
    <Card>
      <CardHeader
        title="Sahibkar kimi nə əldə edirsən?"
        description="Təsdiqdən sonra Topla paneli avtomatik açılır."
      />
      <CardBody>
        <ul className="grid gap-4 sm:grid-cols-2">
          {BENEFITS.map((benefit) => (
            <li key={benefit.title} className="flex gap-3">
              <span
                className="grid size-9 shrink-0 place-items-center rounded-md bg-brand-50 text-brand-700"
                aria-hidden="true"
              >
                <benefit.icon className="size-4.5" />
              </span>
              <div className="min-w-0">
                <p className="text-[13.5px] font-bold text-ink-900">{benefit.title}</p>
                <p className="mt-0.5 text-[13px] leading-relaxed text-ink-500">{benefit.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  )
}

function OwnerRequestForm({
  title,
  description,
  submitLabel,
}: {
  title: string
  description: string
  submitLabel: string
}) {
  const createRequest = useCreateOwnerRequest()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<OwnerRequestFormValues>({
    resolver: zodResolver(ownerRequestSchema),
    defaultValues: { message: '' },
  })

  const message = watch('message') ?? ''
  const pending = isSubmitting || createRequest.isPending

  async function onSubmit(values: OwnerRequestFormValues) {
    setFormError(null)
    try {
      await createRequest.mutateAsync(values.message.trim())
    } catch (error) {
      setFormError(errorMessage(error))
    }
  }

  return (
    <Card>
      <CardHeader title={title} description={description} />
      <CardBody>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          {formError ? (
            <div role="alert">
              <InlineNote tone="danger" icon={<AlertCircle />}>
                {formError}
              </InlineNote>
            </div>
          ) : null}

          <Field
            label="Stadionun və biznesin haqqında"
            error={errors.message?.message}
            hint={`Ad, şəhər, ölçü, örtük, neçə meydança — nə qədər dəqiq yazsan, baxış bir o qədər tez olur. (${message.length}/${MESSAGE_MAX})`}
            required
          >
            {({ id, describedBy, invalid }) => (
              <Textarea
                id={id}
                rows={6}
                maxLength={MESSAGE_MAX}
                placeholder="Bakı, Nərimanov r-nu, 2 ədəd 6x6 süni örtüklü meydança. İş saatları 08:00–24:00…"
                invalid={invalid}
                aria-describedby={describedBy}
                {...register('message')}
              />
            )}
          </Field>

          <InlineNote tone="info" icon={<Clock />}>
            Moderator baxışı adətən <strong>24 saat</strong> çəkir. Nəticə e-poçtuna gələcək və bu
            səhifədə görünəcək.
          </InlineNote>

          <Button type="submit" size="lg" loading={pending}>
            <Send />
            {submitLabel}
          </Button>
        </form>
      </CardBody>
    </Card>
  )
}

function StatusPanel({
  request,
  onRefresh,
  refreshing,
}: {
  request: OwnerRequest
  onRefresh: () => void
  refreshing: boolean
}) {
  const rejected = request.status === ApprovalStatus.Rejected

  return (
    <Card>
      <CardHeader
        title="Sorğunun statusu"
        description={`Göndərilib: ${formatDateTime(request.createdAt)}`}
        action={<ApprovalStatusBadge status={request.status} />}
      />
      <CardBody className="space-y-4">
        {rejected ? (
          <InlineNote tone="danger" icon={<AlertCircle />}>
            <p className="font-bold">Sorğu rədd edildi</p>
            <p className="mt-1">
              {request.rejectReason?.trim()
                ? request.rejectReason
                : 'Moderator səbəb qeyd etməyib. Məlumatları dəqiqləşdirib yenidən göndərə bilərsən.'}
            </p>
          </InlineNote>
        ) : (
          <InlineNote tone="warning" icon={<Clock />}>
            Sorğun növbədədir. Moderator baxışı adətən 24 saat çəkir — nəticə e-poçtuna gələcək.
          </InlineNote>
        )}

        {request.message ? (
          <div className="rounded-md bg-ink-50 px-4 py-3">
            <p className="text-xs font-semibold text-ink-500">Göndərdiyin mətn</p>
            <p className="mt-1 whitespace-pre-line text-[13.5px] leading-relaxed text-ink-700">
              {request.message}
            </p>
          </div>
        ) : null}

        <Button variant="secondary" onClick={onRefresh} loading={refreshing}>
          <RefreshCw />
          Statusu yenilə
        </Button>
      </CardBody>
    </Card>
  )
}

export default function BecomeOwnerPage() {
  usePageMeta({ title: 'Stadion sahibi ol' })

  const { user } = useAuth()
  const requestQuery = useMyOwnerRequest()

  const request = requestQuery.data ?? null
  const isOwner = hasRole(user, 'Owner') || request?.status === ApprovalStatus.Approved

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-extrabold tracking-tight text-ink-900">Stadion sahibi ol</h1>
        <p className="text-sm text-ink-500">
          Meydançanı Topla-da yerləşdir, bronları onlayn qəbul et.
        </p>
      </header>

      {requestQuery.isLoading ? (
        <div className="space-y-4" aria-busy="true">
          <Skeleton className="h-40 rounded-lg" />
          <Skeleton className="h-56 rounded-lg" />
        </div>
      ) : requestQuery.isError ? (
        <ErrorState
          title="Sorğunun statusu yüklənmədi"
          description="Bağlantını yoxlayıb yenidən cəhd et."
          onRetry={() => void requestQuery.refetch()}
        />
      ) : isOwner ? (
        <Card>
          <CardBody className="space-y-4 text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-full bg-success-soft text-success">
              <CheckCircle2 className="size-6" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-ink-900">Sorğun təsdiqləndi</h2>
              <p className="mx-auto max-w-md text-[13.5px] leading-relaxed text-ink-500">
                Artıq stadion sahibisən. Panelə keçib ilk meydançanı əlavə et, şəkilləri yüklə və
                iş saatlarını təyin et.
              </p>
            </div>
            <Button asChild size="lg">
              <Link to="/owner">
                Sahibkar panelinə keç
                <ArrowRight />
              </Link>
            </Button>
          </CardBody>
        </Card>
      ) : request?.status === ApprovalStatus.Pending ? (
        <StatusPanel
          request={request}
          onRefresh={() => void requestQuery.refetch()}
          refreshing={requestQuery.isFetching}
        />
      ) : request?.status === ApprovalStatus.Rejected ? (
        <div className="space-y-6">
          <StatusPanel
            request={request}
            onRefresh={() => void requestQuery.refetch()}
            refreshing={requestQuery.isFetching}
          />
          <OwnerRequestForm
            title="Sorğunu yenidən göndər"
            description="Rədd səbəbini nəzərə alıb məlumatları dəqiqləşdir."
            submitLabel="Yenidən göndər"
          />
        </div>
      ) : (
        <OwnerRequestForm
          title="Müraciət et"
          description="Bir neçə cümlə yaz — moderator komandası yoxlayıb cavab verəcək."
          submitLabel="Sorğunu göndər"
        />
      )}

      {isOwner ? null : <BenefitsCard />}
    </div>
  )
}
