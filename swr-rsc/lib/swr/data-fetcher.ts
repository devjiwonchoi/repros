import type { DataResponse, ServerSWRFetcher } from './types'

export const dataFetcher: ServerSWRFetcher<DataResponse, { base: string }> = {
  endpoint: ({ base }) => `${base}/api/data`,
  fetch: async (endpoint) => {
    const calledFrom = typeof window === 'undefined' ? 'server' : 'client'
    // Visible in browser console — if you see "client" on initial /preload load,
    // the preload bridge failed and useSWR fell through to the real fetcher.
    console.log(`[dataFetcher.fetch] called from ${calledFrom}: ${endpoint}`)
    const res = await fetch(endpoint, { cache: 'no-store' })
    if (!res.ok) throw new Error(`Failed: ${res.status}`)
    const data = (await res.json()) as DataResponse
    return { ...data, calledFrom } as DataResponse & { calledFrom: string }
  },
}

/**
 * Same fetcher, but the endpoint carries a `variant` discriminator so the
 * two modal columns (preload vs fallback) get distinct SWR cache keys and
 * never cross-contaminate. Reuses the logging `fetch` above, so the console
 * line tells you which variant actually hit the network on a modal reopen.
 */
export const modalFetcher: ServerSWRFetcher<
  DataResponse,
  { base: string; variant: string }
> = {
  endpoint: ({ base, variant }) => `${base}/api/data?m=${variant}`,
  fetch: dataFetcher.fetch,
}
