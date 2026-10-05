import { format } from 'date-fns'
import { az } from 'date-fns/locale'
import { cn } from '@/utils/cn'
import type { BlockedSlot, OwnerBooking } from '@/types'

export type CalendarCellState =
  | 'free'
  | 'booked'
  | 'blocked'
  | 'conflict'
  | 'past'
  | 'unavailable'

export interface CalendarCell {
  key: string
  day: Date
  hour: number
  state: CalendarCellState
  booking: OwnerBooking | null
  blocked: BlockedSlot | null
  bookingLabel: string | null
}

export interface CalendarColumn {
  day: Date
  cells: CalendarCell[]
}

const CELL_STYLES: Record<CalendarCellState, string> = {
  free: 'border-line bg-surface text-ink-500 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800',
  booked: 'border-success/25 bg-success-soft text-success',
  blocked: 'border-line-strong bg-ink-100 text-ink-600 hover:bg-ink-200',
  conflict: 'border-danger bg-danger-soft text-danger hover:brightness-95',
  past: 'border-line bg-ink-50 text-ink-400',
  unavailable: 'border-line-strong bg-ink-50 text-ink-500',
}

const CELL_LABELS: Record<CalendarCellState, string> = {
  free: 'Boş',
  booked: 'Bron',
  blocked: 'Bloklanıb',
  conflict: 'Toqquşma',
  past: 'Keçib',
  unavailable: 'Əlçatmaz',
}

function isInteractive(state: CalendarCellState): boolean {
  return state === 'free' || state === 'blocked' || state === 'conflict'
}

function hourLabel(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`
}

function CellContent({ cell }: { cell: CalendarCell }) {
  return (
    <>
      <span className="block text-2xs font-bold uppercase tracking-wide">
        {CELL_LABELS[cell.state]}
      </span>
      {cell.bookingLabel ? (
        <span className="mt-0.5 block truncate text-[12.5px] font-semibold">
          {cell.bookingLabel}
        </span>
      ) : null}
      {cell.state === 'blocked' && cell.blocked?.reason ? (
        <span className="mt-0.5 block truncate text-[12px]">{cell.blocked.reason}</span>
      ) : null}
    </>
  )
}

export function CalendarGrid({
  columns,
  hours,
  onSelect,
}: {
  columns: CalendarColumn[]
  hours: number[]
  onSelect: (cell: CalendarCell) => void
}) {
  return (
    <div className="scroll-shadow-x overflow-x-auto">
      <table className="w-full min-w-[38rem] border-collapse text-left">
        <caption className="sr-only">Stadion cədvəli — saat və gün üzrə</caption>
        <thead>
          <tr>
            <th scope="col" className="w-16 border-b border-line px-2 py-2 text-2xs font-bold uppercase text-ink-500">
              Saat
            </th>
            {columns.map((column) => (
              <th
                key={column.day.toISOString()}
                scope="col"
                className="border-b border-line px-2 py-2 text-2xs font-bold uppercase text-ink-500"
              >
                <span className="block capitalize text-ink-800">
                  {format(column.day, 'EEEEEE', { locale: az })}
                </span>
                <span className="block font-semibold text-ink-500">
                  {format(column.day, 'd MMM', { locale: az })}
                </span>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {hours.map((hour, hourIndex) => (
            <tr key={hour}>
              <th
                scope="row"
                className="whitespace-nowrap border-b border-line px-2 py-1 align-top text-2xs font-semibold tabular-nums text-ink-500"
              >
                {hourLabel(hour)}
              </th>

              {columns.map((column) => {
                const cell = column.cells[hourIndex]
                if (!cell) return <td key={`${column.day.toISOString()}-${hour}`} />

                return (
                  <td key={cell.key} className="border-b border-line p-1 align-top">
                    {isInteractive(cell.state) ? (
                      <button
                        type="button"
                        onClick={() => onSelect(cell)}
                        className={cn(
                          'block min-h-11 w-full rounded-sm border px-2 py-1.5 text-left transition-colors',
                          CELL_STYLES[cell.state],
                        )}
                      >
                        <CellContent cell={cell} />
                      </button>
                    ) : (
                      <div
                        className={cn(
                          'min-h-11 w-full rounded-sm border px-2 py-1.5',
                          CELL_STYLES[cell.state],
                        )}
                      >
                        <CellContent cell={cell} />
                      </div>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function CalendarLegend() {
  const items: CalendarCellState[] = ['free', 'booked', 'blocked', 'conflict', 'past']

  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {items.map((state) => (
        <li key={state} className="flex items-center gap-1.5 text-xs text-ink-600">
          <span
            className={cn('size-3 rounded-xs border', CELL_STYLES[state])}
            aria-hidden="true"
          />
          {CELL_LABELS[state]}
        </li>
      ))}
    </ul>
  )
}
