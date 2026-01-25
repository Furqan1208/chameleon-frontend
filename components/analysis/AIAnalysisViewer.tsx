"use client"

import { useState, useMemo } from "react"
import {
  Brain,
  FileText,
  Activity,
  HardDrive,
  Type,
  FileSignature,
  Shield,
  BarChart3,
  Cpu,
  Clock,
  Network,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import CustomJSONViewer from "./CustomJSONViewer"
import FormattedJSONViewer from "./FormattedJSONViewer"

interface AIAnalysisViewerProps {
  data: any
}

export default function AIAnalysisViewer({ data }: AIAnalysisViewerProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [viewMode, setViewMode] = useState<"formatted" | "raw">("formatted")

  const sections = useMemo(() => {
    if (!data) return []

    if (data.results) {
      return Object.entries(data.results).map(([key, value]: [string, any]) => {
        let icon = <Brain className="w-4 h-4" />
        let description = ""

        switch (key) {
          case 'initial_combined_analysis':
            icon = <FileText className="w-4 h-4" />
            description = "Initial combined analysis"
            break
          case 'behavior_analysis':
            icon = <Activity className="w-4 h-4" />
            description = "Behavior analysis"
            break
          case 'memory_analysis':
            icon = <HardDrive className="w-4 h-4" />
            description = "Memory analysis"
            break
          case 'strings_analysis':
            icon = <Type className="w-4 h-4" />
            description = "Strings analysis"
            break
          case 'signatures_analysis':
            icon = <FileSignature className="w-4 h-4" />
            description = "Signatures analysis"
            break
          case 'target_analysis':
            icon = <Shield className="w-4 h-4" />
            description = "Target analysis"
            break
          case 'final_synthesis':
            icon = <BarChart3 className="w-4 h-4" />
            description = "Final synthesis"
            break
          default:
            icon = <Brain className="w-4 h-4" />
            description = "AI analysis"
        }

        return { key, icon, description, data: value }
      })
    }

    return []
  }, [data])

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  if (!data || sections.length === 0) {
    return (
      <div className="text-center py-12">
        <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No AI analysis data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass border border-border rounded-lg p-4 hover:glow-blue transition-all">
          <div className="flex items-center gap-3 mb-2">
            <Cpu className="w-5 h-5 text-blue-500" />
            <p className="text-sm text-muted-foreground">Sections Analyzed</p>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {sections.length}
          </p>
        </div>
        <div className="glass border border-border rounded-lg p-4 hover:glow-green transition-all">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-green-500" />
            <p className="text-sm text-muted-foreground">Duration</p>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {data.duration_seconds ? `${data.duration_seconds.toFixed(1)}s` : "N/A"}
          </p>
        </div>
        <div className="glass border border-border rounded-lg p-4 hover:glow-pink transition-all">
          <div className="flex items-center gap-3 mb-2">
            <Network className="w-5 h-5 text-pink-500" />
            <p className="text-sm text-muted-foreground">AI Model</p>
          </div>
          <p className="text-2xl font-bold text-foreground font-mono text-sm">
            {data.model_used || "gemini-2.5-flash"}
          </p>
        </div>
      </div>

      {/* View mode toggle */}
      <div className="flex justify-end">
        <div className="inline-flex border border-border rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode("formatted")}
            className={`px-3 py-1.5 text-sm transition-colors ${
              viewMode === "formatted"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted/20"
            }`}
          >
            Formatted
          </button>
          <button
            onClick={() => setViewMode("raw")}
            className={`px-3 py-1.5 text-sm transition-colors ${
              viewMode === "raw"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted/20"
            }`}
          >
            Raw JSON
          </button>
        </div>
      </div>

      {/* Sections grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {sections.map((section) => (
          <div
            key={section.key}
            onClick={() => toggleSection(section.key)}
            className="glass border border-border rounded-lg p-4 hover:bg-muted/10 transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                {section.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-foreground capitalize">
                  {section.key.replace(/_/g, ' ')}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {section.description}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-muted-foreground">
                Click to view analysis
              </span>
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${
                expandedSections[section.key] ? 'rotate-180' : ''
              }`} />
            </div>
          </div>
        ))}
      </div>

      {/* Expanded sections */}
      <div className="space-y-4">
        {sections.map((section) => (
          expandedSections[section.key] && (
            <div key={section.key} className="glass border border-border rounded-lg overflow-hidden">
              <div className="p-4 bg-muted/5 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {section.icon}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground capitalize">
                      {section.key.replace(/_/g, ' ')}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {section.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleSection(section.key)}
                  className="p-1.5 hover:bg-muted rounded transition-colors"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 max-h-[500px] overflow-y-auto">
                {viewMode === "formatted" ? (
                  <FormattedJSONViewer data={section.data} />
                ) : (
                  <CustomJSONViewer data={section.data} mode="raw" />
                )}
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  )
}