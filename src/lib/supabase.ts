import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-key'

// For development without Supabase setup
export const isSupabaseConfigured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types for Supabase
export type Database = {
  public: {
    Tables: {
      sessions: {
        Row: {
          id: string
          name: string | null
          mode: 'sprint' | 'rounds'
          duration_seconds: number
          created_at: string
          facilitator_pin: string | null
        }
        Insert: {
          id?: string
          name?: string | null
          mode?: 'sprint' | 'rounds'
          duration_seconds?: number
          created_at?: string
          facilitator_pin?: string | null
        }
        Update: {
          id?: string
          name?: string | null
          mode?: 'sprint' | 'rounds'
          duration_seconds?: number
          created_at?: string
          facilitator_pin?: string | null
        }
      }
      players: {
        Row: {
          id: string
          session_id: string
          codename: string
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          codename: string
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          codename?: string
          created_at?: string
        }
      }
      tools: {
        Row: {
          id: string
          name: string
          category: 'no-code' | 'low-code' | 'vibe-code' | 'code'
          ratings: Record<string, any>
          notes: string | null
        }
        Insert: {
          id: string
          name: string
          category: 'no-code' | 'low-code' | 'vibe-code' | 'code'
          ratings: Record<string, any>
          notes?: string | null
        }
        Update: {
          id?: string
          name?: string
          category?: 'no-code' | 'low-code' | 'vibe-code' | 'code'
          ratings?: Record<string, any>
          notes?: string | null
        }
      }
      scenarios: {
        Row: {
          id: string
          title: string
          description: string
          targets: Record<string, any>
          weights: Record<string, any>
        }
        Insert: {
          id: string
          title: string
          description: string
          targets: Record<string, any>
          weights: Record<string, any>
        }
        Update: {
          id?: string
          title?: string
          description?: string
          targets?: Record<string, any>
          weights?: Record<string, any>
        }
      }
      responses: {
        Row: {
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
        Insert: {
          id?: string
          session_id: string
          player_id: string
          scenario_id: string
          tool_id: string
          presented_at: string
          submitted_at?: string
          latency_ms: number
          accuracy: number
          time_score: number
          score: number
        }
        Update: {
          id?: string
          session_id?: string
          player_id?: string
          scenario_id?: string
          tool_id?: string
          presented_at?: string
          submitted_at?: string
          latency_ms?: number
          accuracy?: number
          time_score?: number
          score?: number
        }
      }
    }
    Views: {
      leaderboard: {
        Row: {
          codename: string
          avg_score: number
          picks: number
          avg_latency_ms: number
        }
      }
    }
  }
}
