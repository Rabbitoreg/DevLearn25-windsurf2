'use client'

import { useState, useEffect } from 'react'

interface AdminSummary {
  sprintStatus: {
    isActive: boolean
    timeRemaining: number
    totalDuration: number
  }
  metrics: {
    submissionsPerMin: number
    activePlayers: number
    totalResponses: number
    medianScore: number
    medianLatency: number
  }
  topPlayers: Array<{
    codename: string
    avgScore: number
    picks: number
  }>
  lastUpdated: string
}

export default function AdminPage() {
  const [data, setData] = useState<AdminSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await fetch('/api/admin/summary')
        if (!response.ok) {
          throw new Error('Failed to fetch admin data')
        }
        const adminData = await response.json()
        setData(adminData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load admin data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAdminData()

    // Auto-refresh every 2-3 seconds for projector mode
    const interval = setInterval(fetchAdminData, 2500)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 projector-mode">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-6"></div>
          <p className="text-xl">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 projector-mode">
        <div className="max-w-2xl mx-auto text-center">
          <div className="card p-8">
            <h2 className="text-2xl font-semibold mb-6 text-destructive">Error</h2>
            <p className="text-xl mb-6">{error}</p>
            <button onClick={() => window.location.reload()} className="btn-primary text-xl px-8 py-4">
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 projector-mode">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-primary mb-4">AI Tool Match</h1>
          <p className="text-2xl text-muted-foreground">Admin Dashboard</p>
        </div>

        {data && (
          <>
            {/* Sprint Status */}
            <div className="card p-8 mb-8 text-center">
              <h2 className="text-3xl font-semibold mb-6">Sprint Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <div className={`text-6xl font-bold mb-2 ${
                    data.sprintStatus.isActive ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {data.sprintStatus.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </div>
                  <div className="text-xl text-muted-foreground">Sprint Status</div>
                </div>
                <div>
                  <div className="text-6xl font-bold mb-2 text-primary">
                    {formatTime(data.sprintStatus.timeRemaining)}
                  </div>
                  <div className="text-xl text-muted-foreground">Time Remaining</div>
                </div>
                <div>
                  <div className="text-6xl font-bold mb-2 text-primary">
                    {formatTime(data.sprintStatus.totalDuration)}
                  </div>
                  <div className="text-xl text-muted-foreground">Total Duration</div>
                </div>
              </div>
            </div>

            {/* Live Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <div className="card p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">{data.metrics.submissionsPerMin}</div>
                <div className="text-lg text-muted-foreground">Picks/Min</div>
              </div>
              <div className="card p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">{data.metrics.activePlayers}</div>
                <div className="text-lg text-muted-foreground">Players</div>
              </div>
              <div className="card p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">{data.metrics.totalResponses}</div>
                <div className="text-lg text-muted-foreground">Total Picks</div>
              </div>
              <div className="card p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">{data.metrics.medianScore}</div>
                <div className="text-lg text-muted-foreground">Median Score</div>
              </div>
              <div className="card p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">{(data.metrics.medianLatency / 1000).toFixed(1)}s</div>
                <div className="text-lg text-muted-foreground">Median Time</div>
              </div>
            </div>

            {/* Top Players */}
            <div className="card p-8">
              <h2 className="text-3xl font-semibold mb-6 text-center">Live Leaderboard</h2>
              {data.topPlayers.length > 0 ? (
                <div className="space-y-4">
                  {data.topPlayers.map((player, index) => (
                    <div key={player.codename} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                      <div className="flex items-center space-x-6">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
                          index === 0 ? 'bg-yellow-200 text-yellow-800' :
                          index === 1 ? 'bg-gray-200 text-gray-800' :
                          index === 2 ? 'bg-orange-200 text-orange-800' :
                          'bg-blue-200 text-blue-800'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-2xl font-semibold">{player.codename}</div>
                          <div className="text-lg text-muted-foreground">
                            {player.picks} pick{player.picks !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-4xl font-bold text-primary">{player.avgScore.toFixed(1)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-2xl text-muted-foreground py-12">
                  Waiting for players to join...
                </div>
              )}
            </div>

            {/* QR Code Placeholder */}
            <div className="card p-8 mt-8 text-center">
              <h2 className="text-3xl font-semibold mb-6">Join the Game</h2>
              <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-12 mb-4">
                <div className="text-2xl text-muted-foreground mb-4">QR Code Here</div>
                <div className="text-lg text-muted-foreground">
                  Point players to: <span className="font-mono bg-background px-2 py-1 rounded">{window.location.origin}/join</span>
                </div>
              </div>
            </div>

            {/* Last Updated */}
            <div className="text-center mt-6 text-lg text-muted-foreground">
              Last updated: {new Date(data.lastUpdated).toLocaleTimeString()}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
