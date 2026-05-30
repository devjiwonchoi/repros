'use client'

// Layer 1 instrumentation: wrap window.fetch to time every server-function POST
// (correlated by the arg label found in the Flight body) and every /api/work
// control fetch. Combined with call-timing recorded by the harness, the gap
// between "called" and "network started" reveals action-queue wait time.

export type NetEntry = {
  id: number
  label: string
  kind: 'server-fn' | 'route'
  tStart: number
  tEnd: number | null
  status: number | null
}
export type CallEntry = {
  id: number
  label: string
  tStart: number
  tEnd: number | null
}

type Store = {
  installed: boolean
  t0: number
  net: NetEntry[]
  call: CallEntry[]
  labels: string[]
  seq: number
}

function getStore(): Store {
  const w = window as unknown as { __PROBE__?: Store }
  if (!w.__PROBE__) {
    w.__PROBE__ = {
      installed: false,
      t0: performance.now(),
      net: [],
      call: [],
      labels: [],
      seq: 0,
    }
  }
  return w.__PROBE__
}

const now = () => +(performance.now() - getStore().t0).toFixed(1)

export function setLabels(labels: string[]) {
  getStore().labels = labels
}

export function resetTimeline() {
  const s = getStore()
  s.net = []
  s.call = []
  s.t0 = performance.now()
}

export function getTimeline() {
  const s = getStore()
  return { net: s.net, call: s.call }
}

function findLabel(body: string, labels: string[]): string {
  for (const l of labels) {
    if (body.includes(`"${l}"`)) return l
  }
  return 'server-fn'
}

export function installProbe() {
  if (typeof window === 'undefined') return
  const s = getStore()
  if (s.installed) return
  s.installed = true
  const orig = window.fetch.bind(window)

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    let req: Request
    try {
      req = new Request(input, init)
    } catch {
      return orig(input as RequestInfo, init)
    }
    const url = req.url
    const isRoute = url.includes('/api/work')
    const action = req.headers.get('next-action')
    const isServerFn = req.method === 'POST' && !!action
    if (!isRoute && !isServerFn) return orig(input as RequestInfo, init)

    let label = 'unknown'
    if (isRoute) {
      try {
        label = new URL(url).searchParams.get('label') ?? 'route'
      } catch {}
    } else {
      try {
        label = findLabel(await req.clone().text(), s.labels)
      } catch {}
    }

    const entry: NetEntry = {
      id: ++s.seq,
      label,
      kind: isServerFn ? 'server-fn' : 'route',
      tStart: now(),
      tEnd: null,
      status: null,
    }
    s.net.push(entry)
    try {
      const res = await orig(input as RequestInfo, init)
      entry.tEnd = now()
      entry.status = res.status
      return res
    } catch (e) {
      entry.tEnd = now()
      entry.status = -1
      throw e
    }
  }
}

export function recordCall(label: string): CallEntry {
  const s = getStore()
  const e: CallEntry = { id: ++s.seq, label, tStart: now(), tEnd: null }
  s.call.push(e)
  return e
}

export function endCall(e: CallEntry) {
  e.tEnd = now()
}
