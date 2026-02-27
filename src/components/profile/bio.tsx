'use client'

import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { Button } from '@/components/common/button'
import { useUpdateProfileInfo } from '@/components/profile/hooks/use-update-profile'
import { IProfileResponse } from '@/models/profile.models'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useProfileStore } from '@/store/profile'
import { extractFairScore, packFairScore, CachedFairScore } from '@/utils/fairscore-cache'

interface Props {
  username: string
  data?: IProfileResponse
  refetch: () => void
  isEditing: boolean
  setIsEditing: (val: boolean) => void
}

export function Bio({ username: pathUsername, data, refetch, isEditing, setIsEditing }: Props) {
  const { updateProfile, loading } = useUpdateProfileInfo({ username: pathUsername })
  
  // Extract initial bio and score
  const initialExtraction = extractFairScore(data?.profile?.bio);
  
  const [bio, setBio] = useState(initialExtraction.cleanBio)
  const [cachedScore, setCachedScore] = useState<CachedFairScore | null>(initialExtraction.cachedScore)
  const [editUsername, setEditUsername] = useState(data?.profile?.username || pathUsername || '')
  const [image, setImage] = useState(data?.profile?.image || '')
  const router = useRouter()

  useEffect(() => {
    if (data?.profile) {
      const extraction = extractFairScore(data.profile.bio);
      setBio(extraction.cleanBio)
      setCachedScore(extraction.cachedScore)
      setEditUsername(data.profile.username || pathUsername || '')
      setImage(data.profile.image || '')
    }
  }, [data, pathUsername])

  const { mainUsername } = useCurrentWallet()
  const { setProfileData } = useProfileStore()

  const handleSaveProfile = async () => {
    // Re-pack existing score if available
    const bioToSave = cachedScore ? packFairScore(bio, cachedScore.score) : bio;
    
    await updateProfile({ bio: bioToSave, username: editUsername, image })
    refetch()
    setProfileData(editUsername, image)
    setIsEditing(false)
    
    // If username changed, we might need to redirect to the new url
    if (editUsername !== pathUsername && editUsername.trim() !== '') {
      router.push(`/${editUsername}`)
    }
  }

  return (
    <div className="mt-4">
      {mainUsername === pathUsername ? (
        isEditing ? (
          <div className="flex flex-col space-y-4">
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Username</label>
              <input
                type="text"
                className="border-b border-muted-light p-2 w-full outline-0 bg-transparent text-white"
                value={editUsername}
                placeholder="Enter your username"
                onChange={(e) => setEditUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Profile Image URL</label>
              <input
                type="text"
                className="border-b border-muted-light p-2 w-full outline-0 bg-transparent text-white"
                value={image}
                placeholder="Enter image URL"
                onChange={(e) => setImage(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Bio</label>
              <input
                type="text"
                className="border-b border-muted-light p-2 w-full outline-0 bg-transparent text-white"
                value={bio}
                placeholder="Enter your bio"
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
            <div className="w-full flex items-center justify-end space-x-4 pt-2">
              <Button
                className="!w-20 justify-center"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button
                className="!w-20 justify-center"
                type="submit"
                variant="secondary"
                onClick={handleSaveProfile}
                disabled={loading}
              >
                {loading ? '. . .' : 'Save'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex text-[15px] items-center gap-3 mt-1">
            {/* <span className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Bio</span> */}
            <span className="text-zinc-100">
              {bio ? bio : 'No bio provided'}
            </span>
          </div>
        )
      ) : (
        <div className="flex text-[15px] items-center gap-3 mt-1">
          <span className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Bio</span>
          <span className="text-zinc-100">
            {bio ? bio : 'No bio provided'}
          </span>
        </div>
      )}
    </div>
  )
}
