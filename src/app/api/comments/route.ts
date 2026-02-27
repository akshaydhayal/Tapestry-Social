import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const targetProfileId = searchParams.get('targetProfileId')
  const requestingProfileId = searchParams.get('requestingProfileId')
  const contentId = searchParams.get('contentId')

  try {
    let urlStr = `https://api.usetapestry.dev/api/v1/comments/?apiKey=${process.env.TAPESTRY_API_KEY || ''}`
    
    if (contentId) urlStr += `&contentId=${contentId}`
    if (targetProfileId) urlStr += `&targetProfileId=${targetProfileId}`
    if (requestingProfileId) urlStr += `&requestingProfileId=${requestingProfileId}`

    const res = await fetch(urlStr)

    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`Failed to fetch comments: ${res.status} ${res.statusText} - ${errorText}`)
    }

    const response = await res.json()
    return NextResponse.json(response)
  } catch (error) {
    console.error('[Get Comments Error]:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { profileId, targetProfileId, contentId, text, commentId } = body

    if (!profileId || !text || (!targetProfileId && !contentId)) {
      return NextResponse.json(
        { error: 'Missing required fields (profileId, text, and either targetProfileId or contentId)' },
        { status: 400 },
      )
    }

    const url = `https://api.usetapestry.dev/api/v1/comments/?apiKey=${process.env.TAPESTRY_API_KEY || ''}`

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profileId,
        targetProfileId,
        contentId,
        text,
        commentId,
      })
    })

    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`Create comment failed: ${res.status} ${res.statusText} - ${errorText}`)
    }

    const response = await res.json()
    return NextResponse.json(response)
  } catch (error) {
    console.error('[Create Comment Error]:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to create comment',
      },
      { status: 500 },
    )
  }
}
