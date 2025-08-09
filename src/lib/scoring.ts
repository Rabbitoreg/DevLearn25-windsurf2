import { ToolCard, Scenario, AttributeName, ATTRIBUTES } from './types'

/**
 * Calculate accuracy score based on attribute differences
 * Uses range-aware normalization per README §3.1
 */
export function calculateAccuracy(
  tool: ToolCard,
  scenario: Scenario
): number {
  let weightedDifferences = 0
  let totalWeights = 0

  for (const attr of ATTRIBUTES) {
    const toolRating = tool.ratings[attr]
    const targetRating = scenario.targets[attr]
    const weight = scenario.weights[attr]
    
    // Range is 4 for most attributes (1-5), but 3 for application (1-4)
    const range = attr === 'application' ? 3 : 4
    
    const difference = Math.abs(toolRating - targetRating)
    weightedDifferences += weight * difference
    totalWeights += weight * range
  }

  // Accuracy ∈ [0,1]
  const accuracy = 1 - (weightedDifferences / totalWeights)
  return Math.max(0, Math.min(1, accuracy))
}

/**
 * Calculate time score based on reaction time
 * Uses latency cap per README §3.2
 */
export function calculateTimeScore(
  latencyMs: number,
  tmaxSeconds: number = 25
): number {
  const tmaxMs = tmaxSeconds * 1000
  const timeScore = Math.max(0, 1 - latencyMs / tmaxMs)
  return timeScore
}

/**
 * Calculate final score combining accuracy and speed
 * Uses weights per README §3.3: α=0.7 accuracy, β=0.3 speed
 */
export function calculateFinalScore(
  accuracy: number,
  timeScore: number,
  accuracyWeight: number = 0.7,
  speedWeight: number = 0.3
): number {
  const finalScore = 100 * (accuracyWeight * accuracy + speedWeight * timeScore)
  return Math.round(finalScore * 100) / 100 // Round to 2 decimal places
}

/**
 * Complete scoring function that takes all inputs and returns all scores
 */
export function scoreResponse(
  tool: ToolCard,
  scenario: Scenario,
  presentedAt: Date,
  submittedAt: Date
): {
  latencyMs: number
  accuracy: number
  timeScore: number
  score: number
} {
  const latencyMs = submittedAt.getTime() - presentedAt.getTime()
  const accuracy = calculateAccuracy(tool, scenario)
  const timeScore = calculateTimeScore(latencyMs, scenario.tmax)
  const score = calculateFinalScore(accuracy, timeScore)

  return {
    latencyMs,
    accuracy,
    timeScore,
    score
  }
}

/**
 * Calculate attribute heatmap showing where players struggle most
 */
export function calculateAttributeHeatmap(
  responses: Array<{
    tool: ToolCard
    scenario: Scenario
  }>
): Record<AttributeName, { avgDifference: number; count: number }> {
  const heatmap: Record<string, { totalDifference: number; count: number }> = {}
  
  // Initialize heatmap
  for (const attr of ATTRIBUTES) {
    heatmap[attr] = { totalDifference: 0, count: 0 }
  }

  // Calculate differences for each response
  for (const { tool, scenario } of responses) {
    for (const attr of ATTRIBUTES) {
      const difference = Math.abs(tool.ratings[attr] - scenario.targets[attr])
      heatmap[attr].totalDifference += difference
      heatmap[attr].count += 1
    }
  }

  // Calculate averages
  const result: Record<AttributeName, { avgDifference: number; count: number }> = {} as any
  for (const attr of ATTRIBUTES) {
    const data = heatmap[attr]
    result[attr as AttributeName] = {
      avgDifference: data.count > 0 ? data.totalDifference / data.count : 0,
      count: data.count
    }
  }

  return result
}
