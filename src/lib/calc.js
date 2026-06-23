import { toKey, todayKey } from './format.js'

export const RANKS = [
  { name: 'Rookie Setter', min: 0 },
  { name: 'Setter', min: 1000 },
  { name: 'Senior Setter', min: 3000 },
  { name: 'Closer in Training', min: 7500 },
  { name: 'Closer', min: 15000 },
  { name: 'Senior Closer', min: 35000 },
  { name: 'Offer Owner Track', min: 75000 },
]

export const dealPayout = (d) =>
  (Number(d.collected) || 0) * ((Number(d.commission) || 0) / 100)

const monthKey = (key) => (key || '').slice(0, 7)

function rankInfo(lifetime) {
  let idx = 0
  for (let i = 0; i < RANKS.length; i++) {
    if (lifetime >= RANKS[i].min) idx = i
  }
  const current = RANKS[idx]
  const next = RANKS[idx + 1] || null
  let progress = 1
  let remaining = 0
  if (next) {
    const span = next.min - current.min
    progress = span > 0 ? Math.min(1, (lifetime - current.min) / span) : 1
    remaining = Math.max(0, next.min - lifetime)
  }
  return { current, next, progress, remaining, index: idx }
}

function runLengthStreak(activeSet, anchorAllowsToday = true) {
  const today = new Date()
  const cursor = new Date(today)
  if (anchorAllowsToday && !activeSet.has(toKey(cursor))) {
    // Don't penalize for not having logged today yet — start from yesterday.
    cursor.setDate(cursor.getDate() - 1)
  }
  let streak = 0
  while (activeSet.has(toKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

function bestStreakEver(sortedKeys) {
  if (!sortedKeys.length) return 0
  let best = 1
  let run = 1
  for (let i = 1; i < sortedKeys.length; i++) {
    const prev = new Date(sortedKeys[i - 1])
    const cur = new Date(sortedKeys[i])
    const diff = Math.round((cur - prev) / 86400000)
    if (diff === 1) run += 1
    else if (diff === 0) continue
    else run = 1
    if (run > best) best = run
  }
  return best
}

function buildMilestones({ lifetime, totalCloses, lifetimeDials, bestStreak }) {
  const make = (label, value, thresholds, fmt) =>
    thresholds.map((t) => ({
      label: `${fmt(t)} ${label}`,
      threshold: t,
      value,
      unlocked: value >= t,
      progress: Math.min(1, value / t),
    }))

  return {
    revenue: make('earned', lifetime, [1000, 5000, 10000, 25000, 50000, 100000], (t) =>
      t >= 1000 ? `$${t / 1000}k` : `$${t}`,
    ),
    closes: make('closes', totalCloses, [1, 5, 10, 25, 50, 100], (t) => `${t}`),
    dials: make('dials', lifetimeDials, [100, 500, 1000, 5000, 10000, 25000], (t) =>
      t >= 1000 ? `${t / 1000}k` : `${t}`,
    ),
    streak: make('day streak', bestStreak, [3, 7, 14, 30, 60, 100], (t) => `${t}`),
  }
}

function ratio(part, whole) {
  if (!whole) return 0
  return (part / whole) * 100
}

export function derive(state) {
  const deals = state.deals || []
  const activity = state.activity || []
  const followups = state.followups || []
  const targets = state.targets || {}

  const tkey = todayKey()
  const thisMonth = monthKey(tkey)

  // ---- Lifetime ----
  const lifetimeEarned = deals.reduce((s, d) => s + dealPayout(d), 0)
  const totalCloses = deals.length
  const lifetimeDials = activity.reduce((s, a) => s + (Number(a.dials) || 0), 0)

  // ---- This month ----
  const monthDeals = deals.filter((d) => monthKey(d.date) === thisMonth)
  const monthActivity = activity.filter((a) => monthKey(a.date) === thisMonth)

  const revenueMonth = monthDeals.reduce((s, d) => s + dealPayout(d), 0)
  const closesMonth = monthDeals.length
  const act = monthActivity.reduce(
    (s, a) => ({
      dials: s.dials + (Number(a.dials) || 0),
      conversations: s.conversations + (Number(a.conversations) || 0),
      appointments: s.appointments + (Number(a.appointments) || 0),
      shows: s.shows + (Number(a.shows) || 0),
    }),
    { dials: 0, conversations: 0, appointments: 0, shows: 0 },
  )

  // ---- Pacing ----
  const now = new Date()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const dayOfMonth = now.getDate()
  const daysRemaining = daysInMonth - dayOfMonth + 1
  const target = Number(targets.revenue) || 0
  const expectedByNow = target * (dayOfMonth / daysInMonth)
  const remainingToTarget = Math.max(0, target - revenueMonth)
  const perDayNeeded = daysRemaining > 0 ? remainingToTarget / daysRemaining : 0
  let paceStatus = 'on'
  if (target > 0) {
    const r = expectedByNow > 0 ? revenueMonth / expectedByNow : 1
    if (revenueMonth >= target) paceStatus = 'ahead'
    else if (r >= 1) paceStatus = 'ahead'
    else if (r >= 0.85) paceStatus = 'on'
    else paceStatus = 'behind'
  }

  // ---- Conversion funnel (month-to-date) ----
  const conversions = {
    dialToConv: ratio(act.conversations, act.dials),
    convToAppt: ratio(act.appointments, act.conversations),
    apptToShow: ratio(act.shows, act.appointments),
    showToClose: ratio(closesMonth, act.shows),
  }

  // ---- Streaks ----
  const activeSet = new Set([
    ...activity.map((a) => a.date),
    ...deals.map((d) => d.date),
  ])
  const sortedKeys = [...activeSet].sort()
  const streak = runLengthStreak(activeSet)
  const bestStreak = bestStreakEver(sortedKeys)

  // ---- Rank ----
  const rank = rankInfo(lifetimeEarned)

  // ---- Trend series (last 21 days) ----
  const WINDOW = 21
  const series = []
  for (let i = WINDOW - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = toKey(d)
    const dayDeals = deals.filter((x) => x.date === key)
    const a = activity.find((x) => x.date === key)
    series.push({
      date: key,
      revenue: dayDeals.reduce((s, x) => s + dealPayout(x), 0),
      closes: dayDeals.length,
      dials: a ? Number(a.dials) || 0 : 0,
      conversations: a ? Number(a.conversations) || 0 : 0,
      appointments: a ? Number(a.appointments) || 0 : 0,
      shows: a ? Number(a.shows) || 0 : 0,
    })
  }

  const milestones = buildMilestones({
    lifetime: lifetimeEarned,
    totalCloses,
    lifetimeDials,
    bestStreak,
  })

  return {
    lifetimeEarned,
    totalCloses,
    lifetimeDials,
    revenueMonth,
    closesMonth,
    monthActivity: act,
    targets,
    pacing: {
      target,
      revenueMonth,
      expectedByNow,
      daysInMonth,
      dayOfMonth,
      daysRemaining,
      perDayNeeded,
      remainingToTarget,
      status: paceStatus,
    },
    conversions,
    streak,
    bestStreak,
    rank,
    series,
    milestones,
    followups,
  }
}
