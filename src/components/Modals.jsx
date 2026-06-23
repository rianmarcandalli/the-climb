import { useState } from 'react'
import { Modal, Field, Input, Textarea, Select, Button } from './ui.jsx'
import { todayKey } from '../lib/format.js'
import { usd } from '../lib/format.js'

export function DealModal({ onClose, onSave }) {
  const [f, setF] = useState({
    prospect: '',
    value: '',
    collected: '',
    commission: '15',
    date: todayKey(),
    notes: '',
  })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const payout = (Number(f.collected) || 0) * ((Number(f.commission) || 0) / 100)

  const submit = (e) => {
    e.preventDefault()
    if (!f.prospect.trim()) return
    onSave(f)
  }

  return (
    <Modal title="Log a Deal" subtitle="Record a close and what you collected" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Prospect name">
          <Input value={f.prospect} onChange={set('prospect')} placeholder="e.g. Jordan Avery" autoFocus />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Total deal value">
            <Input type="number" min="0" step="any" value={f.value} onChange={set('value')} placeholder="0" />
          </Field>
          <Field label="Collected so far">
            <Input type="number" min="0" step="any" value={f.collected} onChange={set('collected')} placeholder="0" />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Commission %">
            <Input type="number" min="0" step="any" value={f.commission} onChange={set('commission')} placeholder="15" />
          </Field>
          <Field label="Date">
            <Input type="date" value={f.date} onChange={set('date')} />
          </Field>
        </div>
        <Field label="Notes">
          <Textarea value={f.notes} onChange={set('notes')} placeholder="Optional context, payment plan, etc." />
        </Field>

        <div className="flex items-center justify-between rounded-lg border border-line bg-base px-4 py-3">
          <span className="text-xs font-medium uppercase tracking-wide text-faint">Your payout</span>
          <span className="text-lg font-semibold text-accent">{usd(payout, { cents: true })}</span>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">Save deal</Button>
        </div>
      </form>
    </Modal>
  )
}

export function ActivityModal({ onClose, onSave, existingDates = [], initial }) {
  const [f, setF] = useState(() =>
    initial
      ? {
          date: initial.date,
          dials: String(initial.dials ?? ''),
          conversations: String(initial.conversations ?? ''),
          appointments: String(initial.appointments ?? ''),
          shows: String(initial.shows ?? ''),
          notes: initial.notes ?? '',
        }
      : {
          date: todayKey(),
          dials: '',
          conversations: '',
          appointments: '',
          shows: '',
          notes: '',
        },
  )
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const overwrites = existingDates.includes(f.date)

  const submit = (e) => {
    e.preventDefault()
    onSave(f)
  }

  return (
    <Modal title="Log Activity" subtitle="One entry per day — saving an existing date overwrites it" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Date" hint={overwrites ? 'An entry already exists for this date and will be overwritten.' : undefined}>
          <Input type="date" value={f.date} onChange={set('date')} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Dials">
            <Input type="number" min="0" value={f.dials} onChange={set('dials')} placeholder="0" autoFocus />
          </Field>
          <Field label="Conversations">
            <Input type="number" min="0" value={f.conversations} onChange={set('conversations')} placeholder="0" />
          </Field>
          <Field label="Appointments set">
            <Input type="number" min="0" value={f.appointments} onChange={set('appointments')} placeholder="0" />
          </Field>
          <Field label="Show-ups">
            <Input type="number" min="0" value={f.shows} onChange={set('shows')} placeholder="0" />
          </Field>
        </div>
        <Field label="Notes">
          <Textarea value={f.notes} onChange={set('notes')} placeholder="Optional" />
        </Field>
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">Save activity</Button>
        </div>
      </form>
    </Modal>
  )
}

const STATUSES = ['Callback', 'No-Show', 'Not Interested', 'Awaiting Response']

export function FollowupModal({ onClose, onSave }) {
  const [f, setF] = useState({
    prospect: '',
    phone: '',
    date: todayKey(),
    status: 'Callback',
    notes: '',
  })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const submit = (e) => {
    e.preventDefault()
    if (!f.prospect.trim()) return
    onSave(f)
  }

  return (
    <Modal title="Log Follow-Up" subtitle="Add a prospect to your pipeline" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Prospect name">
          <Input value={f.prospect} onChange={set('prospect')} placeholder="e.g. Sam Rivera" autoFocus />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Phone">
            <Input value={f.phone} onChange={set('phone')} placeholder="(555) 555-5555" />
          </Field>
          <Field label="Date">
            <Input type="date" value={f.date} onChange={set('date')} />
          </Field>
        </div>
        <Field label="Status">
          <Select value={f.status} onChange={set('status')}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
        </Field>
        <Field label="Notes">
          <Textarea value={f.notes} onChange={set('notes')} placeholder="Optional" />
        </Field>
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">Save follow-up</Button>
        </div>
      </form>
    </Modal>
  )
}

export { STATUSES }
