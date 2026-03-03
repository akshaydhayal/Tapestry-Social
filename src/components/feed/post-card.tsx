import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Heart, MessageCircle } from 'lucide-react'
import Image from 'next/image'

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
import { ProfileHoverCard } from '@/components/profile/profile-hover-card'

export function PostCard({ post, hideSubnet }: { post: PostProps, hideSubnet?: boolean }) {
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

  // Parse out title if it exists from the auto-formatting
  let title = '';
  let textContent = post.content;
  const titleMatch = textContent.match(/^\*\*([^*]+)\*\*(?:\s*\n\n\s*|\s+)([\s\S]*)$/);
  if (titleMatch) {
    title = titleMatch[1];
    textContent = titleMatch[2];
  } else if (textContent.startsWith('**') && textContent.endsWith('**') && !textContent.includes('\n')) {
     title = textContent.replace(/\*\*/g, '');
     textContent = '';
  }

  return (
    <article 
      onClick={() => router.push(`/post/${post.id}`)}
      className="border-b border-[#3f3f46] hover:bg-white/[0.01] transition-all duration-200 cursor-pointer px-[14px] py-2.5 flex gap-3 group/post"
    >
      <div 
        onClick={handleUserClick}
        className="flex-shrink-0 pt-1 relative z-10"
      >
        <ProfileHoverCard username={post.author.username}>
          <div className="inline-block cursor-pointer">
            <Avatar className="h-9 w-9 ring-1 ring-zinc-800/50 hover:opacity-90 transition-opacity">
              {post.author.avatarUrl ? (
                <Image src={post.author.avatarUrl} alt={post.author.username} fill className="object-cover" />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-indigo-500 to-[#1d9aef] rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {post.author.username.charAt(0).toUpperCase()}
                </div>
              )}
            </Avatar>
          </div>
        </ProfileHoverCard>
      </div>
      
      <div className="flex-1 min-w-0 pb-1">
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <ProfileHoverCard username={post.author.username}>
              <span 
                onClick={handleUserClick}
                className="font-bold text-[14px] text-zinc-100 group-hover/post:text-white transition-colors hover:underline truncate relative z-10 inline-block cursor-pointer"
              >
                {post.author.username}
              </span>
            </ProfileHoverCard>
            <span 
              onClick={handleUserClick}
              className="text-[13px] text-zinc-500 truncate max-w-[100px] font-medium cursor-pointer hover:text-zinc-400 transition-colors"
            >
              @{post.author.walletAddress.slice(0,4)}...{post.author.walletAddress.slice(-4)}
            </span>
            <span className="text-zinc-600">·</span>
            <span className="text-[13px] text-zinc-500 cursor-pointer hover:text-zinc-400">
               {mounted ? new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '...'}
            </span>
          </div>
          
          {!hideSubnet && post.subnet && (
            <Badge variant="secondary" className="bg-[#1d9aef]/5 text-[#1d9aef] border border-[#1d9aef]/10 px-1.5 py-0 hover:bg-[#1d9aef]/15 transition-colors whitespace-nowrap text-[10px] font-black uppercase tracking-tight ml-2 cursor-pointer">
              {post.subnet}
            </Badge>
          )}
        </div>

        {title && (
          <h3 className="text-[16px] font-black text-white mb-1 leading-snug tracking-tight">{title}</h3>
        )}
        {textContent && (
          <div className="text-[14px] text-zinc-300 mb-2.5 leading-relaxed whitespace-pre-wrap break-words font-inter">
            {textContent}
          </div>
        )}

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

        <div className="flex items-center gap-9 mt-1 text-zinc-500">
          <button 
            onClick={(e) => { e.stopPropagation(); setShowCommentBox(!showCommentBox); }}
            className="flex items-center gap-1.5 text-[12px] font-semibold hover:text-[#1d9aef] transition-all group/btn"
            disabled={!mounted}
          >
            <div className="p-1.5 rounded-full group-hover/btn:bg-[#1d9aef]/10 transition-colors -ml-1.5">
               {mounted && <MessageCircle className="h-[17px] w-[17px]" />}
            </div>
            <span>{commentsCount}</span>
          </button>

          <button 
            onClick={(e) => handleLike(e)}
            disabled={isLiking || !mounted}
            className={`flex items-center gap-1.5 text-[12px] font-semibold transition-all group/btn ${isLiked ? 'text-rose-500' : 'hover:text-rose-500'}`}
          >
            <div className={`p-1.5 rounded-full transition-colors ${isLiked ? '' : 'group-hover/btn:bg-rose-500/10'}`}>
                {mounted && <Heart className={`h-[17px] w-[17px] ${isLiked ? 'fill-current' : ''}`} />}
            </div>
            <span>{likesCount}</span>
          </button>
        </div>

        {showCommentBox && (
          <div 
            className={`mt-3 flex gap-2 w-full pt-1 ${post.subnet ? 'bg-zinc-900 border border-zinc-800 p-3 rounded-xl shadow-inner' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="text"
              placeholder={post.subnet ? "Add a comment..." : "Post your reply"}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className={`flex-1 bg-transparent px-1 py-1.5 text-[15px] text-white placeholder:text-zinc-500 focus:outline-none transition-colors ${post.subnet ? 'border-none' : 'border-b border-zinc-800 focus:border-[#1d9aef]'}`}
            />
            <button
              onClick={(e) => handleComment(e)}
              disabled={isCommenting || !commentText.trim()}
              className={`px-4 py-1.5 text-white text-sm font-bold transition-colors disabled:opacity-50 mt-0.5 ${post.subnet ? 'bg-zinc-800 hover:bg-zinc-700 rounded-lg shadow-sm border border-zinc-700' : 'bg-[#1d9aef] hover:bg-[#1a8cd8] rounded-full'}`}
            >
              {isCommenting ? '...' : (post.subnet ? 'Comment' : 'Reply')}
            </button>
          </div>
        )}
      </div>
    </article>
  )
}
