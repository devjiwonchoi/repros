'use client'

import { SWRConfig } from 'swr'
import type { ReactNode } from 'react'
import type { HydrationItem } from './fake-fetch'

// Wraps children with SWRConfig that hands SWR a synchronous fallback for our
// key. Crucially, `fallback` is read on the FIRST render but is NOT written
// into SWR's cache provider synchronously — that's exactly what opens the
// hydration consistency window we're reproducing.
export function SWRHydrationProvider({
  initialData,
  swrKey,
  children,
}: {
  initialData: HydrationItem
  swrKey: string
  children: ReactNode
}) {
  return (
    <SWRConfig
      value={{
        fallback: { [swrKey]: initialData },
        suspense: true,
        // Don't auto-revalidate on focus/reconnect — keeps the demo predictable
        // and isolates the post-hydration race as the only source of refetch.
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
      }}
    >
      {children}
    </SWRConfig>
  )
}
