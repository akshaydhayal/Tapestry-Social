import { socialfi } from '@/utils/socialfi'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const username = searchParams.get('username')

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 })
  }

  try {
    const url = `https://api.usetapestry.dev/api/v1/profiles/${username}?apiKey=${process.env.TAPESTRY_API_KEY || ''}`
    const res = await fetch(url)

    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`Profile fetch failed: ${res.status} ${res.statusText} - ${errorText}`)
    }

    const response = await res.json()
    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Error fetching profiles:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch profiles' },
      { status: 500 },
    )
  }
}

export async function PUT(req: Request) {
  const { searchParams } = new URL(req.url)
  const username = searchParams.get('username')
  const body = await req.json()

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 })
  }

  try {
    const url = `https://api.usetapestry.dev/api/v1/profiles/${username}?apiKey=${process.env.TAPESTRY_API_KEY || ''}`
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`Profile update failed: ${res.status} ${res.statusText} - ${errorText}`)
    }

    const response = await res.json()
    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update profile' },
      { status: 500 },
    )
  }
}
