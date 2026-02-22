'use client'

import { Card } from '@/components/common/card'
import { Feed } from '@/components/feed/feed'
import { PostCard, PostProps } from '@/components/feed/post-card'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function PostDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [post, setPost] = useState<PostProps | null>(null)
  const [comments, setComments] = useState<PostProps[]>([])
  const [isLoadingPost, setIsLoadingPost] = useState(true)
  const [isLoadingComments, setIsLoadingComments] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
            username: postData.author?.username || 'Unknown User',
            avatarUrl: postData.author?.image || '',
            walletAddress: postData.author?.id || 'Unknown',
          },
          content: contentText || 'No content',
          subnet: subnetValue,
          imageUrl: imageUrlValue,
          likesCount: postData.socialCounts.likeCount || 0,
          commentsCount: postData.socialCounts.commentCount || 0,
          createdAt: new Date(postData.content.created_at * 1000).toISOString(),
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
          createdAt: new Date(c.comment.created_at * 1000).toISOString(),
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
    <div className="max-w-3xl mx-auto pb-24">
      <div className="mb-6 flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">Post Thread</h1>
      </div>

      {isLoadingPost ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      ) : post ? (
        <>
          <PostCard post={post} />
          
          <div className="mt-8">
            <h3 className="text-lg font-bold mb-4 px-2 border-b border-zinc-800 pb-2">Comments</h3>
            {isLoadingComments ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
              </div>
            ) : comments.length > 0 ? (
              <Feed posts={comments} />
            ) : (
              <div className="text-center py-12 text-zinc-500 bg-zinc-950/30 rounded-xl border border-zinc-800/50">
                <p className="text-lg">No comments yet</p>
                <p className="text-sm mt-2">Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}
