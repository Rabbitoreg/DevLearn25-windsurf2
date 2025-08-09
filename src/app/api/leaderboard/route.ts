import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    // Development mode fallback when Supabase is not configured
    if (!isSupabaseConfigured) {
      console.log('Development mode: Supabase not configured, using mock data')
      return NextResponse.json({
        leaderboard: [
          { codename: 'TestPlayer', avgScore: 85.5, picks: 1, avgLatencyMs: 2500 },
          { codename: 'Player2', avgScore: 78.2, picks: 2, avgLatencyMs: 3200 },
          { codename: 'Player3', avgScore: 92.1, picks: 3, avgLatencyMs: 1800 }
        ],
        teamAverage: 85.3
      })
    }

    // Get leaderboard data using a query that mimics the materialized view
    const { data: leaderboard, error } = await supabase
      .from('responses')
      .select(`
        players!inner(codename),
        score,
        latency_ms
      `)
      .order('score', { ascending: false })

    if (error) {
      console.error('Error fetching leaderboard:', error)
      return NextResponse.json(
        { error: 'Failed to fetch leaderboard' },
        { status: 500 }
      )
    }

    // Group by player and calculate averages
    const playerStats: Record<string, {
      codename: string
      scores: number[]
      latencies: number[]
    }> = {}

    leaderboard?.forEach(response => {
      const codename = (response.players as any)?.codename
      if (codename && !playerStats[codename]) {
        playerStats[codename] = {
          codename,
          scores: [],
          latencies: []
        }
      }
      if (codename) {
        playerStats[codename].scores.push(response.score)
        playerStats[codename].latencies.push(response.latency_ms)
      }
    })

    // Calculate final leaderboard
    const finalLeaderboard = Object.values(playerStats)
      .map(player => ({
        codename: player.codename,
        avgScore: player.scores.reduce((sum, score) => sum + score, 0) / player.scores.length,
        picks: player.scores.length,
        avgLatencyMs: player.latencies.reduce((sum, lat) => sum + lat, 0) / player.latencies.length
      }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, limit)
      .map(player => ({
        ...player,
        avgScore: Math.round(player.avgScore * 100) / 100,
        avgLatencyMs: Math.round(player.avgLatencyMs)
      }))

    // Calculate team average
    const allScores = Object.values(playerStats).flatMap(p => p.scores)
    const teamAverage = allScores.length > 0 
      ? allScores.reduce((sum, score) => sum + score, 0) / allScores.length 
      : 0

    return NextResponse.json({
      leaderboard: finalLeaderboard,
      teamAverage: Math.round(teamAverage * 100) / 100,
      totalPlayers: Object.keys(playerStats).length,
      totalResponses: allScores.length
    })
  } catch (error) {
    console.error('Error in leaderboard route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
