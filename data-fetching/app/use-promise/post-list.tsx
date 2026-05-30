'use client'

import { use } from 'react'

type Post = { id: string; title: string }

export function PostList({ posts }: { posts: Promise<Post[]> }) {
  const allPosts = use(posts)
  return (
    <ul>
      {allPosts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
