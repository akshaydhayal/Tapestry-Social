import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Heart, MessageCircle, Share2, RefreshCw } from 'lucide-react'
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
import { useState, useEffect } from 'react'
import { useProfileStore } from '@/store/profile'

export function PostCard({ post }: { post: PostProps }) {
  const router = useRouter()
  const { mainUsername } = useProfileStore()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

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

  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/${post.author.username}`)
  }

  return (
    <article 
      onClick={() => router.push(`/post/${post.id}`)}
      className="border-b border-zinc-900 hover:bg-white/[0.02] transition-colors cursor-pointer px-4 pt-3 pb-3 flex gap-3 group"
    >
      <div 
        onClick={handleUserClick}
        className="flex-shrink-0 pt-1"
      >
        <Avatar className="h-10 w-10 ring-0 hover:opacity-80 transition-opacity">
          {post.author.avatarUrl ? (
            <Image src={post.author.avatarUrl} alt={post.author.username} fill className="object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[#1d9aef] to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
              {post.author.username.charAt(0).toUpperCase()}
            </div>
          )}
        </Avatar>
      </div>
      
      <div className="flex-1 min-w-0 pb-1">
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span 
              onClick={handleUserClick}
              className="font-bold text-[15px] text-white hover:underline truncate"
            >
              {post.author.username}
            </span>
            <span 
              onClick={handleUserClick}
              className="text-[15px] text-zinc-500 truncate max-w-[120px]"
            >
              @{post.author.walletAddress.slice(0,4)}...{post.author.walletAddress.slice(-4)}
            </span>
            <span className="text-[15px] text-zinc-500">·</span>
            <span className="text-[15px] text-zinc-500 hover:underline">{mounted ? new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '...'}</span>
          </div>
          
          {post.subnet && (
            <Badge variant="secondary" className="bg-[#1d9aef]/10 text-[#1d9aef] border border-transparent px-2 py-0 hover:bg-[#1d9aef]/20 transition-colors whitespace-nowrap text-xs ml-2">
              {post.subnet}
            </Badge>
          )}
        </div>

        <div className="text-[15px] text-zinc-100 mb-3 leading-normal whitespace-pre-wrap break-words">
          {post.content}
        </div>

        {post.imageUrl && (
          <div className="relative w-full rounded-2xl overflow-hidden border border-zinc-800 mt-2 mb-3 bg-zinc-950">
            <img 
              src={post.imageUrl} 
              alt="Post attachment" 
              className="w-full h-auto max-h-[500px] object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
              }}
            />
          </div>
        )}

        <div className="flex items-center gap-12 mt-1 text-zinc-500 group-hover:text-zinc-500">
          <button 
            onClick={(e) => { e.stopPropagation(); setShowCommentBox(!showCommentBox); }}
            className="flex items-center gap-2 text-[13px] hover:text-[#1d9aef] transition-colors group/btn"
            disabled={!mounted}
          >
            <div className="p-2 rounded-full group-hover/btn:bg-[#1d9aef]/10 transition-colors -ml-2">
               {mounted && <MessageCircle className="h-[18px] w-[18px]" />}
            </div>
            <span>{commentsCount}</span>
          </button>

          <button 
            onClick={(e) => handleLike(e)}
            disabled={isLiking || !mounted}
            className={`flex items-center gap-2 text-[13px] transition-colors group/btn ${isLiked ? 'text-[#f91880]' : 'hover:text-[#f91880]'}`}
          >
            <div className={`p-2 rounded-full transition-colors ${isLiked ? '' : 'group-hover/btn:bg-[#f91880]/10'}`}>
                {mounted && <Heart className={`h-[18px] w-[18px] ${isLiked ? 'fill-current' : ''}`} />}
            </div>
            <span className={isLiked ? '' : ''}>{likesCount}</span>
          </button>
        </div>

        {showCommentBox && (
          <div 
            className="mt-3 flex gap-2 w-full pt-1"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="text"
              placeholder="Post your reply"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 bg-transparent border-b border-zinc-800 px-1 py-2 text-[15px] text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#1d9aef] transition-colors"
            />
            <button
              onClick={(e) => handleComment(e)}
              disabled={isCommenting || !commentText.trim()}
              className="px-4 py-1.5 bg-[#1d9aef] hover:bg-[#1a8cd8] text-white text-sm font-bold rounded-full transition-colors disabled:opacity-50 mt-1"
            >
              {isCommenting ? '...' : 'Reply'}
            </button>
          </div>
        )}
      </div>
    </article>
  )
}
