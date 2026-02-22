import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Heart, MessageCircle, Share2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export interface PostProps {
  id: string
  author: {
    username: string
    avatarUrl?: string
    walletAddress: string
  }
  content: string
  subnet?: string
  imageUrl?: string
  likesCount: number
  commentsCount: number
  createdAt: string
  isLiked?: boolean
  onLike?: () => void
}

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useProfileStore } from '@/store/profile'

export function PostCard({ post }: { post: PostProps }) {
  const router = useRouter()
  const { mainUsername } = useProfileStore()
  
  const [isLiked, setIsLiked] = useState<boolean>(!!post.isLiked)
  const [likesCount, setLikesCount] = useState<number>(post.likesCount)
  const [isLiking, setIsLiking] = useState(false)

  const [commentsCount, setCommentsCount] = useState<number>(post.commentsCount)
  const [showCommentBox, setShowCommentBox] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [isCommenting, setIsCommenting] = useState(false)

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!mainUsername || isLiking) return

    setIsLiking(true)
    const previousIsLiked = isLiked
    const previousLikesCount = likesCount

    // Optimistic Update
    setIsLiked(!isLiked)
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1)

    try {
      const method = previousIsLiked ? 'DELETE' : 'POST'
      const url = previousIsLiked 
        ? `/api/contents/like?nodeId=${post.id}&profileId=${mainUsername}`
        : '/api/contents/like'
        
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: previousIsLiked ? undefined : JSON.stringify({ nodeId: post.id, profileId: mainUsername })
      })

      if (!res.ok) throw new Error('Failed to toggle like')
    } catch (error) {
      console.error(error)
      // Revert optimistic update
      setIsLiked(previousIsLiked)
      setLikesCount(previousLikesCount)
    } finally {
      setIsLiking(false)
    }
  }

  const handleComment = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!mainUsername || !commentText.trim() || isCommenting) return

    setIsCommenting(true)
    try {
      const res = await fetch('/api/contents/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId: post.id,
          profileId: mainUsername,
          text: commentText
        })
      })

      if (!res.ok) throw new Error('Failed to post comment')
      
      setCommentsCount(prev => prev + 1)
      setCommentText('')
      setShowCommentBox(false)
    } catch (error) {
      console.error(error)
    } finally {
      setIsCommenting(false)
    }
  }

  return (
    <Card 
      onClick={() => router.push(`/post/${post.id}`)}
      className="bg-zinc-950/50 backdrop-blur-md border-zinc-800/80 hover:border-zinc-700 transition-colors mb-4 rounded-xl overflow-hidden shadow-lg shadow-black/20 cursor-pointer group"
    >
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <Avatar className="h-10 w-10 ring-2 ring-zinc-800 ring-offset-2 ring-offset-black">
            {post.author.avatarUrl ? (
              <Image src={post.author.avatarUrl} alt={post.author.username} fill className="object-cover" />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                {post.author.username.charAt(0).toUpperCase()}
              </div>
            )}
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-100 group-hover:text-purple-400 transition-colors truncate">{post.author.username}</span>
                <span className="text-sm text-zinc-500 truncate max-w-[120px]">
                  {post.author.walletAddress.slice(0,4)}...{post.author.walletAddress.slice(-4)}
                </span>
                <span className="text-xs text-zinc-600 px-1">•</span>
                <span className="text-xs text-zinc-500">{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
              
              {post.subnet && (
                <Badge variant="secondary" className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-0.5 whitespace-nowrap">
                  {post.subnet}
                </Badge>
              )}
            </div>

            <div className="text-zinc-300 mt-2 mb-4 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
              {post.content}
            </div>

            {post.imageUrl && (
              <div className="relative w-full rounded-2xl overflow-hidden border border-zinc-900/50 mt-3 mb-4 shadow-md bg-zinc-950/20">
                <img 
                  src={post.imageUrl} 
                  alt="Post attachment" 
                  className="w-full h-auto max-h-[500px] object-cover hover:scale-[1.02] transition-transform duration-500 ease-in-out"
                  onError={(e) => {
                    // Try to hide broken images completely
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
              </div>
            )}

            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-zinc-900/50">
              <button 
                onClick={(e) => handleLike(e)}
                disabled={isLiking}
                className={`flex items-center gap-2 text-sm transition-colors ${isLiked ? 'text-pink-500' : 'text-zinc-500 hover:text-pink-400'}`}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                <span>{likesCount}</span>
              </button>
              
              <button 
                onClick={(e) => { e.stopPropagation(); setShowCommentBox(!showCommentBox); }}
                className="flex items-center gap-2 text-sm text-zinc-500 hover:text-blue-400 transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{commentsCount}</span>
              </button>

              <button 
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors ml-auto"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>

            {showCommentBox && (
              <div 
                className="mt-4 flex gap-2 w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
                />
                <button
                  onClick={(e) => handleComment(e)}
                  disabled={isCommenting || !commentText.trim()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50"
                >
                  {isCommenting ? '...' : 'Reply'}
                </button>
              </div>
            )}
            
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
