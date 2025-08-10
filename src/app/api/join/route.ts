import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { JoinRequestSchema } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const { codename } = await request.json()

    // Debug: Log environment variables (temporary)
    console.log('DEBUG - Environment check:', {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      urlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
      keyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
      isSupabaseConfigured
    })

    // Development mode fallback
    if (!isSupabaseConfigured) {
      const mockPlayerId = '7b5c9a4b-2c27-4cb5-925e-c767a9e93c8b'
      return NextResponse.json({ playerId: mockPlayerId })
    }

    // For now, we'll use a default session. In production, this would be dynamic
    const DEFAULT_SESSION_ID = '00000000-0000-0000-0000-000000000000'

    // Check if codename already exists in current session
    const { data: existingPlayer } = await supabase
      .from('players')
      .select('id')
      .eq('session_id', DEFAULT_SESSION_ID)
      .eq('codename', codename)
      .single()

    if (existingPlayer) {
      return NextResponse.json(
        { error: 'Codename already taken' },
        { status: 400 }
      )
    }

    // Create new player
    const { data: player, error } = await supabase
      .from('players')
      .insert({
        session_id: DEFAULT_SESSION_ID,
        codename,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error creating player:', error)
      return NextResponse.json(
        { error: 'Failed to create player' },
        { status: 500 }
      )
    }

    return NextResponse.json({ playerId: player.id })
  } catch (error) {
    console.error('Error in join route:', error)
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }
}
