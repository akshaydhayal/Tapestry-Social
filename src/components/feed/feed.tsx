'use client'

import { PostCard, PostProps } from './post-card'

interface FeedProps {
  posts: PostProps[]
  isLoading?: boolean
}

export function Feed({ posts, isLoading }: FeedProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 bg-zinc-900/50 rounded-xl" />
        ))}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-500 bg-zinc-950/30 rounded-xl border border-zinc-800/50">
        <p className="text-lg">No posts to show yet.</p>
        <p className="text-sm mt-2">Follow some users or join a community to see activity here!</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={{...post}} />
      ))}
    </div>
  )
}
