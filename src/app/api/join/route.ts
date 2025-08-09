import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { JoinRequestSchema } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { codename } = JoinRequestSchema.parse(body)

    // Development mode fallback when Supabase is not configured
    if (!isSupabaseConfigured) {
      console.log('Development mode: Supabase not configured, using mock data')
      // Generate a valid UUID format for development
      const mockPlayerId = `00000000-0000-4000-8000-${Date.now().toString().padStart(12, '0')}`
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
