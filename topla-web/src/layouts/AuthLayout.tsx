import { Link, Outlet } from 'react-router-dom'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'

const BENEFITS = [
  'Boş saatları real vaxtda gör',
  'Rezervasiyanı bir neçə klikə tamamla',
  'Bronlarını tək yerdən idarə et',
]

/** İki sütunlu auth qabığı: solda forma, sağda brend paneli (yalnız desktop). */
export function AuthLayout() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_minmax(0,28rem)]">
      <div className="relative hidden overflow-hidden bg-brand-800 lg:block">
        <div className="pitch-surface absolute inset-0 opacity-45" aria-hidden="true" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link to="/" aria-label="Topla — ana səhifə">
            <Logo tone="light" />
          </Link>

          <div className="max-w-md">
            <h2 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-white">
              Meydançanı tap,
              <br />
              saatı seç, oyna.
            </h2>
            <ul className="mt-8 space-y-3">
              {BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3 text-[15px] text-white/85">
                  <CheckCircle2 className="size-5 shrink-0 text-volt-400" aria-hidden="true" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-white/50">© {new Date().getFullYear()} Topla</p>
        </div>
      </div>

      <div className="flex flex-col justify-center bg-surface px-5 py-10 sm:px-10">
        <div className="mx-auto w-full max-w-sm">
          <Link to="/" className="mb-6 inline-block lg:hidden" aria-label="Topla — ana səhifə">
            <Logo />
          </Link>
          <Link
            to="/"
            className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-500 transition-colors hover:text-brand-700"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Ana səhifəyə qayıt
          </Link>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
