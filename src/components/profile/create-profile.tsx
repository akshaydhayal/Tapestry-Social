'use client'

import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { Alert } from '@/components/common/alert'
import { LoadCircle } from '@/components/common/load-circle'
import { Input } from '@/components/form/input'
import { useCreateProfile } from '@/components/profile/hooks/use-create-profile'

import { useWallet } from '@solana/wallet-adapter-react'
import { useState } from 'react'

interface Props {
  setCreateProfileDialog: (isOpen: boolean) => void
  setIsProfileCreated: (val: boolean) => void
  setProfileUsername: (val: string) => void
}

export function CreateProfile({
  setCreateProfileDialog,
  setIsProfileCreated,
  setProfileUsername,
}: Props) {
  const { walletAddress, loadingMainUsername } = useCurrentWallet()
  useWallet()

  const [tab, setTab] = useState<'individual' | 'community'>('individual')
  
  // Individual Fields
  const [username, setUsername] = useState('')
  const [individualBio, setIndividualBio] = useState('')
  const [individualImage, setIndividualImage] = useState('')
  
  // Community Fields
  const [communityName, setCommunityName] = useState('')
  const [communityUsername, setCommunityUsername] = useState('')
  const [communityImage, setCommunityImage] = useState('')
  const [communityDescription, setCommunityDescription] = useState('')
  const [gateType, setGateType] = useState<'public' | 'fairscore'>('public')
  const [fairScoreGate, setFairScoreGate] = useState('')
  


  const {
    createProfile,
    loading: creationLoading,
    error,
    response,
  } = useCreateProfile()



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!walletAddress) return

    if (tab === 'individual') {
      if (username) {
        await createProfile({ 
          username, 
          walletAddress,
          bio: individualBio,
          image: individualImage
        })
        setIsProfileCreated(true)
        setProfileUsername(username)
        setCreateProfileDialog(false)
      }
    } else {
      if (communityUsername && communityName) {
        // Sanitize username to alphanumeric and append prefix
        const cleanUsername = communityUsername.toLowerCase().replace(/[^a-z0-9]/g, '')
        const finalUsername = `Community_${cleanUsername}`
        
        const meta = {
          isCommunity: true,
          name: communityName,
          gateType: gateType,
          fairScoreGate: gateType === 'fairscore' ? Number(fairScoreGate) || 0 : 0
        }
        
        // Dynamically import packCommunityMeta to avoid modifying top level imports right here
        const { packCommunityMeta } = await import('@/utils/community-meta')
        const bioPayload = packCommunityMeta(communityDescription, meta)

        await createProfile({ 
          username: finalUsername, 
          walletAddress,
          bio: bioPayload,
          image: communityImage
        })
        
        setIsProfileCreated(true)
        setProfileUsername(finalUsername)
        setCreateProfileDialog(false)
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const validValue = value.toLowerCase().replace(/[^a-z0-9]/g, '')
    setUsername(validValue)
  }
  
  const handleCommunityUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const validValue = value.toLowerCase().replace(/[^a-z0-9]/g, '')
    setCommunityUsername(validValue)
  }



  if (loadingMainUsername) {
    return (
      <div className="flex items-center justify-center w-full py-32">
        <LoadCircle />
      </div>
    )
  }

  return (
    <>
      <div className="w-full flex flex-col pt-2">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-white">Join Tapestry</h2>
          <p className="text-sm text-zinc-400 mt-1">Create your identity to start posting.</p>
        </div>
        
        {/* Tabs */}
        <div className="flex bg-zinc-900 rounded-full p-1 mb-4 border border-zinc-800">
          <button 
            type="button"
            className={`flex-1 py-2 text-sm font-bold rounded-full transition-all duration-200 ${tab === 'individual' ? 'bg-[#1d9aef] text-white shadow-md' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
            onClick={() => setTab('individual')}
          >
            User Profile
          </button>
          <button 
            type="button"
            className={`flex-1 py-2 text-sm font-bold rounded-full transition-all duration-200 ${tab === 'community' ? 'bg-[#1d9aef] text-white shadow-md' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
            onClick={() => setTab('community')}
          >
            Community
          </button>
        </div>

        <div className="bg-[#1d9aef]/10 border border-[#1d9aef]/20 rounded-xl p-2.5 mb-5 flex items-center justify-center text-center">
          <p className="text-[12px] font-medium text-[#1d9aef] leading-tight">
            <strong>Note:</strong> You can create either a User or Community Profile per wallet.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {tab === 'individual' ? (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-left-2 duration-300">
              <div className="flex flex-row gap-4">
                <div className="flex-1">
                  <label className="text-xs font-bold text-zinc-400 mb-1 ml-1 block uppercase tracking-wider">Username *</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-zinc-500 font-medium">@</span>
                    <Input
                      name="username"
                      value={username}
                      onChange={handleInputChange}
                      className="pl-8 bg-black border-zinc-800 focus:border-[#1d9aef] rounded-xl text-white placeholder:text-zinc-600 transition-all font-medium py-3"
                      placeholder="satoshi"
                      required
                    />
                  </div>
                </div>

                <div className="flex-1">
                  <label className="text-xs font-bold text-zinc-400 mb-1 ml-1 block uppercase tracking-wider">Profile Picture</label>
                  <Input
                    name="individualImage"
                    value={individualImage}
                    onChange={(e) => setIndividualImage(e.target.value)}
                    className="bg-black border-zinc-800 focus:border-[#1d9aef] rounded-xl text-white placeholder:text-zinc-600 transition-all font-medium py-3"
                    placeholder="https://..."
                  />
                </div>
              </div>
              
              <div className="px-1 -mt-2">
                <p className="text-[11px] text-zinc-500 font-medium">Username: Lowercase letters and numbers only.</p>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 mb-1 ml-1 block uppercase tracking-wider">Bio</label>
                <Input
                  name="individualBio"
                  value={individualBio}
                  onChange={(e) => setIndividualBio(e.target.value)}
                  className="bg-black border-zinc-800 focus:border-[#1d9aef] rounded-xl text-white placeholder:text-zinc-600 transition-all font-medium py-3"
                  placeholder="Software Engineer at Solana..."
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-2 duration-300">
              <div className="flex flex-row gap-4">
                <div className="flex-1">
                  <label className="text-xs font-bold text-zinc-400 mb-1 ml-1 block uppercase tracking-wider">Community Name *</label>
                  <Input
                    name="communityName"
                    value={communityName}
                    onChange={(e) => setCommunityName(e.target.value)}
                    className="bg-black border-zinc-800 focus:border-[#1d9aef] rounded-xl text-white placeholder:text-zinc-600 transition-all font-medium py-3"
                    placeholder="Solana UI Designers"
                    required
                  />
                </div>
                
                <div className="flex-1">
                  <label className="text-xs font-bold text-zinc-400 mb-1 ml-1 block uppercase tracking-wider">Unique Handle *</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-zinc-500 text-xs font-medium">Comm_</span>
                    <Input
                      name="communityHandle"
                      value={communityUsername}
                      onChange={handleCommunityUsernameChange}
                      className="pl-[68px] bg-black border-zinc-800 focus:border-[#1d9aef] rounded-xl text-white placeholder:text-zinc-600 transition-all font-medium py-3"
                      placeholder="solanaui"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex flex-row gap-4">
                <div className="flex-[2]">
                  <label className="text-xs font-bold text-zinc-400 mb-1 ml-1 block uppercase tracking-wider">Description</label>
                  <Input
                    name="communityDescription"
                    value={communityDescription}
                    onChange={(e) => setCommunityDescription(e.target.value)}
                    className="bg-black border-zinc-800 focus:border-[#1d9aef] rounded-xl text-white placeholder:text-zinc-600 transition-all font-medium py-3"
                    placeholder="A place for the best designers."
                  />
                </div>

                <div className="flex-1">
                  <label className="text-xs font-bold text-zinc-400 mb-1 ml-1 block uppercase tracking-wider">Logo URL</label>
                  <Input
                    name="communityImage"
                    value={communityImage}
                    onChange={(e) => setCommunityImage(e.target.value)}
                    className="bg-black border-zinc-800 focus:border-[#1d9aef] rounded-xl text-white placeholder:text-zinc-600 transition-all font-medium py-3"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="bg-black border border-zinc-800 rounded-xl p-4 mt-1">
                <label className="text-xs font-bold text-white mb-3 block uppercase tracking-wider border-b border-zinc-900 pb-2">Access Control</label>
                <div className="flex flex-row gap-6">
                  <label className="flex items-center gap-3 text-sm text-zinc-300 font-medium cursor-pointer group hover:text-white transition-colors">
                    <input 
                      type="radio" 
                      name="gateType" 
                      checked={gateType === 'public'} 
                      onChange={() => setGateType('public')}
                      className="w-4 h-4 accent-[#1d9aef] cursor-pointer"
                    />
                    Public
                  </label>
                  <label className="flex items-center gap-3 text-sm text-zinc-300 font-medium cursor-pointer group hover:text-white transition-colors">
                    <input 
                      type="radio" 
                      name="gateType" 
                      checked={gateType === 'fairscore'} 
                      onChange={() => setGateType('fairscore')}
                      className="w-4 h-4 accent-[#1d9aef] cursor-pointer"
                    />
                    FairScore Gated
                  </label>
                </div>
                  
                {gateType === 'fairscore' && (
                  <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-200 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">
                    <label className="text-xs text-zinc-400 mb-1.5 block font-medium">Minimum FairScore Required</label>
                    <Input
                      name="fairScoreGate"
                      type="number"
                      min="0"
                      max="1000"
                      value={fairScoreGate}
                      onChange={(e) => setFairScoreGate(e.target.value)}
                      placeholder="e.g. 50"
                      className="py-2 h-auto text-sm w-full bg-black border-zinc-700 focus:border-[#1d9aef] rounded-md font-bold text-white"
                      required={gateType === 'fairscore'}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="mt-2">
            <button
               type="submit"
               disabled={creationLoading}
               className="w-full bg-white hover:bg-zinc-200 text-black font-bold py-3.5 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] text-[15px]"
            >
              {creationLoading ? 'Processing...' : tab === 'individual' ? 'Create User Profile' : 'Launch Community'}
            </button>
          </div>
        </form>

        {error && <div className="mt-4"><Alert type="error" message={error} /></div>}
        {response && (
          <div className="mt-4"><Alert type="success" message={`${tab === 'individual' ? 'Profile' : 'Community'} created successfully!`} /></div>
        )}
      </div>
    </>
  )
}
