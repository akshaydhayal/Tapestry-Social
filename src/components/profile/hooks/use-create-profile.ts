import { useState } from 'react'
import { packFairScore } from '@/utils/fairscore-cache'

export const useCreateProfile = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [response, setResponse] = useState(null)

  interface Props {
    username: string
    walletAddress: string
    bio?: string | null
    image?: string | null
  }

  const createProfile = async ({
    username,
    walletAddress,
    bio,
    image,
  }: Props) => {
    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      const formData = new FormData()
      formData.append('username', username)
      formData.append('ownerWalletAddress', walletAddress)
      
      let finalBio = bio || ''
      try {
        const scoreRes = await fetch(`/api/fairscore?wallet=${walletAddress}`)
        if (scoreRes.ok) {
          const scoreData = await scoreRes.json()
          const score = scoreData.fair_score !== undefined ? scoreData.fair_score : 0
          finalBio = packFairScore(finalBio, score)
        }
      } catch (e) {
        console.warn('Failed to fetch initial FairScore during profile creation', e)
      }

      if (finalBio) {
        formData.append('bio', finalBio)
      }
      if (image) {
        formData.append('image', image)
      }

      const res = await fetch('/api/profiles/create', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const errorResponse = await res.json()
        throw new Error(errorResponse.error || 'Failed to create profile')
      }

      const data = await res.json()
      setResponse(data)
      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { createProfile, loading, error, response }
}
