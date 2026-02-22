import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { nodeId, profileId } = await req.json()

    if (!nodeId || !profileId) {
      return NextResponse.json({ error: 'nodeId and profileId are required' }, { status: 400 })
    }

    const url = `https://api.usetapestry.dev/api/v1/likes/${nodeId}?apiKey=${process.env.TAPESTRY_API_KEY || ''}`

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startId: profileId })
    })

    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`Like failed: ${res.status} ${res.statusText} - ${errorText}`)
    }

    const response = await res.json()
    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Error liking content:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to like content' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const nodeId = searchParams.get('nodeId')
    const profileId = searchParams.get('profileId')

    if (!nodeId || !profileId) {
      return NextResponse.json({ error: 'nodeId and profileId are required' }, { status: 400 })
    }

    const url = `https://api.usetapestry.dev/api/v1/likes/${nodeId}?apiKey=${process.env.TAPESTRY_API_KEY || ''}`

    const res = await fetch(url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startId: profileId })
    })

    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`Unlike failed: ${res.status} ${res.statusText} - ${errorText}`)
    }

    const response = await res.json()
    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Error unliking content:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to unlike content' },
      { status: 500 }
    )
  }
}
