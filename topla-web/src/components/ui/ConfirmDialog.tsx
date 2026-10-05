import type { ReactNode } from 'react'
import { Button } from './Button'
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader } from './Dialog'

/** Geri dönüşü olmayan əməliyyatlar üçün — ləğv, silmə, rədd. */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Təsdiqlə',
  cancelLabel = 'İmtina',
  tone = 'danger',
  loading = false,
  onConfirm,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'danger' | 'primary'
  loading?: boolean
  onConfirm: () => void
  children?: ReactNode
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader title={title} description={description} />
        {children ? <DialogBody>{children}</DialogBody> : null}
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
