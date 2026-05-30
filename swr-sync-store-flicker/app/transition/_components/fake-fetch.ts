// Shared fake fetcher. Always takes 800ms, regardless of cache.
// Returns a stable Promise per call.
export type Item = { id: number; name: string }

export function fakeFetch(id: number): Promise<Item> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id, name: `Item ${id}` })
    }, 800)
  })
}

// SWR fetcher signature: key -> Promise<data>.
// Keys look like `item-<id>-<nonce>`; we parse <id> out and call fakeFetch.
export function swrFetcher(key: string): Promise<Item> {
  const match = /^item-(\d+)/.exec(key)
  const id = match ? Number(match[1]) : 0
  return fakeFetch(id)
}
