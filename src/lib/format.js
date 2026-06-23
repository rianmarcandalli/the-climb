export const usd = (n, opts = {}) => {
  const { compact = false, cents = false } = opts
  const v = Number(n) || 0
  if (compact && Math.abs(v) >= 1000) {
    return (
      '$' +
      v.toLocaleString('en-US', {
        notation: 'compact',
        maximumFractionDigits: 1,
      })
    )
  }
  return v.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  })
}

export const num = (n) => (Number(n) || 0).toLocaleString('en-US')

export const pct = (n, digits = 0) => `${(Number(n) || 0).toFixed(digits)}%`

export const todayKey = () => toKey(new Date())

export function toKey(d) {
  const dt = d instanceof Date ? d : new Date(d)
  const y = dt.getFullYear()
  const m = String(dt.getMonth() + 1).padStart(2, '0')
  const day = String(dt.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function prettyDate(key) {
  if (!key) return ''
  const [y, m, d] = key.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
