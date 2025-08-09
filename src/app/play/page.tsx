'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ToolCard, Scenario } from '@/lib/types'
import { ToolCardComponent } from '@/components/tool-card'
import { Timer } from '@/components/timer'

interface GameState {
  scenario: Scenario | null
  tools: ToolCard[]
  selectedTool: ToolCard | null
  startTime: Date | null
  isLoading: boolean
  isSubmitting: boolean
  score: number | null
  error: string
}

export default function PlayPage() {
  const [gameState, setGameState] = useState<GameState>({
    scenario: null,
    tools: [],
    selectedTool: null,
    startTime: null,
    isLoading: true,
    isSubmitting: false,
    score: null,
    error: ''
  })
  
  const [playerId, setPlayerId] = useState<string | null>(null)
  const [codename, setCodename] = useState<string | null>(null)
  const router = useRouter()

  // Check if player is logged in
  useEffect(() => {
    const storedPlayerId = localStorage.getItem('playerId')
    const storedCodename = localStorage.getItem('codename')
    
    if (!storedPlayerId || !storedCodename) {
      router.push('/join')
      return
    }
    
    setPlayerId(storedPlayerId)
    setCodename(storedCodename)
  }, [router])

  // Load initial scenario and tools
  useEffect(() => {
    if (!playerId) return

    const loadGame = async () => {
      try {
        setGameState(prev => ({ ...prev, isLoading: true, error: '' }))

        // Load tools from content and get next scenario
        const [tools, scenarioResponse] = await Promise.all([
          loadToolsFromContent(),
          fetch('/api/scenario/next', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playerId })
          })
        ])

        if (!scenarioResponse.ok) {
          const scenarioData = await scenarioResponse.json()
          throw new Error(scenarioData.error || 'Failed to load scenario')
        }

        const scenarioData = await scenarioResponse.json()
        
        setGameState(prev => ({
          ...prev,
          tools,
          scenario: scenarioData.scenario,
          startTime: new Date(scenarioData.startedAt),
          isLoading: false
        }))
      } catch (error) {
        setGameState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to load game',
          isLoading: false
        }))
      }
    }

    loadGame()
  }, [playerId])

  // Load tools from content using the content loader
  const loadToolsFromContent = async (): Promise<ToolCard[]> => {
    try {
      const response = await fetch('/api/content/tools')
      if (!response.ok) throw new Error('Failed to load tools')
      return response.json()
    } catch (error) {
      console.error('Error loading tools:', error)
      throw new Error('Failed to load tools')
    }
  }

  const handleToolSelect = (tool: ToolCard) => {
    if (gameState.isSubmitting) return
    
    // Immediately submit when a tool is selected (better mobile UX)
    setGameState(prev => ({ ...prev, selectedTool: tool, isSubmitting: true }))
    
    // Small delay to show selection feedback, then submit
    setTimeout(() => {
      submitChoice(tool)
    }, 200)
  }

  const submitChoice = async (tool: ToolCard) => {
    if (!gameState.scenario || !gameState.startTime || !playerId) {
      return
    }

    setGameState(prev => ({ ...prev, isSubmitting: true, error: '' }))

    try {
      const submittedAt = new Date().toISOString()
      
      const response = await fetch('/api/pick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId,
          scenarioId: gameState.scenario.id,
          toolId: tool.id,
          presentedAt: gameState.startTime.toISOString(),
          submittedAt
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit pick')
      }

      // Show score briefly, then load next scenario
      setGameState(prev => ({ ...prev, score: data.score, isSubmitting: false }))
      
      setTimeout(() => {
        loadNextScenario()
      }, 2000)

    } catch (error) {
      setGameState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to submit pick',
        isSubmitting: false
      }))
    }
  }

  const loadNextScenario = async () => {
    if (!playerId) return

    try {
      setGameState(prev => ({ 
        ...prev, 
        isLoading: true, 
        selectedTool: null, 
        score: null, 
        error: '' 
      }))

      const response = await fetch('/api/scenario/next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId })
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 404) {
          // No more scenarios - redirect to results
          router.push('/me')
          return
        }
        throw new Error(data.error || 'Failed to load next scenario')
      }

      setGameState(prev => ({
        ...prev,
        scenario: data.scenario,
        startTime: new Date(data.startedAt),
        isLoading: false
      }))
    } catch (error) {
      setGameState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load next scenario',
        isLoading: false
      }))
    }
  }

  const handleTimeUp = () => {
    if (gameState.selectedTool) {
      submitChoice(gameState.selectedTool)
    } else {
      // Auto-select a random tool if no selection made
      const randomTool = gameState.tools[Math.floor(Math.random() * gameState.tools.length)]
      setGameState(prev => ({ ...prev, selectedTool: randomTool }))
      setTimeout(() => submitChoice(randomTool), 100)
    }
  }

  if (gameState.isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading next scenario...</p>
        </div>
      </div>
    )
  }

  if (gameState.error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4 text-destructive">Error</h2>
            <p className="mb-4">{gameState.error}</p>
            <button onClick={() => window.location.reload()} className="btn-primary">
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (gameState.score !== null) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <div className="card p-6">
            <h2 className="text-2xl font-bold mb-4 text-primary">Score!</h2>
            <div className="text-4xl font-bold mb-4">{gameState.score.toFixed(1)}</div>
            <p className="text-muted-foreground">Loading next scenario...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">AI Tool Match</h1>
          <p className="text-muted-foreground">Playing as: <strong>{codename}</strong></p>
        </div>

        {/* Timer */}
        {gameState.startTime && gameState.scenario && (
          <div className="text-center mb-6">
            <Timer
              startTime={gameState.startTime}
              maxSeconds={gameState.scenario.tmax || 25}
              onTimeUp={handleTimeUp}
            />
          </div>
        )}

        {/* Scenario */}
        {gameState.scenario && (
          <div className="card p-6 mb-6">
            <h2 className="text-xl font-semibold mb-3">{gameState.scenario.title}</h2>
            <p className="text-muted-foreground">{gameState.scenario.description}</p>
          </div>
        )}

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {gameState.tools.map((tool) => (
            <ToolCardComponent
              key={tool.id}
              tool={tool}
              isSelected={gameState.selectedTool?.id === tool.id}
              onSelect={handleToolSelect}
              disabled={gameState.isSubmitting}
            />
          ))}
        </div>

        {/* Instructions */}
        <div className="text-center mb-6">
          <p className="text-muted-foreground">
            {gameState.isSubmitting ? (
              <span className="text-primary font-semibold">Submitting your choice...</span>
            ) : (
              <span>Tap any tool card to submit your choice</span>
            )}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="text-center mt-6 space-x-4">
          <button
            onClick={() => router.push('/me')}
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            View My Results
          </button>
          <button
            onClick={() => router.push('/leaderboard')}
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            View Leaderboard
          </button>
        </div>
      </div>
    </div>
  )
}
