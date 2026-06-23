import { useState } from 'react'
import { Card, Label, Field, Input, Button } from './ui.jsx'

const FIELDS = [
  { key: 'revenue', label: 'Revenue target', prefix: '$' },
  { key: 'closes', label: 'Closes' },
  { key: 'dials', label: 'Dials' },
  { key: 'conversations', label: 'Conversations' },
  { key: 'appointments', label: 'Appointments set' },
  { key: 'shows', label: 'Show-ups' },
]

export default function TargetsTab({ targets, onSave, onSeed, onReset }) {
  const [form, setForm] = useState(() => ({ ...targets }))
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(null)
  const set = (k) => (e) => {
    setForm({ ...form, [k]: e.target.value })
    setSaved(false)
  }

  const submit = async (e) => {
    e.preventDefault()
    await onSave(form)
    setSaved(true)
  }

  const seed = async () => {
    setBusy('seed')
    await onSeed()
    setBusy(null)
  }
  const reset = async () => {
    if (!window.confirm('Clear all deals, activity, and follow-ups? This cannot be undone.')) return
    setBusy('reset')
    await onReset()
    setBusy(null)
  }

  return (
    <div className="max-w-2xl space-y-4">
    <Card>
      <Label>Monthly targets</Label>
      <p className="mt-2 text-sm text-muted">
        Everything on the dashboard — pacing, progress bars, and conversion goals — recalculates from these numbers.
      </p>
      <form onSubmit={submit} className="mt-5 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FIELDS.map((f) => (
            <Field key={f.key} label={f.label}>
              <div className="relative">
                {f.prefix && (
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-faint">
                    {f.prefix}
                  </span>
                )}
                <Input
                  type="number"
                  min="0"
                  value={form[f.key] ?? ''}
                  onChange={set(f.key)}
                  style={f.prefix ? { paddingLeft: '1.75rem' } : undefined}
                />
              </div>
            </Field>
          ))}
        </div>
        <div className="flex items-center gap-3 pt-1">
          <Button type="submit" variant="primary">Save targets</Button>
          {saved && <span className="text-xs font-medium text-positive">Saved.</span>}
        </div>
      </form>
    </Card>

    <Card>
      <Label>Demo data</Label>
      <p className="mt-2 text-sm text-muted">
        Load a realistic sample month to see the dashboard populated, or wipe everything back to an empty slate.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button type="button" variant="default" onClick={seed} disabled={busy !== null}>
          {busy === 'seed' ? 'Loading…' : 'Load sample data'}
        </Button>
        <Button type="button" variant="danger" onClick={reset} disabled={busy !== null}>
          {busy === 'reset' ? 'Clearing…' : 'Clear all data'}
        </Button>
      </div>
    </Card>
    </div>
  )
}
