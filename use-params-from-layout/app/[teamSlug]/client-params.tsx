'use client'

import { useParams } from 'next/navigation'

export function ClientParams() {
  const { teamSlug, project } = useParams()
  return (
    <>
      <p>client team slug: {teamSlug}</p>
      <p>client project: {project}</p>
    </>
  )
}