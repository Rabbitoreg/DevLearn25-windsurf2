'use client'

import { useEffect, useState } from 'react'

interface TimerProps {
  startTime: Date
  maxSeconds: number
  onTimeUp?: () => void
  className?: string
}

export function Timer({ startTime, maxSeconds, onTimeUp, className = '' }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(maxSeconds)
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    if (!isActive) return

    const interval = setInterval(() => {
      const now = new Date()
      const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000)
      const remaining = Math.max(0, maxSeconds - elapsed)
      
      setTimeLeft(remaining)
      
      if (remaining === 0) {
        setIsActive(false)
        onTimeUp?.()
      }
    }, 100) // Update frequently for smooth countdown

    return () => clearInterval(interval)
  }, [startTime, maxSeconds, onTimeUp, isActive])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getTimerClass = () => {
    if (timeLeft <= 5) return 'timer danger'
    if (timeLeft <= 10) return 'timer warning'
    return 'timer'
  }

  return (
    <div className={`${getTimerClass()} ${className}`} role="timer" aria-live="polite">
      <span className="sr-only">Time remaining: </span>
      {formatTime(timeLeft)}
    </div>
  )
}
