import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data')
const DB_PATH = path.join(DATA_DIR, 'db.json')
const DATABASE_URL = process.env.DATABASE_URL

export const TARGETS = {
  revenue: 10000,
  closes: 8,
  dials: 1500,
  conversations: 300,
  appointments: 60,
  shows: 40,
}

// Real closed deals, baked in as the starting point for a brand-new database.
const BASELINE_DEALS = [
  { prospect: 'Laeshawn William', value: 47, collected: 47, commission: 40, notes: 'Low-ticket $47' },
  { prospect: 'Robert Andrews', value: 47, collected: 47, commission: 40, notes: 'Low-ticket $47' },
  { prospect: 'Jecon Kebreab', value: 47, collected: 47, commission: 40, notes: 'Low-ticket $47' },
  { prospect: 'Barath', value: 47, collected: 47, commission: 40, notes: 'Low-ticket $47' },
  { prospect: 'Brayden Smith', value: 47, collected: 47, commission: 40, notes: 'Low-ticket $47' },
  { prospect: 'Marcus Nays', value: 47, collected: 47, commission: 40, notes: 'Low-ticket $47' },
  { prospect: 'Carter', value: 47, collected: 47, commission: 40, notes: 'Low-ticket $47' },
  { prospect: 'Joseph', value: 47, collected: 47, commission: 40, notes: 'Low-ticket $47' },
  { prospect: 'Anthony', value: 47, collected: 47, commission: 40, notes: 'Low-ticket $47' },
  { prospect: 'Josh Cruz', value: 47, collected: 47, commission: 40, notes: 'Low-ticket $47' },
  { prospect: 'Daniel Yoon', value: 3500, collected: 1800, commission: 10, notes: 'Payment plan, paying over time' },
  { prospect: 'Landon', value: 5000, collected: 500, commission: 10, notes: '$500 down' },
  { prospect: 'Chasen', value: 5000, collected: 500, commission: 10, notes: '$500 down' },
].map((d, i) => ({ id: `base-${String(i + 1).padStart(2, '0')}`, date: '2026-06-23', ...d }))

export const DEFAULT_DB = {
  deals: BASELINE_DEALS,
  activity: [],
  followups: [],
  targets: TARGETS,
}

// "Clear all data" wipes to truly empty (not back to the baseline deals).
export const EMPTY_DB = { deals: [], activity: [], followups: [], targets: TARGETS }

function withDefaults(raw) {
  return {
    ...DEFAULT_DB,
    ...raw,
    targets: { ...DEFAULT_DB.targets, ...(raw?.targets || {}) },
  }
}

// --- Postgres backend (used when DATABASE_URL is set) -----------------------
let pool = null

async function initPostgres() {
  const pg = (await import('pg')).default
  pool = new pg.Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })
  await pool.query('CREATE TABLE IF NOT EXISTS app_state (id INT PRIMARY KEY, data JSONB NOT NULL)')
  await pool.query('INSERT INTO app_state (id, data) VALUES (1, $1) ON CONFLICT (id) DO NOTHING', [
    JSON.stringify(DEFAULT_DB),
  ])
}

async function pgRead() {
  const { rows } = await pool.query('SELECT data FROM app_state WHERE id = 1')
  return withDefaults(rows[0]?.data)
}

async function pgWrite(db) {
  await pool.query('UPDATE app_state SET data = $1 WHERE id = 1', [JSON.stringify(db)])
}

// --- File backend (local development fallback) ------------------------------
function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2))
}

function fileRead() {
  ensureFile()
  try {
    return withDefaults(JSON.parse(fs.readFileSync(DB_PATH, 'utf-8')))
  } catch {
    return structuredClone(DEFAULT_DB)
  }
}

function fileWrite(db) {
  ensureFile()
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2))
}

// --- Public API -------------------------------------------------------------
export const usingPostgres = Boolean(DATABASE_URL)

export async function initStore() {
  if (usingPostgres) await initPostgres()
}

export async function readDb() {
  return usingPostgres ? pgRead() : fileRead()
}

export async function writeDb(db) {
  return usingPostgres ? pgWrite(db) : fileWrite(db)
}
