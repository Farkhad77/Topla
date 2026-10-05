import { RotateCcw, Search } from 'lucide-react'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  DatePicker,
  Field,
  Input,
  Segmented,
  SimpleSelect,
} from '@/components/ui'

export type BookingStatusFilter = 'all' | 'confirmed' | 'completed' | 'cancelled'

export interface OwnerBookingsFilterState {
  status: BookingStatusFilter
  stadiumId: string
  fromDate: Date | null
  toDate: Date | null
  search: string
}

export function OwnerBookingsFilters({
  value,
  stadiumOptions,
  hasFilters,
  onChange,
  onReset,
}: {
  value: OwnerBookingsFilterState
  stadiumOptions: { value: string; label: string }[]
  hasFilters: boolean
  onChange: (patch: Partial<OwnerBookingsFilterState>) => void
  onReset: () => void
}) {
  return (
    <Card>
      <CardHeader
        title="Filtrlər"
        description="Status, stadion və tarix serverdə süzülür; müştəri axtarışı açıq səhifədə işləyir."
        action={
          hasFilters ? (
            <Button variant="ghost" size="sm" onClick={onReset}>
              <RotateCcw />
              Sıfırla
            </Button>
          ) : null
        }
      />
      <CardBody className="space-y-4">
        {/* Mobil ekranda çip sırası kəsilməsin deyə üfüqi sürüşür. */}
        <div className="w-full overflow-x-auto pb-1">
          <Segmented
            value={value.status}
            onChange={(status) => onChange({ status })}
            ariaLabel="Status üzrə filtr"
            options={[
              { value: 'all', label: 'Hamısı' },
              { value: 'confirmed', label: 'Təsdiqlənib' },
              { value: 'completed', label: 'Tamamlanıb' },
              { value: 'cancelled', label: 'Ləğv edilib' },
            ]}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Field label="Stadion">
            {({ id }) => (
              <SimpleSelect
                id={id}
                ariaLabel="Stadion üzrə filtr"
                value={value.stadiumId}
                onValueChange={(stadiumId) => onChange({ stadiumId })}
                options={[{ value: 'all', label: 'Bütün stadionlar' }, ...stadiumOptions]}
              />
            )}
          </Field>

          <Field label="Başlanğıc tarixi">
            {({ id }) => (
              <DatePicker
                id={id}
                value={value.fromDate}
                onChange={(fromDate) => onChange({ fromDate })}
                placeholder="Hamısı"
              />
            )}
          </Field>

          <Field label="Son tarix">
            {({ id }) => (
              <DatePicker
                id={id}
                value={value.toDate}
                onChange={(toDate) => onChange({ toDate })}
                minDate={value.fromDate ?? undefined}
                placeholder="Hamısı"
              />
            )}
          </Field>

          <Field label="Müştəri axtar" hint="Yalnız bu səhifədə axtarır">
            {({ id, describedBy }) => (
              <Input
                id={id}
                type="search"
                aria-describedby={describedBy}
                value={value.search}
                onChange={(event) => onChange({ search: event.target.value })}
                placeholder="Müştəri adı"
                leading={<Search />}
              />
            )}
          </Field>
        </div>
      </CardBody>
    </Card>
  )
}
