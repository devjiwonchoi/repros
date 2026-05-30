'use client'

import { Suspense, useState, type ReactNode } from 'react'

import { modalFetcher } from '@/lib/swr/data-fetcher'
import type { ServerSWRPreload } from '@/lib/swr/preload-server-swr'
import type { DataResponse } from '@/lib/swr/types'
import { useServerSWRFallback } from '@/lib/swr/use-server-swr-fallback'
import { useServerSWRFlags } from '@/lib/swr/use-server-swr-flags'
import { useServerSWRPreload } from '@/lib/swr/use-server-swr-preload'

function DataView({ data }: { data: DataResponse }) {
  return (
    <pre className="rounded bg-black/5 p-2 text-xs whitespace-pre-wrap">
      {JSON.stringify(data, null, 2)}
    </pre>
  )
}

function PreloadContent({
  preloaded,
  base,
}: {
  preloaded: Promise<ServerSWRPreload<DataResponse>>
  base: string
}) {
  const { data } = useServerSWRPreload({
    preloaded,
    fetcher: modalFetcher,
    params: { base, variant: 'preload' },
  })
  return <DataView data={data} />
}

function FlagsContent({
  preloaded,
  base,
}: {
  preloaded: Promise<ServerSWRPreload<DataResponse>>
  base: string
}) {
  const { data } = useServerSWRFlags({
    preloaded,
    fetcher: modalFetcher,
    params: { base, variant: 'flags' },
  })
  return <DataView data={data} />
}

function FallbackContent({
  preloaded,
  base,
}: {
  preloaded: Promise<ServerSWRPreload<DataResponse>>
  base: string
}) {
  const { data } = useServerSWRFallback({
    preloaded,
    fetcher: modalFetcher,
    params: { base, variant: 'fallback' },
  })
  return <DataView data={data} />
}

/**
 * Generic open/close harness. `children` (the consumer that reuses the
 * preloaded promise) is only in the tree while open, so toggling truly
 * unmounts and remounts it.
 */
function ModalColumn({
  title,
  hint,
  children,
}: {
  title: string
  hint: string
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [opens, setOpens] = useState(0)
  return (
    <div className="rounded border p-3 space-y-2">
      <p className="font-medium">{title}</p>
      <p className="text-xs text-gray-600">{hint}</p>
      <button
        className="rounded bg-blue-600 px-3 py-1 text-white text-sm"
        onClick={() => {
          setOpen((o) => !o)
          if (!open) setOpens((n) => n + 1)
        }}
      >
        {open ? 'Close' : 'Open'} modal
      </button>
      <p className="text-xs text-gray-600">Opened {opens}×</p>
      {open ? (
        <Suspense fallback={<p className="text-sm">Loading modal…</p>}>
          {children}
        </Suspense>
      ) : null}
    </div>
  )
}

export function ModalComparison({
  preloadedPreload,
  preloadedFlags,
  preloadedFallback,
  base,
}: {
  preloadedPreload: Promise<ServerSWRPreload<DataResponse>>
  preloadedFlags: Promise<ServerSWRPreload<DataResponse>>
  preloadedFallback: Promise<ServerSWRPreload<DataResponse>>
  base: string
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <ModalColumn
        title="B. preload() — ungated"
        hint="Reopen re-arms the bridge → no fetch → fetchedAt STAYS (stale)."
      >
        <PreloadContent preloaded={preloadedPreload} base={base} />
      </ModalColumn>
      <ModalColumn
        title="C. isInitialRender + flags (PR #71371)"
        hint="First commit skips reval; reopen is not initial → fetches → fetchedAt CHANGES, calledFrom client."
      >
        <FlagsContent preloaded={preloadedFlags} base={base} />
      </ModalColumn>
      <ModalColumn
        title="A. fallback only (control)"
        hint="No bridge, no gate → fetches on EVERY open (redundant on first), always fresh."
      >
        <FallbackContent preloaded={preloadedFallback} base={base} />
      </ModalColumn>
    </div>
  )
}
