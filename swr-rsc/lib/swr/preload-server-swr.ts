import 'server-only'

import type { ServerSWRFetcher } from './types'

export type ServerSWRPreload<T> = {
  key: string
  promise: Promise<T>
}

export async function preloadServerSWR<T, Params>({
  fetcher,
  params: paramsPromise,
}: {
  fetcher: ServerSWRFetcher<T, Params>
  params: Promise<Params>
}): Promise<ServerSWRPreload<T>> {
  const params = await paramsPromise
  const endpoint = fetcher.endpoint(params)
  return {
    key: endpoint,
    promise: fetcher.fetch(endpoint),
  }
}
