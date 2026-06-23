import { useEffect } from 'react'

export function Card({ className = '', children, padded = true }) {
  return (
    <div
      className={`rounded-xl border border-line bg-card shadow-soft ${
        padded ? 'p-5' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}

export function Label({ children, className = '' }) {
  return (
    <div
      className={`text-2xs font-medium uppercase tracking-[0.13em] text-faint ${className}`}
    >
      {children}
    </div>
  )
}

export function Metric({ value, sub, accent = false }) {
  return (
    <div>
      <div
        className={`text-2xl font-semibold leading-tight tracking-tight ${
          accent ? 'text-accent' : 'text-ink'
        }`}
      >
        {value}
      </div>
      {sub && <div className="mt-0.5 text-xs text-muted">{sub}</div>}
    </div>
  )
}

export function Delta({ status, children }) {
  const map = {
    ahead: 'text-positive bg-positive/10',
    on: 'text-accent bg-accent/10',
    behind: 'text-negative bg-negative/10',
    neutral: 'text-muted bg-white/5',
  }
  return (
    <span
      className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-2xs font-semibold ${
        map[status] || map.neutral
      }`}
    >
      {children}
    </span>
  )
}

export function ProgressBar({ value, className = '', tone = 'accent' }) {
  const pct = Math.max(0, Math.min(1, value)) * 100
  const bar = tone === 'accent' ? 'bg-accent' : tone === 'positive' ? 'bg-positive' : 'bg-muted'
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06] ${className}`}>
      <div
        className={`h-full rounded-full ${bar} transition-[width] duration-500`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export function Button({
  children,
  variant = 'default',
  className = '',
  ...props
}) {
  const styles = {
    primary:
      'bg-accent text-[#06100E] font-semibold hover:bg-accent/90 active:bg-accent/80',
    default:
      'border border-line bg-elevated text-ink hover:bg-line/40 hover:border-line',
    ghost: 'text-muted hover:text-ink hover:bg-white/5',
    danger: 'text-negative hover:bg-negative/10',
  }
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm transition-colors disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-2xs text-faint">{hint}</span>}
    </label>
  )
}

const inputCls =
  'w-full rounded-lg border border-line bg-base px-3 py-2 text-sm text-ink placeholder:text-faint outline-none transition-colors focus:border-accent/60 focus:ring-1 focus:ring-accent/30'

export function Input(props) {
  return <input className={inputCls} {...props} />
}

export function Textarea(props) {
  return <textarea className={`${inputCls} resize-none`} rows={3} {...props} />
}

export function Select({ children, ...props }) {
  return (
    <select className={`${inputCls} appearance-none`} {...props}>
      {children}
    </select>
  )
}

export function Modal({ title, subtitle, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:items-center"
      onMouseDown={onClose}
    >
      <div
        className="animate-fade w-full max-w-lg rounded-2xl border border-line bg-panel shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-line px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-ink">{title}</h3>
            {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="-mr-1 rounded-md p-1 text-faint transition-colors hover:bg-white/5 hover:text-ink"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

export function EmptyState({ title, hint }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line py-14 text-center">
      <p className="text-sm font-medium text-muted">{title}</p>
      {hint && <p className="mt-1 text-xs text-faint">{hint}</p>}
    </div>
  )
}
