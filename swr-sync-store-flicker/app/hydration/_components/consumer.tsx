'use client'

import useSWR from 'swr'
import { clientFetcher, type HydrationItem } from './fake-fetch'

// The component that actually subscribes to SWR. On first render after
// hydration this reads the SWRConfig fallback synchronously and shows the
// server-resolved value. Then React's passive effect runs the
// useSyncExternalStore consistency check: getServerSnapshot() vs
// getSnapshot(). If the live client cache doesn't yet hold the entry (SWR's
// fallback isn't written to the cache provider synchronously), the snapshots
// differ → forceStoreRerender → re-render → cachedData is undefined →
// `use(revalidate())` → SUSPEND. That's the second skeleton.
export function HydrationConsumer({ swrKey }: { swrKey: string }) {
  // Defense in depth: suspense:true is on SWRConfig AND here.
  const { data } = useSWR<HydrationItem>(swrKey, clientFetcher, {
    suspense: true,
  })

  // SWR with suspense:true never returns undefined here — but TS doesn't know.
  if (!data) return null

  return (
    <div className="rounded-lg border-2 border-emerald-500 bg-emerald-50 p-6">
      <div className="text-xs font-bold uppercase tracking-widest text-emerald-700 mb-3">
        CONTENT
      </div>
      <div className="space-y-1 font-mono text-sm text-emerald-950">
        <div>
          <span className="text-emerald-700">id:</span> {data.id}
        </div>
        <div>
          <span className="text-emerald-700">name:</span> {data.name}
        </div>
        <div>
          <span className="text-emerald-700">source:</span>{' '}
          <span
            className={
              data.source === 'server'
                ? 'rounded bg-emerald-200 px-1.5 py-0.5'
                : 'rounded bg-orange-200 px-1.5 py-0.5 text-orange-900'
            }
          >
            {data.source}
          </span>
        </div>
        <div>
          <span className="text-emerald-700">fetchedAt:</span> {data.fetchedAt}
        </div>
      </div>
      <p className="mt-3 text-xs text-emerald-800">
        If <code>source</code> flips from <strong>server</strong> to{' '}
        <strong>client</strong> after a brief skeleton flash, you just observed
        the post-hydration re-suspend.
      </p>
    </div>
  )
}
