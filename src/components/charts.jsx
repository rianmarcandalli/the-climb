import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  Cell,
} from 'recharts'
import { prettyDate } from '../lib/format.js'

const ACCENT = '#23C7B1'
const GRID = '#23282F'
const AXIS = '#646C76'

export function Sparkline({ data, dataKey = 'v', height = 40, tone = ACCENT }) {
  const id = `spark-${dataKey}-${tone.replace('#', '')}`
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={tone} stopOpacity={0.28} />
            <stop offset="100%" stopColor={tone} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={tone}
          strokeWidth={1.75}
          fill={`url(#${id})`}
          isAnimationActive={false}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function MiniBars({ data, dataKey = 'v', height = 40, tone = ACCENT }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }} barCategoryGap={2}>
        <Bar dataKey={dataKey} radius={[2, 2, 0, 0]} isAnimationActive={false}>
          {data.map((_, i) => (
            <Cell key={i} fill={tone} fillOpacity={i === data.length - 1 ? 1 : 0.4} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function Gauge({ value, label, sublabel }) {
  const pct = Math.max(0, Math.min(1, value)) * 100
  const data = [{ name: 'g', value: pct, fill: ACCENT }]
  return (
    <div className="relative h-[124px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          innerRadius="74%"
          outerRadius="100%"
          data={data}
          startAngle={220}
          endAngle={-40}
          barSize={9}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar background={{ fill: '#1B2026' }} dataKey="value" cornerRadius={9} isAnimationActive={false} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-xl font-semibold text-ink">{label}</div>
        {sublabel && <div className="text-2xs text-faint">{sublabel}</div>}
      </div>
    </div>
  )
}

function TrendTooltip({ active, payload, label, formatter }) {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="rounded-lg border border-line bg-elevated px-3 py-2 text-xs shadow-lg">
      <div className="mb-0.5 font-medium text-faint">{prettyDate(label)}</div>
      <div className="font-semibold text-ink">
        {formatter ? formatter(payload[0].value) : payload[0].value}
      </div>
    </div>
  )
}

export function TrendChart({ data, dataKey, formatter, height = 320 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 12, bottom: 0, left: 4 }}>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={prettyDate}
          tick={{ fill: AXIS, fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: GRID }}
          minTickGap={24}
        />
        <YAxis
          tick={{ fill: AXIS, fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={44}
          tickFormatter={formatter}
        />
        <Tooltip content={<TrendTooltip formatter={formatter} />} cursor={{ stroke: GRID }} />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={ACCENT}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: ACCENT, stroke: '#0A0B0D', strokeWidth: 2 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
