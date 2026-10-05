import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarOff, MapPin, Unlock } from 'lucide-react'
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
  SimpleSelect,
  SkeletonRows,
} from '@/components/ui'
import { OwnerPageHeader } from '@/features/owner/OwnerPageHeader'
import { BlockedSlotForm } from '@/features/owner/BlockedSlotForm'
import { useOwnerStadiums } from '@/features/owner/useOwnerStadiums'
import { useBlockSlot, useBlockedSlots, useUnblockSlot } from '@/hooks/queries/useOwnerQueries'
import { usePageMeta } from '@/hooks/usePageMeta'
import { errorMessage } from '@/api'
import { formatDate, formatTimeRange, toDate, toDateParam } from '@/utils/format'
import type { BlockedSlot, BlockedSlotCreatePayload } from '@/types'

function groupByDate(slots: BlockedSlot[]): { day: string; items: BlockedSlot[] }[] {
  const groups = new Map<string, BlockedSlot[]>()

  for (const slot of slots) {
    const start = toDate(slot.startTime)
    if (!start) continue
    const key = toDateParam(start)
    const bucket = groups.get(key)
    if (bucket) bucket.push(slot)
    else groups.set(key, [slot])
  }

  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, items]) => ({
      day,
      items: items.sort(
        (a, b) => (toDate(a.startTime)?.getTime() ?? 0) - (toDate(b.startTime)?.getTime() ?? 0),
      ),
    }))
}

export default function OwnerBlockedSlotsPage() {
  usePageMeta({ title: 'Bloklanmış vaxtlar — Sahibkar paneli' })

  const stadiums = useOwnerStadiums()
  const [stadiumId, setStadiumId] = useState('')
  const [unblockTarget, setUnblockTarget] = useState<BlockedSlot | null>(null)

  // Səhifə açılanda ilk stadion avtomatik seçilir.
  useEffect(() => {
    const first = stadiums.options[0]
    if (!stadiumId && first) setStadiumId(first.value)
  }, [stadiums.options, stadiumId])

  const blockedQuery = useBlockedSlots(stadiumId || undefined)
  const blockSlot = useBlockSlot(stadiumId)
  const unblockSlot = useUnblockSlot(stadiumId)

  const groups = useMemo(() => groupByDate(blockedQuery.data ?? []), [blockedQuery.data])

  async function handleBlock(payload: BlockedSlotCreatePayload): Promise<boolean> {
    try {
      await blockSlot.mutateAsync(payload)
      return true
    } catch {
      // Xəta mutation hook-unda toast kimi göstərilir; forma təmizlənmir.
      return false
    }
  }

  async function handleUnblock() {
    if (!unblockTarget) return
    try {
      await unblockSlot.mutateAsync(unblockTarget.id)
      setUnblockTarget(null)
    } catch {
      // Dialoq açıq qalır.
    }
  }

  if (!stadiums.isLoading && stadiums.options.length === 0) {
    return (
      <div className="space-y-5">
        <OwnerPageHeader title="Bloklanmış vaxtlar" />
        <EmptyState
          icon={<MapPin />}
          title="Blok üçün stadion lazımdır"
          description="Vaxt bloklamaq üçün ən azı bir stadionun olmalıdır."
          action={
            <Button asChild>
              <Link to="/owner/stadiums/new">Stadion əlavə et</Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <OwnerPageHeader
        title="Bloklanmış vaxtlar"
        description="Təmir, turnir və ya şəxsi istifadə üçün saatları bağla — bloklanmış interval istifadəçilərə əlçatmaz olur."
      />

      <Card>
        <CardHeader title="Stadion seç" />
        <CardBody>
          <Field label="Stadion">
            {({ id }) => (
              <SimpleSelect
                id={id}
                ariaLabel="Stadion seç"
                value={stadiumId}
                onValueChange={setStadiumId}
                options={stadiums.options}
                placeholder="Stadion seç"
                className="sm:max-w-sm"
              />
            )}
          </Field>
        </CardBody>
      </Card>

      <BlockedSlotForm
        disabled={!stadiumId}
        loading={blockSlot.isPending}
        onSubmit={handleBlock}
      />

      <Card>
        <CardHeader title="Mövcud bloklar" description="Tarix üzrə qruplaşdırılıb." />
        <CardBody className="space-y-4">
          {blockedQuery.isLoading ? (
            <SkeletonRows rows={4} columns={3} />
          ) : blockedQuery.isError ? (
            <ErrorState
              title="Bloklar yüklənmədi"
              description={errorMessage(blockedQuery.error)}
              onRetry={() => void blockedQuery.refetch()}
            />
          ) : groups.length === 0 ? (
            <EmptyState
              icon={<CalendarOff />}
              title="Bloklanmış vaxt yoxdur"
              description="Yuxarıdakı formadan tarix və saat aralığı seçərək ilk bloku yarat."
              compact
            />
          ) : (
            groups.map((group) => (
              <section key={group.day} className="space-y-2">
                <h3 className="text-[13px] font-bold text-ink-900">{formatDate(group.day)}</h3>
                <ul className="space-y-2">
                  {group.items.map((slot) => (
                    <li
                      key={slot.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-line bg-ink-50/50 px-3.5 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="text-[13.5px] font-semibold tabular-nums text-ink-900">
                          {formatTimeRange(slot.startTime, slot.endTime)}
                        </p>
                        <p className="text-xs text-ink-500">
                          {slot.reason?.trim() || 'Səbəb göstərilməyib'}
                        </p>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="min-h-10"
                        onClick={() => setUnblockTarget(slot)}
                      >
                        <Unlock />
                        Bloku götür
                      </Button>
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}
        </CardBody>
      </Card>

      <InlineNote tone="info">
        Blok yaradılan interval mövcud bronu ləğv etmir — həmin saatda artıq bron varsa, təqvimdə
        toqquşma kimi işarələnəcək.
      </InlineNote>

      <ConfirmDialog
        open={!!unblockTarget}
        onOpenChange={(open) => {
          if (!open) setUnblockTarget(null)
        }}
        title="Blok götürülsün?"
        description={
          unblockTarget
            ? `${formatDate(unblockTarget.startTime)} · ${formatTimeRange(
                unblockTarget.startTime,
                unblockTarget.endTime,
              )} aralığı yenidən bron üçün açılacaq.`
            : undefined
        }
        confirmLabel="Bloku götür"
        tone="primary"
        loading={unblockSlot.isPending}
        onConfirm={() => void handleUnblock()}
      />
    </div>
  )
}
