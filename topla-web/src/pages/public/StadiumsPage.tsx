import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MapPin, Search, SearchX } from 'lucide-react'
import {
  Button,
  EmptyState,
  ErrorState,
  Input,
  Pagination,
  SimpleSelect,
  SkeletonCard,
} from '@/components/ui'
import { StadiumCard } from '@/features/stadiums/StadiumCard'
import {
  DEFAULT_FILTERS,
  StadiumFiltersPanel,
  StadiumFiltersSheet,
  countActiveFilters,
} from '@/features/stadiums/StadiumFilters'
import { useAllStadiums } from '@/hooks/queries/useStadiumQueries'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { usePageMeta } from '@/hooks/usePageMeta'
import { STADIUM_SORTS, type StadiumFilters, type StadiumListItem, type StadiumSort } from '@/types'

const PAGE_SIZE = 12

const SORT_LABELS: Record<StadiumSort, string> = {
  popular: 'Populyarlıq',
  'price-asc': 'Qiymət: ucuzdan bahaya',
  'price-desc': 'Qiymət: bahadan ucuza',
  name: 'Ad (A–Z)',
  newest: 'Ən yeni',
}

function readFilters(params: URLSearchParams): StadiumFilters {
  const sort = params.get('sort') as StadiumSort | null
  return {
    q: params.get('q') ?? '',
    city: params.get('city') ?? 'all',
    size: params.get('size') ?? 'all',
    surface: params.get('surface') ?? 'all',
    minPrice: Number(params.get('min') ?? 0) || 0,
    maxPrice: Number(params.get('max') ?? 0) || 0,
    sort: sort && STADIUM_SORTS.includes(sort) ? sort : 'popular',
  }
}

function writeFilters(filters: StadiumFilters, page: number): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.q) params.set('q', filters.q)
  if (filters.city !== 'all') params.set('city', filters.city)
  if (filters.size !== 'all') params.set('size', filters.size)
  if (filters.surface !== 'all') params.set('surface', filters.surface)
  if (filters.minPrice) params.set('min', String(filters.minPrice))
  if (filters.maxPrice) params.set('max', String(filters.maxPrice))
  if (filters.sort !== 'popular') params.set('sort', filters.sort)
  if (page > 1) params.set('page', String(page))
  return params
}

/**
 * Backend `Stadiums/View` yalnız səhifələmə dəstəkləyir — filtr/sort parametri yoxdur.
 * Ona görə kataloq bir dəfə çəkilir və filtrlər client-side tətbiq olunur.
 * Backend filtr endpoint-i əlavə edəndə yalnız bu hissə dəyişməlidir.
 */
function applyFilters(items: StadiumListItem[], filters: StadiumFilters): StadiumListItem[] {
  const needle = filters.q.trim().toLowerCase()

  const filtered = items.filter((item) => {
    if (needle) {
      const haystack = `${item.name} ${item.city} ${item.address}`.toLowerCase()
      if (!haystack.includes(needle)) return false
    }
    if (filters.city !== 'all' && item.city !== filters.city) return false
    if (filters.size !== 'all' && item.size !== filters.size) return false
    if (filters.minPrice && item.pricePerHour < filters.minPrice) return false
    if (filters.maxPrice && item.pricePerHour > filters.maxPrice) return false
    return true
  })

  const sorted = [...filtered]
  switch (filters.sort) {
    case 'price-asc':
      sorted.sort((a, b) => a.pricePerHour - b.pricePerHour)
      break
    case 'price-desc':
      sorted.sort((a, b) => b.pricePerHour - a.pricePerHour)
      break
    case 'name':
      sorted.sort((a, b) => a.name.localeCompare(b.name, 'az'))
      break
    case 'newest':
      sorted.reverse()
      break
    default:
      break
  }
  return sorted
}

export default function StadiumsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState<StadiumFilters>(() => readFilters(searchParams))
  const [page, setPage] = useState(() => Number(searchParams.get('page') ?? 1) || 1)
  const [searchInput, setSearchInput] = useState(filters.q)
  const debouncedSearch = useDebouncedValue(searchInput, 300)

  const catalog = useAllStadiums()

  usePageMeta({
    title: 'Stadionlar',
    description:
      'Bütün futbol meydançalarını gör: şəhər, ölçü, örtük və qiymətə görə filtrlə, boş saatları yoxla.',
  })

  useEffect(() => {
    setFilters((current) => (current.q === debouncedSearch ? current : { ...current, q: debouncedSearch }))
  }, [debouncedSearch])

  useEffect(() => {
    setSearchParams(writeFilters(filters, page), { replace: true })
  }, [filters, page, setSearchParams])

  const results = useMemo(
    () => applyFilters(catalog.data ?? [], filters),
    [catalog.data, filters],
  )

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const visible = results.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const availableCities = useMemo(
    () => Array.from(new Set((catalog.data ?? []).map((item) => item.city).filter(Boolean))),
    [catalog.data],
  )

  function handleFiltersChange(next: StadiumFilters) {
    setFilters(next)
    setPage(1)
    if (next.q !== searchInput) setSearchInput(next.q)
  }

  const activeCount = countActiveFilters(filters)

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-8">
      <header className="mb-4 sm:mb-6">
        <h1 className="text-xl font-bold tracking-tight text-ink-900 sm:text-3xl">Stadionlar</h1>
        <p className="mt-1 text-sm text-ink-500">
          {catalog.isLoading
            ? 'Kataloq yüklənir…'
            : `${results.length} meydança tapıldı${activeCount ? ` · ${activeCount} filtr aktivdir` : ''}`}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <StadiumFiltersPanel
              value={filters}
              onChange={handleFiltersChange}
              availableCities={availableCities}
            />
          </div>
        </aside>

        <div className="min-w-0">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <div className="min-w-48 flex-1">
              <label htmlFor="stadium-search" className="sr-only">
                Stadion axtar
              </label>
              <Input
                id="stadium-search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Ad və ya ünvana görə axtar…"
                leading={<Search />}
                type="search"
              />
            </div>

            <StadiumFiltersSheet
              value={filters}
              onChange={handleFiltersChange}
              availableCities={availableCities}
            />

            <div className="w-full sm:w-56">
              <label htmlFor="stadium-sort" className="sr-only">
                Sıralama
              </label>
              <SimpleSelect
                id="stadium-sort"
                value={filters.sort}
                onValueChange={(next) => handleFiltersChange({ ...filters, sort: next as StadiumSort })}
                options={STADIUM_SORTS.map((sort) => ({ value: sort, label: SORT_LABELS[sort] }))}
              />
            </div>
          </div>

          {catalog.isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          ) : catalog.isError ? (
            <ErrorState
              title="Stadionlar yüklənmədi"
              description="Serverə qoşulmaq mümkün olmadı. Bağlantını yoxlayıb yenidən cəhd et."
              onRetry={() => void catalog.refetch()}
            />
          ) : !catalog.data?.length ? (
            <EmptyState
              icon={<MapPin />}
              title="Hələ dərc olunmuş stadion yoxdur"
              description="Moderator təsdiqindən keçmiş meydançalar burada görünəcək."
            />
          ) : !visible.length ? (
            <EmptyState
              icon={<SearchX />}
              title="Filtrlərə uyğun nəticə tapılmadı"
              description="Qiymət aralığını genişləndir və ya ölçü filtrini sıfırla."
              action={
                <Button
                  variant="secondary"
                  onClick={() => handleFiltersChange({ ...DEFAULT_FILTERS, sort: filters.sort })}
                >
                  Filtrləri sıfırla
                </Button>
              }
            />
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {visible.map((stadium) => (
                  <StadiumCard key={stadium.id} stadium={stadium} />
                ))}
              </div>

              <Pagination
                className="mt-8"
                page={safePage}
                totalPages={totalPages}
                totalCount={results.length}
                onChange={(next) => {
                  setPage(next)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
