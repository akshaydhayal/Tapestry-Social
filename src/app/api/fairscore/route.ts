import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const wallet = searchParams.get('wallet')

  if (!wallet) {
    return NextResponse.json({ error: 'wallet parameter is required' }, { status: 400 })
  }

  const apiKey = process.env.FAIRSCALE_API_KEY
  if (!apiKey) {
    console.error('FAIRSCALE_API_KEY is not defined in environment variables')
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  try {
    const response = await fetch(`https://api.fairscale.xyz/fairScore?wallet=${wallet}`, {
      method: 'GET',
      headers: {
        'fairkey': apiKey,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`FairScale API error! status: ${response.status}, message: ${errorText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching FairScore:', error)
    return NextResponse.json({ error: 'Failed to fetch FairScore' }, { status: 500 })
  }
}
