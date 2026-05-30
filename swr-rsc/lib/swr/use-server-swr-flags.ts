'use client'

import type { SWRConfiguration, SWRResponse } from 'swr'
import type { ServerSWRPreload } from './preload-server-swr'
import type { ServerSWRFetcher } from './types'

import useSWR from 'swr'
import { use } from 'react'

import { useIsInitialRender } from './use-is-initial-render'

export type ServerSWRResponse<T> = Omit<SWRResponse<T, Error>, 'data'> & {
  data: T
}

/**
 * Variant C — `fallback` + revalidate flags gated by promise identity.
 * This is vercel/front PR #71371. No `preload`.
 *
 * `useIsInitialRender` is a module-level WeakSet keyed by the promise
 * object, so it is true only on the first client commit of each fresh
 * promise. On that commit we pin `revalidateOnMount: false` +
 * `revalidateIfStale: false`, so SWR skips the redundant mount
 * revalidation outright (no fetch, and no revalidation machinery runs).
 *
 * On a remount that reuses the SAME promise, the promise is already in
 * the WeakSet → isInitialRender is false → flags are not applied → SWR
 * revalidates on mount and fetches fresh. Soft nav ships a FRESH promise
 * → isInitialRender is true again → skip. Identity is the freshness
 * signal, which is exactly the bit `preload` (keyed by the key string)
 * cannot see.
 */
export function useServerSWRFlags<T, Params>({
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
  const isInitialRender = useIsInitialRender(preloadedPromise)
  const preloaded = use(preloadedPromise)
  const key = fetcher.endpoint(params)

  const swr = useSWR<T, Error>(key, fetcher.fetch, {
    ...options,
    suspense: true,
    fallback: { [preloaded.key]: preloaded.promise },
    ...(isInitialRender && {
      revalidateOnMount: false,
      revalidateIfStale: false,
    }),
  } as SWRConfiguration<T, Error>)

  if (swr.data === undefined) {
    throw new Error(
      `[useServerSWRFlags] data is undefined for key "${preloaded.key}".`,
    )
  }

  return swr as ServerSWRResponse<T>
}
