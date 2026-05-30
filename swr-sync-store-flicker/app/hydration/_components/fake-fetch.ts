// Shared shape for the data the server streams down and the SWR consumer reads.
export type HydrationItem = {
  id: number
  name: string
  fetchedAt: number
  source: 'server' | 'client'
}

// Server-side fetch. Deterministic-ish, just a small delay so the page actually
// has to stream the Suspense fallback first before resolving content.
export async function serverFetch(id: number): Promise<HydrationItem> {
  await new Promise((r) => setTimeout(r, 300))
  return {
    id,
    name: `Item #${id}`,
    fetchedAt: Date.now(),
    source: 'server',
  }
}

// Client-side fetcher. Slow + jittery on purpose: when the post-hydration
// useSyncExternalStore consistency check finds snapshots disagree and forces a
// sync re-render, useSWR re-suspends and triggers THIS fetcher. If it's fast,
// the second skeleton flashes for a microsecond and the user misses it; we
// need it to be visibly present, so we make it ~600–1000ms.
export function clientFetcher(key: string): Promise<HydrationItem> {
  const match = /^hydration-item-(\d+)/.exec(key)
  const id = match ? Number(match[1]) : 0
  const delay = 600 + Math.random() * 400
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id,
        name: `Item #${id}`,
        fetchedAt: Date.now(),
        source: 'client',
      })
    }, delay)
  })
}
