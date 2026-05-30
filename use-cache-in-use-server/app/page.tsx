import { SWRClient } from './swr-client'
import { getData, getKey } from './query'

export default async function Page() {
  const repos = ['vercel/next.js', 'vercel/swr']

  // getKey runs on the SERVER (it's a server action), producing the URL key.
  // getData (use cache) is preloaded server-side; its promise streams to the client.
  const items = await Promise.all(
    repos.map(async (repo) => ({
      repo,
      swrKey: await getKey(repo),
      promise: getData(repo),
    })),
  )

  return (
    <main
      style={{ padding: 24, fontFamily: 'monospace', display: 'grid', gap: 16 }}
    >
      <h1>{`get / getKey in "use server", getData has "use cache"`}</h1>
      <SWRClient items={items} />
    </main>
  )
}
