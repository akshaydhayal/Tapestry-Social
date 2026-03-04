'use client'

import { useState } from 'react'
import { X, Lock, Globe, Loader2, CheckCircle2 } from 'lucide-react'
import { Input } from '@/components/form/input'
import { packCommunityMeta, extractCommunityMeta } from '@/utils/community-meta'
import { useUpdateProfileInfo } from '@/components/profile/hooks/use-update-profile'

interface Props {
  communityProfile: any
  onClose: () => void
  onSaved: () => void
}

export function EditCommunityModal({ communityProfile, onClose, onSaved }: Props) {
  const username = communityProfile?.profile?.username || ''
  const { meta, cleanBio } = extractCommunityMeta(communityProfile?.profile?.bio)

  const [description, setDescription] = useState(cleanBio || '')
  const [image, setImage] = useState(communityProfile?.profile?.image || '')
  const [gateType, setGateType] = useState<'public' | 'fairscore'>(
    meta?.gateType === 'fairscore' ? 'fairscore' : 'public'
  )
  const [fairScoreGate, setFairScoreGate] = useState(
    meta?.fairScoreGate ? String(meta.fairScoreGate) : ''
  )
  const [saved, setSaved] = useState(false)

  const { updateProfile, loading, error } = useUpdateProfileInfo({ username })

  const handleSave = async () => {
    const updatedMeta = {
      isCommunity: true,
      name: meta?.name || username.replace('Community_', ''),
      gateType,
      fairScoreGate: gateType === 'fairscore' ? Number(fairScoreGate) || 0 : 0,
    }

    const newBio = packCommunityMeta(description, updatedMeta)

    const result = await updateProfile({
      bio: newBio,
      ...(image ? { image } : {}),
    })

    if (result) {
      setSaved(true)
      setTimeout(() => {
        onSaved()
        onClose()
      }, 1200)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h2 className="text-[16px] font-black text-white">Edit Community Settings</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 flex flex-col gap-4">

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-zinc-400 mb-1 ml-1 block uppercase tracking-wider">
              Description
            </label>
            <Input
              name="editDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-black border-zinc-800 focus:border-[#1d9aef] rounded-xl text-white placeholder:text-zinc-600 transition-all font-medium py-3"
              placeholder="A place for the best designers..."
            />
          </div>

          {/* Image */}
          <div>
            <label className="text-xs font-bold text-zinc-400 mb-1 ml-1 block uppercase tracking-wider">
              Logo URL
            </label>
            <Input
              name="editImage"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="bg-black border-zinc-800 focus:border-[#1d9aef] rounded-xl text-white placeholder:text-zinc-600 transition-all font-medium py-3"
              placeholder="https://..."
            />
          </div>

          {/* Access Control */}
          <div className="bg-black border border-zinc-800 rounded-xl p-4">
            <label className="text-xs font-bold text-white mb-3 block uppercase tracking-wider border-b border-zinc-900 pb-2">
              Access Control
            </label>
            <div className="flex flex-row gap-6">
              <label className="flex items-center gap-3 text-sm text-zinc-300 font-medium cursor-pointer hover:text-white transition-colors">
                <input
                  type="radio"
                  name="editGateType"
                  checked={gateType === 'public'}
                  onChange={() => setGateType('public')}
                  className="w-4 h-4 accent-[#1d9aef] cursor-pointer"
                />
                <Globe className="h-3.5 w-3.5 text-emerald-400" />
                Public
              </label>
              <label className="flex items-center gap-3 text-sm text-zinc-300 font-medium cursor-pointer hover:text-white transition-colors">
                <input
                  type="radio"
                  name="editGateType"
                  checked={gateType === 'fairscore'}
                  onChange={() => setGateType('fairscore')}
                  className="w-4 h-4 accent-[#1d9aef] cursor-pointer"
                />
                <Lock className="h-3.5 w-3.5 text-amber-400" />
                FairScore Gated
              </label>
            </div>

            {gateType === 'fairscore' && (
              <div className="mt-3 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">
                <label className="text-xs text-zinc-400 mb-1.5 block font-medium">
                  Minimum FairScore Required
                </label>
                <Input
                  name="editFairScore"
                  type="number"
                  min="0"
                  max="1000"
                  value={fairScoreGate}
                  onChange={(e) => setFairScoreGate(e.target.value)}
                  placeholder="e.g. 200"
                  className="py-2 h-auto text-sm w-full bg-black border-zinc-700 focus:border-[#1d9aef] rounded-md font-bold text-white"
                />
                <p className="text-[11px] text-zinc-500 mt-1.5">
                  Users with a FairScore below this number won&apos;t be able to join.
                </p>
              </div>
            )}
          </div>

          {error && (
            <p className="text-xs text-red-400 font-medium px-1">{error}</p>
          )}

          {saved && (
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold px-1">
              <CheckCircle2 className="h-4 w-4" />
              Settings saved! Refreshing…
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-full border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 font-bold text-sm transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || saved}
            className="flex-1 py-3 rounded-full bg-[#1d9aef] hover:bg-[#1a8cd8] text-white font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(29,154,239,0.3)]"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>

      </div>
    </div>
  )
}
