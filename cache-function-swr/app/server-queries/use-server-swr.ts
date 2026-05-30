'use client'

import type { ServerQuery } from './query-server'
import type { SWRConfiguration } from 'swr'

import useSWR, { unstable_serialize, preload } from 'swr'
import { useParams } from 'next/navigation'

export type UseServerSWRResult<T> = {
  data: T
  key: string
}

export function useServerQuerySWR<T>(
  query: ServerQuery<T>,
  options?: SWRConfiguration,
): UseServerSWRResult<T> {
  const params = useParams() as Record<string, string>
  const key = unstable_serialize([query.id, params])

  preload(key, () => query.initialData)

  const swr = useSWR<T>(key, () => query.loader({ params }), {
    ...options,
    fallback: { [key]: query.initialData },
    suspense: true,
  })

  return { data: swr.data as T, key }
}
