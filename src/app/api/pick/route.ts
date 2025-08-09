import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { getToolById, getScenarioById } from '@/lib/content'
import { scoreResponse } from '@/lib/scoring'
import { PickRequestSchema } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { playerId, scenarioId, toolId, presentedAt, submittedAt, rationale } = PickRequestSchema.parse(body)

    // Get tool and scenario data
    const [tool, scenario] = await Promise.all([
      getToolById(toolId),
      getScenarioById(scenarioId)
    ])

    if (!tool) {
      return NextResponse.json(
        { error: 'Tool not found' },
        { status: 404 }
      )
    }

    if (!scenario) {
      return NextResponse.json(
        { error: 'Scenario not found' },
        { status: 404 }
      )
    }

    // Calculate scores
    const presentedDate = new Date(presentedAt)
    const submittedDate = new Date(submittedAt)
    const scores = scoreResponse(tool, scenario, presentedDate, submittedDate)

    // Development mode fallback when Supabase is not configured
    if (!isSupabaseConfigured) {
      console.log('Development mode: Calculated scores without saving to DB', scores)
      return NextResponse.json({
        accuracy: scores.accuracy,
        timeScore: scores.timeScore,
        score: scores.score,
        latencyMs: scores.latencyMs
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

    // Save response to database
    const { data: response, error: responseError } = await supabase
      .from('responses')
      .insert({
        session_id: player.session_id,
        player_id: playerId,
        scenario_id: scenarioId,
        tool_id: toolId,
        presented_at: presentedAt,
        submitted_at: submittedAt,
        latency_ms: scores.latencyMs,
        accuracy: scores.accuracy,
        time_score: scores.timeScore,
        score: scores.score
      })
      .select('id')
      .single()

    if (responseError) {
      console.error('Error saving response:', responseError)
      return NextResponse.json(
        { error: 'Failed to save response' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      accuracy: scores.accuracy,
      timeScore: scores.timeScore,
      score: scores.score,
      latencyMs: scores.latencyMs
    })
  } catch (error) {
    console.error('Error in pick route:', error)
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }
}
