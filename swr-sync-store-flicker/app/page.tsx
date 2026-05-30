import Link from 'next/link'

export default function Page() {
  return (
    <main className="mx-auto max-w-2xl p-8 font-mono text-sm">
      <h1 className="text-2xl font-bold mb-2">useSyncExternalStore + Suspense flicker</h1>
      <p className="text-gray-600 mb-8">
        Two demos isolating two distinct flicker mechanisms in SWR.
      </p>

      <ul className="space-y-4">
        <li className="border border-gray-300 p-4 rounded">
          <Link href="/transition" className="text-blue-700 font-bold underline">
            /transition — transition fallback flicker
          </Link>
          <p className="mt-1 text-gray-700">
            Side-by-side: useSWR (left) vs useState+use() (right). Click the buttons —
            left flashes the Suspense fallback because the external-store update can't
            be deferred; right keeps the prior content visible because React owns the state.
          </p>
        </li>

        <li className="border border-gray-300 p-4 rounded">
          <Link href="/hydration" className="text-blue-700 font-bold underline">
            /hydration — post-hydration consistency re-render flicker
          </Link>
          <p className="mt-1 text-gray-700">
            Skeleton → content → skeleton → content sequence on hard navigation.
            Reload a few times; the second skeleton flashes intermittently due to the
            useSyncExternalStore server/client snapshot reconciliation forcing a sync re-suspend.
          </p>
        </li>
      </ul>
    </main>
  )
}
