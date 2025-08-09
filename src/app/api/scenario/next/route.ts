import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { getRandomScenario } from '@/lib/content'
import { NextScenarioRequestSchema } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { playerId } = NextScenarioRequestSchema.parse(body)

    // Development mode fallback when Supabase is not configured
    if (!isSupabaseConfigured) {
      console.log('Development mode: Getting random scenario without DB check')
      const scenario = await getRandomScenario([])
      
      if (!scenario) {
        return NextResponse.json(
          { error: 'No scenarios available' },
          { status: 404 }
        )
      }

      const startedAt = new Date().toISOString()
      return NextResponse.json({
        scenario,
        startedAt
      })
    }

    // Verify player exists
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('id, session_id')
      .eq('id', playerId)
      .single()

    if (playerError || !player) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      )
    }

    // Get scenarios already answered by this player
    const { data: responses } = await supabase
      .from('responses')
      .select('scenario_id')
      .eq('player_id', playerId)

    const answeredScenarioIds = responses?.map(r => r.scenario_id) || []

    // Get a random scenario that hasn't been answered yet
    const scenario = await getRandomScenario(answeredScenarioIds)

    if (!scenario) {
      return NextResponse.json(
        { error: 'No more scenarios available' },
        { status: 404 }
      )
    }

    const startedAt = new Date().toISOString()

    return NextResponse.json({
      scenario,
      startedAt
    })
  } catch (error) {
    console.error('Error in scenario/next route:', error)
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }
}
