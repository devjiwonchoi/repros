'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useSWRConfig } from 'swr'
import { useServerQuerySWR } from '../../server-queries/use-server-swr'
import type { ItemData } from '../../query'
import type { ServerQuery } from '@/app/server-queries/query-server'

function Inner({
  query,
}: {
  query: ServerQuery<ItemData>
}) {
  console.log({ queryClientInner: query });
  const { data, key } = useServerQuerySWR(query)
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div>
        cache key: <code data-testid="key">{key}</code>
      </div>
      <div>
        data: <code data-testid="data">{JSON.stringify(data)}</code>
      </div>
    </div>
  )
}

function CacheInspector() {
  const { cache } = useSWRConfig()
  const keys = Array.from((cache as Map<string, unknown>).keys()).filter(
    (k) => typeof k === 'string' && k.includes('$'),
  )
  return (
    <div>
      <div>SWR cache entries ({keys.length}):</div>
      <pre data-testid="cache-keys">{JSON.stringify(keys, null, 2)}</pre>
    </div>
  )
}

export function Client({
  query,
}: {
  query: ServerQuery<ItemData>
}) {
  console.log({ queryClient: query });
  return (
    <main
      style={{ padding: 24, fontFamily: 'monospace', display: 'grid', gap: 16 }}
    >
      <h1>{`useServerSWR — key = $$id + route params`}</h1>
      <nav style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <Link href="/team-a/1" data-testid="nav-a1">
          /team-a/1
        </Link>
        <Link href="/team-a/2" data-testid="nav-a2">
          /team-a/2 (same team, diff id)
        </Link>
        <Link href="/team-b/1" data-testid="nav-b1">
          /team-b/1 (diff team, same id)
        </Link>
        <Link href="/team-b/2" data-testid="nav-b2">
          /team-b/2 (both diff)
        </Link>
        <Link href="/1/team-a" data-testid="nav-swap">
          /1/team-a (swapped)
        </Link>
      </nav>
      <Suspense fallback={<div>loading…</div>}>
        <Inner query={query} />
      </Suspense>
      <CacheInspector />
    </main>
  )
}
