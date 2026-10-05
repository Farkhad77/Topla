import { BarChart3, LayoutDashboard, MapPin, Star, Ticket, UserCheck, Users } from 'lucide-react'
import { ConsoleLayout, type ConsoleNavItem } from './ConsoleLayout'

const ITEMS: ConsoleNavItem[] = [
  { to: '/admin', label: 'Ümumi baxış', icon: LayoutDashboard, end: true },
  { to: '/admin/owner-requests', label: 'Sahibkar sorğuları', icon: UserCheck },
  { to: '/admin/stadiums', label: 'Stadionlar', icon: MapPin },
  { to: '/admin/bookings', label: 'Rezervasiyalar', icon: Ticket },
  { to: '/admin/users', label: 'İstifadəçilər', icon: Users },
  { to: '/admin/reviews', label: 'Rəylər', icon: Star },
  { to: '/admin/stats', label: 'Statistika', icon: BarChart3 },
]

export function AdminLayout() {
  return <ConsoleLayout variant="admin" title="Admin paneli" subtitle="Platforma idarəetməsi" items={ITEMS} />
}
