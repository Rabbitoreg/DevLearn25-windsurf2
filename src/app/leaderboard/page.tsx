'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface LeaderboardEntry {
  codename: string
  avgScore: number
  picks: number
  avgLatencyMs: number
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[]
  teamAverage: number
  totalPlayers: number
  totalResponses: number
}

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/leaderboard')
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard')
        }
        const leaderboardData = await response.json()
        setData(leaderboardData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load leaderboard')
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeaderboard()

    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchLeaderboard, 5000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4 text-destructive">Error</h2>
            <p className="mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="btn-primary">
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Live Leaderboard</h1>
          <p className="text-muted-foreground">Updates every 5 seconds</p>
        </div>

        {/* Team Stats */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="card p-4 text-center">
              <div className="text-2xl font-bold text-primary">{data.teamAverage.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">Team Average</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl font-bold text-primary">{data.totalPlayers}</div>
              <div className="text-sm text-muted-foreground">Active Players</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl font-bold text-primary">{data.totalResponses}</div>
              <div className="text-sm text-muted-foreground">Total Picks</div>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="card">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Top Players</h2>
          </div>
          
          {data && data.leaderboard.length > 0 ? (
            <div className="divide-y">
              {data.leaderboard.map((entry, index) => (
                <div key={entry.codename} className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        index === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {index + 1}
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold">{entry.codename}</div>
                      <div className="text-sm text-muted-foreground">
                        {entry.picks} pick{entry.picks !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold text-lg">{entry.avgScore.toFixed(1)}</div>
                    <div className="text-sm text-muted-foreground">
                      {(entry.avgLatencyMs / 1000).toFixed(1)}s avg
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              No players yet. <Link href="/join" className="underline hover:text-foreground">Join the game!</Link>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="text-center mt-8 space-x-4">
          <Link href="/" className="btn-secondary">
            Home
          </Link>
          <Link href="/join" className="btn-primary">
            Join Game
          </Link>
        </div>
      </div>
    </div>
  )
}
