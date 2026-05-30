import { CarriedId } from './client'
import { getData } from '../query'
import { getServerReferenceId } from '../server-ref-id'

export default function Page() {
  // $$id read on the SERVER (where it's available), carried down as a prop.
  const baseKey = getServerReferenceId(getData)
  console.log('[carried-id] baseKey ($$id from RSC):', baseKey)

  const repos = ['vercel/next.js', 'vercel/swr']
  const items = repos.map((repo) => ({ repo, promise: getData(repo) }))

  return (
    <main
      style={{ padding: 24, fontFamily: 'monospace', display: 'grid', gap: 16 }}
    >
      <h1>{`key = $$id (carried from RSC) + param`}</h1>
      <div>
        baseKey: <code data-testid="basekey">{String(baseKey)}</code>
      </div>
      <CarriedId baseKey={baseKey ?? 'null'} items={items} />
    </main>
  )
}
