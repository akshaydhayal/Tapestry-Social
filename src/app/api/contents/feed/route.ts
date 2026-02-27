import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const url = `https://api.usetapestry.dev/api/v1/contents/?apiKey=${process.env.TAPESTRY_API_KEY || ''}`
    
    const res = await fetch(url)
    
    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`Tapestry Feed Fetch Error: ${res.status} ${res.statusText} - ${errorText}`)
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('API /contents/feed error:', error.message)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch global feed' },
      { status: 500 },
    )
  }
}

export const dynamic = 'force-dynamic'
