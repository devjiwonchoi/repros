import { headers } from 'next/headers'
import Link from 'next/link'
import { Suspense } from 'react'

import { dataFetcher } from '@/lib/swr/data-fetcher'
import { preloadServerSWR } from '@/lib/swr/preload-server-swr'

import { FallbackDemo } from './client'

async function FallbackShell() {
  const h = await headers()
  const protocol = h.get('x-forwarded-proto') ?? 'http'
  const host = h.get('host') ?? 'localhost:3000'
  const base = `${protocol}://${host}`

  const preloaded = preloadServerSWR({
    fetcher: dataFetcher,
    params: Promise.resolve({ base }),
  })

  return <FallbackDemo preloaded={preloaded} base={base} />
}

export default function Page() {
  return (
    <main className="mx-auto max-w-xl p-6 space-y-4">
      <h1 className="text-xl font-semibold">/fallback (variant A)</h1>
      <p className="text-sm text-gray-600">
        Uses only <code>fallback: {'{ [key]: promise }'}</code>. SWR treats it
        as fallback data — expect a network revalidation right after hydration.
      </p>
      <Suspense fallback={<p>Loading…</p>}>
        <FallbackShell />
      </Suspense>
      <p className="text-sm">
        <Link href="/" className="underline">
          ← home
        </Link>
      </p>
    </main>
  )
}
