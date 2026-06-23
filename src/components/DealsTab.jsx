import { Card, EmptyState } from './ui.jsx'
import { dealPayout } from '../lib/calc.js'
import { usd, prettyDate, num } from '../lib/format.js'

function TrashButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-md p-1.5 text-faint opacity-0 transition-colors hover:bg-negative/10 hover:text-negative group-hover:opacity-100"
      aria-label="Delete"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      </svg>
    </button>
  )
}

export default function DealsTab({ deals, onDelete }) {
  const sorted = [...deals].sort((a, b) => (a.date < b.date ? 1 : -1))
  const totalPayout = deals.reduce((s, d) => s + dealPayout(d), 0)
  const totalCollected = deals.reduce((s, d) => s + (Number(d.collected) || 0), 0)

  if (!deals.length) {
    return <EmptyState title="No deals logged yet" hint="Use “Log Deal” to record your first close." />
  }

  return (
    <Card padded={false}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div className="text-sm font-medium text-ink">{num(deals.length)} deals</div>
        <div className="flex gap-6 text-sm">
          <span className="text-muted">Collected <span className="font-semibold text-ink">{usd(totalCollected)}</span></span>
          <span className="text-muted">Payout <span className="font-semibold text-accent">{usd(totalPayout)}</span></span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-2xs uppercase tracking-wider text-faint">
              <th className="px-5 py-2.5 font-medium">Prospect</th>
              <th className="px-3 py-2.5 font-medium">Date</th>
              <th className="px-3 py-2.5 text-right font-medium">Value</th>
              <th className="px-3 py-2.5 text-right font-medium">Collected</th>
              <th className="px-3 py-2.5 text-right font-medium">%</th>
              <th className="px-3 py-2.5 text-right font-medium">Payout</th>
              <th className="px-5 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((d) => (
              <tr key={d.id} className="group border-b border-line-soft last:border-0 hover:bg-white/[0.02]">
                <td className="px-5 py-3">
                  <div className="font-medium text-ink">{d.prospect || '—'}</div>
                  {d.notes && <div className="mt-0.5 max-w-xs truncate text-2xs text-faint">{d.notes}</div>}
                </td>
                <td className="px-3 py-3 text-muted">{prettyDate(d.date)}</td>
                <td className="px-3 py-3 text-right text-muted">{usd(d.value)}</td>
                <td className="px-3 py-3 text-right text-ink">{usd(d.collected)}</td>
                <td className="px-3 py-3 text-right text-muted">{num(d.commission)}%</td>
                <td className="px-3 py-3 text-right font-semibold text-accent">{usd(dealPayout(d), { cents: true })}</td>
                <td className="px-5 py-3 text-right"><TrashButton onClick={() => onDelete(d.id)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
