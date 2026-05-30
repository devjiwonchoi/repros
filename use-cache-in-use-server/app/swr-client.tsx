'use client'

import { Suspense } from 'react'
import useSWR from 'swr'
import { getData } from './query'

type Data = { repo: string; url: string; cachedAt: string }
type Item = { repo: string; swrKey: string; promise: Promise<Data> }

function Panel({ repo, swrKey, promise }: Item) {
  // Same shape as the real useServerSWR: key carried from the server,
  // fallback maps that exact key to the preloaded promise, suspense on.
  const { data } = useSWR<Data>(swrKey, () => getData(repo), {
    fallback: { [swrKey]: promise },
    suspense: true,
  })
  return (
    <div style={{ border: '1px solid #ccc', padding: 8, display: 'grid', gap: 4 }}>
      <div>
        requested repo: <b>{repo}</b>
      </div>
      <div>
        swr key: <code>{swrKey}</code>
      </div>
      <div>
        returned:{' '}
        <code data-testid={`data-${repo}`}>{JSON.stringify(data)}</code>
      </div>
    </div>
  )
}

export function SWRClient({ items }: { items: Item[] }) {
  // NOTE: getKey is a server action. On the client it is a bare opaque function
  // ({ $$typeof: undefined, ownKeys: ['length','name'] }), and calling it during
  // render throws "Server Functions cannot be called during initial render". So
  // getKey must run on the server (in page.tsx) and the URL is carried down.
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <section style={{ display: 'grid', gap: 8 }}>
        <h2>Two repos, each keyed by its own getKey() URL</h2>
        {items.map((it) => (
          <Suspense key={it.repo} fallback={<div>loading {it.repo}…</div>}>
            <Panel {...it} />
          </Suspense>
        ))}
      </section>
    </div>
  )
}
