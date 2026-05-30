'use client'

import { Suspense, useEffect, useState } from 'react'
import { runAction, cachedRead } from './actions'
import {
  installProbe,
  setLabels,
  resetTimeline,
  getTimeline,
  recordCall,
  endCall,
  type NetEntry,
  type CallEntry,
} from './probe-log'
import { Q1Result } from './q1-suspense'

const ALL_LABELS = ['blocker', 'q1-read', 'A', 'B', 'C']
const bust = () => Math.random().toString(36).slice(2, 8)
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

// Wrap a server-fn / fetch promise so we record when it was CALLED and when it
// RESOLVED, independent of when the network actually fired.
async function timed<T>(label: string, p: Promise<T>): Promise<T> {
  const e = recordCall(label)
  try {
    return await p
  } finally {
    endCall(e)
  }
}

export function Harness() {
  const [net, setNet] = useState<NetEntry[]>([])
  const [call, setCall] = useState<CallEntry[]>([])
  const [q1Promise, setQ1Promise] = useState<Promise<unknown> | null>(null)
  const [busy, setBusy] = useState('')

  useEffect(() => {
    installProbe()
    setLabels(ALL_LABELS)
  }, [])

  function snapshot() {
    const t = getTimeline()
    setNet([...t.net])
    setCall([...t.call])
    ;(window as unknown as { __RESULT__: unknown }).__RESULT__ = t
  }

  function clearAll() {
    resetTimeline()
    setQ1Promise(null)
    setNet([])
    setCall([])
  }

  // ── Q1: preload a cache read behind a slow action ──────────────────────────
  async function q1ServerFn() {
    setBusy('q1-serverfn')
    clearAll()
    void timed('blocker', runAction('blocker', 4000)) // slow action, not awaited
    await sleep(50)
    const p = timed('q1-read', cachedRead('q1-read', 200, bust())) // preload
    setQ1Promise(p)
    await sleep(5000)
    snapshot()
    setBusy('')
  }
  async function q1Route() {
    setBusy('q1-route')
    clearAll()
    void timed(
      'blocker',
      fetch('/api/work?ms=4000&label=blocker').then((r) => r.json())
    )
    await sleep(50)
    const p = timed(
      'q1-read',
      fetch('/api/work?ms=200&label=q1-read').then((r) => r.json())
    )
    setQ1Promise(p)
    await sleep(5000)
    snapshot()
    setBusy('')
  }

  // ── Q2: fan-out of reads, one slow ─────────────────────────────────────────
  async function q2ServerFn() {
    setBusy('q2-serverfn')
    clearAll()
    const a = timed('A', cachedRead('A', 200, bust()))
    const b = timed('B', cachedRead('B', 4000, bust())) // the slow one
    const c = timed('C', cachedRead('C', 200, bust()))
    await Promise.allSettled([a, b, c])
    await sleep(150)
    snapshot()
    setBusy('')
  }
  async function q2Route() {
    setBusy('q2-route')
    clearAll()
    const a = timed('A', fetch('/api/work?ms=200&label=A').then((r) => r.json()))
    const b = timed('B', fetch('/api/work?ms=4000&label=B').then((r) => r.json()))
    const c = timed('C', fetch('/api/work?ms=200&label=C').then((r) => r.json()))
    await Promise.allSettled([a, b, c])
    await sleep(150)
    snapshot()
    setBusy('')
  }

  const Btn = ({ id, on, children }: { id: string; on: () => void; children: React.ReactNode }) => (
    <button id={id} onClick={on} disabled={!!busy} style={btn}>
      {children}
    </button>
  )

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Btn id="q1-serverfn" on={q1ServerFn}>Q1 · server-fn</Btn>
        <Btn id="q1-route" on={q1Route}>Q1 · route (control)</Btn>
        <Btn id="q2-serverfn" on={q2ServerFn}>Q2 · server-fn</Btn>
        <Btn id="q2-route" on={q2Route}>Q2 · route (control)</Btn>
        <Btn id="reset" on={clearAll}>reset</Btn>
        {busy && <span style={{ alignSelf: 'center' }}>running {busy}…</span>}
      </div>

      <div>
        Q1 Suspense content:{' '}
        <Suspense fallback={<span>loading q1-read…</span>}>
          <Q1Result promise={q1Promise} />
        </Suspense>
      </div>

      <Section title="network (when each request actually fired)">
        <Bars rows={net} />
      </Section>
      <Section title="call → resolve (when the harness invoked it / got the result)">
        <Bars rows={call} />
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 style={{ margin: '8px 0', fontSize: 13 }}>{title}</h3>
      {children}
    </div>
  )
}

function Bars({ rows }: { rows: Array<{ label: string; tStart: number; tEnd: number | null; kind?: string }> }) {
  if (!rows.length) return <p style={{ opacity: 0.5, margin: 0 }}>—</p>
  const scale = 0.05 // px per ms
  return (
    <div style={{ display: 'grid', gap: 4 }}>
      {rows.map((r, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 64 }}>{r.label}</span>
          <div style={{ position: 'relative', height: 16, flex: 1, background: '#f1f1f1', borderRadius: 3 }}>
            <div
              title={`${r.tStart} → ${r.tEnd}`}
              style={{
                position: 'absolute',
                left: r.tStart * scale,
                width: Math.max(2, ((r.tEnd ?? r.tStart) - r.tStart) * scale),
                height: 16,
                background: r.kind === 'route' ? '#3b82f6' : '#ef4444',
                borderRadius: 3,
              }}
            />
          </div>
          <span style={{ width: 150, fontSize: 11, textAlign: 'right' }}>
            {r.tStart} → {r.tEnd ?? '…'} ({r.tEnd != null ? Math.round(r.tEnd - r.tStart) : '…'}ms)
          </span>
        </div>
      ))}
    </div>
  )
}

const btn: React.CSSProperties = {
  padding: '6px 10px',
  border: '1px solid #ccc',
  borderRadius: 6,
  background: '#fff',
  cursor: 'pointer',
  fontFamily: 'monospace',
}
