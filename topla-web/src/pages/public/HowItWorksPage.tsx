import { Link } from 'react-router-dom'
import { CalendarCheck, CheckCircle2, LayoutDashboard, Search, Store, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui'
import { usePageMeta } from '@/hooks/usePageMeta'

const PLAYER_STEPS = [
  {
    icon: Search,
    title: 'Meydança tap',
    text: 'Şəhər, ölçü, örtük və qiymətə görə filtrlə. Hər stadionun şəkilləri və rəyləri açıqdır — qeydiyyat tələb olunmur.',
  },
  {
    icon: CalendarCheck,
    title: 'Boş saatı seç',
    text: 'Cədvəl real vaxtda yenilənir: tutulmuş və stadion sahibi tərəfindən bloklanmış saatlar seçilə bilmir.',
  },
  {
    icon: UserPlus,
    title: 'Hesab yarat',
    text: 'Bron etmək üçün qeydiyyatdan keç. E-poçtuna gələn kodu təsdiqləyəndə hesabın dərhal aktivləşir.',
  },
  {
    icon: CheckCircle2,
    title: 'Rezervasiyanı göndər',
    text: 'Yekun məbləği gör və təsdiqlə. Rezervasiya dərhal təsdiqlənir — statusunu panelindən izlə.',
  },
]

const OWNER_STEPS = [
  {
    icon: Store,
    title: 'Sahibkar sorğusu göndər',
    text: 'Profilindən müraciət et. Moderator adətən 24 saat ərzində yoxlayır.',
  },
  {
    icon: LayoutDashboard,
    title: 'Stadionu əlavə et',
    text: 'Qiymət, iş saatları, minimum/maksimum bron müddəti və şəkilləri təyin et.',
  },
  {
    icon: CalendarCheck,
    title: 'Rezervasiyaları idarə et',
    text: 'Bronları təsdiqlə və ya səbəbini yazaraq rədd et, təmir günlərini blokla, gəliri izlə.',
  },
]

export default function HowItWorksPage() {
  usePageMeta({
    title: 'Necə işləyir',
    description:
      'Topla-da meydança bron etmək və stadionunu platformaya əlavə etmək necə işləyir — addım-addım izah.',
  })

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
          Topla necə işləyir
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-600">
          Platforma iki tərəfi birləşdirir: oynamaq istəyən komandalar və meydançasını dolduran
          stadion sahibləri. Hər iki tərəf üçün proses aşağıdakı kimidir.
        </p>
      </header>

      <section className="mt-10" aria-labelledby="players-heading">
        <h2 id="players-heading" className="text-xl font-bold text-ink-900">
          Oyunçular üçün
        </h2>
        <ol className="mt-5 space-y-3">
          {PLAYER_STEPS.map((step, index) => (
            <li
              key={step.title}
              className="flex gap-4 rounded-lg border border-line bg-surface p-5"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-md bg-brand-50 text-brand-700">
                <step.icon className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-2xs font-bold uppercase tracking-wide text-brand-600">
                  Addım {index + 1}
                </p>
                <h3 className="mt-0.5 text-[15px] font-bold text-ink-900">{step.title}</h3>
                <p className="mt-1 text-[13.5px] leading-relaxed text-ink-600">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/stadiums">Stadionlara bax</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link to="/register">Hesab yarat</Link>
          </Button>
        </div>
      </section>

      <section className="mt-12" aria-labelledby="owners-heading">
        <h2 id="owners-heading" className="text-xl font-bold text-ink-900">
          Stadion sahibləri üçün
        </h2>
        <ol className="mt-5 grid gap-3 md:grid-cols-3">
          {OWNER_STEPS.map((step, index) => (
            <li key={step.title} className="rounded-lg border border-line bg-surface p-5">
              <span className="grid size-10 place-items-center rounded-md bg-brand-700 text-white">
                <step.icon className="size-5" aria-hidden="true" />
              </span>
              <p className="mt-4 text-2xs font-bold uppercase tracking-wide text-brand-600">
                Addım {index + 1}
              </p>
              <h3 className="mt-0.5 text-[15px] font-bold text-ink-900">{step.title}</h3>
              <p className="mt-1 text-[13.5px] leading-relaxed text-ink-600">{step.text}</p>
            </li>
          ))}
        </ol>

        <div className="mt-5">
          <Button asChild>
            <Link to="/dashboard/become-owner">Sahibkar sorğusu göndər</Link>
          </Button>
        </div>
      </section>

      <section className="mt-12 rounded-lg border border-line bg-surface p-6" aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="text-xl font-bold text-ink-900">
          Tez-tez verilən suallar
        </h2>
        <dl className="mt-5 space-y-5">
          <div>
            <dt className="text-[14.5px] font-bold text-ink-900">Bronu ləğv edə bilərəmmi?</dt>
            <dd className="mt-1 text-[13.5px] leading-relaxed text-ink-600">
              Bəli — oyuna ən azı 6 saat qalıbsa rezervasiyanı panelindən ləğv edə bilərsən. Bundan
              sonra ləğv düyməsi bağlanır.
            </dd>
          </div>
          <div>
            <dt className="text-[14.5px] font-bold text-ink-900">Qiymət niyə axşam dəyişir?</dt>
            <dd className="mt-1 text-[13.5px] leading-relaxed text-ink-600">
              18:00–22:00 aralığında başlayan bronlara 1.5x pik tarifi tətbiq olunur. Yekun məbləğ
              təsdiq ekranında göstərilir.
            </dd>
          </div>
          <div>
            <dt className="text-[14.5px] font-bold text-ink-900">Qeydiyyatsız baxa bilərəmmi?</dt>
            <dd className="mt-1 text-[13.5px] leading-relaxed text-ink-600">
              Bəli. Stadionlar, rəylər və boş saatlar hamıya açıqdır — yalnız bron etmək üçün hesab
              lazımdır.
            </dd>
          </div>
        </dl>
      </section>
    </div>
  )
}
