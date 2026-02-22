import { socialfi } from '@/utils/socialfi'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { content, ownerWalletAddress, properties = [] } = await req.json()

    if (!content || !ownerWalletAddress) {
      return NextResponse.json(
        { error: 'Content and owner wallet address are required' },
        { status: 400 },
      )
    }

    // Tapestry drops custom properties on read operations, so we embed them safely inside the text.
    let richContent = content;
    const subnetObj = properties.find((p: any) => p.key === 'subnet');
    const imageUrlObj = properties.find((p: any) => p.key === 'imageUrl');
    
    if (subnetObj || imageUrlObj) {
        richContent += "\n\n|TAPESTRY_META|";
        if (subnetObj) richContent += `subnet=${subnetObj.value}|`;
        if (imageUrlObj) richContent += `imageUrl=${imageUrlObj.value}|`;
    }

    const mergedProperties: { key: string; value: string | boolean | number }[] = [
      { key: 'text', value: richContent },
    ]

    // 1. Resolve actual Tapestry Profile ID from Wallet Address
    let profileId = ownerWalletAddress

    try {
      const identityUrl = `https://api.usetapestry.dev/api/v1/identities/${ownerWalletAddress}?apiKey=${process.env.TAPESTRY_API_KEY || ''}`
      const identityRawRes = await fetch(identityUrl)
      
      if (!identityRawRes.ok) {
        throw new Error('Wallet is not connected to a Tapestry profile.')
      }

      const identityRes = await identityRawRes.json()

      if (
        identityRes && 
        identityRes.identities && 
        identityRes.identities.length > 0 && 
        identityRes.identities[0].profiles && 
        identityRes.identities[0].profiles.length > 0
      ) {
        profileId = identityRes.identities[0].profiles[0].profile.id
      } else {
        throw new Error('Wallet is not connected to a Tapestry profile.')
      }
    } catch (err: any) {
      console.error('API /contents/create Identity Resolution Error:', err.message)
      throw new Error(`Failed to resolve Tapestry profile: ${err.message}`)
    }

    // 2. Format a unique content ID
    const contentId = `${profileId}-${Date.now()}`

    // 3. Send actual request using correct profileId
    const response = await socialfi.contents.findOrCreateCreate(
      {
        apiKey: process.env.TAPESTRY_API_KEY || '',
      },
      {
        id: contentId,
        profileId,
        properties: mergedProperties,
      },
    )

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('API /contents/create error:', error.response?.data || error.message)
    return NextResponse.json(
      { error: error.message || 'Failed to create post' },
      { status: 500 },
    )
  }
}

export const dynamic = 'force-dynamic'
