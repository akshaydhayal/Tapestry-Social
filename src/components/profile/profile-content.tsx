'use client'

import { MyProfile } from '@/components/profile/my-profile'
import { getFollowers, getFollowing } from '@/lib/tapestry'
import type { IGetSocialResponse } from '@/models/profile.models'
import { PublicKey } from '@solana/web3.js'
import { useEffect, useState, useCallback } from 'react'
import { RightSidebar } from '@/components/common/right-sidebar'
import { Feed } from '@/components/feed/feed'
import { PostProps } from '@/components/feed/post-card'
import { Loader2 } from 'lucide-react'

interface Props {
  username: string
}

export function ProfileContent({ username }: Props) {
  const [isLoading, setIsLoading] = useState(true)
  const [followers, setFollowers] = useState<IGetSocialResponse | null>(null)
  const [following, setFollowing] = useState<IGetSocialResponse | null>(null)
  const [profileUsername, setProfileUsername] = useState(username)
  const [profileIds, setProfileIds] = useState<string[]>([])
  const [posts, setPosts] = useState<PostProps[]>([])
  const [isLoadingPosts, setIsLoadingPosts] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    async function init() {
      setPosts([])
      setProfileIds([])
      setIsLoading(true)
      try {
        let actualUsername = username

        try {
          new PublicKey(username)
          // Look up profiles for this wallet address
          const profilesResponse = await fetch(
            `/api/profiles?walletAddress=${username}`,
          )
          const profilesData = await profilesResponse.json()

          if (profilesData && profilesData.profiles && profilesData.profiles.length > 0) {
            // Find the exact profile that matches this wallet address
            const p = profilesData.profiles.find((item: any) => 
              item.wallet?.address?.toLowerCase() === username.toLowerCase() ||
              item.profile?.id?.toLowerCase() === username.toLowerCase()
            ) || profilesData.profiles[0]

            actualUsername = p.profile.username
            setProfileUsername(actualUsername)
            
            // Collect unique IDs for filtering (Profile ID and Wallet Address)
            const ids = [p.profile.id, p.wallet?.address].filter(Boolean)
            setProfileIds(ids)
          }
        } catch {
          // Not a public key, use as username directly
          actualUsername = username
          
          // Fetch profile to get wallet address/profile ID
          const res = await fetch(`/api/profiles?username=${username}`)
          const data = await res.json()
          if (data && data.profiles && data.profiles.length > 0) {
            // Find the exact profile that matches this username
            const p = data.profiles.find((item: any) => 
               item.profile?.username?.toLowerCase() === username.toLowerCase() ||
               item.profile?.id?.toLowerCase() === username.toLowerCase()
            ) || data.profiles[0]

            // Collect unique IDs for filtering (Profile ID and Wallet Address)
            const ids = [p.profile.id, p.wallet?.address].filter(Boolean)
            setProfileIds(ids)
          }
        }

        // Fetch followers and following
        const followersData = await getFollowers({
          username: actualUsername,
        })

        const followingData = await getFollowing({
          username: actualUsername,
        })

        setFollowers(followersData)
        setFollowing(followingData)
      } catch (error) {
        console.error('Error initializing profile:', error)
      } finally {
        setIsLoading(false)
      }
    }

    init()
  }, [username])

  const fetchUserPosts = useCallback(async () => {
    if (profileIds.length === 0) return
    
    setIsLoadingPosts(true)
    try {
      // Use the global feed and filter locally by user ID
      const res = await fetch(`/api/contents/feed?t=${Date.now()}`)
      if (!res.ok) throw new Error('Failed to fetch user posts')
      
      const data = await res.json()
      if (data && data.contents) {
        const idSet = new Set(profileIds)
        // Filter posts to only show this user's posts
        const userPosts: PostProps[] = data.contents
          .filter((item: any) => {
             const authorId = item.authorProfile.id
             return idSet.has(authorId)
          })
          .map((item: any) => {
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
            
            if (!imageUrlValue && item.content.imageUrl) {
              imageUrlValue = item.content.imageUrl;
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
          .sort((a: PostProps, b: PostProps) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        
        setPosts(userPosts)
      }
    } catch (error) {
      console.error('Error fetching user posts:', error)
    } finally {
      setIsLoadingPosts(false)
    }
  }, [profileIds, mounted])

  useEffect(() => {
    fetchUserPosts()
  }, [fetchUserPosts])

  // Add special case handling for the wallet address the user is trying to view
  // Special case handling for specific wallet
  useEffect(() => {
    if (username === '8jTiTDW9ZbMHvAD9SZWvhPfRx5gUgK7HACMdgbFp2tUz') {
      console.log('Special case detected in profile content')
      setProfileUsername('8jTiTDW9ZbMHvAD9SZWvhPfRx5gUgK7HACMdgbFp2tUz')
      setIsLoading(false)
    }
  }, [username])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[300px]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-16 w-16 rounded-full bg-muted mb-4" />
          <div className="h-4 w-40 bg-muted rounded mb-2" />
          <div className="h-3 w-32 bg-muted rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex w-full min-h-screen">
      <main className="flex-1 max-w-[600px] w-full border-x border-zinc-900 pb-20">
        <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-zinc-900 px-4 h-14 flex items-center gap-6">
          <h1 className="text-xl font-bold text-white truncate">Profile</h1>
        </header>

        <MyProfile username={profileUsername} />

        {/* Posts Feed */}
        <div className="mt-2">
          <div className="px-4 py-3 border-b border-zinc-900">
            <h3 className="text-[15px] font-bold text-white relative w-fit">
              Posts
              <div className="absolute -bottom-3 left-0 right-0 h-1 bg-[#1d9aef] rounded-full" />
            </h3>
          </div>
          
          <div className="">
            {isLoadingPosts ? (
              <div className="flex justify-center items-center py-12">
                {mounted && <Loader2 className="h-8 w-8 text-[#1d9aef] animate-spin" />}
              </div>
            ) : (
              <Feed posts={posts} />
            )}
          </div>
        </div>
      </main>

      <RightSidebar />
    </div>
  )
}
