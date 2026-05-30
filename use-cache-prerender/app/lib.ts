import { cacheLife } from 'next/cache'

export async function getUsers() {
  'use cache'
  cacheLife('minutes')
  return new Promise<string>((resolve) => {
    resolve(`Alice, Bob, Charlie @ ${new Date().toISOString()}`)
  })
}
