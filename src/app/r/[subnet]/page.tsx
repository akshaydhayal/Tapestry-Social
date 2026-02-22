'use client'

import { Feed } from '@/components/feed/feed'
import { CreatePost } from '@/components/feed/create-post'
import { PostProps } from '@/components/feed/post-card'
import { useState, useEffect, useCallback } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { ArrowLeft, LockKeyhole, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

const SUBNET_GATES: Record<string, { minScore: number, desc: string }> = {
  'SolanaDevs': { minScore: 100, desc: 'Requires FairScore > 100 to prove developer activity.' },
  'NFTWhales': { minScore: 500, desc: 'Requires FairScore > 500 or specific NFT holdings.' },
  'DeFiDegens': { minScore: 0, desc: 'Open to everyone.' }
}

export default function SubnetPage() {
  const params = useParams()
  const subnet = typeof params.subnet === 'string' ? params.subnet : 'unknown'
  const [posts, setPosts] = useState<PostProps[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { connected, publicKey } = useWallet()
  
  // Mock user's FairScore
  const [userScore, setUserScore] = useState<number | null>(null)

  const fetchPosts = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/contents/feed')
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
        
        // Filter by current subnet
        const filteredPosts = tapestryPosts
          .filter(p => p.subnet === `#${subnet}` || p.subnet === subnet)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        
        setPosts(filteredPosts)
      }
    } catch (error) {
      console.error('Error fetching subnet feed:', error)
    } finally {
      setIsLoading(false)
    }
  }, [subnet])
  
  useEffect(() => {
    // Determine the criteria
    const criteria = SUBNET_GATES[subnet] || { minScore: 0, desc: 'Open to everyone.' }
    
    // Simulate fetching the FairScale score when authenticated
    if (connected) {
      setTimeout(() => setUserScore(842), 500)
    } else {
      setUserScore(null)
    }
  }, [subnet, connected])

  useEffect(() => {
    const criteria = SUBNET_GATES[subnet] || { minScore: 0, desc: 'Open to everyone.' }
    if (criteria.minScore === 0 || (userScore !== null && userScore >= criteria.minScore)) {
      fetchPosts()
    }
  }, [fetchPosts, userScore, subnet])

  const criteria = SUBNET_GATES[subnet] || { minScore: 0, desc: 'Open to everyone.' }
  const isLocked = criteria.minScore > 0 && (userScore === null || userScore < criteria.minScore)

  const handlePostSubmit = async (content: string, _subnet: string, imageUrl?: string) => {
    if (!connected || !publicKey) return
    setIsSubmitting(true)

    try {
      const properties: { key: string; value: string }[] = [
        { key: 'subnet', value: `#${subnet}` }
      ]
      
      if (imageUrl && imageUrl.trim() !== '') {
        properties.push({ key: 'imageUrl', value: imageUrl.trim() })
      }

      const response = await fetch('/api/contents/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerWalletAddress: publicKey.toBase58(),
          content,
          properties
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create post')
      }

      const newPost: PostProps = {
        id: Math.random().toString(),
        author: {
          username: 'You',
          walletAddress: publicKey.toBase58(),
        },
        content,
        subnet: `#${subnet}`,
        imageUrl: imageUrl ? imageUrl.trim() : undefined,
        likesCount: 0,
        commentsCount: 0,
        createdAt: new Date().toISOString()
      }
      setPosts([newPost, ...posts])
    } catch (error) {
      console.error(error)
      alert("Failed to submit post")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-black text-white p-4 sm:p-6 lg:p-8">
      <main className="max-w-2xl w-full mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Global Feed</span>
          </Link>
          
          <div className="text-right">
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
              #{subnet}
            </h1>
            <p className="text-xs text-zinc-500 font-mono tracking-wider mt-1 uppercase">Members: {Math.floor(Math.random() * 1000) + 100}</p>
          </div>
        </div>

        {isLocked ? (
          <div className="mt-12 p-8 border border-zinc-800 bg-zinc-950/50 backdrop-blur-md rounded-2xl text-center relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-50" />
            <LockKeyhole className="h-16 w-16 mx-auto text-zinc-600 mb-6 relative z-10" />
            <h2 className="text-2xl font-bold mb-4 relative z-10">Access Restricted</h2>
            <p className="text-zinc-400 mb-6 relative z-10 max-w-md mx-auto">
              This subnet is gated by FairScale reputation. <br/>
              <span className="text-purple-400 font-medium">{criteria.desc}</span>
            </p>
            {!connected ? (
              <p className="text-sm text-zinc-500 relative z-10">Please log in to calculate your on-chain score.</p>
            ) : (
              <div className="bg-zinc-900 rounded-xl p-4 inline-block relative z-10 border border-zinc-800">
                <p className="text-sm text-zinc-500 mb-1">Your Current Score:</p>
                <p className="text-3xl font-black text-white">{userScore !== null ? userScore : 'Calculating...'}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CreatePost onSubmit={handlePostSubmit} isLoading={isSubmitting} />
            <div className="mt-8">
              <Feed posts={posts} isLoading={isLoading} />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
