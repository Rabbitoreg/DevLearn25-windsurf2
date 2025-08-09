'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface PlayerStats {
  totalResponses: number
  avgScore: number
  avgLatency: number
}

interface Response {
  id: string
  scenario_id: string
  tool_id: string
  submitted_at: string
  latency_ms: number
  accuracy: number
  time_score: number
  score: number
}

interface PlayerData {
  player: {
    id: string
    codename: string
    createdAt: string
  }
  stats: PlayerStats
  responses: Response[]
}

export default function MePage() {
  const [data, setData] = useState<PlayerData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const playerId = localStorage.getItem('playerId')
    const codename = localStorage.getItem('codename')

    if (!playerId || !codename) {
      router.push('/join')
      return
    }

    const fetchPlayerData = async () => {
      try {
        const response = await fetch(`/api/me?playerId=${playerId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch player data')
        }
        const playerData = await response.json()
        setData(playerData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load your results')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlayerData()
  }, [router])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading your results...</p>
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
              Try Again
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
          <h1 className="text-3xl font-bold text-primary mb-2">Your Results</h1>
          {data && <p className="text-muted-foreground">Playing as: <strong>{data.player.codename}</strong></p>}
        </div>

        {data && (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="card p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">{data.stats.avgScore.toFixed(1)}</div>
                <div className="text-muted-foreground">Average Score</div>
              </div>
              <div className="card p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">{data.stats.totalResponses}</div>
                <div className="text-muted-foreground">Total Picks</div>
              </div>
              <div className="card p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">{(data.stats.avgLatency / 1000).toFixed(1)}s</div>
                <div className="text-muted-foreground">Avg Response Time</div>
              </div>
            </div>

            {/* Response History */}
            <div className="card">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">Your Picks</h2>
              </div>
              
              {data.responses.length > 0 ? (
                <div className="divide-y">
                  {data.responses.map((response, index) => (
                    <div key={response.id} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">Pick #{data.responses.length - index}</div>
                        <div className="text-right">
                          <div className="font-bold text-lg">{response.score.toFixed(1)}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(response.submitted_at).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Accuracy:</span>
                          <span className="ml-1 font-medium">{(response.accuracy * 100).toFixed(1)}%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Speed:</span>
                          <span className="ml-1 font-medium">{(response.time_score * 100).toFixed(1)}%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Time:</span>
                          <span className="ml-1 font-medium">{(response.latency_ms / 1000).toFixed(1)}s</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Tool:</span>
                          <span className="ml-1 font-medium">{response.tool_id}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  No picks yet. <Link href="/play" className="underline hover:text-foreground">Start playing!</Link>
                </div>
              )}
            </div>
          </>
        )}

        {/* Navigation */}
        <div className="text-center mt-8 space-x-4">
          <Link href="/play" className="btn-primary">
            Continue Playing
          </Link>
          <Link href="/leaderboard" className="btn-secondary">
            View Leaderboard
          </Link>
        </div>
      </div>
    </div>
  )
}
