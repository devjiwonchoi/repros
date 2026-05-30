import { ClientGetKey } from './client'

export default function Page() {
  return (
    <main style={{ padding: 24, fontFamily: 'monospace', display: 'grid', gap: 16 }}>
      <h1>{`use(getKey()) on the client (the .new.ts move)`}</h1>
      <ClientGetKey repo="vercel/next.js" />
    </main>
  )
}
