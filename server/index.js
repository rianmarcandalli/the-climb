import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { initStore, readDb, writeDb, usingPostgres, EMPTY_DB, DEFAULT_DB } from './store.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST_DIR = path.join(__dirname, '..', 'dist')
const PORT = process.env.PORT || 3001

const id = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8)

const app = express()
app.use(express.json())

// Small wrapper so a thrown error in an async route returns 500 instead of hanging.
const route = (handler) => (req, res) => {
  Promise.resolve(handler(req, res)).catch((err) => {
    console.error('[the-climb]', err)
    res.status(500).json({ error: 'server error' })
  })
}

// --- Read everything in one shot (the frontend hydrates from this) ---
app.get('/api/state', route(async (_req, res) => {
  res.json(await readDb())
}))

// --- Deals ---
app.post('/api/deals', route(async (req, res) => {
  const db = await readDb()
  const b = req.body || {}
  const deal = {
    id: id(),
    prospect: String(b.prospect || '').trim(),
    value: Number(b.value) || 0,
    collected: Number(b.collected) || 0,
    commission: Number(b.commission) || 0,
    date: b.date || new Date().toISOString().slice(0, 10),
    notes: String(b.notes || ''),
  }
  db.deals.push(deal)
  await writeDb(db)
  res.status(201).json(deal)
}))

app.delete('/api/deals/:id', route(async (req, res) => {
  const db = await readDb()
  db.deals = db.deals.filter((d) => d.id !== req.params.id)
  await writeDb(db)
  res.json({ ok: true })
}))

// --- Activity (one entry per date; posting an existing date overwrites it) ---
app.post('/api/activity', route(async (req, res) => {
  const db = await readDb()
  const b = req.body || {}
  const entry = {
    id: id(),
    date: b.date || new Date().toISOString().slice(0, 10),
    dials: Number(b.dials) || 0,
    conversations: Number(b.conversations) || 0,
    appointments: Number(b.appointments) || 0,
    shows: Number(b.shows) || 0,
    notes: String(b.notes || ''),
  }
  const existing = db.activity.find((a) => a.date === entry.date)
  if (existing) {
    entry.id = existing.id
    db.activity = db.activity.map((a) => (a.date === entry.date ? entry : a))
  } else {
    db.activity.push(entry)
  }
  await writeDb(db)
  res.status(201).json(entry)
}))

app.delete('/api/activity/:id', route(async (req, res) => {
  const db = await readDb()
  db.activity = db.activity.filter((a) => a.id !== req.params.id)
  await writeDb(db)
  res.json({ ok: true })
}))

// --- Follow-ups ---
app.post('/api/followups', route(async (req, res) => {
  const db = await readDb()
  const b = req.body || {}
  const f = {
    id: id(),
    prospect: String(b.prospect || '').trim(),
    phone: String(b.phone || ''),
    date: b.date || new Date().toISOString().slice(0, 10),
    status: b.status || 'Callback',
    notes: String(b.notes || ''),
  }
  db.followups.push(f)
  await writeDb(db)
  res.status(201).json(f)
}))

app.delete('/api/followups/:id', route(async (req, res) => {
  const db = await readDb()
  db.followups = db.followups.filter((f) => f.id !== req.params.id)
  await writeDb(db)
  res.json({ ok: true })
}))

// --- Targets ---
app.put('/api/targets', route(async (req, res) => {
  const db = await readDb()
  const b = req.body || {}
  const keys = ['revenue', 'closes', 'dials', 'conversations', 'appointments', 'shows']
  for (const k of keys) {
    if (b[k] !== undefined) db.targets[k] = Number(b[k]) || 0
  }
  await writeDb(db)
  res.json(db.targets)
}))

// --- Demo data: load realistic sample / clear everything ---
function sampleData() {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  const dom = now.getDate()
  const key = (day) => {
    const dt = new Date(y, m, day)
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
  }
  const dayOffset = (back) => {
    const dt = new Date(now)
    dt.setDate(dt.getDate() - back)
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
  }

  const dealSpecs = [
    { d: 2, prospect: 'Marcus Lane', value: 4000, collected: 4000, commission: 15, notes: 'Paid in full' },
    { d: 5, prospect: 'Priya Nair', value: 6000, collected: 3000, commission: 15, notes: '2-pay plan' },
    { d: 9, prospect: 'Devlin Co', value: 8000, collected: 8000, commission: 12, notes: '' },
    { d: 14, prospect: 'Sara Kim', value: 5000, collected: 2500, commission: 15, notes: 'Deposit' },
    { d: 18, prospect: 'Tom Boyd', value: 10000, collected: 5000, commission: 20, notes: 'Premium tier' },
    { d: 22, prospect: 'Nina Ross', value: 3000, collected: 3000, commission: 15, notes: '' },
  ].filter((s) => s.d <= dom)

  const deals = dealSpecs.map((s, i) => ({
    id: `seed-d${i}`,
    prospect: s.prospect,
    value: s.value,
    collected: s.collected,
    commission: s.commission,
    date: key(s.d),
    notes: s.notes,
  }))

  const actVals = [
    { dials: 72, conversations: 16, appointments: 4, shows: 3 },
    { dials: 88, conversations: 19, appointments: 5, shows: 3 },
    { dials: 64, conversations: 12, appointments: 3, shows: 2 },
    { dials: 95, conversations: 22, appointments: 6, shows: 4 },
    { dials: 80, conversations: 17, appointments: 4, shows: 3 },
    { dials: 58, conversations: 11, appointments: 3, shows: 2 },
    { dials: 70, conversations: 15, appointments: 4, shows: 2 },
    { dials: 90, conversations: 21, appointments: 6, shows: 4 },
    { dials: 41, conversations: 9, appointments: 2, shows: 1 },
  ]
  const activity = actVals.map((v, i) => ({
    id: `seed-a${i}`,
    date: dayOffset(actVals.length - 1 - i),
    ...v,
    notes: '',
  }))

  const followups = [
    { prospect: 'Alex Monroe', phone: '(555) 201-8841', back: 2, status: 'Callback', notes: 'Wants to talk to spouse, call back Wed' },
    { prospect: 'Jordan Pike', phone: '(555) 332-1190', back: 3, status: 'No-Show', notes: 'Missed 2pm, reschedule' },
    { prospect: 'Riley Chen', phone: '(555) 778-3402', back: 1, status: 'Awaiting Response', notes: 'Sent proposal' },
    { prospect: 'Casey Webb', phone: '(555) 640-2255', back: 4, status: 'Not Interested', notes: 'Budget not there' },
    { prospect: 'Sam Ortiz', phone: '(555) 905-7781', back: 0, status: 'Callback', notes: 'Very warm, asked about pricing' },
  ].map((f, i) => ({
    id: `seed-f${i}`,
    prospect: f.prospect,
    phone: f.phone,
    date: dayOffset(f.back),
    status: f.status,
    notes: f.notes,
  }))

  return { deals, activity, followups, targets: structuredClone(DEFAULT_DB.targets) }
}

app.post('/api/seed', route(async (_req, res) => {
  const data = sampleData()
  await writeDb(data)
  res.json(data)
}))

app.post('/api/reset', route(async (_req, res) => {
  const fresh = structuredClone(EMPTY_DB)
  await writeDb(fresh)
  res.json(fresh)
}))

// --- Serve built frontend in production ---
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR))
  app.get('*', (_req, res) => res.sendFile(path.join(DIST_DIR, 'index.html')))
}

initStore()
  .then(() => {
    app.listen(PORT, () => {
      const backend = usingPostgres ? 'Postgres' : 'local file'
      console.log(`[the-climb] API on http://localhost:${PORT} (data: ${backend})`)
    })
  })
  .catch((err) => {
    console.error('[the-climb] failed to start store:', err)
    process.exit(1)
  })
