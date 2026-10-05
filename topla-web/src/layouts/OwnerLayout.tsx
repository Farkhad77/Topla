import {
  CalendarDays,
  CalendarRange,
  LayoutDashboard,
  Lock,
  MapPin,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react'
import { ConsoleLayout, type ConsoleNavItem } from './ConsoleLayout'
import { useAuth } from '@/hooks/useAuth'
import { isOwnerNotWorker } from '@/utils/permissions'

const BASE_ITEMS: ConsoleNavItem[] = [
  { to: '/owner', label: 'Ümumi baxış', icon: LayoutDashboard, end: true },
  { to: '/owner/bookings', label: 'Rezervasiyalar', icon: CalendarDays },
  { to: '/owner/calendar', label: 'Təqvim', icon: CalendarRange },
  { to: '/owner/stadiums', label: 'Stadionlarım', icon: MapPin },
  { to: '/owner/blocked-slots', label: 'Bloklanmış vaxtlar', icon: Lock },
  { to: '/owner/revenue', label: 'Gəlir', icon: TrendingUp },
  { to: '/owner/reviews', label: 'Rəylər', icon: Star },
]

const OWNER_ONLY: ConsoleNavItem = { to: '/owner/staff', label: 'İşçilər', icon: Users }

export function OwnerLayout() {
  const { user } = useAuth()
  // İşçi owner deyil: işçi idarəetməsi yalnız sahibkara görünür.
  const items = isOwnerNotWorker(user) ? [...BASE_ITEMS, OWNER_ONLY] : BASE_ITEMS

  return (
    <ConsoleLayout
      variant="owner"
      title="Sahibkar paneli"
      subtitle={isOwnerNotWorker(user) ? 'Sahibkar' : 'İşçi girişi'}
      items={items}
    />
  )
}
