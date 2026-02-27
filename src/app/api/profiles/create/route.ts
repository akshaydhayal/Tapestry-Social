import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const username = formData.get('username')?.toString()
  const ownerWalletAddress = formData.get('ownerWalletAddress')?.toString()
  const bio = formData.get('bio')?.toString()
  const image = formData.get('image')?.toString()

  if (!username || !ownerWalletAddress) {
    return NextResponse.json(
      { error: 'Username and owner wallet address are required' },
      { status: 400 },
    )
  }
  try {
    const url = `https://api.usetapestry.dev/api/v1/profiles/findOrCreate?apiKey=${process.env.TAPESTRY_API_KEY || ''}`
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletAddress: ownerWalletAddress,
        username,
        bio,
        image,
        blockchain: 'SOLANA',
      })
    })

    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`Tapestry API Error: ${res.status} ${res.statusText} - ${errorText}`)
    }

    const profile = await res.json()

    return NextResponse.json(profile)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create profile' },
      { status: 500 },
    )
  }
}

export const dynamic = 'force-dynamic'
