import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Info, KeyRound, Lock, LogOut, Mail, ShieldCheck, User } from 'lucide-react'
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  ConfirmDialog,
  ErrorState,
  InlineNote,
} from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { usePageMeta } from '@/hooks/usePageMeta'
import { ROLE_LABELS } from '@/utils/constants'

function InfoRow({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <div className="flex items-start gap-3 border-b border-line py-3.5 last:border-0 last:pb-0">
      <span
        className="grid size-8 shrink-0 place-items-center rounded-sm bg-ink-50 text-ink-500 [&_svg]:size-4"
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className="min-w-0">
        <dt className="text-xs font-semibold text-ink-500">{label}</dt>
        <dd className="mt-0.5 break-words text-sm font-semibold text-ink-900">{value}</dd>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  usePageMeta({ title: 'Profil' })

  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  async function handleLogout() {
    setBusy(true)
    await logout()
    setLogoutOpen(false)
    setBusy(false)
  }

  // Şifrə bərpası səhifəsi yalnız qonaqlar üçündür — ona görə əvvəlcə sessiyanı bağlayırıq.
  async function handlePasswordChange() {
    setBusy(true)
    await logout({ silent: true })
    setPasswordOpen(false)
    setBusy(false)
    navigate('/forgot-password')
  }

  if (!user) {
    return (
      <ErrorState title="Profil məlumatı yoxdur" description="Sessiya oxunmadı. Yenidən daxil ol." />
    )
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-extrabold tracking-tight text-ink-900">Profil</h1>
        <p className="text-sm text-ink-500">Hesab məlumatların və sessiya vəziyyətin.</p>
      </header>

      <Card>
        <CardBody className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <Avatar name={user.fullName} size="lg" className="size-14 text-base" />
          <div className="min-w-0">
            <p className="text-lg font-bold text-ink-900">{user.fullName}</p>
            <p className="mt-0.5 break-all text-[13px] text-ink-500">{user.email}</p>
            <div className="mt-2 flex flex-wrap justify-center gap-1.5 sm:justify-start">
              {user.roles.map((role) => (
                <Badge key={role} tone="brand" size="sm">
                  {ROLE_LABELS[role]}
                </Badge>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Hesab məlumatları" description="Bu məlumatlar giriş tokenindən oxunur." />
        <CardBody>
          <dl>
            <InfoRow icon={<User />} label="Ad və soyad" value={user.fullName} />
            <InfoRow icon={<Mail />} label="E-poçt" value={user.email} />
            <InfoRow
              icon={<ShieldCheck />}
              label="Rollar"
              value={user.roles.map((role) => ROLE_LABELS[role]).join(' · ')}
            />
          </dl>

          <InlineNote tone="info" icon={<Info />} className="mt-4">
            Profil redaktəsi hələ dəstəklənmir — server tərəfdə ad, e-poçt və nömrəni dəyişmək üçün
            endpoint yoxdur. Məlumatlarında səhv varsa dəstəklə əlaqə saxla.
          </InlineNote>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Təhlükəsizlik" />
        <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span
              className="grid size-8 shrink-0 place-items-center rounded-sm bg-ink-50 text-ink-500"
              aria-hidden="true"
            >
              <Lock className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-[13.5px] font-bold text-ink-900">Şifrə</p>
              <p className="mt-0.5 text-[13px] leading-relaxed text-ink-500">
                Şifrə e-poçta göndərilən link vasitəsilə dəyişdirilir.
              </p>
            </div>
          </div>
          <Button variant="secondary" onClick={() => setPasswordOpen(true)}>
            <KeyRound />
            Şifrəni dəyiş
          </Button>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-[13.5px] font-bold text-ink-900">Hesabdan çıx</p>
            <p className="mt-0.5 text-[13px] text-ink-500">
              Bu cihazda sessiyan bağlanacaq. Bronların silinmir.
            </p>
          </div>
          <Button variant="danger-soft" onClick={() => setLogoutOpen(true)}>
            <LogOut />
            Çıxış
          </Button>
        </CardBody>
      </Card>

      <ConfirmDialog
        open={passwordOpen}
        onOpenChange={(open) => {
          if (!busy) setPasswordOpen(open)
        }}
        title="Şifrəni dəyişmək üçün çıxış lazımdır"
        description="Bərpa linki yalnız hesabdan kənarda işləyir. Sessiyanı bağlayıb şifrə bərpası səhifəsinə keçirik."
        confirmLabel="Davam et"
        cancelLabel="İmtina"
        tone="primary"
        loading={busy}
        onConfirm={() => void handlePasswordChange()}
      />

      <ConfirmDialog
        open={logoutOpen}
        onOpenChange={(open) => {
          if (!busy) setLogoutOpen(open)
        }}
        title="Hesabdan çıxırsan?"
        description="Yenidən daxil olmaq üçün e-poçt və şifrən lazım olacaq."
        confirmLabel="Bəli, çıx"
        cancelLabel="Qal"
        loading={busy}
        onConfirm={() => void handleLogout()}
      />
    </div>
  )
}
