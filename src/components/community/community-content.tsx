'use client'

import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { extractCommunityMeta } from '@/utils/community-meta'
import { getCleanBio } from '@/utils/bio-utils'
import { Hash, Lock, Globe, Loader2, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState, useCallback } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Feed } from '@/components/feed/feed'
import { PostProps } from '@/components/feed/post-card'
import { CreateCommunityPostModal } from './create-community-post-modal'
import { RightSidebar } from '@/components/common/right-sidebar'
import { useGetFollowersState } from '@/components/profile/hooks/use-get-follower-state'
import { useFollowUser } from '@/components/profile/hooks/use-follow-user'
import { useFairScore } from '@/hooks/use-fairscore'
import { Button } from '@/components/common/button'

interface Props {
  communityProfile: any // Raw profile item from the API
}

export function CommunityContent({ communityProfile }: Props) {
  const { walletAddress, mainUsername } = useCurrentWallet()
  const { publicKey } = useWallet()
  const [posts, setPosts] = useState<PostProps[]>([])
  const [isLoadingPosts, setIsLoadingPosts] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => setMounted(true), [])
  
  // Parse Meta
  const bio = getCleanBio(communityProfile?.profile?.bio)
  const { meta } = extractCommunityMeta(communityProfile?.profile?.bio)
  const username = communityProfile.profile.username
  const name = meta?.name || username.replace('Community_', '')
  const isGated = meta?.gateType === 'fairscore' && meta?.fairScoreGate && meta.fairScoreGate > 0
  const gateScore = meta?.fairScoreGate || 0
  const image = communityProfile.profile.image

  // Membership & Score validation
  const { fairScore, isLoading: scoreLoading } = useFairScore(walletAddress, mainUsername, '')
  const { data: followState, loading: stateLoading, refetch: refetchState } = useGetFollowersState({
    followerUsername: mainUsername || '',
    followeeUsername: username
  })
  const { followUser, loading: followLoading } = useFollowUser()
  const [joinError, setJoinError] = useState('')

  const isJoined = followState?.isFollowing || walletAddress === communityProfile.wallet?.address
  const canView = !isGated || isJoined
  const canPost = isJoined

  // Fetch posts filtered by subnet metadata matching this group
  const fetchPosts = useCallback(async () => {
    if (!canView) return
    setIsLoadingPosts(true)
    try {
      const res = await fetch(`/api/contents/feed?t=${Date.now()}`)
      const data = await res.json()
      if (data && data.contents) {
        const subnetPosts: PostProps[] = data.contents
          .filter((item: any) => {
             // Look for subnet in TAPESTRY_META
             const contentText = item.content.text || ''
             if (contentText.includes('|TAPESTRY_META|')) {
               const parts = contentText.split('|TAPESTRY_META|')
               const msgMeta = parts[1]
               const subnetMatch = msgMeta.match(/subnet=([^|\s]+)/)
               if (subnetMatch && subnetMatch[1] === name) {
                 return true
               }
             }
             return false
          })
          .map((item: any) => {
            const parts = item.content.text.split('|TAPESTRY_META|')
            const contentText = parts[0].trim();
            const msgMeta = parts[1];
            
            let imageUrlValue: string | undefined = undefined;
            const imgMatch = msgMeta?.match(/imageUrl=([^|]+)/);
            if (imgMatch) imageUrlValue = imgMatch[1];
            if (!imageUrlValue && item.content.imageUrl) {
              imageUrlValue = item.content.imageUrl;
            }

            return {
              id: item.content.id,
              content: contentText || 'No content',
              author: {
                username: item.authorProfile.username,
                avatarUrl: item.authorProfile.image,
                walletAddress: item.authorProfile.id,
              },
              subnet: name,
              imageUrl: imageUrlValue,
              likesCount: item.socialCounts?.likeCount || 0,
              commentsCount: item.socialCounts?.commentCount || 0,
              createdAt: new Date(item.content.created_at).toISOString(),
              isLiked: item.requestingProfileSocialInfo?.hasLiked || false,
            }
          })
          .sort((a: PostProps, b: PostProps) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        
        setPosts(subnetPosts)
      }
    } catch (e) {
      console.error('Failed to load posts', e)
    } finally {
      setIsLoadingPosts(false)
    }
  }, [name, canView, mainUsername])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const handleJoin = async () => {
    if (!mainUsername) return
    setJoinError('')

    // Validate if gated
    if (isGated && fairScore !== null) {
      if (fairScore < gateScore) {
        setJoinError(`Your FairScore (${fairScore}) does not meet the requirement (${gateScore}).`)
        return
      }
    }

    try {
      await followUser({ followerUsername: mainUsername, followeeUsername: username })
      await refetchState()
    } catch (e: any) {
      setJoinError(e.message || 'Failed to join community.')
    }
  }

  const handleCreatePost = async (content: string, _subnet: string, imageUrl?: string) => {
    if (!mainUsername || !walletAddress) return
    
    try {
      const properties: { key: string; value: string }[] = [{ key: 'subnet', value: name }]
      if (imageUrl && imageUrl.trim() !== '') {
        properties.push({ key: 'imageUrl', value: imageUrl.trim() })
      }
      const res = await fetch('/api/contents/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerWalletAddress: publicKey?.toBase58() || walletAddress,
          content,
          properties
        })
      })

      if (!res.ok) throw new Error('Failed to create post')

      // Fetch directly after sending
      setTimeout(() => {
        fetchPosts()
      }, 1000)
    } catch (e) {
      console.error(e)
    }
  }

  const mockMemberCount = mounted ? Math.floor(Math.sin(name.length) * 500) + 600 : '...'

  return (
    <div className="flex w-full min-h-screen">
      <main className="flex-1 max-w-[600px] w-full border-x border-zinc-900 flex flex-col h-screen">
        {/* Community Header (Sticky) */}
        <header className="sticky top-0 z-20 bg-zinc-950 border-b border-zinc-900 shrink-0 shadow-lg relative">
          {/* Banner Placeholder */}
          <div className="h-24 w-full bg-gradient-to-r from-zinc-800 to-zinc-900 absolute top-0 left-0 right-0 overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
          </div>
          
          <div className="relative pt-12 px-4 pb-4">
            <div className="flex items-end justify-between">
              {/* Profile Image & Name */}
              <div className="flex items-end gap-3 translate-y-2">
                 <div className="h-20 w-20 flex-shrink-0 rounded-2xl bg-zinc-900 flex items-center justify-center text-3xl border-4 border-zinc-950 shadow-xl overflow-hidden relative z-10">
                   {image ? (
                     <Image src={image} alt={name} fill unoptimized className="object-cover" />
                   ) : (
                     <Hash className="h-8 w-8 text-[#1d9aef]" />
                   )}
                 </div>
                 <div className="flex flex-col pb-1">
                    <div className="flex items-center gap-1.5">
                      <h1 className="text-xl font-black text-white">{name}</h1>
                    </div>
                    <span className="text-[13px] text-zinc-400 font-medium">@{username}</span>
                 </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 relative z-10 pb-1">
                {canPost && (
                  <CreateCommunityPostModal onSubmit={handleCreatePost} communityName={name} />
                )}
                
                <Button 
                  onClick={handleJoin} 
                  disabled={isJoined || stateLoading || followLoading || scoreLoading || !mainUsername}
                  className={`h-9 px-5 text-sm font-bold rounded-full transition-all ${isJoined ? 'bg-zinc-800 text-white hover:bg-zinc-700 cursor-default border border-zinc-700' : 'bg-white text-black hover:bg-zinc-200 shadow-md'}`}
                >
                  {stateLoading ? <Loader2 className="h-4 w-4 animate-spin mx-2" /> : isJoined ? 'Joined' : 'Join Group'}
                </Button>
              </div>
            </div>
            
            <div className="mt-5 space-y-2.5">
              {bio && (
                <p className="text-[14px] text-zinc-300 leading-snug">
                  {bio}
                </p>
              )}
              
              <div className="flex items-center gap-4 text-[13px] text-zinc-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="text-white font-bold">{mockMemberCount}</span> Members
                </span>
                <span className="flex items-center gap-1">
                  {isGated ? (
                    <>
                      <Lock className="h-3.5 w-3.5 text-amber-500" />
                      <span className="text-amber-500/90">Requires Rep &gt; {gateScore}</span>
                    </>
                  ) : (
                    <>
                      <Globe className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-emerald-500/90">Public Group</span>
                    </>
                  )}
                </span>
              </div>
            </div>

            {joinError && (
              <div className="mt-3 flex items-start gap-1.5 text-[12px] text-rose-400 font-medium bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{joinError}</span>
              </div>
            )}
          </div>
        </header>

        {/* Feed Content Area */}
        <div className="flex-1 overflow-y-auto bg-black relative custom-scrollbar">
          {(!canView) ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
              <div className="h-16 w-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-4 border border-amber-500/20">
                <Lock className="h-8 w-8 text-amber-500" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Restricted Access</h2>
              <p className="text-sm text-zinc-400 max-w-[280px]">
                This community requires a minimum FairScore of <span className="text-amber-400 font-bold">{gateScore}</span> to view and post messages.
              </p>
              {fairScore !== null && (
                <div className="mt-6 bg-zinc-900 border border-zinc-800 p-3 rounded-xl flex items-center gap-3">
                   <div className="flex flex-col items-start gap-0.5">
                     <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Your Current Score</span>
                     <span className={`text-lg font-black ${fairScore >= gateScore ? 'text-emerald-400' : 'text-rose-400'}`}>{fairScore}</span>
                   </div>
                </div>
              )}
            </div>
          ) : (
            <div className="pb-20">
              {!canPost && (
                <div className="p-4 bg-zinc-900/50 border-b border-zinc-900 text-center text-sm text-zinc-500 mb-4">
                  Join this group to participate in the discussion.
                </div>
              )}
              
              <div className="w-full">
                {isLoadingPosts ? (
                  <div className="flex justify-center items-center py-10">
                    <Loader2 className="h-7 w-7 text-[#1d9aef] animate-spin" />
                  </div>
                ) : (
                  <Feed posts={posts} hideSubnets={true} />
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      
      <RightSidebar />
    </div>
  )
}
