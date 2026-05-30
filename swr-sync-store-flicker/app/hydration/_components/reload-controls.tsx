'use client'

import { useEffect, useState } from 'react'

// URL params we use to coordinate state across hard reloads:
//   ?n=3&total=10        → reload counter, "burst" mode (stops after total)
//   ?auto=1&n=42         → infinite auto-reload mode
const STORAGE_AUTO = 'hydration-auto-reload'
const RELOAD_DELAY_MS = 1500

function hardReloadTo(url: string) {
  // Use location.href to force a true hard navigation (full document load),
  // which is what triggers the hydration race we're reproducing. router.push
  // would do a client-side navigation and bypass the whole mechanism.
  window.location.href = url
}

export function ReloadControls() {
  const [auto, setAuto] = useState(false)
  const [burst, setBurst] = useState<{ n: number; total: number } | null>(null)

  // On mount: read URL + localStorage, decide whether we're mid-burst or
  // mid-auto and schedule the next reload. This is the loop's continuation
  // — the actual reload is scheduled here, then it happens, then this runs
  // again on the next page.
  useEffect(() => {
    const url = new URL(window.location.href)
    const nParam = url.searchParams.get('n')
    const totalParam = url.searchParams.get('total')
    const autoParam = url.searchParams.get('auto')
    const localAuto = window.localStorage.getItem(STORAGE_AUTO) === '1'

    const isAuto = autoParam === '1' || localAuto
    setAuto(isAuto)

    if (isAuto) {
      // Auto mode: keep going, count just for display.
      const n = nParam ? Number(nParam) : 0
      setBurst({ n, total: 0 })
      const next = scheduleReload(() => {
        const u = new URL(window.location.href)
        u.searchParams.set('auto', '1')
        u.searchParams.set('n', String(n + 1))
        u.searchParams.set('t', String(Date.now()))
        hardReloadTo(u.toString())
      })
      return () => clearTimeout(next)
    }

    if (nParam && totalParam) {
      const n = Number(nParam)
      const total = Number(totalParam)
      setBurst({ n, total })
      if (n < total) {
        const next = scheduleReload(() => {
          const u = new URL(window.location.href)
          u.searchParams.set('n', String(n + 1))
          u.searchParams.set('total', String(total))
          u.searchParams.set('t', String(Date.now()))
          hardReloadTo(u.toString())
        })
        return () => clearTimeout(next)
      }
    }
  }, [])

  const startBurst = () => {
    const u = new URL(window.location.href)
    u.searchParams.set('n', '1')
    u.searchParams.set('total', '10')
    u.searchParams.set('t', String(Date.now()))
    u.searchParams.delete('auto')
    hardReloadTo(u.toString())
  }

  const toggleAuto = () => {
    const next = !auto
    setAuto(next)
    if (next) {
      window.localStorage.setItem(STORAGE_AUTO, '1')
      const u = new URL(window.location.href)
      u.searchParams.set('auto', '1')
      u.searchParams.set('n', '1')
      u.searchParams.set('t', String(Date.now()))
      u.searchParams.delete('total')
      hardReloadTo(u.toString())
    } else {
      window.localStorage.removeItem(STORAGE_AUTO)
      // Clear the URL params so we stop reloading.
      const u = new URL(window.location.href)
      u.searchParams.delete('auto')
      u.searchParams.delete('n')
      u.searchParams.delete('total')
      u.searchParams.delete('t')
      window.history.replaceState({}, '', u.toString())
    }
  }

  const singleReload = () => {
    const u = new URL(window.location.href)
    u.searchParams.set('t', String(Date.now()))
    u.searchParams.delete('n')
    u.searchParams.delete('total')
    u.searchParams.delete('auto')
    hardReloadTo(u.toString())
  }

  return (
    <div className="rounded-lg border border-gray-300 bg-gray-50 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={singleReload}
          className="rounded bg-gray-800 px-3 py-1.5 text-sm font-bold text-white hover:bg-gray-700"
        >
          Hard reload once
        </button>
        <button
          onClick={startBurst}
          disabled={auto}
          className="rounded bg-blue-700 px-3 py-1.5 text-sm font-bold text-white hover:bg-blue-600 disabled:opacity-50"
        >
          Hard reload 10×
        </button>
        <button
          onClick={toggleAuto}
          className={`rounded px-3 py-1.5 text-sm font-bold text-white ${
            auto ? 'bg-red-700 hover:bg-red-600' : 'bg-emerald-700 hover:bg-emerald-600'
          }`}
        >
          {auto ? 'Stop auto-reload' : 'Start auto-reload'}
        </button>
        {burst && (
          <span className="ml-2 rounded bg-yellow-200 px-2 py-1 text-sm font-mono font-bold text-yellow-900">
            {auto
              ? `auto reload #${burst.n}`
              : `reload ${burst.n}/${burst.total}`}
          </span>
        )}
      </div>
      <p className="mt-2 text-xs text-gray-600">
        Reloads happen with a {RELOAD_DELAY_MS}ms gap so you can watch each one.
        Watch for the second skeleton flash (red border) right after the green
        content first appears.
      </p>
    </div>
  )
}

function scheduleReload(fn: () => void) {
  return window.setTimeout(fn, RELOAD_DELAY_MS)
}
