'use client'

import { use, Suspense } from 'react'
import useSWR from 'swr'
import { getData, getKey } from '../query-cache'

function Inner({ repo }: { repo: string }) {
  // use(getKey()) on the client, but getKey is now a "use cache" fn (not "use server").
  const key = use(getKey(repo))
  const { data } = useSWR(key, () => getData(repo), { suspense: true })
  return (
    <pre data-testid="result">
      key={key}
      {'\n'}
      data={JSON.stringify(data)}
    </pre>
  )
}

export function CacheGetKey({ repo }: { repo: string }) {
  return (
    <Suspense fallback={<p data-testid="result">loading…</p>}>
      <Inner repo={repo} />
    </Suspense>
  )
}
