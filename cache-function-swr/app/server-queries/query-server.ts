import { getServerReferenceId } from './server-ref-id'

export type ServerQuery<T> = {
  id: string
  initialData: Promise<T>
  loader: ({
    params,
  }: {
    params: Promise<Record<string, string>> | Record<string, string>
  }) => Promise<T>
}

export function queryServer<T>({ loader, params }): ServerQuery<T> {
  const initialData = loader({ params })
  return {
    id: getServerReferenceId(loader),
    initialData,
    loader,
  }
}
