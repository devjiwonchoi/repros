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
  console.log({ paramsServer: params })
  const initialData = loader({ params })
  console.log({ initialDataServer: initialData })
  return {
    id: getServerReferenceId(loader),
    initialData,
    loader,
  }
}
