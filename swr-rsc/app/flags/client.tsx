'use client'

import { Suspense } from 'react'

import { modalFetcher } from '@/lib/swr/data-fetcher'
import type { ServerSWRPreload } from '@/lib/swr/preload-server-swr'
import type { DataResponse } from '@/lib/swr/types'
import { useServerSWRFlags } from '@/lib/swr/use-server-swr-flags'

function Inner({
  preloaded,
  base,
}: {
  preloaded: Promise<ServerSWRPreload<DataResponse>>
  base: string
}) {
  const { data } = useServerSWRFlags({
    preloaded,
    fetcher: modalFetcher,
    params: { base, variant: 'route' },
  })
  return (
    <pre className="rounded bg-black/5 p-2 text-sm whitespace-pre-wrap">
      {JSON.stringify(data, null, 2)}
    </pre>
  )
}

export function FlagsDemo({
  preloaded,
  base,
}: {
  preloaded: Promise<ServerSWRPreload<DataResponse>>
  base: string
}) {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <Inner preloaded={preloaded} base={base} />
    </Suspense>
  )
}
