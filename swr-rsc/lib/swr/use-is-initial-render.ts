'use client'

import { useEffect } from 'react'

/**
 * Mirrors vercel/front PR #71371's hook: track which preloaded
 * promises have already committed once on the client. Promise
 * identity (not key string) is the freshness signal — soft nav
 * re-runs preloadServerSWR with a fresh promise, so it still gets
 * the mount-revalidation skip; a long-lived parent passing the same
 * promise across child remounts correctly falls through to SWR's
 * default revalidation.
 *
 * WeakSet auto-GCs entries when the promise drops out of scope.
 */
const consumedPreloads = new WeakSet<Promise<unknown>>()

export function useIsInitialRender(
  preloadedPromise: Promise<unknown>,
): boolean {
  const isInitialRender =
    typeof window === 'undefined' || !consumedPreloads.has(preloadedPromise)
  useEffect(() => {
    consumedPreloads.add(preloadedPromise)
  }, [preloadedPromise])
  return isInitialRender
}
