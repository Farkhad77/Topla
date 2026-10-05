import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle } from 'lucide-react'
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  Field,
  InlineNote,
  RatingInput,
  Textarea,
} from '@/components/ui'
import { reviewSchema, type ReviewFormValues } from '@/schemas/misc'
import { useCreateReview } from '@/hooks/queries/useReviewQueries'
import { errorMessage } from '@/api'

const COMMENT_MAX = 1000

interface ReviewDialogProps {
  stadiumId: string
  stadiumName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Rəy dialoqu — oyundan sonra "Rəy yaz" düymələri bunu açır. */
export function ReviewDialog({ stadiumId, stadiumName, open, onOpenChange }: ReviewDialogProps) {
  const createReview = useCreateReview()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, comment: '' },
  })

  // Dialoq hər açılanda təmiz forma.
  useEffect(() => {
    if (open) {
      reset({ rating: 0, comment: '' })
      setFormError(null)
    }
  }, [open, reset])

  const rating = watch('rating') ?? 0
  const comment = watch('comment') ?? ''
  const pending = isSubmitting || createReview.isPending

  async function onSubmit(values: ReviewFormValues) {
    setFormError(null)
    try {
      await createReview.mutateAsync({
        stadiumId,
        rating: values.rating,
        comment: values.comment.trim(),
      })
      onOpenChange(false)
    } catch (error) {
      setFormError(errorMessage(error))
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!pending) onOpenChange(next)
      }}
    >
      <DialogContent>
        <DialogHeader
          title="Rəy yaz"
          description={`${stadiumName} — oyun təcrübən başqalarına kömək edir.`}
        />

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogBody className="space-y-4">
            {formError ? (
              <div role="alert">
                <InlineNote tone="danger" icon={<AlertCircle />}>
                  {formError}
                </InlineNote>
              </div>
            ) : null}

            <Field label="Qiymətləndirmə" error={errors.rating?.message} required>
              {({ id, describedBy }) => (
                <div aria-describedby={describedBy}>
                  <RatingInput
                    id={id}
                    value={rating}
                    onChange={(next) => setValue('rating', next, { shouldValidate: true })}
                  />
                </div>
              )}
            </Field>

            <Field
              label="Rəyin"
              error={errors.comment?.message}
              hint={`Meydança, örtük, işıqlandırma, soyunub-geyinmə otağı… (${comment.length}/${COMMENT_MAX})`}
              required
            >
              {({ id, describedBy, invalid }) => (
                <Textarea
                  id={id}
                  rows={5}
                  maxLength={COMMENT_MAX}
                  placeholder="Meydança təmiz idi, işıqlandırma yaxşıdır…"
                  invalid={invalid}
                  aria-describedby={describedBy}
                  {...register('comment')}
                />
              )}
            </Field>
          </DialogBody>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              İmtina
            </Button>
            <Button type="submit" loading={pending}>
              Rəyi göndər
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
