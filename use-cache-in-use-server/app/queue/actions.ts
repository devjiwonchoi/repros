'use server'

import { cacheLife } from 'next/cache'

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

// A plain Server Action (mutation-like). Goes through callServer -> action queue.
export async function runAction(label: string, ms: number) {
  const startedAt = Date.now()
  console.log(`[SRV] action:start ${label} ms=${ms} @ ${startedAt}`)
  await sleep(ms)
  const endedAt = Date.now()
  console.log(`[SRV] action:end   ${label} (+${endedAt - startedAt}ms)`)
  return { label, startedAt, endedAt }
}

// A "use cache" read, exposed as a server function. `bust` is part of the cache
// key, so a unique value forces a MISS — guaranteeing the body actually sleeps
// `ms` (otherwise a hit would return instantly and "slow" wouldn't be real).
export async function cachedRead(label: string, ms: number, bust: string) {
  'use cache'
  cacheLife('seconds')
  const startedAt = Date.now()
  console.log(`[SRV] cache:start  ${label} ms=${ms} bust=${bust} @ ${startedAt}`)
  await sleep(ms)
  const endedAt = Date.now()
  console.log(`[SRV] cache:end    ${label} (+${endedAt - startedAt}ms)`)
  return { label, startedAt, endedAt, bust }
}
