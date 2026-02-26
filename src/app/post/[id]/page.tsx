'use client'

import { Card } from '@/components/common/card'
import { Feed } from '@/components/feed/feed'
import { PostCard, PostProps } from '@/components/feed/post-card'
import { RightSidebar } from '@/components/common/right-sidebar'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useProfileStore } from '@/store/profile'
import { Avatar } from '@/components/ui/avatar'

export default function PostDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { mainUsername, profileImage } = useProfileStore()
  const [post, setPost] = useState<PostProps | null>(null)
  const [comments, setComments] = useState<PostProps[]>([])
  const [isLoadingPost, setIsLoadingPost] = useState(true)
  const [isLoadingComments, setIsLoadingComments] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [isCommenting, setIsCommenting] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchPostAndComments = async () => {
      try {
        // 1. Fetch Post Detail
        const postRes = await fetch(`/api/contents/detail?id=${params.id}`)
        if (!postRes.ok) throw new Error('Failed to fetch post')
        const postData = await postRes.json()

        let contentText = postData.content.text || '';
        let subnetValue = '';
        let imageUrlValue: string | undefined = undefined;
        
        if (contentText.includes('|TAPESTRY_META|')) {
            const parts = contentText.split('|TAPESTRY_META|');
            contentText = parts[0].trim();
            const meta = parts[1];
            
            const subnetMatch = meta.match(/subnet=([^|]+)/);
            if (subnetMatch) subnetValue = subnetMatch[1];
            
            const imgMatch = meta.match(/imageUrl=([^|]+)/);
            if (imgMatch) imageUrlValue = imgMatch[1];
        }

        // Check for top-level imageUrl returned by Tapestry API
        if (!imageUrlValue && postData.content.imageUrl) {
            imageUrlValue = postData.content.imageUrl;
        }

        if (!imageUrlValue && !contentText.includes('|TAPESTRY_META|')) {
           const textProp = postData.content.properties?.find((p: any) => p.key === 'text');
           const subnetProp = postData.content.properties?.find((p: any) => p.key === 'subnet');
           const imageProp = postData.content.properties?.find((p: any) => p.key === 'imageUrl');
           if (!contentText) contentText = textProp?.value || 'No content';
           subnetValue = subnetProp ? subnetProp.value : '';
           imageUrlValue = imageProp ? imageProp.value : undefined;
        }

        const formattedPost: PostProps = {
          id: postData.content.id,
          author: {
            username: postData.authorProfile?.username || 'Unknown User',
            avatarUrl: postData.authorProfile?.image || '',
            walletAddress: postData.authorProfile?.id || 'Unknown',
          },
          content: contentText || 'No content',
          subnet: subnetValue,
          imageUrl: imageUrlValue,
          likesCount: postData.socialCounts.likeCount || 0,
          commentsCount: postData.socialCounts.commentCount || 0,
          createdAt: new Date(postData.content.created_at).toISOString(),
          isLiked: postData.requestingProfileSocialInfo?.hasLiked || false,
        }
        setPost(formattedPost)
        setIsLoadingPost(false)

        // 2. Fetch Comments
        const commentsRes = await fetch(`/api/comments?contentId=${params.id}`)
        if (!commentsRes.ok) throw new Error('Failed to fetch comments')
        const commentsData = await commentsRes.json()

        const formattedComments: PostProps[] = commentsData.comments.map((c: any) => ({
          id: c.comment.id,
          author: {
            username: c.author?.username || 'Unknown User',
            avatarUrl: c.author?.image || '',
            walletAddress: c.author?.id || 'Unknown',
          },
          content: c.comment.text,
          likesCount: c.socialCounts?.likeCount || 0,
          commentsCount: 0, 
          createdAt: new Date(c.comment.created_at).toISOString(),
          isLiked: c.requestingProfileSocialInfo?.hasLiked || false,
        }))
        
        // Sort comments by newest first
        formattedComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        setComments(formattedComments)
        
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoadingPost(false)
        setIsLoadingComments(false)
      }
    }

    if (params.id) {
      fetchPostAndComments()
    }
  }, [params.id])

  const handleComment = async () => {
    if (!mainUsername || !commentText.trim() || isCommenting || !post) return

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
      
      const newComment: PostProps = {
        id: Date.now().toString(),
        author: {
          username: mainUsername,
          avatarUrl: profileImage || '',
          walletAddress: mainUsername,
        },
        content: commentText,
        likesCount: 0,
        commentsCount: 0,
        createdAt: new Date().toISOString(),
        isLiked: false
      }

      setComments(prev => [newComment, ...prev])
      setCommentText('')
      setPost(prev => prev ? { ...prev, commentsCount: prev.commentsCount + 1 } : prev)
    } catch (error) {
      console.error(error)
    } finally {
      setIsCommenting(false)
    }
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full min-h-[50vh] flex-col gap-4">
        <p className="text-red-400">{error}</p>
        <button onClick={() => router.back()} className="text-zinc-500 hover:text-white transition-colors">
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="flex w-full justify-center lg:justify-start lg:gap-8 max-w-[1265px] mx-auto relative">
      <main className="w-full sm:w-[600px] min-h-[200vh] border-x border-zinc-900 shrink-0 pb-24">
        <div className="sticky top-0 bg-black/80 backdrop-blur-md z-10 border-b border-zinc-900 flex items-center gap-6 px-4 py-3">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-white"
          >
            {mounted && <ArrowLeft className="w-5 h-5" />}
          </button>
          <h1 className="text-xl font-bold text-white">Post Thread</h1>
        </div>

        {isLoadingPost ? (
          <div className="flex justify-center items-center h-48">
            {mounted && <Loader2 className="w-8 h-8 animate-spin text-[#1d9aef]" />}
          </div>
        ) : post ? (
          <>
            <PostCard post={post} />
            
            <div className="border-b border-t border-slate-500 px-4 py-3 flex gap-3">
              <Avatar className="h-10 w-10 ring-0">
                {profileImage ? (
                  <img src={profileImage} alt={mainUsername || 'Profile'} className="w-full h-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-[#1d9aef] to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                    {mainUsername ? mainUsername.charAt(0).toUpperCase() : '?'}
                  </div>
                )}
              </Avatar>
              
              <div className="flex-1 flex items-center justify-between gap-4">
                <input
                  type="text"
                  placeholder="Post your reply"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 bg-transparent border-none text-[15px] sm:text-[20px] text-white placeholder:text-zinc-500 focus:outline-none"
                  disabled={isCommenting}
                />
                <button
                  onClick={handleComment}
                  disabled={isCommenting || !commentText.trim()}
                  className="px-4 py-1.5 bg-[#1d9aef] hover:bg-[#1a8cd8] text-white text-[15px] font-bold rounded-full transition-colors disabled:opacity-50"
                >
                  {isCommenting ? '...' : 'Reply'}
                </button>
              </div>
            </div>

            <div className="mt-8">
              {isLoadingComments ? (
                <div className="flex justify-center items-center h-32">
                  {mounted && <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />}
                </div>
              ) : comments.length > 0 ? (
                <Feed posts={comments} />
              ) : (
                <div className="text-center py-12 text-zinc-500">
                  <p className="text-lg">No comments yet</p>
                  <p className="text-sm mt-2">Be the first to share your thoughts!</p>
                </div>
              )}
            </div>
          </>
        ) : null}
      </main>

      <RightSidebar />
    </div>
  )
}
