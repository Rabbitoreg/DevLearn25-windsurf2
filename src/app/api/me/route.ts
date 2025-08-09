import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const playerId = searchParams.get('playerId')

    if (!playerId) {
      return NextResponse.json(
        { error: 'Player ID required' },
        { status: 400 }
      )
    }

    // Development mode fallback when Supabase is not configured
    if (!isSupabaseConfigured) {
      console.log('Development mode: Supabase not configured, using mock data')
      return NextResponse.json({
        player: {
          id: playerId,
          codename: 'TestPlayer',
          createdAt: new Date().toISOString()
        },
        stats: {
          totalResponses: 3,
          avgScore: 82.1,
          avgLatency: 2800
        },
        responses: [
          {
            id: 'mock-response-1',
            scenario_id: 'scenario-1',
            tool_id: 'glide',
            submitted_at: new Date(Date.now() - 300000).toISOString(), // 5 min ago
            latency_ms: 2500,
            accuracy: 0.9,
            time_score: 0.8,
            score: 85.5
          },
          {
            id: 'mock-response-2',
            scenario_id: 'scenario-2',
            tool_id: 'notion',
            submitted_at: new Date(Date.now() - 180000).toISOString(), // 3 min ago
            latency_ms: 3200,
            accuracy: 0.75,
            time_score: 0.65,
            score: 78.2
          },
          {
            id: 'mock-response-3',
            scenario_id: 'scenario-3',
            tool_id: 'chatgpt',
            submitted_at: new Date(Date.now() - 60000).toISOString(), // 1 min ago
            latency_ms: 2700,
            accuracy: 0.85,
            time_score: 0.75,
            score: 82.6
          }
        ]
      })
    }

    // Get player info
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('id, codename, created_at')
      .eq('id', playerId)
      .single()

    if (playerError || !player) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      )
    }

    // Get player's responses with scores
    const { data: responses, error: responsesError } = await supabase
      .from('responses')
      .select(`
        id,
        scenario_id,
        tool_id,
        submitted_at,
        latency_ms,
        accuracy,
        time_score,
        score
      `)
      .eq('player_id', playerId)
      .order('submitted_at', { ascending: false })

    if (responsesError) {
      console.error('Error fetching responses:', responsesError)
      return NextResponse.json(
        { error: 'Failed to fetch responses' },
        { status: 500 }
      )
    }

    // Calculate summary stats
    const totalResponses = responses?.length || 0
    const avgScore = totalResponses > 0 
      ? responses!.reduce((sum, r) => sum + r.score, 0) / totalResponses 
      : 0
    const avgLatency = totalResponses > 0 
      ? responses!.reduce((sum, r) => sum + r.latency_ms, 0) / totalResponses 
      : 0

    return NextResponse.json({
      player: {
        id: player.id,
        codename: player.codename,
        createdAt: player.created_at
      },
      stats: {
        totalResponses,
        avgScore: Math.round(avgScore * 100) / 100,
        avgLatency: Math.round(avgLatency)
      },
      responses: responses || []
    })
  } catch (error) {
    console.error('Error in me route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
