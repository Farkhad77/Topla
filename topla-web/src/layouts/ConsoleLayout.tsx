import { useState, type ComponentType, type ReactNode } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { ExternalLink, LogOut, Menu, User } from 'lucide-react'
import { Logo, LogoMark } from '@/components/brand/Logo'
import {
  Avatar,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils/cn'
import { ROLE_LABELS } from '@/utils/constants'

export interface ConsoleNavItem {
  to: string
  label: string
  icon: ComponentType<{ className?: string }>
  end?: boolean
  badge?: number
}

export interface ConsoleLayoutProps {
  variant: 'user' | 'owner' | 'admin'
  title: string
  subtitle?: string
  items: ConsoleNavItem[]
  headerAction?: ReactNode
}

const SHELL = {
  user: { sidebar: 'bg-surface border-r border-line', link: 'light' },
  owner: { sidebar: 'bg-brand-800', link: 'dark' },
  admin: { sidebar: 'bg-ink-900', link: 'dark' },
} as const

/**
 * Bütün panellər (user / owner / admin) eyni qabığı paylaşır —
 * yalnız naviqasiya siyahısı və vizual ton dəyişir. Kod təkrarı yoxdur.
 */
export function ConsoleLayout({ variant, title, subtitle, items, headerAction }: ConsoleLayoutProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const shell = SHELL[variant]

  const navigation = (
    <nav className="flex flex-col gap-0.5" aria-label={`${title} naviqasiyası`}>
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-md px-3 py-2.5 text-[13.5px] font-semibold transition-colors',
              shell.link === 'dark'
                ? isActive
                  ? 'bg-white/12 text-white'
                  : 'text-white/65 hover:bg-white/8 hover:text-white'
                : isActive
                  ? 'bg-brand-50 text-brand-800'
                  : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900',
            )
          }
        >
          <item.icon className="size-4.5 shrink-0" />
          <span className="truncate">{item.label}</span>
          {item.badge ? (
            <span
              className={cn(
                'ml-auto rounded-full px-1.5 py-0.5 text-2xs font-bold tabular-nums',
                shell.link === 'dark' ? 'bg-volt-400 text-brand-900' : 'bg-brand-700 text-white',
              )}
            >
              {item.badge}
            </span>
          ) : null}
        </NavLink>
      ))}
    </nav>
  )

  return (
    <div className="min-h-dvh bg-canvas lg:grid lg:grid-cols-[15rem_1fr]">
      {/* Desktop sidebar */}
      <aside className={cn('sticky top-0 hidden h-dvh flex-col p-4 lg:flex', shell.sidebar)}>
        <Link
          to="/"
          className="mb-6 flex items-center gap-2.5 px-1"
          aria-label="Topla — ana səhifə"
        >
          {shell.link === 'dark' ? (
            <>
              <LogoMark className="size-8" />
              <span className="text-[19px] font-extrabold tracking-[-0.045em] text-white">topla</span>
            </>
          ) : (
            <Logo />
          )}
        </Link>

        <div
          className={cn(
            'mb-4 rounded-md px-3 py-2.5',
            shell.link === 'dark' ? 'bg-white/8' : 'bg-ink-50',
          )}
        >
          <p
            className={cn(
              'truncate text-[13px] font-bold',
              shell.link === 'dark' ? 'text-white' : 'text-ink-900',
            )}
          >
            {user?.fullName ?? '—'}
          </p>
          <p
            className={cn(
              'truncate text-2xs',
              shell.link === 'dark' ? 'text-white/55' : 'text-ink-500',
            )}
          >
            {user?.roles.map((role) => ROLE_LABELS[role]).join(' · ')}
          </p>
        </div>

        {navigation}

        <div className="mt-auto pt-4">
          <Link
            to="/"
            className={cn(
              'flex items-center gap-2 rounded-md px-3 py-2.5 text-[13px] font-semibold transition-colors',
              shell.link === 'dark'
                ? 'text-white/60 hover:bg-white/8 hover:text-white'
                : 'text-ink-500 hover:bg-ink-100 hover:text-ink-900',
            )}
          >
            <ExternalLink className="size-4" />
            Sayta qayıt
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 border-b border-line bg-surface/85 backdrop-blur-md">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="secondary" size="icon" className="lg:hidden" aria-label="Menyu">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className={cn('p-4', shell.sidebar)}>
                <SheetTitle className="sr-only">{title} menyusu</SheetTitle>
                <div className="mb-6 px-1">
                  {shell.link === 'dark' ? (
                    <span className="text-[19px] font-extrabold tracking-[-0.045em] text-white">
                      topla
                    </span>
                  ) : (
                    <Logo />
                  )}
                </div>
                {navigation}
              </SheetContent>
            </Sheet>

            <div className="min-w-0">
              <h1 className="truncate text-[15px] font-bold text-ink-900">{title}</h1>
              {subtitle ? <p className="truncate text-xs text-ink-500">{subtitle}</p> : null}
            </div>

            <div className="ml-auto flex items-center gap-2">
              {headerAction}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full outline-offset-2" aria-label="Hesab menyusu">
                    <Avatar name={user?.fullName} size="sm" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>
                    <span className="block truncate">{user?.fullName ?? '—'}</span>
                    <span className="block truncate text-2xs font-normal text-ink-500">
                      {user?.email}
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuItem onSelect={() => navigate('/dashboard/profile')}>
                    <User />
                    Profil
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem danger onSelect={() => void logout()}>
                    <LogOut />
                    Çıxış
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
