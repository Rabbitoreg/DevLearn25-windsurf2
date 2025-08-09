import { promises as fs } from 'fs'
import path from 'path'
import { ToolCard, Scenario, ToolCardSchema, ScenarioSchema } from './types'

let toolsCache: ToolCard[] | null = null
let scenariosCache: Scenario[] | null = null

/**
 * Load tools from content/deck.tools.json
 */
export async function loadTools(): Promise<ToolCard[]> {
  if (toolsCache) {
    return toolsCache
  }

  try {
    const filePath = path.join(process.cwd(), 'content', 'deck.tools.json')
    const fileContent = await fs.readFile(filePath, 'utf-8')
    const rawTools = JSON.parse(fileContent)
    
    // Validate tools with Zod schema
    const tools = rawTools.map((tool: any) => ToolCardSchema.parse(tool))
    toolsCache = tools
    return tools
  } catch (error) {
    console.error('Error loading tools:', error)
    throw new Error('Failed to load tools')
  }
}

/**
 * Load scenarios from content/scenarios.json
 */
export async function loadScenarios(): Promise<Scenario[]> {
  if (scenariosCache) {
    return scenariosCache
  }

  try {
    const filePath = path.join(process.cwd(), 'content', 'scenarios.json')
    const fileContent = await fs.readFile(filePath, 'utf-8')
    const rawScenarios = JSON.parse(fileContent)
    
    // Validate scenarios with Zod schema
    const scenarios = rawScenarios.map((scenario: any) => ScenarioSchema.parse(scenario))
    scenariosCache = scenarios
    return scenarios
  } catch (error) {
    console.error('Error loading scenarios:', error)
    throw new Error('Failed to load scenarios')
  }
}

/**
 * Get a specific tool by ID
 */
export async function getToolById(id: string): Promise<ToolCard | null> {
  const tools = await loadTools()
  return tools.find(tool => tool.id === id) || null
}

/**
 * Get a specific scenario by ID
 */
export async function getScenarioById(id: string): Promise<Scenario | null> {
  const scenarios = await loadScenarios()
  return scenarios.find(scenario => scenario.id === id) || null
}

/**
 * Get a random scenario for the next question
 */
export async function getRandomScenario(excludeIds: string[] = []): Promise<Scenario | null> {
  const scenarios = await loadScenarios()
  const availableScenarios = scenarios.filter(s => !excludeIds.includes(s.id))
  
  if (availableScenarios.length === 0) {
    return null
  }
  
  const randomIndex = Math.floor(Math.random() * availableScenarios.length)
  return availableScenarios[randomIndex]
}

/**
 * Clear caches (useful for development)
 */
export function clearContentCache(): void {
  toolsCache = null
  scenariosCache = null
}
