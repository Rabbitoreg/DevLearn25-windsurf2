import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getToolById, getScenarioById } from '@/lib/content'
import { calculateAttributeHeatmap } from '@/lib/scoring'

export async function GET(request: NextRequest) {
  try {
    // Get all responses
    const { data: responses, error } = await supabase
      .from('responses')
      .select('scenario_id, tool_id')

    if (error) {
      console.error('Error fetching responses for heatmap:', error)
      return NextResponse.json(
        { error: 'Failed to fetch responses' },
        { status: 500 }
      )
    }

    if (!responses || responses.length === 0) {
      return NextResponse.json({
        heatmap: {},
        totalResponses: 0
      })
    }

    // Get tool and scenario data for each response
    const responseData = await Promise.all(
      responses.map(async (response) => {
        const [tool, scenario] = await Promise.all([
          getToolById(response.tool_id),
          getScenarioById(response.scenario_id)
        ])
        
        if (tool && scenario) {
          return { tool, scenario }
        }
        return null
      })
    )

    // Filter out null responses
    const validResponses = responseData.filter(r => r !== null) as Array<{
      tool: any
      scenario: any
    }>

    // Calculate heatmap
    const heatmap = calculateAttributeHeatmap(validResponses)

    return NextResponse.json({
      heatmap,
      totalResponses: validResponses.length
    })
  } catch (error) {
    console.error('Error in heatmap route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
