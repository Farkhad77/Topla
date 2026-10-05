import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, MapPin, Pencil, Plus, Trash2 } from 'lucide-react'
import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  InlineNote,
  SkeletonCard,
  Switch,
} from '@/components/ui'
import { PitchImage } from '@/components/brand/PitchImage'
import { OwnerPageHeader } from '@/features/owner/OwnerPageHeader'
import { useOwnerStadiums, type OwnerStadiumEntry } from '@/features/owner/useOwnerStadiums'
import { useDeleteStadium, useToggleStadiumActive } from '@/hooks/queries/useStadiumQueries'
import { usePageMeta } from '@/hooks/usePageMeta'
import { errorMessage } from '@/api'
import { formatPrice, formatTimeOnly } from '@/utils/format'

/**
 * TODO(backend): `GET /api/Stadiums/my` cavabında `isActive` sahəsi yoxdur,
 * ona görə switch-in başlanğıc vəziyyəti bilinmir. Switch yalnız əməliyyat
 * göndərir; vəziyyət yerli olaraq saxlanılır və səhifə yenilənəndə sıfırlanır.
 */
export default function OwnerStadiumsPage() {
  usePageMeta({ title: 'Stadionlarım — Sahibkar paneli' })

  const stadiums = useOwnerStadiums()
  const toggleActive = useToggleStadiumActive()
  const deleteStadium = useDeleteStadium()

  const [deleteTarget, setDeleteTarget] = useState<OwnerStadiumEntry | null>(null)
  const [activeState, setActiveState] = useState<Record<string, boolean>>({})

  async function handleDelete() {
    if (!deleteTarget?.id) return
    try {
      await deleteStadium.mutateAsync(deleteTarget.id)
      setDeleteTarget(null)
    } catch {
      // Xəta toast kimi göstərilir.
    }
  }

  if (stadiums.isLoading) {
    return (
      <div className="space-y-5">
        <OwnerPageHeader title="Stadionlarım" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </div>
    )
  }

  if (stadiums.isError) {
    return (
      <div className="space-y-5">
        <OwnerPageHeader title="Stadionlarım" />
        <ErrorState
          title="Stadionlar yüklənmədi"
          description={errorMessage(stadiums.error)}
          onRetry={stadiums.refetch}
        />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <OwnerPageHeader
        title="Stadionlarım"
        description="Meydançaların siyahısı, iş saatları və qiymətləri. Redaktə edəndə dəyişiklik dərhal saytda görünür."
        action={
          <Button asChild>
            <Link to="/owner/stadiums/new">
              <Plus />
              Yeni stadion
            </Link>
          </Button>
        }
      />

      {stadiums.missingIdCount > 0 ? (
        <InlineNote tone="warning">
          {stadiums.missingIdCount} stadion üçün backend id qaytarmır
          (<code className="font-mono text-xs">StadiumViewDetailDto</code> sahəsi yoxdur). Həmin
          kartlarda redaktə, silmə və aktivlik düymələri deaktivdir — uydurma id yaradılmır.
        </InlineNote>
      ) : null}

      {stadiums.entries.length === 0 ? (
        <EmptyState
          icon={<MapPin />}
          title="Hələ stadion əlavə etməmisən"
          description="İlk meydançanı əlavə et: ad, ünvan, qiymət, iş saatları və şəkillər. Moderator təsdiqindən sonra saytda görünəcək."
          action={
            <Button asChild>
              <Link to="/owner/stadiums/new">İlk stadionu əlavə et</Link>
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {stadiums.entries.map((entry) => {
            const { stadium, id } = entry
            const switchId = `stadium-active-${entry.key}`

            return (
              <li
                key={entry.key}
                className="flex flex-col overflow-hidden rounded-lg border border-line bg-surface shadow-card"
              >
                <div className="relative aspect-16/10 bg-brand-800">
                  <PitchImage src={stadium.mainImageUrl} alt={`${stadium.name} meydançası`} />
                  <span className="absolute left-3 top-3 rounded-full bg-ink-900/75 px-2.5 py-1 text-2xs font-bold text-white">
                    {stadium.size}
                  </span>
                </div>

                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div className="min-w-0">
                    <h3 className="truncate text-[15px] font-bold text-ink-900">{stadium.name}</h3>
                    <p className="mt-1 flex items-start gap-1.5 text-[13px] text-ink-500">
                      <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                      <span className="line-clamp-2">
                        {stadium.city}
                        {stadium.address ? `, ${stadium.address}` : ''}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="brand">{formatPrice(stadium.pricePerHour, true)}</Badge>
                    <Badge tone="outline">
                      <Clock className="size-3" aria-hidden="true" />
                      {formatTimeOnly(stadium.openTime)}–{formatTimeOnly(stadium.closeTime)}
                    </Badge>
                    <Badge tone="neutral">{stadium.surfaceType}</Badge>
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        id={switchId}
                        checked={activeState[entry.key] ?? true}
                        disabled={!id || toggleActive.isPending}
                        onCheckedChange={(checked) => {
                          if (!id) return
                          setActiveState((current) => ({ ...current, [entry.key]: checked }))
                          toggleActive.mutate({ stadiumId: id, active: checked })
                        }}
                      />
                      <label htmlFor={switchId} className="text-[13px] font-semibold text-ink-700">
                        {(activeState[entry.key] ?? true) ? 'Aktiv' : 'Deaktiv'}
                      </label>
                    </div>

                    <div className="flex items-center gap-1">
                      {id ? (
                        <Button variant="ghost" size="icon-sm" asChild aria-label="Stadionu redaktə et">
                          <Link to={`/owner/stadiums/${id}/edit`}>
                            <Pencil />
                          </Link>
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon-sm" disabled aria-label="Redaktə mümkün deyil">
                          <Pencil />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        disabled={!id}
                        aria-label="Stadionu sil"
                        onClick={() => setDeleteTarget(entry)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </div>

                  {!id ? (
                    <p className="text-xs text-warning">
                      Backend bu stadion üçün id qaytarmır — əməliyyatlar müvəqqəti bağlıdır.
                    </p>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title="Stadion silinsin?"
        description={
          deleteTarget
            ? `«${deleteTarget.stadium.name}» silinəcək. Bu əməliyyat geri qaytarılmır və gələcək bronlar itir.`
            : undefined
        }
        confirmLabel="Sil"
        loading={deleteStadium.isPending}
        onConfirm={() => void handleDelete()}
      />
    </div>
  )
}
