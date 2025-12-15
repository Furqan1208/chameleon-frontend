// D:\FYP\Chameleon Frontend\app\dashboard\analysis\[id]\page.tsx
"use client"

import { useParams } from "next/navigation"
import { useState, useEffect, useMemo } from "react"
import { useAnalysis } from "@/hooks/useAnalysis"
import { useAnalysisData } from "@/hooks/useAnalysisData"
import { NetworkBackground } from "@/components/3d/NetworkBackground"
import { ThreatGauge } from "@/components/charts/ThreatGauge"
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
  Clock,
  Eye,
  EyeOff,
  Copy,
  Shield,
  Activity,
  Database,
  Type,
  FileSignature,
  Search,
  Code,
  Cpu,
  Network,
  File,
  HardDrive,
  BarChart3,
  Hash,
  Fingerprint,
  Cpu as CpuIcon,
  Terminal,
  Globe,
  Server,
  Key,
  Users,
  Settings,
  Database as DatabaseIcon,
  Binary,
  FileCode,
  Package,
  FolderTree,
  FileArchive,
  DownloadCloud,
  ExternalLink,
  AlertCircle
} from "lucide-react"
import { apiService } from "@/lib/api-service"
import { formatDistanceToNow } from "date-fns"

// Utility function to extract file hashes from parsed data - FIXED for array structure
const extractFileHashes = (parsedData: any) => {
  // Handle array structure (target[0]) or direct object
  const targetData = parsedData?.sections?.target?.[0] || parsedData?.sections?.target

  if (!targetData) return null

  return {
    md5: targetData.md5 || "N/A",
    sha1: targetData.sha1 || "N/A",
    sha256: targetData.sha256 || "N/A",
    sha512: targetData.sha512 || "N/A",
    filename: targetData.file_name || "N/A",
    file_size: targetData.file_size || 0,
    file_type: targetData.file_type || "N/A",
    file_path: targetData.file_path || "N/A"
  }
}

// Utility function to get signature count - FROM CAPE ROOT signatures array
const getSignaturesCount = (capeData: any) => {
  if (capeData?.signatures && Array.isArray(capeData.signatures)) {
    return capeData.signatures.length
  }
  return 0
}

// Utility function to get process count - Count unique PIDs from behavior
const getProcessCount = (capeData: any) => {
  if (!capeData?.behavior?.processes) return 0
  
  // Extract all unique PIDs from processes
  const processes = capeData.behavior.processes
  if (Array.isArray(processes)) {
    return processes.length
  }
  return 0
}

// Utility function to get strings count - FROM strings metadata in parsed data
const getStringsCount = (parsedData: any) => {
  // Check in parsed data sections
  const stringsData = parsedData?.sections?.strings?.[0] || parsedData?.sections?.strings
  if (stringsData?.metadata?.total_strings_processed) {
    return stringsData.metadata.total_strings_processed
  }
  
  // Fallback: check in cape data
  if (parsedData?.strings?.metadata?.total_strings_processed) {
    return parsedData.strings.metadata.total_strings_processed
  }
  
  // Last resort: check array length
  if (Array.isArray(stringsData)) {
    return stringsData.length
  }
  
  return 0
}

// Utility function to get duration from CAPE info
const getAnalysisDuration = (capeData: any) => {
  if (capeData?.info?.duration) {
    // Duration is in seconds, convert to formatted string
    const seconds = capeData.info.duration
    if (seconds < 60) {
      return `${seconds}s`
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes}m ${remainingSeconds}s`
    } else {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      return `${hours}h ${minutes}m`
    }
  }
  
  // Fallback to AI duration if available
  return null
}

// Custom JSON viewer component with fallback
const CustomJSONViewer = ({ data, mode }: { data: any, mode: "pretty" | "raw" }) => {
  if (mode === "raw") {
    return (
      <pre className="text-sm text-foreground font-mono whitespace-pre-wrap break-words leading-relaxed max-h-[500px] overflow-y-auto bg-black/5 p-4 rounded">
        {JSON.stringify(data, null, 2)}
      </pre>
    )
  }

  try {
    return (
      <div className="json-pretty-container">
        <pre className="text-sm text-foreground font-mono whitespace-pre-wrap break-words leading-relaxed max-h-[500px] overflow-y-auto bg-black/5 p-4 rounded">
          {JSON.stringify(data, null, 2)}
        </pre>
        <style jsx global>{`
          .json-pretty-container pre {
            font-family: 'Geist Mono', monospace;
            font-size: 13px;
          }
          .json-pretty-container .string { color: #f1fa8c; }
          .json-pretty-container .number { color: #bd93f9; }
          .json-pretty-container .boolean { color: #ff79c6; }
          .json-pretty-container .null { color: #ff5555; }
          .json-pretty-container .key { color: #8be9fd; }
        `}</style>
      </div>
    )
  } catch {
    return (
      <pre className="text-sm text-foreground font-mono whitespace-pre-wrap break-words max-h-[500px] overflow-y-auto bg-black/5 p-4 rounded">
        {JSON.stringify(data, null, 2)}
      </pre>
    )
  }
}

// Formatted JSON Viewer - removes brackets and quotes for cleaner display
const FormattedJSONViewer = ({ data, title }: { data: any, title?: string }) => {
  const renderFormattedValue = (value: any, key?: string, depth = 0): React.ReactNode => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground italic">—</span>
    }

    // Handle arrays
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-muted-foreground italic">Empty</span>
      }
      if (value.length === 1 && typeof value[0] === 'string') {
        return <span className="text-foreground">{value[0]}</span>
      }
      return (
        <div className="space-y-2">
          {value.slice(0, 10).map((item, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-muted-foreground text-xs mt-1">•</span>
              <div>{renderFormattedValue(item, undefined, depth + 1)}</div>
            </div>
          ))}
          {value.length > 10 && (
            <div className="text-xs text-muted-foreground italic">+ {value.length - 10} more items</div>
          )}
        </div>
      )
    }

    // Handle objects
    if (typeof value === 'object') {
      const entries = Object.entries(value)
      if (entries.length === 0) {
        return <span className="text-muted-foreground italic">Empty</span>
      }

      return (
        <div className="space-y-3 ml-4">
          {entries.slice(0, 15).map(([k, v]) => (
            <div key={k} className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium text-blue-400 min-w-fit">{k.replace(/_/g, ' ')}:</span>
                {typeof v !== 'object' && renderFormattedValue(v, k, depth + 1)}
              </div>
              {typeof v === 'object' && (
                <div>{renderFormattedValue(v, undefined, depth + 1)}</div>
              )}
            </div>
          ))}
          {entries.length > 15 && (
            <div className="text-xs text-muted-foreground italic">+ {entries.length - 15} more fields</div>
          )}
        </div>
      )
    }

    // Handle strings - check for hashes and paths
    if (typeof value === 'string') {
      if (/^[a-fA-F0-9]{32,128}$/.test(value)) {
        return (
          <div className="flex items-center gap-2">
            <Fingerprint className="w-3 h-3 text-primary" />
            <code className="text-primary font-mono text-sm break-all">{value}</code>
          </div>
        )
      }
      if (value.includes('/') || value.includes('\\')) {
        return (
          <div className="flex items-center gap-2">
            <FolderTree className="w-3 h-3 text-secondary" />
            <code className="text-foreground font-mono text-sm break-all">{value}</code>
          </div>
        )
      }
      return <span className="text-foreground">{value}</span>
    }

    if (typeof value === 'number') {
      return <span className="text-accent font-medium">{value.toLocaleString()}</span>
    }

    if (typeof value === 'boolean') {
      return (
        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${value ? 'bg-primary/20 text-primary' : 'bg-destructive/20 text-destructive'
          }`}>
          {value ? 'Yes' : 'No'}
        </span>
      )
    }

    return <span className="text-foreground">{String(value)}</span>
  }

  return (
    <div className="space-y-4">
      {title && <h4 className="font-semibold text-foreground text-lg">{title}</h4>}
      <div className="text-sm leading-relaxed max-h-[500px] overflow-y-auto">
        {renderFormattedValue(data)}
      </div>
    </div>
  )
}

// Cape Report Structured Viewer - Fixed layout
const CapeStructuredViewer = ({ data }: { data: any }) => {
  const [activeSection, setActiveSection] = useState<string>("overview")

  const sections = useMemo(() => {
    if (!data || typeof data !== 'object') return []

    const allSections = Object.entries(data).map(([key, value]) => {
      let icon = <File className="w-4 h-4" />
      let description = ""

      switch (key) {
        case 'malscore':
          icon = <Shield className="w-4 h-4" />
          description = "Overall threat score"
          break
        case 'malstatus':
          icon = <AlertTriangle className="w-4 h-4" />
          description = "Malware status classification"
          break
        case 'file':
          icon = <File className="w-4 h-4" />
          description = "File information and metadata"
          break
        case 'behavior':
          icon = <Activity className="w-4 h-4" />
          description = "Behavior analysis results"
          break
        case 'signatures':
          icon = <FileSignature className="w-4 h-4" />
          description = "Detection signatures"
          break
        case 'network':
          icon = <Globe className="w-4 h-4" />
          description = "Network activity"
          break
        case 'memory':
          icon = <HardDrive className="w-4 h-4" />
          description = "Memory analysis"
          break
        case 'target':
          icon = <Shield className="w-4 h-4" />
          description = "Target information"
          break
        case 'statistics':
          icon = <BarChart3 className="w-4 h-4" />
          description = "Analysis statistics"
          break
        case 'ttps':
          icon = <FileCode className="w-4 h-4" />
          description = "MITRE ATT&CK Techniques"
          break
        case 'strings':
          icon = <Type className="w-4 h-4" />
          description = "Extracted strings"
          break
        case 'info':
          icon = <FileText className="w-4 h-4" />
          description = "Analysis information"
          break
        default:
          icon = <Code className="w-4 h-4" />
          description = "Additional data"
      }

      return { key, icon, description, value }
    })

    // Put malscore and malstatus first if they exist
    const orderedSections = []
    const malscoreSection = allSections.find(s => s.key === 'malscore')
    const malstatusSection = allSections.find(s => s.key === 'malstatus')
    const otherSections = allSections.filter(s => 
      s.key !== 'malscore' && s.key !== 'malstatus'
    )

    if (malscoreSection) orderedSections.push(malscoreSection)
    if (malstatusSection) orderedSections.push(malstatusSection)
    orderedSections.push(...otherSections)

    return orderedSections
  }, [data])

  if (!data || sections.length === 0) {
    return (
      <div className="text-center py-12">
        <FileJson className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No CAPE data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Section selector - Horizontal scroll on mobile */}
      <div className="flex flex-col space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Select Section</h3>
        <div className="flex overflow-x-auto pb-2 space-x-2">
          {sections.map((section) => (
            <button
              key={section.key}
              onClick={() => setActiveSection(section.key)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap ${activeSection === section.key
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'hover:bg-muted/20 text-muted-foreground border border-border'
                }`}
            >
              {section.icon}
              <span className="font-medium capitalize">
                {section.key.replace(/_/g, ' ')}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Active section content */}
      <div className="glass border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            {sections.find(s => s.key === activeSection)?.icon || <FileJson className="w-6 h-6 text-blue-500" />}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground capitalize">
              {activeSection.replace(/_/g, ' ')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {sections.find(s => s.key === activeSection)?.description}
            </p>
          </div>
        </div>

        {activeSection === 'malscore' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center p-8">
              <div className="relative">
                {/* Threat Gauge for malscore */}
                <div className="text-center">
                  <div className="text-6xl font-bold text-foreground mb-2">
                    {data.malscore?.toFixed(1) || 0}
                  </div>
                  <div className="text-lg text-muted-foreground">out of 10</div>
                </div>
                
                {/* Status indicator */}
                {data.malstatus && (
                  <div className={`mt-4 inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                    data.malstatus.toLowerCase() === 'malicious' 
                      ? 'bg-destructive/20 text-destructive' 
                      : data.malstatus.toLowerCase() === 'suspicious'
                      ? 'bg-accent/20 text-accent'
                      : 'bg-primary/20 text-primary'
                  }`}>
                    Status: {data.malstatus}
                  </div>
                )}
              </div>
            </div>
            
            {/* Explanation */}
            <div className="border-t border-border pt-4">
              <h4 className="font-semibold text-foreground mb-2">What this score means:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    data.malscore >= 7 ? 'bg-destructive' : 
                    data.malscore >= 4 ? 'bg-accent' : 'bg-primary'
                  }`}></div>
                  <span>
                    {data.malscore >= 7 ? 'High Risk (7.0-10.0): Likely malicious' : 
                     data.malscore >= 4 ? 'Medium Risk (4.0-6.9): Suspicious activity' : 
                     'Low Risk (0.0-3.9): Probably benign'}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="max-h-[600px] overflow-y-auto">
            <CustomJSONViewer data={sections.find(s => s.key === activeSection)?.value} mode="raw" />
          </div>
        )}
      </div>
    </div>
  )
}

// Parsed Sections Viewer - Top-bottom layout
const ParsedSectionsViewer = ({ data }: { data: any }) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [viewMode, setViewMode] = useState<"formatted" | "raw">("formatted")

  const sections = useMemo(() => {
    if (!data?.sections || typeof data.sections !== 'object') return []

    return Object.entries(data.sections).map(([key, value]: [string, any]) => {
      let icon = getSectionIcon(key)
      let itemCount = 0

      // Handle both array[0] and direct object structures
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
            className={`px-3 py-1.5 text-sm transition-colors ${viewMode === "formatted"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted/20"
              }`}
          >
            Formatted
          </button>
          <button
            onClick={() => setViewMode("raw")}
            className={`px-3 py-1.5 text-sm transition-colors ${viewMode === "raw"
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
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expandedSections[section.key] ? 'rotate-180' : ''
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

// AI Analysis Viewer - Top-bottom layout
const AIAnalysisViewer = ({ data }: { data: any }) => {
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
            className={`px-3 py-1.5 text-sm transition-colors ${viewMode === "formatted"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted/20"
              }`}
          >
            Formatted
          </button>
          <button
            onClick={() => setViewMode("raw")}
            className={`px-3 py-1.5 text-sm transition-colors ${viewMode === "raw"
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
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expandedSections[section.key] ? 'rotate-180' : ''
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

// Simple Analysis Overview component
const SimpleAnalysisOverview = ({ analysis }: { analysis: any }) => {
  const getThreatColor = (score?: number) => {
    if (!score) return "text-muted-foreground"
    if (score >= 7) return "text-destructive"
    if (score >= 4) return "text-accent"
    return "text-primary"
  }

  const getThreatLabel = (score?: number) => {
    if (!score) return "Unknown"
    if (score >= 7) return "High Risk"
    if (score >= 4) return "Medium Risk"
    return "Low Risk"
  }

  return (
    <div className="glass border border-border rounded-xl p-6">
      <h2 className="text-xl font-semibold text-foreground mb-6">Analysis Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <File className="w-4 h-4" />
            <span className="text-sm">Filename</span>
          </div>
          <p className="text-foreground font-medium truncate">{analysis.filename || "Unknown"}</p>
        </div>

        <div>
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Created</span>
          </div>
          <p className="text-foreground font-medium">
            {analysis.created_at ? formatDistanceToNow(new Date(analysis.created_at), { addSuffix: true }) : "Unknown"}
          </p>
        </div>

        <div>
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Shield className="w-4 h-4" />
            <span className="text-sm">Status</span>
          </div>
          <p className="text-foreground font-medium capitalize">{analysis.status || "pending"}</p>
        </div>

        <div>
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">Threat Level</span>
          </div>
          <p className={`font-semibold text-lg ${getThreatColor(analysis.malscore)}`}>
            {getThreatLabel(analysis.malscore)}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function AnalysisPage() {
  const params = useParams()
  const analysisId = params.id as string

  const { analysis: originalAnalysis, loading: originalLoading, error: originalError } = useAnalysis(analysisId)
  const { overviewData, loading: overviewLoading, error: overviewError } = useAnalysisData(analysisId)

  const [activeView, setActiveView] = useState<"overview" | "cape" | "parsed" | "ai">("overview")
  const [components, setComponents] = useState<any>(null)
  const [capeData, setCapeData] = useState<any>(null)
  const [parsedData, setParsedData] = useState<any>(null)
  const [aiData, setAiData] = useState<any>(null)
  const [loadingComponents, setLoadingComponents] = useState(false)
  const [copied, setCopied] = useState(false)
  const [viewMode, setViewMode] = useState<"pretty" | "raw">("pretty")
  const [downloadProgress, setDownloadProgress] = useState(0)

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

      if (comps.components?.cape) {
        try {
          const cape = await apiService.getCapeReport(analysisId)
          setCapeData(cape.data || cape)
        } catch (err) {
          console.warn("Failed to load CAPE data:", err)
        }
      }

      if (comps.components?.parsed) {
        try {
          const parsed = await apiService.getParsedSection(analysisId, "all")
          setParsedData(parsed.data || parsed)
        } catch (err) {
          console.warn("Failed to load parsed data:", err)
        }
      }

      if (comps.components?.ai_analysis) {
        try {
          const ai = await apiService.getAiAnalysis(analysisId, "summary")
          const aiResponse = ai.data || ai

          if (aiResponse.results) {
            setAiData(aiResponse)
          } else if (aiResponse.sections) {
            const results: any = {}
            Object.entries(aiResponse.sections).forEach(([key, value]: [string, any]) => {
              if (value.analysis) {
                results[key] = value.analysis
              } else {
                results[key] = value
              }
            })
            setAiData({
              ...aiResponse,
              results,
              sections_analyzed: Object.keys(aiResponse.sections || {})
            })
          } else {
            setAiData(aiResponse)
          }
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
      setDownloadProgress(0)
      const interval = setInterval(() => {
        setDownloadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      const data = await apiService.downloadReport(analysisId, format as any)

      clearInterval(interval)
      setDownloadProgress(100)

      // Convert JSON to Blob and download
      const jsonStr = JSON.stringify(data, null, 2)
      const blob = new Blob([jsonStr], { type: "application/json" })
      const url = window.URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = `${analysisId}.${format}` // e.g. "123.json"
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)

      setTimeout(() => setDownloadProgress(0), 1000)
    } catch (err) {
      console.error("Download failed:", err)
      alert("Download failed. Please try again.")
      setDownloadProgress(0)
    }
  }

  const handleCopyJson = (data: any) => {
    try {
      navigator.clipboard.writeText(JSON.stringify(data, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Copy failed:", err)
    }
  }

  // Extract data with corrected functions
  const fileHashes = extractFileHashes(parsedData)
  
  // Get counts from CAPE data
  const signaturesCount = getSignaturesCount(capeData)
  const processCount = getProcessCount(capeData)
  const stringsCount = getStringsCount(parsedData)
  const analysisDuration = getAnalysisDuration(capeData)

  // Get malscore from the right place - check both originalAnalysis and overviewData
  const getMalscore = () => {
    // 1. Check the root of capeData (this is where it's actually located)
    if (capeData?.malscore !== undefined) {
      return capeData.malscore
    }

    // 2. Check other sources as fallback
    if (overviewData?.malscore !== undefined) {
      return overviewData.malscore
    }

    if (originalAnalysis?.malscore !== undefined) {
      return originalAnalysis.malscore
    }

    if (parsedData?.sections?.info?.[0]?.malscore !== undefined) {
      return parsedData.sections.info[0].malscore
    }

    return 0
  }

  const malscore = getMalscore()

  const combinedAnalysis = originalAnalysis || overviewData ? {
    ...(originalAnalysis || {}),
    ...(overviewData || {}),
    analysis_id: analysisId,
    filename: fileHashes?.filename || originalAnalysis?.filename || overviewData?.filename || "Unknown",
    created_at: originalAnalysis?.created_at || overviewData?.created_at || new Date().toISOString(),
    status: originalAnalysis?.status || overviewData?.status || "completed",
    malscore: malscore,
    file_hashes: fileHashes,
    parsed_results: {
      sections: parsedData?.sections || {}
    }
  } : null

  return (
    <div className="relative min-h-full bg-background">
      <NetworkBackground />

      <div className="relative z-10 p-4 lg:p-6 max-w-7xl mx-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-8 h-8 text-primary" />
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Analysis Results</h1>
                  <p className="text-muted-foreground text-sm">
                    {fileHashes?.filename || combinedAnalysis?.filename || "Malware analysis report"} • ID: <span className="font-mono">{analysisId.substring(0, 8)}...</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {activeView === "cape" && (
                <button
                  onClick={() => setViewMode(viewMode === "pretty" ? "raw" : "pretty")}
                  className="px-3 py-1.5 border border-border rounded-lg hover:bg-muted/20 transition-colors flex items-center gap-2 text-sm"
                  disabled={downloadProgress > 0}
                >
                  {viewMode === "pretty" ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  {viewMode === "pretty" ? "Raw View" : "Structured View"}
                </button>
              )}
              <button
                onClick={() => handleDownload("json")}
                disabled={downloadProgress > 0}
                className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm relative overflow-hidden"
              >
                {downloadProgress > 0 ? (
                  <>
                    <Loader className="w-3 h-3 animate-spin" />
                    <span className="text-xs">Downloading... {downloadProgress}%</span>
                    <div
                      className="absolute bottom-0 left-0 h-0.5 bg-primary/30 transition-all duration-300"
                      style={{ width: `${downloadProgress}%` }}
                    />
                  </>
                ) : (
                  <>
                    <Download className="w-3 h-3" />
                    <span className="text-xs">Export JSON</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="glass border border-border rounded-xl p-8 lg:p-12 flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <Loader className="w-10 h-10 text-primary animate-spin" />
              </div>
              <p className="text-muted-foreground">Loading analysis results...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="glass border border-destructive/50 rounded-xl p-4 lg:p-6 bg-destructive/5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-destructive mb-2">Error Loading Analysis</p>
                  <p className="text-sm text-foreground/80">{error}</p>
                </div>
              </div>
            </div>
          )}

          {combinedAnalysis && !loading && (
            <>
              {/* View Selector Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <ViewCard
                  icon={<Layers className="w-4 h-4" />}
                  label="Overview"
                  active={activeView === "overview"}
                  onClick={() => setActiveView("overview")}
                  color="green"
                  description="Summary & visualizations"
                />

                {components?.components?.cape && (
                  <ViewCard
                    icon={<FileJson className="w-4 h-4" />}
                    label="Cape Report"
                    active={activeView === "cape"}
                    onClick={() => setActiveView("cape")}
                    color="blue"
                    description="Raw & structured CAPE data"
                  />
                )}

                {components?.components?.parsed && (
                  <ViewCard
                    icon={<FileText className="w-4 h-4" />}
                    label="Parsed"
                    active={activeView === "parsed"}
                    onClick={() => setActiveView("parsed")}
                    color="pink"
                    description="Structured analysis"
                  />
                )}

                {components?.components?.ai_analysis && (
                  <ViewCard
                    icon={<Brain className="w-4 h-4" />}
                    label="AI Analysis"
                    active={activeView === "ai"}
                    onClick={() => setActiveView("ai")}
                    color="accent"
                    description="AI-powered insights"
                  />
                )}
              </div>

              {/* Component Status */}
              {components && (
                <div className="glass border border-border rounded-xl p-4 bg-muted/5">
                  <p className="text-sm text-muted-foreground mb-3">Analysis Components</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(components.components || {}).map(([key, value]) => (
                      <div
                        key={key}
                        className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${value
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "bg-muted/20 text-muted-foreground border border-border"
                          }`}
                      >
                        {value ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <AlertTriangle className="w-3 h-3" />
                        )}
                        <span className="capitalize">{key.replace('_', ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Active View Content */}
              <div className="space-y-6">
                {activeView === "overview" && (
                  <>
                    {/* File Information */}
                    {fileHashes && (
                      <div className="glass border border-border rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 bg-blue-500/10 rounded-lg">
                            <File className="w-5 h-5 text-blue-500" />
                          </div>
                          <div>
                            <h2 className="text-xl font-semibold text-foreground">File Information</h2>
                            <p className="text-sm text-muted-foreground">Sample details and cryptographic hashes</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* File Basics */}
                          <div className="space-y-4">
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Filename</p>
                              <p className="text-foreground font-mono text-sm break-all">{fileHashes.filename}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">File Type</p>
                              <p className="text-foreground text-sm">{fileHashes.file_type}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">File Size</p>
                              <p className="text-foreground font-mono text-sm">
                                {(fileHashes.file_size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>

                          {/* Hashes */}
                          <div className="space-y-4">
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                                <Hash className="w-3 h-3" /> MD5
                              </p>
                              <div className="flex items-center gap-2">
                                <code className="text-primary font-mono text-xs break-all flex-1 bg-primary/5 p-2 rounded">
                                  {fileHashes.md5}
                                </code>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                                <Hash className="w-3 h-3" /> SHA256
                              </p>
                              <div className="flex items-center gap-2">
                                <code className="text-primary font-mono text-xs break-all flex-1 bg-primary/5 p-2 rounded">
                                  {fileHashes.sha256}
                                </code>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Simple Analysis Overview - UPDATED to remove duplicate file info */}
                    <SimpleAnalysisOverview analysis={combinedAnalysis} />

                    {/* Threat Gauge & Stats */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-1">
                        <ThreatGauge
                          score={malscore}
                          title="Threat Score"
                          size="md"
                        />
                      </div>
                      <div className="lg:col-span-2">
                        <div className="glass border border-border rounded-xl p-6 h-full">
                          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Stats</h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatCard
                              label="Processes"
                              value={processCount}
                              icon={<Activity className="w-4 h-4" />}
                              color="blue"
                            />
                            <StatCard
                              label="Signatures"
                              value={signaturesCount}
                              icon={<FileSignature className="w-4 h-4" />}
                              color="pink"
                            />
                            <StatCard
                              label="Strings"
                              value={stringsCount.toLocaleString()}
                              icon={<Type className="w-4 h-4" />}
                              color="green"
                            />
                            <StatCard
                              label="Duration"
                              value={analysisDuration || `${aiData?.duration_seconds?.toFixed(1)}s` || "N/A"}
                              icon={<Clock className="w-4 h-4" />}
                              color="accent"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {activeView === "cape" && (
                  <div className="glass border border-border rounded-xl p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                          <FileJson className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-foreground">CAPE Report</h2>
                          <p className="text-sm text-muted-foreground">
                            Raw JSON data from CAPE sandbox
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyJson(capeData)}
                          className="px-3 py-1.5 border border-border rounded-lg hover:bg-muted/20 transition-colors flex items-center gap-2 text-sm"
                        >
                          <Copy className="w-3 h-3" />
                          {copied ? "Copied!" : "Copy JSON"}
                        </button>
                      </div>
                    </div>

                    <div className="mt-6">
                      {loadingComponents ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader className="w-6 h-6 text-primary animate-spin" />
                        </div>
                      ) : capeData ? (
                        <CapeStructuredViewer data={capeData} />
                      ) : (
                        <div className="text-center py-8">
                          <FileJson className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground">No CAPE data available</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeView === "parsed" && (
                  <div className="glass border border-border rounded-xl p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-pink-500/10 rounded-lg">
                          <FileText className="w-5 h-5 text-pink-500" />
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-foreground">Parsed Sections</h2>
                          <p className="text-sm text-muted-foreground">
                            Structured analysis extracted from CAPE report
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {parsedData?.sections ? Object.keys(parsedData.sections).length : 0} sections
                      </div>
                    </div>

                    {loadingComponents ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader className="w-6 h-6 text-primary animate-spin" />
                      </div>
                    ) : parsedData ? (
                      <ParsedSectionsViewer data={parsedData} />
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">No parsed data available</p>
                      </div>
                    )}
                  </div>
                )}

                {activeView === "ai" && (
                  <div className="glass border border-border rounded-xl p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Brain className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-foreground">AI Analysis</h2>
                          <p className="text-sm text-muted-foreground">
                            AI-powered insights and threat intelligence
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyJson(aiData)}
                          className="px-3 py-1.5 border border-border rounded-lg hover:bg-muted/20 transition-colors flex items-center gap-2 text-sm"
                        >
                          <Copy className="w-3 h-3" />
                          Copy All
                        </button>
                      </div>
                    </div>

                    {loadingComponents ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader className="w-6 h-6 text-primary animate-spin" />
                      </div>
                    ) : aiData ? (
                      <AIAnalysisViewer data={aiData} />
                    ) : (
                      <div className="text-center py-8">
                        <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">No AI analysis available</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {!loading && !error && !combinedAnalysis && (
            <div className="glass border border-border rounded-xl p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-2">No analysis found</p>
              <p className="text-sm text-muted-foreground">
                The analysis with ID <span className="font-mono">{analysisId}</span> could not be found.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper components
function ViewCard({
  icon,
  label,
  active,
  onClick,
  color,
  description
}: {
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
  color: "green" | "blue" | "pink" | "accent"
  description: string
}) {
  const activeClass = active
    ? color === "green"
      ? "bg-primary/10 border-primary text-primary"
      : color === "blue"
        ? "bg-blue-500/10 border-blue-500 text-blue-500"
        : color === "pink"
          ? "bg-pink-500/10 border-pink-500 text-pink-500"
          : "bg-primary/10 border-primary text-primary"
    : "bg-muted/5 text-muted-foreground border-border hover:border-foreground/30"

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-start p-3 rounded-lg border transition-all duration-200 ${activeClass} hover:scale-[1.02] group`}
    >
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="font-semibold text-sm">{label}</span>
      </div>
      <p className="text-xs text-left opacity-80 group-hover:opacity-100 transition-opacity text-left">
        {description}
      </p>
    </button>
  )
}

function StatCard({ label, value, icon, color }: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: "green" | "blue" | "pink" | "accent"
}) {
  const colorClasses = {
    green: 'text-primary border-primary/20 bg-primary/5',
    blue: 'text-blue-500 border-blue-500/20 bg-blue-500/5',
    pink: 'text-pink-500 border-pink-500/20 bg-pink-500/5',
    accent: 'text-accent border-accent/20 bg-accent/5'
  }

  return (
    <div className={`border rounded-lg p-3 hover:scale-[1.02] transition-transform ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div className={`p-1.5 rounded-lg ${colorClasses[color].split(' ')[0].replace('text-', 'bg-')} bg-opacity-10`}>
          {icon}
        </div>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className={`text-xl font-bold mt-1.5 ${colorClasses[color].split(' ')[0]}`}>{value}</div>
    </div>
  )
}

function getSectionIcon(sectionName: string) {
  const lowerName = sectionName.toLowerCase()
  switch (lowerName) {
    case 'behavior':
      return <Activity className="w-4 h-4" />
    case 'memory':
      return <Database className="w-4 h-4" />
    case 'strings':
      return <Type className="w-4 h-4" />
    case 'signatures':
      return <FileSignature className="w-4 h-4" />
    case 'target':
      return <Shield className="w-4 h-4" />
    case 'info':
      return <FileText className="w-4 h-4" />
    case 'statistics':
      return <BarChart3 className="w-4 h-4" />
    case 'cape':
      return <FileJson className="w-4 h-4" />
    case 'network':
      return <Globe className="w-4 h-4" />
    case 'file':
      return <File className="w-4 h-4" />
    case 'process':
      return <CpuIcon className="w-4 h-4" />
    case 'registry':
      return <Settings className="w-4 h-4" />
    case 'dropped':
      return <DownloadCloud className="w-4 h-4" />
    default:
      return <Code className="w-4 h-4" />
  }
}