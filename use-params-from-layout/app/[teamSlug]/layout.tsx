import { Suspense } from 'react'
import { ClientParams } from './client-params'

export default function RootLayout({ children, params }) {
  return (
    <>
      <Suspense fallback={<div>Loading server params...</div>}>
        <ServerParams params={params} />
      </Suspense>
      <Suspense fallback={<div>Loading client params...</div>}>
        <ClientParams />
      </Suspense>
      {children}
    </>
  )
}

async function ServerParams({ params }) {
  const { teamSlug, project } = await params
  return (
    <>
      <p>server team slug: {teamSlug}</p>
      <p>server project: {project}</p>
    </>
  )
}