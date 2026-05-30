import Link from 'next/link'
import { SwrPanel } from './_components/swr-panel'
import { UsePanel } from './_components/use-panel'

export default function TransitionPage() {
  return (
    <main className="mx-auto max-w-7xl p-8 font-mono text-sm">
      <Link
        href="/"
        className="text-blue-700 underline text-xs"
      >
        ← back
      </Link>

      <h1 className="mt-2 text-2xl font-bold">
        /transition — Suspense behavior inside startTransition
      </h1>

      <p className="mt-3 max-w-3xl text-gray-700">
        Both panels do the same UX (change key inside{' '}
        <code className="bg-gray-200 rounded px-1">startTransition</code>). Left
        uses <code className="bg-gray-200 rounded px-1">useSyncExternalStore</code>{' '}
        via SWR — React can&apos;t defer the update because of the no-tearing
        contract, so the boundary&apos;s fallback shows. Right uses{' '}
        <code className="bg-gray-200 rounded px-1">useState</code> — the update
        is fully deferrable, so React keeps the prior tree visible.
      </p>

      <p className="mt-2 max-w-3xl text-gray-600 text-xs">
        Click the buttons. Watch the{' '}
        <span className="font-bold">loading…</span> badge (always shows during a
        pending transition) and the child render counter / pulse bar to see
        re-mounts vs preserved trees.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SwrPanel />
        <UsePanel />
      </div>
    </main>
  )
}
