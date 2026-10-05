import { Link } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { Button } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { usePageMeta } from '@/hooks/usePageMeta'
import { ROLE_LABELS } from '@/utils/constants'

export default function ForbiddenPage() {
  usePageMeta({ title: 'İcazə yoxdur' })
  const { user } = useAuth()

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-5 px-4 py-24 text-center">
      <div className="grid size-14 place-items-center rounded-full bg-danger-soft text-danger">
        <Lock className="size-6" />
      </div>
      <div className="space-y-2">
        <h1 className="text-lg font-bold text-ink-900">Bu bölməyə girişin yoxdur</h1>
        <p className="text-sm leading-relaxed text-ink-500">
          {user
            ? `Hesabın "${user.roles.map((role) => ROLE_LABELS[role]).join(', ')}" rolundadır və bu səhifə başqa rol üçün nəzərdə tutulub.`
            : 'Bu səhifəyə baxmaq üçün əvvəlcə daxil olmalısan.'}
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link to={user ? '/dashboard' : '/login'}>{user ? 'Panelimə qayıt' : 'Daxil ol'}</Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link to="/">Ana səhifə</Link>
        </Button>
      </div>
    </div>
  )
}
