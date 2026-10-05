import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import { InlineNote } from '@/components/ui'

/** API xətaları üçün forma səviyyəli xəbərdarlıq — sahə xətalarından ayrıdır. */
export function FormAlert({ message }: { message: string | null }) {
  if (!message) return null

  return (
    <div role="alert">
      <InlineNote tone="danger" icon={<AlertCircle />}>
        {message}
      </InlineNote>
    </div>
  )
}

/** Şifrə xanasının içindəki göz düyməsi — hündürlüyü xananın tam boyudur (toxunma sahəsi). */
export function PasswordToggle({ shown, onToggle }: { shown: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={shown ? 'Şifrəni gizlət' : 'Şifrəni göstər'}
      className="flex h-10 w-9 items-center justify-center rounded-sm text-ink-500 transition-colors hover:text-ink-800"
    >
      {shown ? <EyeOff /> : <Eye />}
    </button>
  )
}
