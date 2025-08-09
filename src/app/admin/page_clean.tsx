'use client'

import { useState, useEffect } from 'react'

interface AdminSummary {
  sprintStatus?: {
    isActive: boolean
    timeRemaining: number
    totalDuration: number
  }
  metrics?: {
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
  lastUpdated?: string
  // Development mode fallback properties
  totalResponses?: number
  activePlayers?: number
  submissionsPerMinute?: number
  avgScore?: number
  medianLatency?: number
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
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p className="text-xl font-bold">Error Loading Dashboard</p>
            <p>{error}</p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-primary text-white px-6 py-3 rounded-lg text-lg hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Fallback values for development mode
  const sprintStatus = data?.sprintStatus || { isActive: true, timeRemaining: 300, totalDuration: 300 }
  const metrics = data?.metrics || {
    submissionsPerMin: data?.submissionsPerMinute || 0,
    activePlayers: data?.activePlayers || 0,
    totalResponses: data?.totalResponses || 0,
    medianScore: data?.avgScore || 0,
    medianLatency: data?.medianLatency || 0
  }

  return (
    <div className="container mx-auto px-4 py-8 projector-mode">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-center mb-2">AI Tool Match</h1>
        <h2 className="text-2xl text-center text-muted-foreground">Admin Dashboard</h2>
      </div>

      {/* Sprint Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card rounded-lg p-6 border">
          <h3 className="text-lg font-semibold mb-2">Sprint Status</h3>
          <div className={`text-2xl font-bold ${sprintStatus.isActive ? 'text-green-600' : 'text-red-600'}`}>
            {sprintStatus.isActive ? 'ACTIVE' : 'INACTIVE'}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Time: {formatTime(sprintStatus.timeRemaining)} / {formatTime(sprintStatus.totalDuration)}
          </p>
        </div>

        <div className="bg-card rounded-lg p-6 border">
          <h3 className="text-lg font-semibold mb-2">Progress</h3>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
            <div 
              className="bg-primary h-4 rounded-full transition-all duration-300" 
              style={{ width: `${((sprintStatus.totalDuration - sprintStatus.timeRemaining) / sprintStatus.totalDuration) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-muted-foreground">
            {Math.round(((sprintStatus.totalDuration - sprintStatus.timeRemaining) / sprintStatus.totalDuration) * 100)}% Complete
          </p>
        </div>

        <div className="bg-card rounded-lg p-6 border">
          <h3 className="text-lg font-semibold mb-2">Total Duration</h3>
          <div className="text-2xl font-bold text-primary">
            {formatTime(sprintStatus.totalDuration)}
          </div>
        </div>
      </div>

      {/* Live Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-card rounded-lg p-6 border">
          <h3 className="text-lg font-semibold mb-2">Picks/Min</h3>
          <div className="text-2xl font-bold text-primary">
            {metrics.submissionsPerMin}
          </div>
        </div>
        <div className="bg-card rounded-lg p-6 border">
          <h3 className="text-lg font-semibold mb-2">Players</h3>
          <div className="text-2xl font-bold text-primary">
            {metrics.activePlayers}
          </div>
        </div>
        <div className="bg-card rounded-lg p-6 border">
          <h3 className="text-lg font-semibold mb-2">Total Picks</h3>
          <div className="text-2xl font-bold text-primary">
            {metrics.totalResponses}
          </div>
        </div>
        <div className="bg-card rounded-lg p-6 border">
          <h3 className="text-lg font-semibold mb-2">Median Score</h3>
          <div className="text-2xl font-bold text-primary">
            {metrics.medianScore}
          </div>
        </div>
        <div className="bg-card rounded-lg p-6 border">
          <h3 className="text-lg font-semibold mb-2">Median Time</h3>
          <div className="text-2xl font-bold text-primary">
            {(metrics.medianLatency / 1000).toFixed(1)}s
          </div>
        </div>
      </div>

      {/* Top Players */}
      <div className="bg-card rounded-lg p-6 border mb-8">
        <h2 className="text-2xl font-bold mb-4 text-center">Live Leaderboard</h2>
        {data?.topPlayers && data.topPlayers.length > 0 ? (
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
                <div className="text-3xl font-bold text-primary">
                  {player.avgScore.toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-xl text-muted-foreground">No players yet</p>
            <p className="text-lg text-muted-foreground mt-2">Waiting for game participants...</p>
          </div>
        )}
      </div>

      {/* Last Updated */}
      <div className="text-center text-sm text-muted-foreground">
        Last updated: {data?.lastUpdated ? new Date(data.lastUpdated).toLocaleTimeString() : 'Never'}
      </div>
    </div>
  )
}
