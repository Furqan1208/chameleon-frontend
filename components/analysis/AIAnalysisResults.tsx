// D:\FYP\Chameleon Frontend\components\analysis\AIAnalysisResults.tsx
"use client"

import { Brain, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

interface AIAnalysisResultsProps {
  aiAnalysis: any
}

export function AIAnalysisResults({ aiAnalysis }: AIAnalysisResultsProps) {
  const [expanded, setExpanded] = useState(true)

  // Helper function to render AI analysis content
  const renderAnalysisContent = (data: any, depth: number = 0) => {
    if (!data) return null
    
    if (typeof data === 'string') {
      return <p className={`text-foreground whitespace-pre-wrap ${depth > 0 ? 'text-sm' : ''}`}>{data}</p>
    }
    
    if (Array.isArray(data)) {
      return (
        <ul className={`space-y-1 ${depth > 0 ? 'ml-4' : ''}`}>
          {data.map((item, index) => (
            <li key={index} className="text-foreground">
              {renderAnalysisContent(item, depth + 1)}
            </li>
          ))}
        </ul>
      )
    }
    
    if (typeof data === 'object') {
      // For nested objects, show key-value pairs
      return (
        <div className={`space-y-3 ${depth > 0 ? 'ml-4 border-l border-border pl-4' : ''}`}>
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="space-y-1">
              <h4 className={`font-medium text-foreground capitalize ${depth === 0 ? 'text-lg' : 'text-base'}`}>
                {key.replace(/_/g, " ")}
              </h4>
              <div className="text-muted-foreground">
                {renderAnalysisContent(value, depth + 1)}
              </div>
            </div>
          ))}
        </div>
      )
    }
    
    return <p className="text-foreground">{String(data)}</p>
  }

  // Extract the main analysis content
  const getMainAnalysisContent = () => {
    if (!aiAnalysis) return null
    
    // Try different possible structures
    if (aiAnalysis.results?.final_synthesis) {
      return aiAnalysis.results.final_synthesis
    }
    
    if (aiAnalysis.final_synthesis?.analysis) {
      return aiAnalysis.final_synthesis.analysis
    }
    
    if (aiAnalysis.final_synthesis) {
      return aiAnalysis.final_synthesis
    }
    
    return aiAnalysis
  }

  const mainContent = getMainAnalysisContent()

  return (
    <div className="glass border border-primary/30 rounded-lg p-6 glow-green">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-semibold text-foreground">AI Analysis</h2>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {expanded && (
        <div className="space-y-6">
          {mainContent && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Summary</h3>
              <div className="prose prose-invert max-w-none">
                {renderAnalysisContent(mainContent)}
              </div>
            </div>
          )}

          {/* Render other sections if available */}
          {aiAnalysis?.results && Object.keys(aiAnalysis.results)
            .filter((key) => key !== "final_synthesis")
            .map((key) => (
              <div key={key} className="border-t border-border pt-4">
                <h3 className="text-lg font-semibold text-foreground mb-3 capitalize">{key.replace(/_/g, " ")}</h3>
                <div className="prose prose-invert max-w-none">
                  {renderAnalysisContent(aiAnalysis.results[key])}
                </div>
              </div>
            ))}
          
          {/* Also check if we have sections directly in aiAnalysis */}
          {!aiAnalysis?.results && Object.keys(aiAnalysis || {})
            .filter((key) => key !== "final_synthesis" && key !== "sections" && key !== "model_usage" && key !== "sections_analyzed" && key !== "duration_seconds")
            .map((key) => (
              <div key={key} className="border-t border-border pt-4">
                <h3 className="text-lg font-semibold text-foreground mb-3 capitalize">{key.replace(/_/g, " ")}</h3>
                <div className="prose prose-invert max-w-none">
                  {renderAnalysisContent(aiAnalysis[key])}
                </div>
              </div>
            ))}
        </div>
      )}

      {!expanded && <p className="text-muted-foreground">Click to expand AI analysis</p>}
    </div>
  )
}