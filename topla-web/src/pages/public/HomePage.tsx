import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  CalendarCheck,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Timer,
  Wallet,
} from 'lucide-react'
import { Button, SimpleSelect, SkeletonCard, Input, EmptyState } from '@/components/ui'
import { StadiumCard } from '@/features/stadiums/StadiumCard'
import { useStadiumList } from '@/hooks/queries/useStadiumQueries'
import { usePageMeta } from '@/hooks/usePageMeta'
import { CITIES, STADIUM_SIZES } from '@/utils/constants'

const STEPS = [
  {
    icon: Search,
    title: 'Meydança tap',
    text: 'Şəhər, ölçü və qiymətə görə filtrlə. Hər stadionun şəkilləri, rəyləri və şərtləri bir ekranda.',
  },
  {
    icon: CalendarCheck,
    title: 'Boş saatı seç',
    text: 'Real vaxtda yenilənən cədvəldən boş slotu seç, müddəti təyin et, qiyməti dərhal gör.',
  },
  {
    icon: ShieldCheck,
    title: 'Təsdiqlə və oyna',
    text: 'Rezervasiyanı göndər — bron dərhal təsdiqlənir. Bronlarını panelindən izlə.',
  },
]

const BENEFITS = [
  { icon: Timer, title: 'Zəng etməyə ehtiyac yoxdur', text: 'Boş saatları özün gör, telefonla növbə gözləmə.' },
  { icon: Wallet, title: 'Şəffaf qiymət', text: 'Saatlıq tarif və axşam əmsalı bron etməzdən əvvəl göstərilir.' },
  { icon: ShieldCheck, title: 'Yoxlanılmış stadionlar', text: 'Hər meydança moderator təsdiqindən keçir.' },
  { icon: Sparkles, title: 'Real rəylər', text: 'Yalnız orada oynayanların qiymətləndirməsi.' },
]

export default function HomePage() {
  usePageMeta({
    title: 'Topla — Futbol meydançasını onlayn bron et',
    description:
      'Azərbaycanda futbol stadionlarını tap, boş saatları gör, qiymətləri müqayisə et və bir neçə klikə rezervasiya et.',
  })

  const navigate = useNavigate()
  const [city, setCity] = useState('all')
  const [size, setSize] = useState('all')
  const [query, setQuery] = useState('')

  const featured = useStadiumList(1, 6)

  function handleSearch() {
    const params = new URLSearchParams()
    if (city !== 'all') params.set('city', city)
    if (size !== 'all') params.set('size', size)
    if (query.trim()) params.set('q', query.trim())
    navigate(`/stadiums${params.toString() ? `?${params}` : ''}`)
  }

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-brand-800">
        <div className="pitch-surface absolute inset-0 opacity-40" aria-hidden="true" />
        <div
          className="absolute inset-0 bg-linear-to-b from-brand-900/20 via-brand-900/50 to-brand-900/85"
          aria-hidden="true"
        />

        <div className="relative mx-auto w-full max-w-7xl px-4 pb-10 pt-12 sm:px-6 sm:pb-20 sm:pt-24">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white/85 backdrop-blur-sm">
            <span className="size-1.5 rounded-full bg-volt-400" aria-hidden="true" />
            Azərbaycanda futbol meydançaları üçün rezervasiya platforması
          </p>

          <h1 className="mt-5 max-w-2xl text-3xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Meydançanı tap,
            <br />
            saatı seç, oyna.
          </h1>

          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
            5x5-dən 11x11-ə qədər stadionlar. Boş saatları real vaxtda gör, qiyməti müqayisə et və
            zəng etmədən rezervasiya et.
          </p>

          {/* Axtarış — hero-nun əsas hərəkəti */}
          <form
            className="mt-8 max-w-3xl rounded-lg bg-surface p-2.5 shadow-overlay"
            onSubmit={(event) => {
              event.preventDefault()
              handleSearch()
            }}
          >
            <div className="grid gap-2 sm:grid-cols-[1.4fr_1fr_0.8fr_auto]">
              <div className="sm:border-r sm:border-line sm:pr-2">
                <label htmlFor="hero-q" className="sr-only">
                  Stadion adı və ya ünvan
                </label>
                <Input
                  id="hero-q"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Stadion adı və ya ünvan"
                  leading={<Search />}
                  className="border-transparent focus:border-brand-600"
                />
              </div>

              <div className="sm:border-r sm:border-line sm:pr-2">
                <label htmlFor="hero-city" className="sr-only">
                  Şəhər
                </label>
                <SimpleSelect
                  id="hero-city"
                  value={city}
                  onValueChange={setCity}
                  className="border-transparent"
                  options={[
                    { value: 'all', label: 'Bütün şəhərlər' },
                    ...CITIES.map((item) => ({ value: item, label: item })),
                  ]}
                />
              </div>

              <div>
                <label htmlFor="hero-size" className="sr-only">
                  Ölçü
                </label>
                <SimpleSelect
                  id="hero-size"
                  value={size}
                  onValueChange={setSize}
                  className="border-transparent"
                  options={[
                    { value: 'all', label: 'Ölçü' },
                    ...STADIUM_SIZES.map((item) => ({ value: item, label: item })),
                  ]}
                />
              </div>

              <Button type="submit" size="lg" className="sm:w-auto">
                <Search />
                Axtar
              </Button>
            </div>
          </form>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-white/70">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4" aria-hidden="true" />
              Bakı, Gəncə, Sumqayıt və digər şəhərlər
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarCheck className="size-4" aria-hidden="true" />
              Gündəlik yenilənən cədvəl
            </span>
          </div>
        </div>
      </section>

      {/* POPULYAR STADIONLAR */}
      <section className="mx-auto w-full max-w-7xl px-4 py-9 sm:px-6 sm:py-14">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-ink-900 sm:text-2xl">Populyar stadionlar</h2>
            <p className="mt-1 text-sm text-ink-500">
              Platformada ən çox baxılan və bron olunan meydançalar.
            </p>
          </div>
          <Button variant="ghost" asChild>
            <Link to="/stadiums">
              Hamısına bax
              <ArrowRight />
            </Link>
          </Button>
        </div>

        {featured.isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : featured.isError ? (
          <EmptyState
            icon={<MapPin />}
            title="Stadionlar yüklənmədi"
            description="Serverlə bağlantı qurula bilmədi. Bir azdan yenidən cəhd et."
            action={
              <Button variant="secondary" onClick={() => void featured.refetch()}>
                Yenidən cəhd et
              </Button>
            }
          />
        ) : !featured.data?.items.length ? (
          <EmptyState
            icon={<MapPin />}
            title="Hələ dərc olunmuş stadion yoxdur"
            description="Stadion sahibisənsə, meydançanı platformaya əlavə et və ilk rezervasiyaları qəbul etməyə başla."
            action={
              <Button asChild>
                <Link to="/dashboard/become-owner">Stadion sahibi ol</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.data.items.map((stadium) => (
              <StadiumCard key={stadium.id} stadium={stadium} />
            ))}
          </div>
        )}
      </section>

      {/* NECƏ İŞLƏYİR */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto w-full max-w-7xl px-4 py-9 sm:px-6 sm:py-14">
          <h2 className="text-xl font-bold tracking-tight text-ink-900 sm:text-2xl">Topla necə işləyir</h2>
          <p className="mt-1 text-sm text-ink-500">Üç addım — beş dəqiqədən az.</p>

          <ol className="mt-8 grid gap-5 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title} className="relative rounded-lg border border-line bg-canvas p-5">
                <span className="grid size-9 place-items-center rounded-md bg-brand-700 text-white">
                  <step.icon className="size-4.5" aria-hidden="true" />
                </span>
                <p className="mt-4 text-2xs font-bold uppercase tracking-wide text-brand-600">
                  Addım {index + 1}
                </p>
                <h3 className="mt-1 text-base font-bold text-ink-900">{step.title}</h3>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-600">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ÜSTÜNLÜKLƏR */}
      <section className="mx-auto w-full max-w-7xl px-4 py-9 sm:px-6 sm:py-14">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((benefit) => (
            <div key={benefit.title} className="rounded-lg border border-line bg-surface p-5">
              <benefit.icon className="size-5 text-brand-700" aria-hidden="true" />
              <h3 className="mt-3 text-[15px] font-bold text-ink-900">{benefit.title}</h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-600">{benefit.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ŞƏHƏRLƏR */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-9 sm:px-6 sm:pb-14">
        <h2 className="text-xl font-bold tracking-tight text-ink-900 sm:text-2xl">Şəhərlər</h2>
        <p className="mt-1 text-sm text-ink-500">Bölgəni seç, mövcud meydançaları gör.</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {CITIES.map((item) => (
            <Link
              key={item}
              to={`/stadiums?city=${encodeURIComponent(item)}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-surface px-4 py-2 text-[13px] font-semibold text-ink-700 transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-800"
            >
              <MapPin className="size-3.5" aria-hidden="true" />
              {item}
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 sm:pb-16">
        <div className="relative overflow-hidden rounded-xl bg-brand-800 px-5 py-9 sm:px-12 sm:py-12">
          <div className="pitch-surface absolute inset-0 opacity-30" aria-hidden="true" />
          <div className="relative flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Stadionun var? Onu Topla-da qazanca çevir.
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-white/80">
                Boş saatlarını onlayn sat, rezervasiyaları tək paneldən idarə et, gəlir statistikanı
                izlə. Qeydiyyat pulsuzdur.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Button size="lg" variant="soft" asChild>
                <Link to="/dashboard/become-owner">Stadion sahibi ol</Link>
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="text-white hover:bg-white/10"
                asChild
              >
                <Link to="/how-it-works">Ətraflı oxu</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
