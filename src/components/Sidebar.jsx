import { ProgressBar } from './ui.jsx'
import { usd } from '../lib/format.js'

const NAV = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'deals', label: 'Deals' },
  { id: 'followups', label: 'Follow-Ups' },
  { id: 'trend', label: 'Trend' },
  { id: 'activity', label: 'Activity Log' },
  { id: 'targets', label: 'Targets' },
]

function Icon({ id }) {
  const p = {
    dashboard: 'M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z',
    deals: 'M3 7h18M3 12h18M3 17h18',
    followups: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z',
    trend: 'm3 17 6-6 4 4 8-8M21 7h-4M21 7v4',
    activity: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2',
    targets: 'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0M12 12h.01',
  }
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d={p[id]} />
    </svg>
  )
}

export default function Sidebar({ tab, setTab, rank, streak }) {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-panel lg:flex">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 18 5-9 4 5 3-4 6 8" />
          </svg>
        </div>
        <div>
          <div className="text-sm font-semibold tracking-tight text-ink">The Climb</div>
          <div className="text-2xs text-faint">Sales performance</div>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-2">
        {NAV.map((n) => {
          const active = tab === n.id
          return (
            <button
              key={n.id}
              onClick={() => setTab(n.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? 'bg-accent/10 font-medium text-accent'
                  : 'text-muted hover:bg-white/[0.04] hover:text-ink'
              }`}
            >
              <Icon id={n.id} />
              {n.label}
            </button>
          )
        })}
      </nav>

      <div className="space-y-3 border-t border-line p-4">
        <div className="rounded-lg border border-line bg-card p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-medium uppercase tracking-wider text-faint">Rank</span>
            <span className="flex items-center gap-1 text-2xs font-semibold text-warning">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4.5 12.5h6L9 22l9.5-12.5h-6L13 2Z" /></svg>
              {streak}d
            </span>
          </div>
          <div className="mt-1.5 text-sm font-semibold text-ink">{rank.current.name}</div>
          {rank.next ? (
            <>
              <ProgressBar value={rank.progress} className="mt-2.5" />
              <div className="mt-1.5 text-2xs text-faint">
                {usd(rank.remaining)} to {rank.next.name}
              </div>
            </>
          ) : (
            <div className="mt-2 text-2xs text-accent">Top rank reached</div>
          )}
        </div>
      </div>
    </aside>
  )
}

export { NAV }
