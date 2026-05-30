export type ServerSWRFetcher<T, Params> = {
  endpoint: (params: Params) => string
  fetch: (endpoint: string) => Promise<T>
}

export type DataResponse = {
  name: string
  fetchedAt: string
  runtime: 'server' | 'client'
  calledFrom?: 'server' | 'client'
}
