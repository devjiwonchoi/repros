'use client'

import { Suspense } from 'react'
import useSWR from 'swr'
import { getData } from '../query'

type Data = { repo: string; url: string; cachedAt: string }
type Item = { repo: string; promise: Promise<Data> }

function Panel({
  baseKey,
  repo,
  promise,
}: {
  baseKey: string
  repo: string
  promise: Promise<Data>
}) {
  // The proposal: carried $$id + param. (repo stands in for a route param.)
  const key = `${baseKey}$${repo}`
  const { data } = useSWR<Data>(key, () => getData(repo), {
    fallback: { [key]: promise },
    suspense: true,
  })
  return (
    <div style={{ border: '1px solid #ccc', padding: 8, display: 'grid', gap: 4 }}>
      <div>
        requested repo: <b>{repo}</b>
      </div>
      <div>
        swr key: <code>{key}</code>
      </div>
      <div>
        returned:{' '}
        <code data-testid={`data-${repo}`}>{JSON.stringify(data)}</code>
      </div>
    </div>
  )
}

export function CarriedId({
  baseKey,
  items,
}: {
  baseKey: string
  items: Item[]
}) {
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {items.map((it) => (
        <Suspense key={it.repo} fallback={<div>loading {it.repo}…</div>}>
          <Panel baseKey={baseKey} repo={it.repo} promise={it.promise} />
        </Suspense>
      ))}
    </div>
  )
}
