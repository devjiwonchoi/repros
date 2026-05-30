import { NextResponse } from 'next/server'

export async function GET() {
  await new Promise((r) => setTimeout(r, 1000))
  return NextResponse.json({
    name: 'swr-rsc-repro',
    fetchedAt: new Date().toISOString(),
    runtime: typeof window === 'undefined' ? 'server' : 'client',
  })
}
