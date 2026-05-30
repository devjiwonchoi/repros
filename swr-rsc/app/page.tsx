import Link from 'next/link'

export default function Page() {
  return (
    <main className="mx-auto max-w-xl p-6 space-y-4">
      <h1 className="text-xl font-semibold">SWR ← RSC variants</h1>
      <p className="text-sm text-gray-600">
        Compare how the RSC-preloaded promise reaches <code>useSWR</code>.
        Watch the Network tab and the <code>fetchedAt</code> timestamp.
      </p>
      <ul className="list-disc pl-6 space-y-1">
        <li>
          <Link href="/fallback" className="underline">
            /fallback
          </Link>{' '}
          — current pattern using <code>fallback</code> option.
        </li>
        <li>
          <Link href="/preload" className="underline">
            /preload
          </Link>{' '}
          — new pattern using SWR's <code>preload()</code>.
        </li>
        <li>
          <Link href="/modal" className="underline">
            /modal
          </Link>{' '}
          — same-promise remount: preload vs fallback on modal reopen.
        </li>
        <li>
          <Link href="/flags" className="underline">
            /flags
          </Link>{' '}
          — isInitialRender + flags (PR), for soft-nav comparison.
        </li>
      </ul>
    </main>
  )
}
