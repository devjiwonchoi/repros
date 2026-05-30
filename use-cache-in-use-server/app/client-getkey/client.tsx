'use client'

import { use, Suspense } from 'react'
import useSWR from 'swr'
import { getData, getKey } from '../query'

function Inner({ repo }: { repo: string }) {
  // Exactly use-server-swr.new.ts line 27: call getKey on the client, use() it.
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

export function ClientGetKey({ repo }: { repo: string }) {
  return (
    <Suspense fallback={<p data-testid="result">loading…</p>}>
      <Inner repo={repo} />
    </Suspense>
  )
}
