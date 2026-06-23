import { Card, Label, ProgressBar, Delta } from './ui.jsx'
import { Sparkline, MiniBars, Gauge } from './charts.jsx'
import { usd, num, pct } from '../lib/format.js'

function PacingBanner({ pacing }) {
  const { status, perDayNeeded, daysRemaining, remainingToTarget, target, revenueMonth } = pacing
  const toTargetPct = target > 0 ? revenueMonth / target : 0
  const copy = {
    ahead: { text: 'Ahead of pace', tone: 'ahead' },
    on: { text: 'On pace', tone: 'on' },
    behind: { text: 'Behind pace', tone: 'behind' },
  }[status]

  return (
    <Card className="col-span-full">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2.5">
            <Label>Monthly pacing</Label>
            <Delta status={copy.tone}>{copy.text}</Delta>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-semibold tracking-tight text-ink">{usd(revenueMonth)}</span>
            <span className="text-sm text-muted">of {usd(target)} target</span>
          </div>
          <p className="mt-2 text-sm text-muted">
            {remainingToTarget > 0 ? (
              <>
                <span className="font-semibold text-ink">{usd(perDayNeeded)}/day</span> needed across the
                remaining <span className="font-semibold text-ink">{daysRemaining}</span> day
                {daysRemaining === 1 ? '' : 's'}.
              </>
            ) : (
              <span className="font-medium text-positive">Monthly target reached — every close from here is upside.</span>
            )}
          </p>
          <ProgressBar value={toTargetPct} tone={status === 'behind' ? 'muted' : 'accent'} className="mt-4 max-w-md" />
        </div>
        <div className="w-full sm:w-44">
          <Gauge value={toTargetPct} label={pct(toTargetPct * 100)} sublabel="of target" />
        </div>
      </div>
    </Card>
  )
}

function StatCard({ label, value, sub, delta, chart }) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <Label>{label}</Label>
        {delta}
      </div>
      <div className="mt-3 text-2xl font-semibold tracking-tight text-ink">{value}</div>
      {sub && <div className="mt-1 text-xs text-muted">{sub}</div>}
      {chart && <div className="mt-3">{chart}</div>}
    </Card>
  )
}

function ActivityTile({ label, value, target, series, dataKey }) {
  const progress = target > 0 ? value / target : 0
  return (
    <Card>
      <div className="flex items-start justify-between">
        <Label>{label}</Label>
        <span className="text-2xs text-faint">{pct(progress * 100)}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-xl font-semibold text-ink">{num(value)}</span>
        <span className="text-xs text-faint">/ {num(target)}</span>
      </div>
      <ProgressBar value={progress} className="mt-2.5" />
      <div className="mt-3 -mb-1">
        <MiniBars data={series} dataKey={dataKey} height={32} />
      </div>
    </Card>
  )
}

function FunnelRow({ label, value, count }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted">{label}</span>
        <span className="font-semibold text-ink">{pct(value, value < 10 ? 1 : 0)}</span>
      </div>
      <ProgressBar value={value / 100} className="mt-1.5" />
    </div>
  )
}

function ConversionPanel({ conversions }) {
  return (
    <Card>
      <Label>Conversion funnel · this month</Label>
      <div className="mt-4 space-y-3.5">
        <FunnelRow label="Dial → Conversation" value={conversions.dialToConv} />
        <FunnelRow label="Conversation → Appointment" value={conversions.convToAppt} />
        <FunnelRow label="Appointment → Show" value={conversions.apptToShow} />
        <FunnelRow label="Show → Close" value={conversions.showToClose} />
      </div>
    </Card>
  )
}

const CATS = [
  { key: 'revenue', title: 'Revenue' },
  { key: 'closes', title: 'Closes' },
  { key: 'dials', title: 'Dials' },
  { key: 'streak', title: 'Streak' },
]

function MilestonePanel({ milestones }) {
  return (
    <Card>
      <Label>Milestones</Label>
      <div className="mt-4 space-y-4">
        {CATS.map((c) => {
          const list = milestones[c.key] || []
          const unlocked = list.filter((m) => m.unlocked).length
          return (
            <div key={c.key}>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-muted">{c.title}</span>
                <span className="text-2xs text-faint">{unlocked}/{list.length}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {list.map((m) => (
                  <span
                    key={m.label}
                    title={m.unlocked ? `Unlocked: ${m.label}` : `${m.label} — ${pct(m.progress * 100)}`}
                    className={`rounded-md border px-2 py-1 text-2xs font-medium transition-colors ${
                      m.unlocked
                        ? 'border-accent/30 bg-accent/10 text-accent'
                        : 'border-line bg-base text-faint'
                    }`}
                  >
                    {m.label}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

export default function Dashboard({ d }) {
  const revSeries = d.series.map((s) => ({ date: s.date, v: s.revenue }))
  const closeSeries = d.series.map((s) => ({ date: s.date, v: s.closes }))
  const t = d.targets

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <PacingBanner pacing={d.pacing} />

      <StatCard
        label="Revenue · this month"
        value={usd(d.revenueMonth)}
        sub={`Target ${usd(t.revenue)}`}
        delta={<Delta status={d.pacing.status}>{pct(t.revenue ? (d.revenueMonth / t.revenue) * 100 : 0)}</Delta>}
        chart={<Sparkline data={revSeries} dataKey="v" />}
      />
      <StatCard
        label="Closes · this month"
        value={num(d.closesMonth)}
        sub={`Target ${num(t.closes)}`}
        delta={<Delta status={d.closesMonth >= t.closes ? 'ahead' : 'neutral'}>{num(d.closesMonth)}/{num(t.closes)}</Delta>}
        chart={<MiniBars data={closeSeries} dataKey="v" />}
      />
      <StatCard
        label="Lifetime earned"
        value={usd(d.lifetimeEarned)}
        sub={`${num(d.totalCloses)} deals all-time`}
      />
      <StatCard
        label="Current streak"
        value={`${d.streak} days`}
        sub={`Best ${d.bestStreak} days · ${d.rank.current.name}`}
        delta={<Delta status={d.streak > 0 ? 'ahead' : 'neutral'}>{d.streak > 0 ? 'active' : 'idle'}</Delta>}
      />

      <ActivityTile label="Dials" value={d.monthActivity.dials} target={t.dials} series={d.series} dataKey="dials" />
      <ActivityTile label="Conversations" value={d.monthActivity.conversations} target={t.conversations} series={d.series} dataKey="conversations" />
      <ActivityTile label="Appointments set" value={d.monthActivity.appointments} target={t.appointments} series={d.series} dataKey="appointments" />
      <ActivityTile label="Show-ups" value={d.monthActivity.shows} target={t.shows} series={d.series} dataKey="shows" />

      <div className="col-span-full grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ConversionPanel conversions={d.conversions} />
        <MilestonePanel milestones={d.milestones} />
      </div>
    </div>
  )
}
