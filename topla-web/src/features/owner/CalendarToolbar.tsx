import { Card, CardBody, CardHeader, DatePicker, Field, Segmented, SimpleSelect } from '@/components/ui'

export type CalendarView = 'day' | 'week'

export function CalendarToolbar({
  stadiumId,
  stadiumOptions,
  date,
  view,
  onStadiumChange,
  onDateChange,
  onViewChange,
}: {
  stadiumId: string
  stadiumOptions: { value: string; label: string }[]
  date: Date
  view: CalendarView
  onStadiumChange: (stadiumId: string) => void
  onDateChange: (date: Date) => void
  onViewChange: (view: CalendarView) => void
}) {
  return (
    <Card>
      <CardHeader title="Görünüş" description="Stadionu, tarixi və dövrü seç." />
      <CardBody className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Field label="Stadion">
          {({ id }) => (
            <SimpleSelect
              id={id}
              ariaLabel="Stadion seç"
              value={stadiumId}
              onValueChange={onStadiumChange}
              options={stadiumOptions}
              placeholder="Stadion seç"
            />
          )}
        </Field>

        <Field label="Tarix">
          {({ id }) => <DatePicker id={id} value={date} onChange={onDateChange} />}
        </Field>

        <div className="space-y-1.5">
          <p className="text-[13px] font-semibold text-ink-800">Dövr</p>
          <Segmented
            value={view}
            onChange={onViewChange}
            ariaLabel="Gün və ya həftə görünüşü"
            options={[
              { value: 'day', label: 'Gün' },
              { value: 'week', label: 'Həftə' },
            ]}
          />
        </div>
      </CardBody>
    </Card>
  )
}
