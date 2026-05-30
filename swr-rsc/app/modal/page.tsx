import { headers } from 'next/headers'
import Link from 'next/link'
import { Suspense } from 'react'

import { modalFetcher } from '@/lib/swr/data-fetcher'
import { preloadServerSWR } from '@/lib/swr/preload-server-swr'

import { ModalComparison } from './client'

async function ModalShell() {
  const h = await headers()
  const protocol = h.get('x-forwarded-proto') ?? 'http'
  const host = h.get('host') ?? 'localhost:3000'
  const base = `${protocol}://${host}`

  // Preloaded ONCE per variant, on this server render only. Each modal
  // reuses its own promise across open/close, with no further server run.
  const preloadedPreload = preloadServerSWR({
    fetcher: modalFetcher,
    params: Promise.resolve({ base, variant: 'preload' }),
  })
  const preloadedFlags = preloadServerSWR({
    fetcher: modalFetcher,
    params: Promise.resolve({ base, variant: 'flags' }),
  })
  const preloadedFallback = preloadServerSWR({
    fetcher: modalFetcher,
    params: Promise.resolve({ base, variant: 'fallback' }),
  })

  return (
    <ModalComparison
      preloadedPreload={preloadedPreload}
      preloadedFlags={preloadedFlags}
      preloadedFallback={preloadedFallback}
      base={base}
    />
  )
}

export default function Page() {
  return (
    <main className="mx-auto max-w-5xl p-6 space-y-4">
      <h1 className="text-xl font-semibold">
        /modal — same-promise remount, three strategies
      </h1>
      <p className="text-sm text-gray-600">
        The server preloads ONCE per column. Opening a modal mounts a consumer
        that reuses the SAME preloaded promise; closing unmounts it. Reopen is a
        fresh React mount with the same (now stale) promise and no server re-run.
      </p>
      <p className="text-sm text-gray-600">
        Watch <code>fetchedAt</code> (changes = a real fetch) and{' '}
        <code>calledFrom</code> (<code>client</code> = the client fetched,{' '}
        <code>server</code> = served from the streamed promise, no client fetch).
      </p>
      <Suspense fallback={<p>Loading…</p>}>
        <ModalShell />
      </Suspense>
      <p className="text-sm">
        <Link href="/" className="underline">
          ← home
        </Link>
      </p>
    </main>
  )
}
