'use client'

import type { SWRConfiguration, SWRResponse } from 'swr'
import type { ServerSWRPreload } from './preload-server-swr'
import type { ServerSWRFetcher } from './types'

import useSWR, { preload } from 'swr'
import { use } from 'react'

export type ServerSWRResponse<T> = Omit<SWRResponse<T, Error>, 'data'> & {
  data: T
}

/**
 * Variant B — SWR `preload()` bridge (ungated).
 *
 * Calls `preload(key, () => promise)` on every render, so SWR's preload
 * middleware satisfies the mount revalidation from the streamed promise
 * instead of the network. `fallback` is still required for suspense SSR.
 *
 * Caveat (see /modal): it re-arms the bridge on every mount, so a remount
 * that reuses the SAME (stale) promise also bridges and never revalidates.
 * `preload` is keyed by the cache key string, so it cannot tell a fresh
 * promise from a reused one — the distinction `useIsInitialRender` adds.
 */
export function useServerSWRPreload<T, Params>({
  preloaded: preloadedPromise,
  fetcher,
  params,
  options,
}: {
  preloaded: Promise<ServerSWRPreload<T>>
  fetcher: ServerSWRFetcher<T, Params>
  params: Params
  options?: Omit<SWRConfiguration<T, Error>, 'suspense'>
}): ServerSWRResponse<T> {
  const preloaded = use(preloadedPromise)
  const key = fetcher.endpoint(params)

  preload(preloaded.key, () => preloaded.promise)

  const swr = useSWR<T, Error>(key, fetcher.fetch, {
    ...options,
    suspense: true,
    fallback: { [preloaded.key]: preloaded.promise },
  } as SWRConfiguration<T, Error>)

  if (swr.data === undefined) {
    throw new Error(
      `[useServerSWRPreload] data is undefined for key "${preloaded.key}".`,
    )
  }

  return swr as ServerSWRResponse<T>
}
