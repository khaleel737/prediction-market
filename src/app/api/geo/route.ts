import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

const DEFAULT_GEO_HEADER = 'x-vercel-ip-country'

export async function GET(request: Request) {
  try {
    const headersList = await headers()

    const url = new URL(request.url)
    const customHeader = url.searchParams.get('header')

    let country: string | null = null

    if (customHeader) {
      country = headersList.get(customHeader)
    }

    if (!country) {
      country = headersList.get(DEFAULT_GEO_HEADER)
    }

    return NextResponse.json({ country: country?.toUpperCase() ?? null })
  }
  catch {
    return NextResponse.json({ country: null })
  }
}
