"use client"

import { useState, useMemo } from "react"
import { ChevronDown, ChevronUp, FileText } from "lucide-react"
import CustomJSONViewer from "./CustomJSONViewer"
import FormattedJSONViewer from "./FormattedJSONViewer"
import { getSectionIcon } from "./utils"

interface ParsedSectionsViewerProps {
  data: any
}

export default function ParsedSectionsViewer({ data }: ParsedSectionsViewerProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [viewMode, setViewMode] = useState<"formatted" | "raw">("formatted")

  const sections = useMemo(() => {
    if (!data?.sections || typeof data.sections !== 'object') return []

    return Object.entries(data.sections).map(([key, value]: [string, any]) => {
      const icon = getSectionIcon(key)
      let itemCount = 0

      const sectionData = Array.isArray(value) && value.length > 0 ? value[0] : value

      if (Array.isArray(sectionData)) {
        itemCount = sectionData.length
      } else if (typeof sectionData === 'object') {
        itemCount = Object.keys(sectionData).length
      } else {
        itemCount = 1
      }

      return { key, icon, itemCount, data: sectionData }
    })
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
        <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No parsed data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
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
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {sections.map((section) => (
          <div
            key={section.key}
            onClick={() => toggleSection(section.key)}
            className="glass border border-border rounded-lg p-4 hover:bg-muted/10 transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-muted rounded-lg">
                {section.icon}
              </div>
              <h4 className="font-medium text-foreground capitalize flex-1">
                {section.key}
              </h4>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {section.itemCount} {section.itemCount === 1 ? 'item' : 'items'}
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
                  <h3 className="text-lg font-semibold text-foreground capitalize">
                    {section.key}
                  </h3>
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