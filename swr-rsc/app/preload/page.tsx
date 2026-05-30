import { headers } from 'next/headers'
import Link from 'next/link'
import { Suspense } from 'react'

import { dataFetcher } from '@/lib/swr/data-fetcher'
import { preloadServerSWR } from '@/lib/swr/preload-server-swr'

import { PreloadDemo } from './client'

async function PreloadShell() {
  const h = await headers()
  const protocol = h.get('x-forwarded-proto') ?? 'http'
  const host = h.get('host') ?? 'localhost:3000'
  const base = `${protocol}://${host}`

  const preloaded = preloadServerSWR({
    fetcher: dataFetcher,
    params: Promise.resolve({ base }),
  })

  return <PreloadDemo preloaded={preloaded} base={base} />
}

export default function Page() {
  return (
    <main className="mx-auto max-w-xl p-6 space-y-4">
      <h1 className="text-xl font-semibold">/preload (variant B)</h1>
      <p className="text-sm text-gray-600">
        Bridges via SWR's <code>preload()</code> + keeps <code>fallback</code>{' '}
        for SSR. No client revalidation on mount — same timestamp until you
        click Revalidate.
      </p>
      <Suspense fallback={<p>Loading…</p>}>
        <PreloadShell />
      </Suspense>
      <p className="text-sm">
        <Link href="/" className="underline">
          ← home
        </Link>
      </p>
    </main>
  )
}
