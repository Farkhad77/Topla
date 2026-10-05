import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, LogOut, Menu, ShieldCheck, Store, Ticket, User } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
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
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { canAccessAdminArea, canAccessOwnerArea } from '@/utils/permissions'
import { cn } from '@/utils/cn'
import { APP_NAME } from '@/utils/constants'

const NAV_LINKS = [
  { to: '/stadiums', label: 'Stadionlar' },
  { to: '/how-it-works', label: 'Necə işləyir' },
]

function navClass({ isActive }: { isActive: boolean }) {
  return cn(
    'rounded-sm px-3 py-2 text-sm font-semibold transition-colors',
    isActive ? 'text-brand-700' : 'text-ink-600 hover:text-ink-900',
  )
}

export function PublicLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <a
        href="#main"
        className="sr-only-focusable absolute left-4 top-4 z-100 rounded-sm bg-brand-700 px-4 py-2 text-sm font-semibold text-white"
      >
        Əsas məzmuna keç
      </a>

      <header className="sticky top-0 z-40 border-b border-line bg-surface/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-2 px-4 sm:px-6">
          <Link to="/" aria-label={`${APP_NAME} — ana səhifə`} className="shrink-0">
            <Logo />
          </Link>

          <nav className="ml-4 hidden items-center gap-1 md:flex" aria-label="Əsas naviqasiya">
            {NAV_LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} className={navClass}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {user ? (
              <>
                <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                  <Link to="/dashboard/bookings">
                    <Ticket />
                    Rezervasiyalarım
                  </Link>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="rounded-full outline-offset-2 transition-transform hover:scale-105"
                      aria-label="Hesab menyusu"
                    >
                      <Avatar name={user.fullName} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>
                      <span className="block truncate">{user.fullName}</span>
                      <span className="block truncate text-2xs font-normal text-ink-500">
                        {user.email}
                      </span>
                    </DropdownMenuLabel>
                    <DropdownMenuItem onSelect={() => navigate('/dashboard')}>
                      <LayoutDashboard />
                      Panelim
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => navigate('/dashboard/profile')}>
                      <User />
                      Profil
                    </DropdownMenuItem>
                    {canAccessOwnerArea(user) ? (
                      <DropdownMenuItem onSelect={() => navigate('/owner')}>
                        <Store />
                        Sahibkar paneli
                      </DropdownMenuItem>
                    ) : null}
                    {canAccessAdminArea(user) ? (
                      <DropdownMenuItem onSelect={() => navigate('/admin')}>
                        <ShieldCheck />
                        Admin paneli
                      </DropdownMenuItem>
                    ) : null}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem danger onSelect={() => void logout()}>
                      <LogOut />
                      Çıxış
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Daxil ol</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/register">Qeydiyyat</Link>
                </Button>
              </div>
            )}

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="secondary" size="icon" className="md:hidden" aria-label="Menyu">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="p-5">
                <SheetTitle className="mb-6 text-base font-bold">Menyu</SheetTitle>
                <nav className="flex flex-col gap-1" aria-label="Mobil naviqasiya">
                  {NAV_LINKS.map((link) => (
                    <SheetClose asChild key={link.to}>
                      <Link
                        to={link.to}
                        className="rounded-sm px-3 py-2.5 text-sm font-semibold text-ink-800 hover:bg-ink-100"
                      >
                        {link.label}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>

                <div className="mt-6 flex flex-col gap-2 border-t border-line pt-5">
                  {user ? (
                    <>
                      <SheetClose asChild>
                        <Button variant="secondary" block asChild>
                          <Link to="/dashboard">Panelim</Link>
                        </Button>
                      </SheetClose>
                      <Button variant="ghost" block onClick={() => void logout()}>
                        Çıxış
                      </Button>
                    </>
                  ) : (
                    <>
                      <SheetClose asChild>
                        <Button block asChild>
                          <Link to="/register">Qeydiyyat</Link>
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button variant="secondary" block asChild>
                          <Link to="/login">Daxil ol</Link>
                        </Button>
                      </SheetClose>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main id="main" className="flex-1">
        <Outlet />
      </main>

      <SiteFooter />
    </div>
  )
}

function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-line bg-surface sm:mt-16">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 sm:px-6 sm:py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-500">
            Topla — Azərbaycanda futbol meydançalarını onlayn tapmaq və bron etmək üçün platforma.
            Boş saatları gör, qiyməti müqayisə et, bir neçə klikə rezervasiya et.
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-ink-400">Platforma</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-600">
            <li>
              <Link to="/stadiums" className="hover:text-brand-700">
                Stadionlar
              </Link>
            </li>
            <li>
              <Link to="/how-it-works" className="hover:text-brand-700">
                Necə işləyir
              </Link>
            </li>
            <li>
              <Link to="/dashboard/become-owner" className="hover:text-brand-700">
                Stadion sahibi ol
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-ink-400">Hesab</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-600">
            <li>
              <Link to="/login" className="hover:text-brand-700">
                Daxil ol
              </Link>
            </li>
            <li>
              <Link to="/register" className="hover:text-brand-700">
                Qeydiyyat
              </Link>
            </li>
            <li>
              <Link to="/dashboard/bookings" className="hover:text-brand-700">
                Rezervasiyalarım
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-ink-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} Topla. Bütün hüquqlar qorunur.</p>
          <p>Bakı, Azərbaycan</p>
        </div>
      </div>
    </footer>
  )
}
