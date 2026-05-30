'use client'

import { Suspense, use, useRef, useState, useTransition } from 'react'
import { fakeFetch, type Item } from './fake-fetch'
import { PendingBadge, Skeleton } from './skeleton'

function UseChild({
  promise,
  selectedId,
}: {
  promise: Promise<Item>
  selectedId: number
}) {
  const renderCountRef = useRef(0)
  renderCountRef.current += 1

  const data = use(promise)

  return (
    <div className="rounded border border-emerald-400 bg-emerald-50 p-4 text-emerald-900">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-wide font-bold">
          use() child content
        </div>
        <div className="text-[10px] font-mono bg-emerald-200 px-2 py-0.5 rounded">
          render #{renderCountRef.current}
        </div>
      </div>
      <div className="mt-2 font-mono text-lg font-bold">{data.name}</div>
      <div className="mt-1 font-mono text-xs opacity-60">id: {data.id}</div>
      <div
        key={selectedId}
        className="mt-3 h-2 w-full rounded bg-emerald-300"
        style={{
          animation: 'pulse-once-use 1.2s ease-out',
        }}
      />
      <style>{`
        @keyframes pulse-once-use {
          0% { background-color: #6ee7b7; transform: scaleX(0); transform-origin: left; }
          100% { background-color: #6ee7b7; transform: scaleX(1); transform-origin: left; }
        }
      `}</style>
    </div>
  )
}

export function UsePanel() {
  // Initial promise so the first paint has content to suspend on.
  const [state, setState] = useState<{ id: number; promise: Promise<Item> }>(
    () => ({ id: 1, promise: fakeFetch(1) })
  )
  const [isPending, startTrans] = useTransition()

  return (
    <section className="flex flex-col gap-4 rounded-lg border-2 border-green-300 bg-green-50 p-6">
      <header>
        <h2 className="text-lg font-bold text-green-900">
          Right: useState + use() (React-owned state)
        </h2>
        <p className="mt-1 text-sm text-green-800">
          The pending promise lives in React state. <code>startTransition</code>{' '}
          marks the update as deferrable, so React{' '}
          <strong>keeps the previous resolved tree on screen</strong> until the
          new promise settles. No fallback flash.
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
                  setState({ id: n, promise: fakeFetch(n) })
                })
              }}
              className={`rounded border px-3 py-1.5 text-sm font-bold transition-colors ${
                state.id === n
                  ? 'border-green-700 bg-green-700 text-white'
                  : 'border-green-300 bg-white text-green-900 hover:bg-green-100'
              }`}
            >
              Item {n}
            </button>
          ))}
        </div>
        <PendingBadge visible={isPending} />
      </div>

      <Suspense fallback={<Skeleton label="right / use()" />}>
        <UseChild promise={state.promise} selectedId={state.id} />
      </Suspense>
    </section>
  )
}
