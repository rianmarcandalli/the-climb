import { useState } from 'react'
import { Card, Label } from './ui.jsx'
import { TrendChart } from './charts.jsx'
import { usd, num } from '../lib/format.js'

const METRICS = [
  { key: 'revenue', label: 'Revenue', fmt: (v) => usd(v, { compact: true }) },
  { key: 'closes', label: 'Closes', fmt: num },
  { key: 'dials', label: 'Dials', fmt: num },
  { key: 'conversations', label: 'Conversations', fmt: num },
  { key: 'appointments', label: 'Appointments', fmt: num },
  { key: 'shows', label: 'Show-ups', fmt: num },
]

export default function TrendTab({ series }) {
  const [metric, setMetric] = useState('revenue')
  const m = METRICS.find((x) => x.key === metric)
  const total = series.reduce((s, d) => s + (d[metric] || 0), 0)

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Label>Last 21 days</Label>
          <div className="mt-2 text-2xl font-semibold tracking-tight text-ink">
            {metric === 'revenue' ? usd(total) : num(total)}
          </div>
          <div className="text-xs text-muted">total {m.label.toLowerCase()}</div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {METRICS.map((x) => (
            <button
              key={x.key}
              onClick={() => setMetric(x.key)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                metric === x.key
                  ? 'bg-accent/10 text-accent'
                  : 'text-muted hover:bg-white/[0.04] hover:text-ink'
              }`}
            >
              {x.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-5">
        <TrendChart data={series} dataKey={metric} formatter={m.fmt} />
      </div>
    </Card>
  )
}
