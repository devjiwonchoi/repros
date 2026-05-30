import { Suspense } from 'react'
import Link from 'next/link'
import { HydrationSkeleton } from './_components/skeleton'
import { SWRHydrationProvider } from './_components/swr-provider'
import { HydrationConsumer } from './_components/consumer'
import { ReloadControls } from './_components/reload-controls'
import { serverFetch } from './_components/fake-fetch'

// Static key — both server (in SWRConfig.fallback) and client (in useSWR) must
// agree on the same string, or SWR will look up the wrong entry and the
// fallback will never apply.
const SWR_KEY = 'hydration-item-42'

// The actual data-fetching server component. Async + dynamic (no `use cache`)
// so cacheComponents requires it to be Suspense-wrapped at the call site.
// We fetch on the server, then pass the resolved value into a client component
// (SWRHydrationProvider) as a serializable prop. The client component renders
// SWRConfig with that data as the fallback, and the consumer subscribes.
async function HydrationContent() {
  const item = await serverFetch(42)
  return (
    <SWRHydrationProvider initialData={item} swrKey={SWR_KEY}>
      <HydrationConsumer swrKey={SWR_KEY} />
    </SWRHydrationProvider>
  )
}

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl p-8 font-mono text-sm space-y-6">
      <div>
        <Link href="/" className="text-blue-700 underline">
          ← back
        </Link>
      </div>

      <header>
        <h1 className="text-2xl font-bold mb-2">
          /hydration — post-hydration consistency re-render flicker
        </h1>
        <p className="text-gray-700 mb-2">
          On hard navigation the server streams the Suspense fallback (red
          skeleton), then the resolved content (green card). React hydrates,
          then runs the <code>useSyncExternalStore</code> consistency check
          inside SWR&apos;s subscription:
        </p>
        <ol className="list-decimal ml-6 text-gray-700 space-y-1">
          <li>
            <code>getServerSnapshot()</code> matches the rendered HTML.
          </li>
          <li>
            A passive effect calls <code>getSnapshot()</code> on the live client
            cache. SWR&apos;s <code>fallback</code> isn&apos;t written into the
            cache provider synchronously, so this returns nothing for our key.
          </li>
          <li>
            Snapshots differ → <code>forceStoreRerender</code> schedules a sync
            re-render.
          </li>
          <li>
            Re-render: <code>useSWR(key, fetcher, {'{'} suspense: true {'}'})</code>{' '}
            sees <code>cachedData === undefined</code>, calls{' '}
            <code>use(revalidate())</code>, <strong>suspends</strong>.
          </li>
          <li>
            Suspense boundary swaps the content back to the skeleton (red).
            <code>clientFetcher</code> resolves ~600–1000ms later, content
            reappears.
          </li>
        </ol>
        <p className="mt-3 text-gray-700">
          Result: <strong>skeleton → content → skeleton → content</strong>.
          Intermittent because the race depends on whether SWR&apos;s cache
          write wins vs the post-commit consistency check.
        </p>
      </header>

      <ReloadControls />

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Live demo</h2>
        <Suspense fallback={<HydrationSkeleton />}>
          <HydrationContent />
        </Suspense>
      </section>

      <footer className="text-xs text-gray-500 border-t border-gray-200 pt-4">
        Tip: if the second skeleton never flashes, bump the{' '}
        <code>clientFetcher</code> delay in{' '}
        <code>app/hydration/_components/fake-fetch.ts</code> (try{' '}
        <code>1200 + Math.random()*600</code>) to widen the race window.
      </footer>
    </main>
  )
}
