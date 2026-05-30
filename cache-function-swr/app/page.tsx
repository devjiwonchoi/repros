import Link from 'next/link'

export default function Page() {
  return (
    <main style={{ padding: 24, fontFamily: 'monospace', display: 'grid', gap: 8 }}>
      <h1>cache-function-swr</h1>
      <Link href="/team-a/1">enter /team-a/1</Link>
    </main>
  )
}
