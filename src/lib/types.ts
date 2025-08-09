import { z } from 'zod'

// Tool Card Schema
export const ToolCardSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(['no-code', 'low-code', 'vibe-code', 'code']),
  ratings: z.object({
    ease: z.number().min(1).max(5),
    flexibility: z.number().min(1).max(5),
    collaboration: z.number().min(1).max(5),
    privacy: z.number().min(1).max(5),
    cost: z.number().min(1).max(5),
    speed: z.number().min(1).max(5),
    integrations: z.number().min(1).max(5),
    code: z.number().min(1).max(5),
    application: z.number().min(1).max(4), // Note: 1-4 scale
    a11y: z.number().min(1).max(5),
  }),
  notes: z.string(),
})

// Scenario Schema
export const ScenarioSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  targets: z.object({
    ease: z.number().min(1).max(5),
    flexibility: z.number().min(1).max(5),
    collaboration: z.number().min(1).max(5),
    privacy: z.number().min(1).max(5),
    cost: z.number().min(1).max(5),
    speed: z.number().min(1).max(5),
    integrations: z.number().min(1).max(5),
    code: z.number().min(1).max(5),
    application: z.number().min(1).max(4),
    a11y: z.number().min(1).max(5),
  }),
  weights: z.object({
    ease: z.number(),
    flexibility: z.number(),
    collaboration: z.number(),
    privacy: z.number(),
    cost: z.number(),
    speed: z.number(),
    integrations: z.number(),
    code: z.number(),
    application: z.number(),
    a11y: z.number(),
  }),
  tmax: z.number().optional().default(25), // Max time in seconds
})

// API Request/Response Schemas
export const JoinRequestSchema = z.object({
  codename: z.string().min(1).max(50),
})

export const PickRequestSchema = z.object({
  playerId: z.string().min(1), // More flexible for development mode
  scenarioId: z.string(),
  toolId: z.string(),
  presentedAt: z.string().datetime(),
  submittedAt: z.string().datetime(),
  rationale: z.string().optional(),
})

export const NextScenarioRequestSchema = z.object({
  playerId: z.string().min(1), // More flexible for development mode
})

// Type exports
export type ToolCard = z.infer<typeof ToolCardSchema>
export type Scenario = z.infer<typeof ScenarioSchema>
export type JoinRequest = z.infer<typeof JoinRequestSchema>
export type PickRequest = z.infer<typeof PickRequestSchema>
export type NextScenarioRequest = z.infer<typeof NextScenarioRequestSchema>

// Database types
export interface Player {
  id: string
  session_id: string
  codename: string
  created_at: string
}

export interface Session {
  id: string
  name: string | null
  mode: 'sprint' | 'rounds'
  duration_seconds: number
  created_at: string
  facilitator_pin: string | null
}

export interface Response {
  id: string
  session_id: string
  player_id: string
  scenario_id: string
  tool_id: string
  presented_at: string
  submitted_at: string
  latency_ms: number
  accuracy: number
  time_score: number
  score: number
}

export interface LeaderboardEntry {
  codename: string
  avg_score: number
  picks: number
  avg_latency_ms: number
}

// Attribute names for consistency
export const ATTRIBUTES = [
  'ease',
  'flexibility', 
  'collaboration',
  'privacy',
  'cost',
  'speed',
  'integrations',
  'code',
  'application',
  'a11y'
] as const

export type AttributeName = typeof ATTRIBUTES[number]
