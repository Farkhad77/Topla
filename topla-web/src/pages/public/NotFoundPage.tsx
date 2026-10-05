import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { Button } from '@/components/ui'
import { usePageMeta } from '@/hooks/usePageMeta'

export default function NotFoundPage() {
  usePageMeta({ title: 'Səhifə tapılmadı' })

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-canvas px-6 text-center">
      <div className="grid size-14 place-items-center rounded-full bg-brand-50 text-brand-700">
        <Compass className="size-6" />
      </div>
      <div className="space-y-2">
        <p className="text-4xl font-extrabold tracking-tight text-ink-900">404</p>
        <h1 className="text-lg font-bold text-ink-900">Bu səhifə mövcud deyil</h1>
        <p className="max-w-sm text-sm text-ink-500">
          Link köhnəlmiş və ya səhv yazılmış ola bilər. Aşağıdakı düymələrlə davam et.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link to="/">Ana səhifə</Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link to="/stadiums">Stadionlara bax</Link>
        </Button>
      </div>
    </div>
  )
}
