import { RotateCcw } from 'lucide-react'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  DatePicker,
  Field,
  InlineNote,
  Segmented,
} from '@/components/ui'

export type RevenuePeriod = 'today' | 'week' | 'month' | 'year' | 'all'

export const REVENUE_PERIOD_LABELS: Record<RevenuePeriod, string> = {
  today: 'bu gün',
  week: 'bu həftə',
  month: 'bu ay',
  year: 'bu il',
  all: 'bütün dövr',
}

export function RevenuePeriodFilter({
  period,
  from,
  to,
  onPeriodChange,
  onFromChange,
  onToChange,
  onClearRange,
}: {
  period: RevenuePeriod
  from: Date | null
  to: Date | null
  onPeriodChange: (period: RevenuePeriod) => void
  onFromChange: (date: Date) => void
  onToChange: (date: Date) => void
  onClearRange: () => void
}) {
  const hasRange = !!from && !!to

  return (
    <Card>
      <CardHeader
        title="Dövr"
        action={
          hasRange ? (
            <Button variant="ghost" size="sm" onClick={onClearRange}>
              <RotateCcw />
              Aralığı təmizlə
            </Button>
          ) : null
        }
      />
      <CardBody className="space-y-4">
        <div className="w-full overflow-x-auto pb-1">
          <Segmented
            value={period}
            onChange={onPeriodChange}
            ariaLabel="Gəlir dövrü"
            options={[
              { value: 'today', label: 'Bu gün' },
              { value: 'week', label: 'Bu həftə' },
              { value: 'month', label: 'Bu ay' },
              { value: 'year', label: 'Bu il' },
              { value: 'all', label: 'Hamısı' },
            ]}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:max-w-xl">
          <Field label="Aralığın başlanğıcı">
            {({ id }) => (
              <DatePicker id={id} value={from} onChange={onFromChange} placeholder="Seçilməyib" />
            )}
          </Field>
          <Field label="Aralığın sonu">
            {({ id }) => (
              <DatePicker
                id={id}
                value={to}
                onChange={onToChange}
                minDate={from ?? undefined}
                placeholder="Seçilməyib"
              />
            )}
          </Field>
        </div>

        {hasRange ? (
          <InlineNote tone="info">
            Tarix aralığı seçilib — yuxarıdakı dövr düymələri nəzərə alınmır.
          </InlineNote>
        ) : null}
      </CardBody>
    </Card>
  )
}
