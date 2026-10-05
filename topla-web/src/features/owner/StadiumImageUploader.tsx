import { useEffect, useRef, useState } from 'react'
import { ImagePlus, Star, Trash2, Upload } from 'lucide-react'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  InlineNote,
  Skeleton,
} from '@/components/ui'
import { PitchImage } from '@/components/brand/PitchImage'
import {
  useDeleteStadiumImage,
  useSetMainStadiumImage,
  useStadiumImages,
  useUploadStadiumImages,
} from '@/hooks/queries/useStadiumQueries'
import { errorMessage } from '@/api'
import type { StadiumImage } from '@/types'

const MAX_BYTES = 5 * 1024 * 1024
const MAX_LABEL = '5 MB'

interface PendingImage {
  file: File
  url: string
}

export function StadiumImageUploader({ stadiumId }: { stadiumId: string }) {
  const imagesQuery = useStadiumImages(stadiumId)
  const uploadImages = useUploadStadiumImages(stadiumId)
  const deleteImage = useDeleteStadiumImage(stadiumId)
  const setMainImage = useSetMainStadiumImage(stadiumId)

  const [pending, setPending] = useState<PendingImage[]>([])
  const [rejected, setRejected] = useState<string[]>([])
  const [deleteTarget, setDeleteTarget] = useState<StadiumImage | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const pendingRef = useRef<PendingImage[]>([])

  useEffect(() => {
    pendingRef.current = pending
  }, [pending])

  // Yalnız komponent söküləndə: object URL-lər sızmasın.
  useEffect(() => {
    return () => {
      pendingRef.current.forEach((item) => URL.revokeObjectURL(item.url))
    }
  }, [])

  function handleSelect(fileList: FileList | null) {
    if (!fileList) return
    const accepted: PendingImage[] = []
    const problems: string[] = []

    Array.from(fileList).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        problems.push(`${file.name} — yalnız şəkil faylı yükləmək olar`)
        return
      }
      if (file.size > MAX_BYTES) {
        problems.push(`${file.name} — ölçü ${MAX_LABEL}-dan böyükdür`)
        return
      }
      accepted.push({ file, url: URL.createObjectURL(file) })
    })

    setPending((current) => [...current, ...accepted])
    setRejected(problems)
    if (inputRef.current) inputRef.current.value = ''
  }

  function removePending(url: string) {
    URL.revokeObjectURL(url)
    setPending((current) => current.filter((item) => item.url !== url))
  }

  async function handleUpload() {
    if (!pending.length) return
    try {
      await uploadImages.mutateAsync(pending.map((item) => item.file))
      pending.forEach((item) => URL.revokeObjectURL(item.url))
      setPending([])
    } catch {
      // Xəta mesajı mutation hook-unda göstərilir; seçilmiş fayllar qalır.
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deleteImage.mutateAsync(deleteTarget.id)
      setDeleteTarget(null)
    } catch {
      // Dialoq açıq qalır.
    }
  }

  const images = imagesQuery.data ?? []

  return (
    <Card>
      <CardHeader
        title="Şəkillər"
        description={`İlk təəssürat şəkildən başlayır. Maksimum ${MAX_LABEL}, yalnız şəkil formatları.`}
        action={
          <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
            <ImagePlus />
            Şəkil seç
          </Button>
        }
      />

      <CardBody className="space-y-4">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          aria-label="Stadion şəkilləri seç"
          onChange={(event) => handleSelect(event.target.files)}
        />

        {rejected.length ? (
          <InlineNote tone="danger">
            <p className="font-semibold">Bəzi fayllar əlavə edilmədi:</p>
            <ul className="mt-1 list-disc pl-4">
              {rejected.map((problem) => (
                <li key={problem}>{problem}</li>
              ))}
            </ul>
          </InlineNote>
        ) : null}

        {pending.length ? (
          <div className="space-y-3 rounded-md border border-dashed border-line-strong p-3.5">
            <p className="text-[13px] font-semibold text-ink-800">
              Yüklənməyə hazır: {pending.length} şəkil
            </p>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {pending.map((item) => (
                <li key={item.url} className="relative overflow-hidden rounded-md border border-line">
                  <img
                    src={item.url}
                    alt={`Seçilmiş şəkil: ${item.file.name}`}
                    className="aspect-4/3 w-full object-cover"
                  />
                  <Button
                    variant="danger"
                    size="icon-sm"
                    className="absolute right-1.5 top-1.5"
                    aria-label={`${item.file.name} seçimini ləğv et`}
                    onClick={() => removePending(item.url)}
                  >
                    <Trash2 />
                  </Button>
                </li>
              ))}
            </ul>
            <Button
              size="sm"
              loading={uploadImages.isPending}
              onClick={() => void handleUpload()}
              className="min-h-10"
            >
              <Upload />
              Serverə yüklə
            </Button>
          </div>
        ) : null}

        {imagesQuery.isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="aspect-4/3 w-full rounded-md" />
            ))}
          </div>
        ) : imagesQuery.isError ? (
          <ErrorState
            title="Şəkillər yüklənmədi"
            description={errorMessage(imagesQuery.error)}
            onRetry={() => void imagesQuery.refetch()}
          />
        ) : images.length === 0 ? (
          <EmptyState
            icon={<ImagePlus />}
            title="Hələ şəkil yoxdur"
            description="Ən azı bir şəkil əlavə et — şəkilsiz elanlar demək olar ki, bron toplamır."
            compact
          />
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {images.map((image) => (
              <li key={image.id} className="overflow-hidden rounded-md border border-line bg-surface">
                <div className="relative aspect-4/3 bg-brand-800">
                  <PitchImage src={image.imageUrl} alt="Stadion şəkli" />
                  {image.isMain ? (
                    <span className="absolute left-2 top-2 rounded-full bg-brand-700 px-2 py-0.5 text-2xs font-bold text-white">
                      Əsas
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center justify-between gap-1 p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="min-h-10"
                    disabled={image.isMain || setMainImage.isPending}
                    onClick={() => setMainImage.mutate(image.id)}
                  >
                    <Star />
                    {image.isMain ? 'Əsasdır' : 'Əsas et'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Şəkli sil"
                    onClick={() => setDeleteTarget(image)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardBody>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title="Şəkil silinsin?"
        description="Bu əməliyyat geri qaytarılmır. Şəkil stadion səhifəsindən dərhal yox olacaq."
        confirmLabel="Sil"
        loading={deleteImage.isPending}
        onConfirm={() => void handleDelete()}
      />
    </Card>
  )
}
