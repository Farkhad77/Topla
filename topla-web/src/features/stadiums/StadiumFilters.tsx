import { SlidersHorizontal, X } from 'lucide-react'
import {
  Button,
  Field,
  FilterChip,
  Input,
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  SimpleSelect,
} from '@/components/ui'
import { CITIES, STADIUM_SIZES, SURFACE_TYPES } from '@/utils/constants'
import type { StadiumFilters as Filters } from '@/types'

export const DEFAULT_FILTERS: Filters = {
  q: '',
  city: 'all',
  size: 'all',
  surface: 'all',
  minPrice: 0,
  maxPrice: 0,
  sort: 'popular',
}

export function countActiveFilters(filters: Filters): number {
  let count = 0
  if (filters.city !== 'all') count += 1
  if (filters.size !== 'all') count += 1
  if (filters.surface !== 'all') count += 1
  if (filters.minPrice > 0) count += 1
  if (filters.maxPrice > 0) count += 1
  return count
}

interface FiltersProps {
  value: Filters
  onChange: (next: Filters) => void
  /** Backend siyahısında olan real şəhərlər — sabit siyahı ilə birləşdirilir. */
  availableCities?: string[]
  resultCount?: number
}

function FilterFields({ value, onChange, availableCities = [] }: FiltersProps) {
  const cities = Array.from(new Set([...availableCities, ...CITIES])).sort((a, b) =>
    a.localeCompare(b, 'az'),
  )

  const set = <K extends keyof Filters>(key: K, next: Filters[K]) =>
    onChange({ ...value, [key]: next })

  return (
    <div className="space-y-5">
      <Field label="Şəhər">
        {({ id }) => (
          <SimpleSelect
            id={id}
            value={value.city}
            onValueChange={(next) => set('city', next)}
            options={[
              { value: 'all', label: 'Bütün şəhərlər' },
              ...cities.map((city) => ({ value: city, label: city })),
            ]}
          />
        )}
      </Field>

      <div className="space-y-2">
        <p className="text-[13px] font-semibold text-ink-800">Meydança ölçüsü</p>
        <div className="flex flex-wrap gap-1.5">
          <FilterChip active={value.size === 'all'} onClick={() => set('size', 'all')}>
            Hamısı
          </FilterChip>
          {STADIUM_SIZES.map((size) => (
            <FilterChip key={size} active={value.size === size} onClick={() => set('size', size)}>
              {size}
            </FilterChip>
          ))}
        </div>
      </div>

      <Field label="Örtük növü">
        {({ id }) => (
          <SimpleSelect
            id={id}
            value={value.surface}
            onValueChange={(next) => set('surface', next)}
            options={[
              { value: 'all', label: 'Fərq etməz' },
              ...SURFACE_TYPES.map((surface) => ({ value: surface, label: surface })),
            ]}
          />
        )}
      </Field>

      <div className="space-y-2">
        <p className="text-[13px] font-semibold text-ink-800">Saatlıq qiymət (₼)</p>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Minimum">
            {({ id }) => (
              <Input
                id={id}
                type="number"
                min={0}
                inputMode="numeric"
                placeholder="0"
                value={value.minPrice || ''}
                onChange={(event) => set('minPrice', Number(event.target.value) || 0)}
              />
            )}
          </Field>
          <Field label="Maksimum">
            {({ id }) => (
              <Input
                id={id}
                type="number"
                min={0}
                inputMode="numeric"
                placeholder="Limitsiz"
                value={value.maxPrice || ''}
                onChange={(event) => set('maxPrice', Number(event.target.value) || 0)}
              />
            )}
          </Field>
        </div>
      </div>
    </div>
  )
}

export function StadiumFiltersPanel(props: FiltersProps) {
  const active = countActiveFilters(props.value)

  return (
    <div className="rounded-lg border border-line bg-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold text-ink-900">Filtr</h2>
        {active > 0 ? (
          <Button
            variant="link"
            size="sm"
            onClick={() => props.onChange({ ...DEFAULT_FILTERS, q: props.value.q, sort: props.value.sort })}
          >
            Sıfırla
          </Button>
        ) : null}
      </div>
      <FilterFields {...props} />
    </div>
  )
}

/** Mobil: filtrlər aşağıdan açılan panelə keçir. */
export function StadiumFiltersSheet(props: FiltersProps) {
  const active = countActiveFilters(props.value)

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="secondary" className="lg:hidden">
          <SlidersHorizontal />
          Filtr
          {active > 0 ? (
            <span className="ml-0.5 rounded-full bg-brand-700 px-1.5 text-2xs font-bold text-white">
              {active}
            </span>
          ) : null}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="p-5">
        <SheetTitle className="mb-5 text-base font-bold">Filtrlər</SheetTitle>
        <FilterFields {...props} />
        <div className="sticky bottom-0 mt-6 flex gap-2 bg-surface pt-3">
          <Button
            variant="secondary"
            block
            onClick={() =>
              props.onChange({ ...DEFAULT_FILTERS, q: props.value.q, sort: props.value.sort })
            }
          >
            <X />
            Sıfırla
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
