import type { ItemData } from '../../query'
import { getData } from '../../query'
import { queryServer } from '@/app/server-queries/query-server'
import { Client } from './client'

export default async function Page({ params }) {
  const query = queryServer<ItemData>({ loader: getData, params })

  return <Client query={query} />
}
