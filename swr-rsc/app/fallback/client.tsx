'use client'

import { Suspense, useState } from 'react'
import { useSWRConfig } from 'swr'

import { dataFetcher } from '@/lib/swr/data-fetcher'
import type { ServerSWRPreload } from '@/lib/swr/preload-server-swr'
import type { DataResponse } from '@/lib/swr/types'
import { useServerSWRFallback } from '@/lib/swr/use-server-swr-fallback'

function Inner({
  preloaded,
  base,
}: {
  preloaded: Promise<ServerSWRPreload<DataResponse>>
  base: string
}) {
  const { data, mutate } = useServerSWRFallback({
    preloaded,
    fetcher: dataFetcher,
    params: { base },
  })

  return (
    <div className="space-y-2">
      <p>
        <strong>Variant A — fallback</strong>
      </p>
      <pre className="rounded bg-black/5 p-2 text-sm">
        {JSON.stringify(data, null, 2)}
      </pre>
      <button
        className="rounded bg-blue-600 px-3 py-1 text-white text-sm"
        onClick={() => mutate()}
      >
        Revalidate
      </button>
    </div>
  )
}

export function FallbackDemo({
  preloaded,
  base,
}: {
  preloaded: Promise<ServerSWRPreload<DataResponse>>
  base: string
}) {
  const { cache } = useSWRConfig()
  const [, force] = useState(0)
  return (
    <div className="space-y-4">
      <Suspense fallback={<p>Loading…</p>}>
        <Inner preloaded={preloaded} base={base} />
      </Suspense>
      <button
        className="rounded bg-gray-200 px-3 py-1 text-sm"
        onClick={() => {
          cache.delete(`${base}/api/data`)
          force((n) => n + 1)
        }}
      >
        Clear cache & remount
      </button>
    </div>
  )
}
