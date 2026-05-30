import { Suspense } from 'react'
import { PostList } from './post-list'

export default function Page() {
  const postsPromise = fetch('https://api.vercel.app/blog').then((r) =>
    r.json()
  )

  return (
    <>
      <h1>use promise (client component)</h1>
      <Suspense fallback={<p>loading…</p>}>
        <PostList posts={postsPromise} />
      </Suspense>
    </>
  )
}
