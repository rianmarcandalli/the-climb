const json = async (res) => {
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

const send = (method, url, body) =>
  fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  }).then(json)

export const api = {
  getState: () => fetch('/api/state').then(json),

  addDeal: (d) => send('POST', '/api/deals', d),
  deleteDeal: (id) => send('DELETE', `/api/deals/${id}`),

  saveActivity: (a) => send('POST', '/api/activity', a),
  deleteActivity: (id) => send('DELETE', `/api/activity/${id}`),

  addFollowup: (f) => send('POST', '/api/followups', f),
  deleteFollowup: (id) => send('DELETE', `/api/followups/${id}`),

  saveTargets: (t) => send('PUT', '/api/targets', t),

  seed: () => send('POST', '/api/seed'),
  reset: () => send('POST', '/api/reset'),
}
