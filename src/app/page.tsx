'use client'

import { Feed } from '@/components/feed/feed'
import { CreatePost } from '@/components/feed/create-post'
import { PostProps } from '@/components/feed/post-card'
import { useState, useEffect, useCallback } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Loader2 } from 'lucide-react'
import { useFollowEvent } from '@/hooks/use-follow-event'

import { RightSidebar } from '@/components/common/right-sidebar'

export default function HomeFeedPage() {
  const [posts, setPosts] = useState<PostProps[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingFeed, setIsLoadingFeed] = useState(true)
  const [feedType, setFeedType] = useState<'following' | 'global'>('global')
  const [mounted, setMounted] = useState(false)
  const { connected, publicKey } = useWallet()

  useEffect(() => {
    setMounted(true)
  }, [])
  const fetchPosts = useCallback(async () => {
    console.log(`Fetching ${feedType} feed...`)
    setPosts([]) // Clear current posts to show loading/empty state during transition
    setIsLoadingFeed(true)
    const endpoint = feedType === 'global' 
      ? `/api/contents/feed?t=${Date.now()}` 
      : `/api/contents/following?walletAddress=${publicKey?.toBase58() || ''}&t=${Date.now()}`
    
    if (feedType === 'following' && !publicKey) {
      setPosts([])
      setIsLoadingFeed(false)
      return
    }

    try {
      const res = await fetch(endpoint)
      if (!res.ok) throw new Error('Failed to fetch feed')
      
      const data = await res.json()
      if (data && data.contents) {
        const tapestryPosts: PostProps[] = data.contents.map((item: any) => {
          let contentText = item.content.text || '';
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
        if (!imageUrlValue && item.content.imageUrl) {
            imageUrlValue = item.content.imageUrl;
        }

        if (!imageUrlValue && !contentText.includes('|TAPESTRY_META|')) {
           // Fallback to legacy properties if they ever get fixed in the Tapestry API response mappings
           const textProp = item.content.properties?.find((p: any) => p.key === 'text')
           const subnetProp = item.content.properties?.find((p: any) => p.key === 'subnet')
           const imageProp = item.content.properties?.find((p: any) => p.key === 'imageUrl')
           
           if (!contentText) contentText = textProp?.value || 'No content'
           subnetValue = subnetProp ? subnetProp.value : ''
           imageUrlValue = imageProp ? imageProp.value : undefined
        }

          return {
            id: item.content.id,
            author: {
              username: item.authorProfile.username,
              avatarUrl: item.authorProfile.image,
              walletAddress: item.authorProfile.id,
            },
            content: contentText || 'No content',
            subnet: subnetValue,
            imageUrl: imageUrlValue,
            likesCount: item.socialCounts?.likeCount || 0,
            commentsCount: item.socialCounts?.commentCount || 0,
            createdAt: new Date(item.content.created_at).toISOString(),
            isLiked: item.requestingProfileSocialInfo?.hasLiked || false,
          }
        })
      
      // Filter out empty posts without text and sort newest first
      const validPosts = tapestryPosts
        .filter(p => p.content !== 'No content')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      
      setPosts(validPosts)
    } else {
      setPosts([])
    }
    } catch (error) {
      console.error(`Error fetching ${feedType} feed:`, error)
      setPosts([])
    } finally {
      setIsLoadingFeed(false)
    }
  }, [feedType, publicKey])

  useFollowEvent(fetchPosts)

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const handleCreatePost = async (content: string, subnet: string, imageUrl?: string) => {
    if (!connected || !publicKey) return

    setIsSubmitting(true)
    try {
      // Basic post props
      const properties: { key: string; value: string }[] = []
      if (subnet) {
        properties.push({ key: 'subnet', value: subnet })
      }
      
      // Attach Image ID if provided
      if (imageUrl && imageUrl.trim() !== '') {
        properties.push({ key: 'imageUrl', value: imageUrl.trim() })
      }

      const res = await fetch('/api/contents/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerWalletAddress: publicKey.toBase58(),
          content,
          properties
        })
      })

      if (!res.ok) {
        throw new Error('Failed to create post')
      }

      await fetchPosts()
    } catch (error) {
      console.error(error)
      alert("Failed to create post")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex w-full min-h-screen">
      {/* Main Feed Content */}
      <main className="flex-1 max-w-[600px] w-full border-x border-zinc-900 pb-20">
        <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-zinc-900 flex flex-col pt-2 cursor-pointer">
          <div className="flex w-full h-14">
            <button 
              onClick={() => setFeedType('global')}
              className="flex-1 flex justify-center items-center hover:bg-zinc-900/50 transition-colors relative font-bold text-[15px] group"
            >
              <div className="flex flex-col items-center h-full justify-center">
                <span className={`${feedType === 'global' ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'}`}>For you</span>
                {feedType === 'global' && (
                  <div className="absolute bottom-0 h-1 w-14 bg-[#1d9aef] rounded-full"></div>
                )}
              </div>
            </button>
            <button 
              onClick={() => setFeedType('following')}
              className="flex-1 flex justify-center items-center hover:bg-zinc-900/50 transition-colors relative font-bold text-[15px] group"
            >
               <div className="flex flex-col items-center h-full justify-center">
                <span className={`${feedType === 'following' ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'}`}>Following</span>
                {feedType === 'following' && (
                  <div className="absolute bottom-0 h-1 w-20 bg-[#1d9aef] rounded-full"></div>
                )}
              </div>
            </button>
          </div>
        </header>

        <CreatePost onSubmit={handleCreatePost} isLoading={isSubmitting} />
        
        <div className="w-full">
          {isLoadingFeed ? (
            <div className="flex justify-center items-center py-10">
              {mounted && <Loader2 className="h-7 w-7 text-[#1d9aef] animate-spin" />}
            </div>
          ) : (
            <Feed posts={posts} />
          )}
        </div>
      </main>

      {/* Right Sidebar Component */}
      <RightSidebar />
    </div>
  )
}
