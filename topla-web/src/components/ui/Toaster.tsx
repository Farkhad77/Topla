import { Toaster as SonnerToaster } from 'sonner'

/** Bildiriş üslubu tək yerdə — komponentlərdə sonner birbaşa çağırılmır. */
export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-center"
      duration={4000}
      closeButton
      toastOptions={{
        classNames: {
          toast:
            'rounded-md border border-line bg-surface text-ink-900 shadow-overlay text-[13.5px] font-medium',
          description: 'text-ink-500 text-xs',
          actionButton: 'bg-brand-700 text-white',
          success: 'border-success/25',
          error: 'border-danger/25',
        },
      }}
    />
  )
}
