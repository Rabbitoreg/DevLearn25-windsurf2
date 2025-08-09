'use client'

import { ToolCard } from '@/lib/types'

interface ToolCardProps {
  tool: ToolCard
  isSelected: boolean
  onSelect: (tool: ToolCard) => void
  disabled?: boolean
}

export function ToolCardComponent({ tool, isSelected, onSelect, disabled }: ToolCardProps) {
  const handleClick = () => {
    if (!disabled) {
      onSelect(tool)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'no-code': return 'bg-green-100 text-green-800'
      case 'low-code': return 'bg-blue-100 text-blue-800'
      case 'vibe-code': return 'bg-purple-100 text-purple-800'
      case 'code': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div
      className={`tool-card ${isSelected ? 'selected' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-pressed={isSelected}
      aria-label={`Select ${tool.name} - ${tool.category} tool`}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-lg">{tool.name}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(tool.category)}`}>
          {tool.category}
        </span>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {tool.notes}
      </p>
      
      {/* Key attributes preview */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex justify-between">
          <span>Ease:</span>
          <span className="font-medium">{tool.ratings.ease}/5</span>
        </div>
        <div className="flex justify-between">
          <span>Speed:</span>
          <span className="font-medium">{tool.ratings.speed}/5</span>
        </div>
        <div className="flex justify-between">
          <span>Code:</span>
          <span className="font-medium">{tool.ratings.code}/5</span>
        </div>
        <div className="flex justify-between">
          <span>Cost:</span>
          <span className="font-medium">{tool.ratings.cost}/5</span>
        </div>
      </div>
    </div>
  )
}
