import { getUsers } from './lib'

export default async function Page() {
  const users = await getUsers()
  return <p>{users}</p>
}
