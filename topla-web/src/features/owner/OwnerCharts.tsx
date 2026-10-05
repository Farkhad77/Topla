import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartCard, ChartTooltip, axisProps, chartTheme } from '@/components/ui'
import type { TimeSeriesPoint } from '@/types'

const CURSOR_FILL = 'rgba(31,102,64,0.06)'
const MARGIN = { top: 8, right: 12, bottom: 0, left: 0 }

interface SeriesChartProps {
  title: string
  description?: string
  data: TimeSeriesPoint[]
  emptyLabel: string
  formatter: (value: number) => string
  height?: number
  className?: string
}

/** Sıfırlardan ibarət seriya data deyil — boş vəziyyət göstərilir. */
function hasSignal(data: TimeSeriesPoint[]): boolean {
  return data.some((point) => point.value > 0)
}

export function RevenueAreaChart({
  title,
  description,
  data,
  emptyLabel,
  formatter,
  height = 260,
  className,
}: SeriesChartProps) {
  return (
    <ChartCard
      title={title}
      description={description}
      isEmpty={!hasSignal(data)}
      emptyLabel={emptyLabel}
      height={height}
      className={className}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={MARGIN}>
          <CartesianGrid vertical={false} stroke={chartTheme.grid} />
          <XAxis dataKey="label" {...axisProps} />
          <YAxis {...axisProps} width={44} />
          <Tooltip
            cursor={{ fill: CURSOR_FILL }}
            content={<ChartTooltip formatter={formatter} />}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={chartTheme.series}
            strokeWidth={2}
            fill={chartTheme.seriesSoft}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

export function CountBarChart({
  title,
  description,
  data,
  emptyLabel,
  formatter,
  height = 260,
  className,
  allowDecimals = false,
}: SeriesChartProps & { allowDecimals?: boolean }) {
  return (
    <ChartCard
      title={title}
      description={description}
      isEmpty={!hasSignal(data)}
      emptyLabel={emptyLabel}
      height={height}
      className={className}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={MARGIN}>
          <CartesianGrid vertical={false} stroke={chartTheme.grid} />
          <XAxis dataKey="label" {...axisProps} />
          <YAxis {...axisProps} width={44} allowDecimals={allowDecimals} />
          <Tooltip
            cursor={{ fill: CURSOR_FILL }}
            content={<ChartTooltip formatter={formatter} />}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} fill={chartTheme.series} maxBarSize={38} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
