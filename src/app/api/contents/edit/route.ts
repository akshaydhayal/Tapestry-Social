import { NextResponse } from 'next/server'

export async function PUT(req: Request) {
  try {
    const { contentId, text, subnet, imageUrl } = await req.json()

    if (!contentId || !text) {
      return NextResponse.json({ error: 'contentId and text are required' }, { status: 400 })
    }

    // Re-embed metadata if provided
    let richContent = text
    if (subnet || imageUrl) {
      richContent += "\n\n|TAPESTRY_META|"
      if (subnet) richContent += `subnet=${subnet}|`
      if (imageUrl) richContent += `imageUrl=${imageUrl}|`
    }

    const properties = [
      { key: 'text', value: richContent }
    ]

    const url = `https://api.usetapestry.dev/api/v1/contents/${contentId}?apiKey=${process.env.TAPESTRY_API_KEY || ''}`

    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ properties })
    })

    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`Update failed: ${res.status} ${res.statusText} - ${errorText}`)
    }

    const response = await res.json()
    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Error updating content:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update content' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
