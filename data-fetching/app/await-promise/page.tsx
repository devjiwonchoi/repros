import { Suspense } from 'react'

type Post = { id: string; title: string }

async function PostList() {
  const res = await fetch('https://api.vercel.app/blog')
  const posts: Post[] = await res.json()
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}

export default function Page() {
  return (
    <>
      <h1>await promise (server component)</h1>
      <Suspense fallback={<p>loading…</p>}>
        <PostList />
      </Suspense>
    </>
  )
}
