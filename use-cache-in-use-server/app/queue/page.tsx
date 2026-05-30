import { Harness } from './client'

export default function Page() {
  return (
    <main style={{ padding: 24, fontFamily: 'monospace', display: 'grid', gap: 16, maxWidth: 900 }}>
      <h1 style={{ fontSize: 18 }}>Action-queue serialization probe</h1>
      <p style={{ margin: 0, fontSize: 13, opacity: 0.8 }}>
        Red = server-function calls (via callServer → action queue). Blue = plain
        Route-Handler fetches (control). If red bars run back-to-back while blue
        bars overlap, the action queue is serializing.
      </p>
      <Harness />
    </main>
  )
}
