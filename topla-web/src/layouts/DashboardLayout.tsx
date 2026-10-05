import { CalendarCheck, LayoutDashboard, Star, Store, User } from 'lucide-react'
import { ConsoleLayout, type ConsoleNavItem } from './ConsoleLayout'

const ITEMS: ConsoleNavItem[] = [
  { to: '/dashboard', label: 'Ümumi baxış', icon: LayoutDashboard, end: true },
  { to: '/dashboard/bookings', label: 'Rezervasiyalarım', icon: CalendarCheck },
  { to: '/dashboard/reviews', label: 'Rəylərim', icon: Star },
  { to: '/dashboard/become-owner', label: 'Stadion sahibi ol', icon: Store },
  { to: '/dashboard/profile', label: 'Profil', icon: User },
]

export function DashboardLayout() {
  return <ConsoleLayout variant="user" title="Panelim" items={ITEMS} />
}
