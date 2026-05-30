'use client'

import { use } from 'react'

// Renders a preloaded promise via use() inside a Suspense boundary, so we can
// observe how long the content is gated when the preload sits behind a slow
// action in the queue.
export function Q1Result({ promise }: { promise: Promise<unknown> | null }) {
  if (!promise) return <span style={{ opacity: 0.6 }}>idle</span>
  return <Resolved promise={promise} />
}

function Resolved({ promise }: { promise: Promise<unknown> }) {
  const data = use(promise)
  return <span>resolved: {JSON.stringify(data)}</span>
}
