import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Development mode fallback when Supabase is not configured
    if (!isSupabaseConfigured) {
      console.log('Development mode: Supabase not configured, using mock data')
      return NextResponse.json({
        totalResponses: 15,
        activePlayers: 3,
        submissionsPerMinute: 2.5,
        avgScore: 82.1,
        medianLatency: 2800,
        topPlayers: [
          { codename: 'TestPlayer', avgScore: 85.5, count: 5 },
          { codename: 'Player2', avgScore: 78.2, count: 4 },
          { codename: 'Player3', avgScore: 92.1, count: 6 }
        ]
      })
    }

    // Get current time for calculating submissions per minute
    const now = new Date()
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)

    // Get recent submissions for rate calculation
    const { data: recentSubmissions, error: recentError } = await supabase
      .from('responses')
      .select('submitted_at')
      .gte('submitted_at', fiveMinutesAgo.toISOString())

    if (recentError) {
      console.error('Error fetching recent submissions:', recentError)
    }

    // Get all responses for overall stats
    const { data: allResponses, error: allError } = await supabase
      .from('responses')
      .select(`
        score,
        latency_ms,
        submitted_at,
        players!inner(codename)
      `)

    if (allError) {
      console.error('Error fetching all responses:', allError)
      return NextResponse.json(
        { error: 'Failed to fetch responses' },
        { status: 500 }
      )
    }

    // Calculate metrics
    const totalResponses = allResponses?.length || 0
    const submissionsPerMin = recentSubmissions?.length || 0
    
    // Calculate median accuracy and latency
    const scores = allResponses?.map(r => r.score).sort((a, b) => a - b) || []
    const latencies = allResponses?.map(r => r.latency_ms).sort((a, b) => a - b) || []
    
    const medianScore = scores.length > 0 
      ? scores[Math.floor(scores.length / 2)] 
      : 0
    const medianLatency = latencies.length > 0 
      ? latencies[Math.floor(latencies.length / 2)] 
      : 0

    // Get unique active players
    const uniquePlayers = new Set(allResponses?.map(r => (r.players as any)?.codename).filter(Boolean) || [])
    const activePlayers = uniquePlayers.size

    // Get top 5 leaderboard for admin view
    const playerStats: Record<string, { scores: number[], count: number }> = {}
    
    allResponses?.forEach(response => {
      const codename = (response.players as any)?.codename
      if (codename && !playerStats[codename]) {
        playerStats[codename] = { scores: [], count: 0 }
      }
      if (codename) {
        playerStats[codename].scores.push(response.score)
        playerStats[codename].count += 1
      }
    })

    const topPlayers = Object.entries(playerStats)
      .map(([codename, stats]) => ({
        codename,
        avgScore: stats.scores.reduce((sum, score) => sum + score, 0) / stats.scores.length,
        picks: stats.count
      }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 5)
      .map(player => ({
        ...player,
        avgScore: Math.round(player.avgScore * 100) / 100
      }))

    return NextResponse.json({
      sprintStatus: {
        isActive: true, // TODO: Implement actual sprint timing
        timeRemaining: 300, // TODO: Calculate from actual sprint start
        totalDuration: 300
      },
      metrics: {
        submissionsPerMin,
        activePlayers,
        totalResponses,
        medianScore: Math.round(medianScore * 100) / 100,
        medianLatency: Math.round(medianLatency)
      },
      topPlayers,
      lastUpdated: now.toISOString()
    })
  } catch (error) {
    console.error('Error in admin summary route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
