import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { contentId, profileId, text } = await req.json()

    if (!contentId || !profileId || !text) {
      return NextResponse.json({ error: 'contentId, profileId, and text are required' }, { status: 400 })
    }

    const url = `https://api.usetapestry.dev/api/v1/comments/?apiKey=${process.env.TAPESTRY_API_KEY || ''}`

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        contentId, 
        profileId, 
        text 
      })
    })

    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`Comment failed: ${res.status} ${res.statusText} - ${errorText}`)
    }

    const response = await res.json()
    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Error commenting on content:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to comment on content' },
      { status: 500 }
    )
  }
}
