import { cacheLife } from 'next/cache'

export type ItemData = {
  teamSlug: string
  id: string
  url: string
  cachedAt: string
}

export async function getData({ params }): Promise<ItemData> {
  'use cache: private'
  cacheLife('seconds')

  const { teamSlug, id } = await params
  const url = `/api/teams/${teamSlug}/items/${id}`
  return { teamSlug, id, url, cachedAt: new Date().toISOString() }
}
