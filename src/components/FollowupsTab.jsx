import { useState } from 'react'
import { Card, EmptyState } from './ui.jsx'
import { STATUSES } from './Modals.jsx'
import { prettyDate } from '../lib/format.js'

const STATUS_TONE = {
  Callback: 'border-accent/30 bg-accent/10 text-accent',
  'No-Show': 'border-negative/30 bg-negative/10 text-negative',
  'Not Interested': 'border-line bg-white/[0.04] text-faint',
  'Awaiting Response': 'border-warning/30 bg-warning/10 text-warning',
}

const DOT = {
  Callback: 'bg-accent',
  'No-Show': 'bg-negative',
  'Not Interested': 'bg-faint',
  'Awaiting Response': 'bg-warning',
}

export default function FollowupsTab({ followups, onDelete }) {
  const [filter, setFilter] = useState('All')
  const counts = STATUSES.reduce(
    (acc, s) => ({ ...acc, [s]: followups.filter((f) => f.status === s).length }),
    {},
  )
  const chips = [{ k: 'All', n: followups.length }, ...STATUSES.map((s) => ({ k: s, n: counts[s] }))]
  const shown =
    filter === 'All' ? followups : followups.filter((f) => f.status === filter)
  const sorted = [...shown].sort((a, b) => (a.date < b.date ? 1 : -1))

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {chips.map((c) => {
          const active = filter === c.k
          return (
            <button
              key={c.k}
              onClick={() => setFilter(c.k)}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? 'border-accent/40 bg-accent/10 text-accent'
                  : 'border-line bg-card text-muted hover:text-ink'
              }`}
            >
              {c.k}
              <span className={`rounded-full px-1.5 text-2xs ${active ? 'bg-accent/20' : 'bg-white/[0.06] text-faint'}`}>
                {c.n}
              </span>
            </button>
          )
        })}
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          title={followups.length ? `No “${filter}” follow-ups` : 'No follow-ups yet'}
          hint={followups.length ? 'Try a different filter.' : 'Use “Log Follow-Up” to start your pipeline.'}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {sorted.map((f) => (
            <Card key={f.id} className="group relative">
              <button
                onClick={() => onDelete(f.id)}
                className="absolute right-3 top-3 rounded-md p-1 text-faint opacity-0 transition-colors hover:bg-white/5 hover:text-ink group-hover:opacity-100"
                aria-label="Resolve"
                title="Remove from pipeline"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m20 6-11 11-5-5" /></svg>
              </button>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${DOT[f.status]}`} />
                <span className="font-medium text-ink">{f.prospect || '—'}</span>
              </div>
              <div className="mt-1 text-xs text-faint">{f.phone || 'No phone'} · {prettyDate(f.date)}</div>
              <div className="mt-3">
                <span className={`inline-flex rounded-md border px-2 py-0.5 text-2xs font-medium ${STATUS_TONE[f.status]}`}>
                  {f.status}
                </span>
              </div>
              {f.notes && <p className="mt-3 text-xs text-muted">{f.notes}</p>}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
