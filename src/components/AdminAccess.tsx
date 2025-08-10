'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function AdminAccess() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showPasswordInput, setShowPasswordInput] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  // Simple password for conference use - you can change this
  const ADMIN_PASSWORD = 'conference2025'

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      setShowPasswordInput(false)
      setError('')
      setPassword('')
    } else {
      setError('Incorrect password')
      setPassword('')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setShowPasswordInput(false)
    setPassword('')
    setError('')
  }

  if (isAuthenticated) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-card border rounded-lg p-3 shadow-lg">
          <div className="flex items-center space-x-3">
            <Link 
              href="/admin" 
              className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm hover:bg-primary/90"
            >
              Admin Dashboard
            </Link>
            <button 
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (showPasswordInput) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-card border rounded-lg p-4 shadow-lg">
          <form onSubmit={handlePasswordSubmit} className="space-y-3">
            <div>
              <label htmlFor="admin-password" className="block text-sm font-medium mb-1">
                Admin Password
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter password"
                autoFocus
              />
            </div>
            {error && (
              <p className="text-red-600 text-xs">{error}</p>
            )}
            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm hover:bg-primary/90"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setShowPasswordInput(false)}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setShowPasswordInput(true)}
        className="text-muted-foreground hover:text-foreground text-xs opacity-50 hover:opacity-100"
        title="Admin Access"
      >
        ⚙️
      </button>
    </div>
  )
}
