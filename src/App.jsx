import { useEffect, useMemo, useState } from 'react'
import { api } from './api.js'
import { derive } from './lib/calc.js'
import { NAV } from './components/Sidebar.jsx'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './components/Dashboard.jsx'
import DealsTab from './components/DealsTab.jsx'
import FollowupsTab from './components/FollowupsTab.jsx'
import TrendTab from './components/TrendTab.jsx'
import ActivityTab from './components/ActivityTab.jsx'
import TargetsTab from './components/TargetsTab.jsx'
import { DealModal, ActivityModal, FollowupModal } from './components/Modals.jsx'
import { Button } from './components/ui.jsx'

const MONTH_LABEL = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

const PAGE = {
  dashboard: { title: 'Dashboard', sub: MONTH_LABEL },
  deals: { title: 'Deals', sub: 'Your full close ledger' },
  followups: { title: 'Follow-Ups', sub: 'Open pipeline' },
  trend: { title: 'Trend', sub: 'Daily performance' },
  activity: { title: 'Activity Log', sub: 'Every logged day' },
  targets: { title: 'Targets', sub: 'Monthly goals' },
}

function PlusIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export default function App() {
  const [state, setState] = useState(null)
  const [error, setError] = useState(null)
  const [tab, setTab] = useState('dashboard')
  const [modal, setModal] = useState(null) // 'deal' | 'activity' | 'followup'
  const [editActivity, setEditActivity] = useState(null)

  useEffect(() => {
    api.getState().then(setState).catch((e) => setError(e.message))
  }, [])

  const d = useMemo(() => (state ? derive(state) : null), [state])

  const refresh = async () => setState(await api.getState())

  const closeModal = () => {
    setModal(null)
    setEditActivity(null)
  }
  const after = async () => {
    await refresh()
    closeModal()
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center">
        <div>
          <div className="text-sm font-medium text-negative">Couldn’t reach the data server</div>
          <p className="mt-1 text-xs text-muted">Make sure the backend is running (npm run dev). {error}</p>
        </div>
      </div>
    )
  }

  if (!d) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-line border-t-accent" />
      </div>
    )
  }

  const page = PAGE[tab]

  return (
    <div className="flex h-full">
      <Sidebar tab={tab} setTab={setTab} rank={d.rank} streak={d.streak} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-line bg-base/85 backdrop-blur">
          <div className="flex items-center justify-between gap-4 px-5 py-4 lg:px-8">
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold tracking-tight text-ink">{page.title}</h1>
              <p className="text-xs text-muted">{page.sub}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button variant="default" onClick={() => setModal('followup')} className="hidden sm:inline-flex">
                <PlusIcon /> Follow-Up
              </Button>
              <Button variant="default" onClick={() => setModal('activity')} className="hidden sm:inline-flex">
                <PlusIcon /> Activity
              </Button>
              <Button variant="primary" onClick={() => setModal('deal')}>
                <PlusIcon /> Log Deal
              </Button>
            </div>
          </div>

          {/* Mobile nav */}
          <div className="flex gap-1 overflow-x-auto px-3 pb-2 lg:hidden">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => setTab(n.id)}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  tab === n.id ? 'bg-accent/10 text-accent' : 'text-muted'
                }`}
              >
                {n.label}
              </button>
            ))}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-5 py-6 lg:px-8">
          <div key={tab} className="animate-fade">
            {tab === 'dashboard' && <Dashboard d={d} />}
            {tab === 'deals' && <DealsTab deals={state.deals} onDelete={(id) => api.deleteDeal(id).then(refresh)} />}
            {tab === 'followups' && (
              <FollowupsTab followups={state.followups} onDelete={(id) => api.deleteFollowup(id).then(refresh)} />
            )}
            {tab === 'trend' && <TrendTab series={d.series} />}
            {tab === 'activity' && (
              <ActivityTab
                activity={state.activity}
                onDelete={(id) => api.deleteActivity(id).then(refresh)}
                onEdit={(a) => {
                  setEditActivity(a)
                  setModal('activity')
                }}
              />
            )}
            {tab === 'targets' && (
              <TargetsTab
                targets={state.targets}
                onSave={(t) => api.saveTargets(t).then(refresh)}
                onSeed={() => api.seed().then(refresh)}
                onReset={() => api.reset().then(refresh)}
              />
            )}
          </div>
        </main>
      </div>

      {modal === 'deal' && (
        <DealModal onClose={closeModal} onSave={(deal) => api.addDeal(deal).then(after)} />
      )}
      {modal === 'activity' && (
        <ActivityModal
          onClose={closeModal}
          initial={editActivity}
          existingDates={state.activity.map((a) => a.date)}
          onSave={(a) => api.saveActivity(a).then(after)}
        />
      )}
      {modal === 'followup' && (
        <FollowupModal onClose={closeModal} onSave={(f) => api.addFollowup(f).then(after)} />
      )}
    </div>
  )
}
