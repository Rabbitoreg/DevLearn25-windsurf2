import { NextResponse } from 'next/server'
import { loadTools } from '@/lib/content'

export async function GET() {
  try {
    const tools = await loadTools()
    return NextResponse.json(tools)
  } catch (error) {
    console.error('Error loading tools:', error)
    return NextResponse.json(
      { error: 'Failed to load tools' },
      { status: 500 }
    )
  }
}
