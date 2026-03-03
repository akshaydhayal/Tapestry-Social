import { NextResponse } from 'next/server'

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const contentId = searchParams.get('contentId')

    if (!contentId) {
      return NextResponse.json({ error: 'contentId is required' }, { status: 400 })
    }

    const url = `https://api.usetapestry.dev/api/v1/contents/${contentId}?apiKey=${process.env.TAPESTRY_API_KEY || ''}`

    const res = await fetch(url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    })

    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`Delete failed: ${res.status} ${res.statusText} - ${errorText}`)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting content:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete content' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
