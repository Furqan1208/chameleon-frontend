import React from "react"
import {
  Activity,
  Database,
  Type,
  FileSignature,
  Shield,
  FileText,
  BarChart3,
  FileJson,
  Globe,
  File,
  Cpu as CpuIcon,
  Settings,
  DownloadCloud,
  Code,
  Brain,
  Layers,
  FileJson as FileJsonIcon,
  FileText as FileTextIcon
} from "lucide-react"

// Utility function to extract file hashes from multiple analysis sources
export const extractFileHashes = (parsedData?: any, capeData?: any, overviewData?: any, originalAnalysis?: any) => {
  // Try multiple paths to find target data (in priority order)
  let targetData = 
    // Parsed data sources (highest priority)
    parsedData?.target?.ai_summary ||          // AI summary target
    parsedData?.sections?.target ||             // Parsed sections target
    parsedData?.target ||                       // Direct target object
    // Overview data sources
    overviewData?.target?.ai_summary ||        // Overview AI summary
    overviewData?.target ||                    // Overview target
    overviewData?.sections?.target ||          // Overview sections target
    // Cape data sources
    capeData?.target?.file ||                   // CAPE file target
    capeData?.file ||                           // CAPE file
    capeData?.target ||                         // CAPE target
    // Original analysis fallback
    originalAnalysis?.target ||                 // Original target
    originalAnalysis ||                         // Direct original
    null

  if (!targetData) return null

  // Extract hashes and validate they're not empty strings
  const md5 = targetData.md5 || targetData?.file?.md5 || ""
  const sha1 = targetData.sha1 || targetData?.file?.sha1 || ""
  const sha256 = targetData.sha256 || targetData?.file?.sha256 || ""
  const sha512 = targetData.sha512 || targetData?.file?.sha512 || ""

  // Return null if we have no valid hashes (all empty)
  if (!md5 && !sha1 && !sha256 && !sha512) {
    return null
  }

  return {
    md5: md5 || "N/A",
    sha1: sha1 || "N/A",
    sha256: sha256 || "N/A",
    sha512: sha512 || "N/A",
    filename: targetData.file_name || targetData.name || targetData?.filename || "N/A",
    file_size: targetData.file_size || targetData.size || 0,
    file_type: targetData.file_type || targetData.type || "N/A",
    file_path: targetData.file_path || "N/A"
  }
}

// Utility function to get signature count
export const getSignaturesCount = (capeData: any) => {
  if (capeData?.signatures && Array.isArray(capeData.signatures)) {
    return capeData.signatures.length
  }
  return 0
}

// Utility function to get process count
export const getProcessCount = (capeData: any) => {
  if (!capeData?.behavior?.processes) return 0
  
  const processes = capeData.behavior.processes
  if (Array.isArray(processes)) {
    return processes.length
  }
  return 0
}

// Utility function to get strings count
export const getStringsCount = (parsedData: any) => {
  const stringsData = parsedData?.sections?.strings?.[0] || parsedData?.sections?.strings
  if (stringsData?.metadata?.total_strings_processed) {
    return stringsData.metadata.total_strings_processed
  }
  
  if (parsedData?.strings?.metadata?.total_strings_processed) {
    return parsedData.strings.metadata.total_strings_processed
  }
  
  if (Array.isArray(stringsData)) {
    return stringsData.length
  }
  
  return 0
}

// Utility function to get duration from CAPE info
export const getAnalysisDuration = (capeData: any) => {
  if (capeData?.info?.duration) {
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
  return null
}

// Get malscore from various sources
export const getMalscore = (capeData: any, overviewData: any, originalAnalysis: any, parsedData: any) => {
  if (capeData?.malscore !== undefined) {
    return capeData.malscore
  }

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

// Get section icon
export const getSectionIcon = (sectionName: string) => {
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

// View icons
export const VIEW_ICONS = {
  overview: Layers,
  cape: FileJsonIcon,
  parsed: FileTextIcon,
  ai: Brain
}

// Threat level helper
export const getThreatColor = (score?: number) => {
  if (!score) return "text-muted-foreground"
  if (score >= 7) return "text-destructive"
  if (score >= 4) return "text-accent"
  return "text-primary"
}

export const getThreatLabel = (score?: number) => {
  if (!score) return "Unknown"
  if (score >= 7) return "High Risk"
  if (score >= 4) return "Medium Risk"
  return "Low Risk"
}
