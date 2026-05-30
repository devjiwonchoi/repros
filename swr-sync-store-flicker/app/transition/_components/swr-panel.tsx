'use client'

import { Suspense, useRef, useState, useTransition } from 'react'
import useSWR from 'swr'
import { swrFetcher } from './fake-fetch'
import { PendingBadge, Skeleton } from './skeleton'

// Child reads from SWR with suspense: true. Each render bumps a counter so
// re-mounts (after the boundary flips back to fallback) are visible.
function SwrChild({ id, nonce }: { id: number; nonce: number }) {
  const renderCountRef = useRef(0)
  renderCountRef.current += 1

  const key = `item-${id}-${nonce}`
  // Provide fallbackData only when nonce === 0 (initial render, both on SSR and
  // client mount) so the page has content without a suspend on first paint.
  // Every click bumps `nonce`, producing a key with no cache entry and no
  // fallback → re-suspends and flashes the Suspense fallback.
  const { data } = useSWR(key, swrFetcher, {
    suspense: true,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    fallbackData:
      nonce === 0 ? { id, name: `Item ${id}` } : undefined,
  })

  return (
    <div className="rounded border border-emerald-400 bg-emerald-50 p-4 text-emerald-900">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-wide font-bold">
          SWR child content
        </div>
        <div className="text-[10px] font-mono bg-emerald-200 px-2 py-0.5 rounded">
          render #{renderCountRef.current}
        </div>
      </div>
      <div className="mt-2 font-mono text-lg font-bold">{data.name}</div>
      <div className="mt-1 font-mono text-xs opacity-60">id: {data.id}</div>
      <div
        key={`${id}-${nonce}`}
        className="mt-3 h-2 w-full rounded bg-emerald-300"
        style={{
          animation: 'pulse-once 1.2s ease-out',
        }}
      />
      <style>{`
        @keyframes pulse-once {
          0% { background-color: #6ee7b7; transform: scaleX(0); transform-origin: left; }
          100% { background-color: #6ee7b7; transform: scaleX(1); transform-origin: left; }
        }
      `}</style>
    </div>
  )
}

export function SwrPanel() {
  const [activeId, setActiveId] = useState(1)
  const [nonce, setNonce] = useState(0)
  const [isPending, startTrans] = useTransition()

  return (
    <section className="flex flex-col gap-4 rounded-lg border-2 border-red-300 bg-red-50 p-6">
      <header>
        <h2 className="text-lg font-bold text-red-900">
          Left: useSWR (external store, suspense: true)
        </h2>
        <p className="mt-1 text-sm text-red-800">
          SWR uses <code>useSyncExternalStore</code> under the hood. Even inside{' '}
          <code>startTransition</code>, the store snapshot read is synchronous, so
          React cannot keep the prior tree alive — the Suspense boundary{' '}
          <strong>flashes its fallback</strong>.
        </p>
      </header>

      <div className="flex items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => {
                startTrans(() => {
                  setActiveId(n)
                  setNonce((x) => x + 1)
                })
              }}
              className={`rounded border px-3 py-1.5 text-sm font-bold transition-colors ${
                activeId === n
                  ? 'border-red-700 bg-red-700 text-white'
                  : 'border-red-300 bg-white text-red-900 hover:bg-red-100'
              }`}
            >
              Item {n}
            </button>
          ))}
        </div>
        <PendingBadge visible={isPending} />
      </div>

      <Suspense fallback={<Skeleton label="left / SWR" />}>
        <SwrChild id={activeId} nonce={nonce} />
      </Suspense>
    </section>
  )
}
