'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function JoinPage() {
  const [codename, setCodename] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!codename.trim()) {
      setError('Please enter a codename')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ codename: codename.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join')
      }

      // Store player ID in localStorage
      localStorage.setItem('playerId', data.playerId)
      localStorage.setItem('codename', codename.trim())

      // Redirect to play page
      router.push('/play')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            Join AI Tool Match
          </h1>
          <p className="text-muted-foreground">
            Choose a codename to start playing
          </p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="codename" className="block text-sm font-medium mb-2">
                Codename
              </label>
              <input
                type="text"
                id="codename"
                value={codename}
                onChange={(e) => setCodename(e.target.value)}
                placeholder="Enter your codename"
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                maxLength={50}
                disabled={isLoading}
                autoFocus
              />
            </div>

            {error && (
              <div className="text-destructive text-sm" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !codename.trim()}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Joining...' : 'Join Game'}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            No personal information required. Just pick a fun codename!
          </p>
        </div>
      </div>
    </div>
  )
}
