'use server'

import { cacheLife } from 'next/cache'

// Server Action (file-level "use server") whose body also declares "use cache".
// Takes `repo` so we can probe whether the server-reference id ($$id) varies
// with the argument: $$id identifies the function, not the individual call.
export async function foobarbaz(repo: string) {
  'use cache'
  cacheLife('seconds')

  return {
    repo,
    cachedAt: new Date().toISOString(),
  }
}


// fetcher.name = 'bar'