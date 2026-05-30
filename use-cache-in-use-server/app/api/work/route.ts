import { type NextRequest } from 'next/server'

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

// Control: same artificial delay, but via a plain Route Handler instead of a
// server function. These do NOT go through callServer / the action queue, so
// concurrent calls should overlap (subject only to the browser's connection cap).
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const ms = Number(searchParams.get('ms') ?? '0')
  const label = searchParams.get('label') ?? 'route'
  const startedAt = Date.now()
  await sleep(ms)
  const endedAt = Date.now()
  return Response.json({ label, startedAt, endedAt })
}
