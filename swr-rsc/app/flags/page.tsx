import { headers } from 'next/headers'
import Link from 'next/link'
import { Suspense } from 'react'

import { modalFetcher } from '@/lib/swr/data-fetcher'
import { preloadServerSWR } from '@/lib/swr/preload-server-swr'

import { FlagsDemo } from './client'

async function FlagsShell() {
  const h = await headers()
  const protocol = h.get('x-forwarded-proto') ?? 'http'
  const host = h.get('host') ?? 'localhost:3000'
  const base = `${protocol}://${host}`

  const preloaded = preloadServerSWR({
    fetcher: modalFetcher,
    params: Promise.resolve({ base, variant: 'route' }),
  })

  return <FlagsDemo preloaded={preloaded} base={base} />
}

export default function Page() {
  return (
    <main className="mx-auto max-w-xl p-6 space-y-4">
      <h1 className="text-xl font-semibold">
        /flags (variant C — isInitialRender + flags)
      </h1>
      <p className="text-sm text-gray-600">
        Distinct key from /preload so it doesn&apos;t share the SWR cache.
        Soft-nav between this and home and watch <code>fetchedAt</code>.
      </p>
      <Suspense fallback={<p>Loading…</p>}>
        <FlagsShell />
      </Suspense>
      <p className="text-sm">
        <Link href="/" className="underline">
          ← home
        </Link>
      </p>
    </main>
  )
}
