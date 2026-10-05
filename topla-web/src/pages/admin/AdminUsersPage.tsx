import { Link } from 'react-router-dom'
import { ClipboardList, Ticket, UserCheck } from 'lucide-react'
import { Button, InlineNote } from '@/components/ui'
import { AdminPageHeader } from '@/features/admin/AdminPageHeader'
import { MissingEndpointNotice } from '@/features/admin/MissingEndpointNotice'
import {
  AssignModeratorCard,
  BlockUserCard,
  UnblockUserCard,
} from '@/features/admin/UserModerationCards'
import { RoleGate } from '@/components/common/RoleGate'
import { usePageMeta } from '@/hooks/usePageMeta'

const ID_SOURCES = [
  {
    to: '/admin/owner-requests',
    label: 'Sahibkar sorğuları',
    description: 'Sorğu detalında istifadəçinin tam id-si göstərilir.',
    icon: UserCheck,
  },
  {
    to: '/admin/bookings',
    label: 'Rezervasiyalar',
    description: 'Hər bronun sahibi «istifadəçi id» sütununda görünür.',
    icon: Ticket,
  },
  {
    to: '/admin/reviews',
    label: 'Rəylər',
    description: 'Şikayət olunan rəyin müəllif id-si rəy kartındadır.',
    icon: ClipboardList,
  },
]

export default function AdminUsersPage() {
  usePageMeta({ title: 'İstifadəçilər — Admin' })

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="İstifadəçilər"
        description="Blok konsolu: istifadəçini id-si ilə blokla və ya bloku götür."
      />

      <MissingEndpointNotice
        title="İstifadəçi siyahısı endpoint-i hazır deyil"
        description="Backend-də istifadəçiləri səhifələnmiş şəkildə qaytaran açıq endpoint yoxdur, ona görə burada axtarıla bilən siyahı göstərmirik — uydurma data göstərməkdənsə boşluğu açıq yazırıq. Blok və blokdan çıxarma əməliyyatları isə tam işləkdir: onlar istifadəçi id-si ilə çalışır."
        endpoint="GET /api/Users?pageNumber=&pageSize="
      >
        <div className="grid gap-2 sm:grid-cols-3">
          {ID_SOURCES.map((source) => (
            <Link
              key={source.to}
              to={source.to}
              className="flex items-start gap-2.5 rounded-md border border-line bg-ink-50/60 p-3 transition-colors hover:border-line-strong hover:bg-ink-100"
            >
              <source.icon className="mt-0.5 size-4 shrink-0 text-ink-500" aria-hidden="true" />
              <span className="min-w-0">
                <span className="block text-[13px] font-bold text-ink-900">{source.label}</span>
                <span className="block text-xs leading-relaxed text-ink-500">
                  {source.description}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </MissingEndpointNotice>

      <InlineNote tone="warning">
        Blok əməliyyatı dərhal qüvvəyə minir və istifadəçinin bütün gələcək rezervasiyalarına təsir
        edir. Səbəbi konkret yaz — bu qeyd moderasiya tarixçəsində qalır.
      </InlineNote>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <BlockUserCard />
        <UnblockUserCard />
        {/* Endpoint yalnız Admin-ə açıqdır — moderatora kartı göstərmirik */}
        <RoleGate roles={['Admin']}>
          <AssignModeratorCard />
        </RoleGate>
      </div>

      <div className="rounded-lg border border-line bg-surface p-5">
        <h3 className="text-sm font-bold text-ink-900">Id-ni haradan tapmaq olar?</h3>
        <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-ink-600">
          Hər sorğu, bron və rəy kartında istifadəçi id-si göstərilir. Kartdakı id-ni kopyalayıb
          yuxarıdakı formaya yapışdır — sistem GUID formatını olduğu kimi qəbul edir.
        </p>
        <Button asChild variant="secondary" size="sm" className="mt-3">
          <Link to="/admin/bookings">Rezervasiyalara keç</Link>
        </Button>
      </div>
    </div>
  )
}
