// D:\FYP\Chameleon Frontend\app\dashboard\analysis\[id]\page.tsx
"use client"

import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { useAnalysis } from "@/hooks/useAnalysis"
import { useAnalysisData } from "@/hooks/useAnalysisData"
import { NetworkBackground } from "@/components/3d/NetworkBackground"
import { AnalysisOverview } from "@/components/analysis/AnalysisOverview"
import { BehaviorVisualizer } from "@/components/analysis/BehaviorVisualizer"
import { MemoryAnalysis } from "@/components/analysis/MemoryAnalysis"
import { StringsAnalysis } from "@/components/analysis/StringsAnalysis"
import { SignaturesAnalysis } from "@/components/analysis/SignaturesAnalysis"
import { AIAnalysisResults } from "@/components/analysis/AIAnalysisResults"
import { 
  Loader, 
  FileJson, 
  FileText, 
  Brain, 
  Layers, 
  ChevronDown, 
  ChevronUp,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react"
import { apiService } from "@/lib/api-service"
import { formatDistanceToNow } from "date-fns"

// Helper functions for AI data rendering
const hasAISections = (aiData: any) => {
  if (!aiData) return false
  const sections = [
    'initial_combined_analysis',
    'memory_analysis',
    'behavior_analysis',
    'strings_analysis',
    'signatures_analysis',
    'target_analysis',
    'final_synthesis'
  ]
  return sections.some(section => aiData[section])
}

const renderAISection = (aiData: any, sectionKey: string, displayName: string, filename: string) => {
  const sectionData = aiData[sectionKey]
  if (!sectionData) return null
  
  return (
    <AIAnalysisSection 
      key={sectionKey}
      name={displayName} 
      data={sectionData} 
      filename={filename}
    />
  )
}

// Helper function to render AI content safely
const renderAIContent = (content: any) => {
  if (typeof content === 'string') {
    return <p className="text-foreground text-sm whitespace-pre-wrap">{content}</p>
  } else if (content && typeof content === 'object') {
    return (
      <div className="space-y-2">
        {content.overview && (
          <p className="text-foreground text-sm"><strong>Overview:</strong> {content.overview}</p>
        )}
        {content.key_findings && Array.isArray(content.key_findings) && (
          <div>
            <p className="text-foreground text-sm font-medium mb-1">Key Findings:</p>
            <ul className="list-disc pl-5 text-sm text-foreground">
              {content.key_findings.map((finding: string, idx: number) => (
                <li key={idx} className="mb-1">{finding}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }
  return null
}

export default function AnalysisPage() {
  const params = useParams()
  const analysisId = params.id as string
  
  // Use both hooks
  const { analysis: originalAnalysis, loading: originalLoading, error: originalError } = useAnalysis(analysisId)
  const { overviewData, loading: overviewLoading, error: overviewError } = useAnalysisData(analysisId)
  
  const [activeView, setActiveView] = useState<"overview" | "cape" | "parsed" | "ai">("overview")
  const [components, setComponents] = useState<any>(null)
  const [capeData, setCapeData] = useState<any>(null)
  const [parsedData, setParsedData] = useState<any>(null)
  const [aiData, setAiData] = useState<any>(null)
  const [loadingComponents, setLoadingComponents] = useState(false)

  // Combine loading states
  const loading = originalLoading || overviewLoading || loadingComponents
  const error = originalError || overviewError

  useEffect(() => {
    if (analysisId) {
      loadComponents()
    }
  }, [analysisId])

  const loadComponents = async () => {
    try {
      setLoadingComponents(true)
      const comps = await apiService.getAnalysisComponents(analysisId)
      setComponents(comps)
      
      // Load data for available components
      if (comps.components?.cape) {
        try {
          const cape = await apiService.getCapeReport(analysisId)
          setCapeData(cape.data)
        } catch (err) {
          console.warn("Failed to load CAPE data:", err)
        }
      }
      
      if (comps.components?.parsed) {
        try {
          const parsed = await apiService.getParsedSection(analysisId, "all")
          setParsedData(parsed.data)
        } catch (err) {
          console.warn("Failed to load parsed data:", err)
        }
      }
      
      if (comps.components?.ai_analysis) {
        try {
          // Try to load the analysis summary first
          const aiSummary = await apiService.getAiAnalysis(analysisId, "summary")
          
          // Load individual AI analysis sections
          const aiSectionsToLoad = [
            "initial_combined_analysis",
            "memory_analysis",
            "behavior_analysis", 
            "strings_analysis",
            "signatures_analysis",
            "target_analysis",
            "final_synthesis"
          ]
          
          const loadedAISections: any = {}
          
          // Try to load each section
          for (const section of aiSectionsToLoad) {
            try {
              const sectionData = await apiService.getAiAnalysis(analysisId, section)
              if (sectionData && !sectionData.error) {
                loadedAISections[section] = sectionData.data || sectionData
              }
            } catch (sectionErr) {
              console.warn(`Failed to load AI section ${section}:`, sectionErr)
            }
          }
          
          // Combine summary with sections
          setAiData({
            ...(aiSummary.data || aiSummary),
            ...loadedAISections
          })
        } catch (err) {
          console.warn("Failed to load AI data:", err)
        }
      }
    } catch (err) {
      console.warn("Failed to load components:", err)
    } finally {
      setLoadingComponents(false)
    }
  }

  const handleDownload = async (format: string) => {
    try {
      await apiService.downloadReport(analysisId, format as any)
    } catch (err) {
      console.error("Download failed:", err)
      alert("Download failed. Please try again.")
    }
  }

  // Prepare combined analysis data for overview
  const combinedAnalysis = originalAnalysis || overviewData ? {
    ...(originalAnalysis || {}),
    ...(overviewData || {}),
    analysis_id: analysisId,
    filename: originalAnalysis?.filename || overviewData?.filename || "Unknown",
    created_at: originalAnalysis?.created_at || overviewData?.created_at || new Date().toISOString(),
    status: originalAnalysis?.status || overviewData?.status || "completed",
    malscore: originalAnalysis?.malscore || overviewData?.malscore || 0,
    parsed_results: {
      sections: parsedData?.sections || {}
    }
  } : null

  return (
    <div className="relative min-h-full bg-background">
      <NetworkBackground />

      <div className="relative z-10 p-6 lg:p-8">
        <div className="space-y-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Analysis Results</h1>
              <p className="text-muted-foreground">
                {combinedAnalysis?.filename || "Malware analysis report"} • ID: {analysisId}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownload("json")}
                className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export JSON
              </button>
            </div>
          </div>

          {loading && (
            <div className="glass border border-border rounded-lg p-12 flex flex-col items-center justify-center gap-4">
              <Loader className="w-8 h-8 text-primary animate-spin" />
              <p className="text-muted-foreground">Loading analysis results...</p>
            </div>
          )}

          {error && (
            <div className="glass border border-destructive rounded-lg p-6 text-destructive">
              <p className="font-semibold mb-2">Error Loading Analysis</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {combinedAnalysis && !loading && (
            <>
              {/* View Selector */}
              <div className="glass border border-border rounded-lg p-4">
                <div className="flex flex-wrap gap-2">
                  <ViewButton
                    icon={<Layers className="w-4 h-4" />}
                    label="Overview"
                    active={activeView === "overview"}
                    onClick={() => setActiveView("overview")}
                    color="green"
                  />
                  
                  {components?.components?.cape && (
                    <ViewButton
                      icon={<FileJson className="w-4 h-4" />}
                      label="Cape Raw"
                      active={activeView === "cape"}
                      onClick={() => setActiveView("cape")}
                      color="blue"
                    />
                  )}
                  
                  {components?.components?.parsed && (
                    <ViewButton
                      icon={<FileText className="w-4 h-4" />}
                      label="Parsed Sections"
                      active={activeView === "parsed"}
                      onClick={() => setActiveView("parsed")}
                      color="pink"
                    />
                  )}
                  
                  {components?.components?.ai_analysis && (
                    <ViewButton
                      icon={<Brain className="w-4 h-4" />}
                      label="AI Analysis"
                      active={activeView === "ai"}
                      onClick={() => setActiveView("ai")}
                      color="accent"
                    />
                  )}
                </div>
              </div>

              {/* Component Status */}
              {components && (
                <div className="glass border border-border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-2">Available Components</p>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(components.components || {}).map(([key, value]) => (
                      <div
                        key={key}
                        className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                          value 
                            ? "bg-primary/20 text-primary border border-primary/30" 
                            : "bg-muted text-muted-foreground border border-border"
                        }`}
                      >
                        {value ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <AlertTriangle className="w-3 h-3" />
                        )}
                        {key.replace('_', ' ')}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Active View Content */}
              <div className="space-y-6">
                {activeView === "overview" && (
                  <>
                    <AnalysisOverview analysis={combinedAnalysis} />
                    
                    {parsedData?.sections?.behavior && (
                      <BehaviorVisualizer behavior={parsedData.sections.behavior} />
                    )}

                    {parsedData?.sections?.memory && (
                      <MemoryAnalysis memory={parsedData.sections.memory} />
                    )}

                    {parsedData?.sections?.strings && (
                      <StringsAnalysis strings={parsedData.sections.strings} />
                    )}

                    {parsedData?.sections?.signatures && (
                      <SignaturesAnalysis signatures={parsedData.sections.signatures} />
                    )}

                    {aiData && <AIAnalysisResults aiAnalysis={aiData} />}
                  </>
                )}

                {activeView === "cape" && (
                  <div className="glass border border-border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <FileJson className="w-6 h-6 text-secondary" />
                        <h2 className="text-2xl font-semibold text-foreground">Cape Raw Report</h2>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Raw data from CAPE sandbox analysis
                      </p>
                    </div>
                    
                    {loadingComponents ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader className="w-6 h-6 text-primary animate-spin" />
                      </div>
                    ) : capeData ? (
                      <div className="border border-border rounded-lg p-4 bg-muted/5">
                        <pre className="text-sm text-foreground font-mono overflow-x-auto max-h-[600px] overflow-y-auto">
                          {JSON.stringify(capeData, null, 2)}
                        </pre>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">No CAPE data available</p>
                      </div>
                    )}
                  </div>
                )}

                {activeView === "parsed" && (
                  <div className="space-y-6">
                    <div className="glass border border-border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <FileText className="w-6 h-6 text-accent" />
                          <h2 className="text-2xl font-semibold text-foreground">Parsed Sections</h2>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Structured analysis from CAPE report
                        </p>
                      </div>
                      
                      {loadingComponents ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader className="w-6 h-6 text-primary animate-spin" />
                        </div>
                      ) : parsedData ? (
                        <div className="space-y-6">
                          {/* Parsed sections summary */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(parsedData.sections || {}).map(([key, value]) => (
                              <div
                                key={key}
                                className="border border-border rounded-lg p-4 bg-muted/5 hover:bg-muted/10 transition-colors cursor-pointer"
                                onClick={() => {
                                  // You could add functionality to jump to specific section
                                  const element = document.getElementById(`section-${key}`);
                                  if (element) {
                                    element.scrollIntoView({ behavior: 'smooth' });
                                  }
                                }}
                              >
                                <p className="font-medium text-foreground capitalize">{key}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {Array.isArray(value) 
                                    ? `${value.length} items`
                                    : typeof value === 'object'
                                      ? Object.keys(value).length + ' keys'
                                      : 'Data available'}
                                </p>
                              </div>
                            ))}
                          </div>
                          
                          {/* Show detailed sections */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-foreground">Section Details</h3>
                            {Object.entries(parsedData.sections || {}).map(([key, value]) => (
                              <ParsedSection key={key} name={key} data={value} />
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <p className="text-muted-foreground">No parsed data available</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeView === "ai" && (
                  <div className="space-y-6">
                    <div className="glass border border-border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <Brain className="w-6 h-6 text-primary" />
                          <h2 className="text-2xl font-semibold text-foreground">AI Analysis</h2>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          AI-powered insights and synthesis
                        </p>
                      </div>
                      
                      {loadingComponents ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader className="w-6 h-6 text-primary animate-spin" />
                        </div>
                      ) : aiData ? (
                        <div className="space-y-6">
                          {/* AI Analysis Summary - Keep this if available */}
                          {(aiData.analysis_id || aiData.sections_analyzed || aiData.model_usage) && (
                            <div className="border border-border rounded-lg p-4 mb-6">
                              <h3 className="font-semibold text-foreground mb-3">AI Analysis Summary</h3>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {aiData.analysis_id && (
                                  <div>
                                    <p className="text-sm text-muted-foreground">Analysis ID</p>
                                    <p className="text-foreground font-mono text-sm">{aiData.analysis_id}</p>
                                  </div>
                                )}
                                {aiData.sections_analyzed && Array.isArray(aiData.sections_analyzed) && (
                                  <div>
                                    <p className="text-sm text-muted-foreground">Sections Analyzed</p>
                                    <p className="text-foreground font-medium">{aiData.sections_analyzed.length}</p>
                                  </div>
                                )}
                                {aiData.model_usage && typeof aiData.model_usage === 'object' && (
                                  <div>
                                    <p className="text-sm text-muted-foreground">AI Models Used</p>
                                    <p className="text-foreground font-medium">
                                      {Object.keys(aiData.model_usage).join(', ')}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* AI Sections - Similar to parsed sections */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-foreground">AI Analysis Sections</h3>
                            
                            {/* Display each AI analysis file as a separate section */}
                            {renderAISection(aiData, 'initial_combined_analysis', 'Initial Combined Analysis', 'initial_combined_analysis_analysis.json')}
                            {renderAISection(aiData, 'memory_analysis', 'Memory Analysis', 'memory_analysis_analysis.json')}
                            {renderAISection(aiData, 'behavior_analysis', 'Behavior Analysis', 'behavior_analysis_analysis.json')}
                            {renderAISection(aiData, 'strings_analysis', 'Strings Analysis', 'strings_analysis_analysis.json')}
                            {renderAISection(aiData, 'signatures_analysis', 'Signatures Analysis', 'signatures_analysis_analysis.json')}
                            {renderAISection(aiData, 'target_analysis', 'Target Analysis', 'target_analysis_analysis.json')}
                            {renderAISection(aiData, 'final_synthesis', 'Final Synthesis', 'final_synthesis_analysis.json')}
                            
                            {/* If AI data is in a different format, display raw */}
                            {!hasAISections(aiData) && (
                              <div className="border border-border rounded-lg p-4">
                                <h3 className="font-semibold text-foreground mb-2">Raw AI Analysis Data</h3>
                                <pre className="text-sm text-foreground font-mono overflow-x-auto max-h-[400px] overflow-y-auto">
                                  {JSON.stringify(aiData, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No AI analysis available</p>
                          <p className="text-sm text-muted-foreground mt-2">
                            This analysis was performed without AI analysis or the AI analysis failed to load.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {!loading && !error && !combinedAnalysis && (
            <div className="glass border border-border rounded-lg p-12 text-center">
              <AlertTriangle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No analysis found</p>
              <p className="text-sm text-muted-foreground mt-2">
                The analysis with ID {analysisId} could not be found.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper components
function ViewButton({
  icon,
  label,
  active,
  onClick,
  color
}: {
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
  color: string
}) {
  const activeClass = active 
    ? color === "green" 
      ? "bg-primary/20 text-primary border-primary" 
      : color === "blue"
        ? "bg-secondary/20 text-secondary border-secondary"
        : color === "pink"
          ? "bg-accent/20 text-accent border-accent"
          : "bg-primary/20 text-primary border-primary"
    : "bg-muted/5 text-muted-foreground border-border hover:border-foreground/30"

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${activeClass}`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  )
}

function ParsedSection({ name, data }: { name: string; data: any }) {
  const [expanded, setExpanded] = useState(false)
  
  return (
    <div className="border border-border rounded-lg p-4" id={`section-${name}`}>
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-3">
          <h4 className="font-semibold text-foreground capitalize">{name}</h4>
          <span className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground">
            {typeof data === 'object' ? Object.keys(data).length + ' keys' : 'data'}
          </span>
        </div>
        <button className="p-1 rounded hover:bg-muted">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>
      
      {expanded && (
        <div className="mt-4 border-t border-border pt-4">
          <pre className="text-sm text-foreground font-mono overflow-x-auto max-h-[400px] overflow-y-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

function AIAnalysisSection({ name, data, filename }: { name: string; data: any; filename?: string }) {
  const [expanded, setExpanded] = useState(false)
  
  // Safely extract analysis content
  let analysisContent = null
  if (typeof data === 'object') {
    analysisContent = data.analysis || data
  } else {
    analysisContent = data
  }
  
  // Format the filename display
  const displayFilename = filename || `${name.toLowerCase().replace(/ /g, '_')}_analysis.json`
  
  return (
    <div className="border border-border rounded-lg p-4" id={`ai-section-${name}`}>
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-3">
          <Brain className="w-5 h-5 text-primary" />
          <div>
            <h4 className="font-semibold text-foreground">{name}</h4>
            {filename && (
              <p className="text-xs text-muted-foreground font-mono mt-1">{displayFilename}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {data.ai_model && typeof data.ai_model === 'string' && (
            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
              {data.ai_model}
            </span>
          )}
          <button className="p-1 rounded hover:bg-muted">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>
      
      {expanded && (
        <div className="mt-4 border-t border-border pt-4">
          {/* Safely display analysis content */}
          {typeof analysisContent === 'string' ? (
            <div className="prose prose-invert max-w-none">
              <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                {analysisContent}
              </p>
            </div>
          ) : analysisContent && typeof analysisContent === 'object' ? (
            <div className="space-y-4">
              {/* Check for common structures in your AI files */}
              {analysisContent.executive_summary && (
                <div className="border-l-2 border-primary pl-4">
                  <h5 className="font-medium text-foreground mb-2">Executive Summary</h5>
                  {renderAIContent(analysisContent.executive_summary)}
                </div>
              )}
              
              {analysisContent.technical_analysis && (
                <div className="border-l-2 border-secondary pl-4">
                  <h5 className="font-medium text-foreground mb-2">Technical Analysis</h5>
                  <pre className="text-sm text-foreground font-mono overflow-x-auto max-h-[300px] overflow-y-auto">
                    {JSON.stringify(analysisContent.technical_analysis, null, 2)}
                  </pre>
                </div>
              )}
              
              {/* Display chunk results if present (for behavior/strings analysis) */}
              {analysisContent.chunk_results && Array.isArray(analysisContent.chunk_results) && (
                <div className="border-l-2 border-accent pl-4">
                  <h5 className="font-medium text-foreground mb-2">Chunk Analysis Results</h5>
                  <p className="text-sm text-muted-foreground mb-2">
                    {analysisContent.chunks_analyzed || analysisContent.chunk_results.length} chunks analyzed
                  </p>
                  {analysisContent.chunk_results.slice(0, 2).map((chunk: any, idx: number) => (
                    <div key={idx} className="mb-3 p-3 bg-muted/5 rounded">
                      <p className="text-sm font-medium text-foreground">Chunk {chunk.chunk_number}</p>
                      {chunk.analysis && typeof chunk.analysis === 'object' && (
                        <pre className="text-xs text-foreground font-mono overflow-x-auto mt-2">
                          {JSON.stringify(chunk.analysis, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Raw data fallback */}
              {!analysisContent.executive_summary && !analysisContent.technical_analysis && !analysisContent.chunk_results && (
                <pre className="text-sm text-foreground font-mono overflow-x-auto max-h-[400px] overflow-y-auto">
                  {JSON.stringify(analysisContent, null, 2)}
                </pre>
              )}
            </div>
          ) : (
            <pre className="text-sm text-foreground font-mono overflow-x-auto max-h-[400px] overflow-y-auto">
              {JSON.stringify(analysisContent, null, 2)}
            </pre>
          )}
          
          {/* Show metadata */}
          <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground flex flex-wrap gap-3">
            {data.timestamp && (
              <span>Timestamp: {new Date(data.timestamp).toLocaleString()}</span>
            )}
            {data.analysis_type && (
              <span>Type: {data.analysis_type}</span>
            )}
            {data.section && (
              <span>Section: {data.section}</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}