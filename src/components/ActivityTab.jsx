import { Card, EmptyState, Button } from './ui.jsx'
import { prettyDate, num } from '../lib/format.js'

export default function ActivityTab({ activity, onDelete, onEdit }) {
  const sorted = [...activity].sort((a, b) => (a.date < b.date ? 1 : -1))

  if (!activity.length) {
    return <EmptyState title="No activity logged yet" hint="Use “Log Activity” to record a day of dials." />
  }

  return (
    <Card padded={false}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-2xs uppercase tracking-wider text-faint">
              <th className="px-5 py-2.5 font-medium">Date</th>
              <th className="px-3 py-2.5 text-right font-medium">Dials</th>
              <th className="px-3 py-2.5 text-right font-medium">Convos</th>
              <th className="px-3 py-2.5 text-right font-medium">Appts</th>
              <th className="px-3 py-2.5 text-right font-medium">Shows</th>
              <th className="px-3 py-2.5 font-medium">Notes</th>
              <th className="px-5 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((a) => (
              <tr key={a.id} className="group border-b border-line-soft last:border-0 hover:bg-white/[0.02]">
                <td className="px-5 py-3 font-medium text-ink">{prettyDate(a.date)}</td>
                <td className="px-3 py-3 text-right text-ink">{num(a.dials)}</td>
                <td className="px-3 py-3 text-right text-muted">{num(a.conversations)}</td>
                <td className="px-3 py-3 text-right text-muted">{num(a.appointments)}</td>
                <td className="px-3 py-3 text-right text-muted">{num(a.shows)}</td>
                <td className="max-w-[14rem] truncate px-3 py-3 text-faint">{a.notes || '—'}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button onClick={() => onEdit(a)} className="rounded-md px-2 py-1 text-2xs text-muted hover:bg-white/5 hover:text-ink">Edit</button>
                    <button onClick={() => onDelete(a.id)} className="rounded-md px-2 py-1 text-2xs text-faint hover:bg-negative/10 hover:text-negative">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
