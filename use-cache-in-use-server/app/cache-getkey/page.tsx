import { CacheGetKey } from './client'

export default function Page() {
  return (
    <main style={{ padding: 24, fontFamily: 'monospace', display: 'grid', gap: 16 }}>
      <h1>{`use(getKey()) on the client, getKey is "use cache"`}</h1>
      <CacheGetKey repo="vercel/next.js" />
    </main>
  )
}
