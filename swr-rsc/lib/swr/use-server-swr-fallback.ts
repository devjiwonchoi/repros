'use client'

import type { SWRConfiguration, SWRResponse } from 'swr'
import type { ServerSWRPreload } from './preload-server-swr'
import type { ServerSWRFetcher } from './types'

import useSWR from 'swr'
import { use } from 'react'

export type ServerSWRResponse<T> = Omit<SWRResponse<T, Error>, 'data'> & {
  data: T
}

/**
 * Variant A — current pattern (from front).
 * The preloaded promise is plumbed into SWR via the `fallback` option.
 * Side effect: SWR treats it as fallback data and revalidates on mount.
 */
export function useServerSWRFallback<T, Params>({
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

  const swr = useSWR<T, Error>(key, fetcher.fetch, {
    ...options,
    suspense: true,
    fallback: { [preloaded.key]: preloaded.promise },
  } as SWRConfiguration<T, Error>)

  if (swr.data === undefined) {
    throw new Error(
      `[useServerSWRFallback] data is undefined for key "${preloaded.key}".`,
    )
  }

  return swr as ServerSWRResponse<T>
}
