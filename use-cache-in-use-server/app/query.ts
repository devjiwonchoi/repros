'use server'

import { cacheLife } from 'next/cache'

// Mirrors apps/vercel-site/.../usage-summary-query.ts:
// a "use server" module exposing a cached data getter plus a key getter.
// `getData` declares "use cache" and builds its URL from `getKey`, so the
// fetched URL and the SWR key share one source and cannot drift.
export async function getData(repo: string) {
  'use cache'
  cacheLife('seconds')

  const url = await getKey(repo)
  return {
    repo,
    url,
    cachedAt: new Date().toISOString(),
  }
}

export async function getKey(repo: string) {
  return `/api/repos/${repo}`
}
