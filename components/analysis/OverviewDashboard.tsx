"use client"

import { useState, useMemo, useEffect } from "react"
import {
  Shield,
  File,
  Activity,
  AlertTriangle,
  Brain,
  Layers,
  Cpu,
  Network,
  HardDrive,
  Folder,
  Key,
  Terminal,
  Type,
  FileCode,
  BarChart3,
  Clock,
  Users,
  Globe,
  Database,
  Hash,
  Server,
  Zap,
  Target,
  AlertCircle,
  CheckCircle,
  XCircle,
  TrendingUp,
  PieChart,
  LineChart,
  Download,
  Copy,
  Eye,
  EyeOff,
  Search,
  Filter,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  FileText,
  ExternalLink,
  GitBranch,
  Timer,
  ShieldAlert,
  Server as ServerIcon,
  Code as CodeIcon,
  BarChart as BarChartIcon
} from "lucide-react"
import { motion } from "framer-motion"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

interface OverviewDashboardProps {
  combinedAnalysis: any
  fileHashes: any
  malscore: number
  capeData: any
  parsedData: any
  aiData: any
  onCopyJson?: () => void
  copied?: boolean
  onDownload?: (format: string) => void
}

interface SectionCardProps {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
  collapsible?: boolean
  defaultExpanded?: boolean
}

const SectionCard = ({ title, icon, children, className, collapsible = false, defaultExpanded = true }: SectionCardProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  
  return (
    <div className={cn("glass border border-border rounded-xl", className)}>
      <div 
        className={cn("p-6", collapsible && "cursor-pointer hover:bg-muted/10 transition-colors")}
        onClick={collapsible ? () => setIsExpanded(!isExpanded) : undefined}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon && <div className="p-2 rounded-lg bg-primary/10">{icon}</div>}
            <div>
              <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            </div>
          </div>
          {collapsible && (
            <div className="p-2 hover:bg-muted/20 rounded-lg transition-colors">
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          )}
        </div>
      </div>
      {isExpanded && <div className="px-6 pb-6">{children}</div>}
    </div>
  )
}

const StatCard = ({ icon, label, value, color = "primary", description, trend, trendValue }: any) => {
  const colorClasses = {
    blue: "border-blue-500/20 bg-blue-500/5 text-blue-500",
    red: "border-red-500/20 bg-red-500/5 text-red-500",
    green: "border-green-500/20 bg-green-500/5 text-green-500",
    purple: "border-purple-500/20 bg-purple-500/5 text-purple-500",
    orange: "border-orange-500/20 bg-orange-500/5 text-orange-500",
    pink: "border-pink-500/20 bg-pink-500/5 text-pink-500",
    cyan: "border-cyan-500/20 bg-cyan-500/5 text-cyan-500",
    primary: "border-primary/20 bg-primary/5 text-primary"
  }

  return (
    <div className={`glass border rounded-xl p-4 hover:scale-[1.02] transition-all duration-200 ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="p-2 rounded-lg bg-current/10">
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
            trend === 'up' ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'
          }`}>
            {trend === 'up' ? '↑' : '↓'} {trendValue}
          </div>
        )}
      </div>
      <div className="space-y-1">
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm font-medium text-foreground">{label}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-2">{description}</p>
        )}
      </div>
    </div>
  )
}

const ThreatLevelBadge = ({ level, score }: { level: string; score: number }) => {
  const getConfig = (level: string) => {
    switch(level.toLowerCase()) {
      case 'critical': return { color: 'bg-red-500', text: 'Critical', icon: <AlertTriangle className="w-4 h-4" /> }
      case 'high': return { color: 'bg-orange-500', text: 'High', icon: <AlertCircle className="w-4 h-4" /> }
      case 'medium': return { color: 'bg-yellow-500', text: 'Medium', icon: <AlertCircle className="w-4 h-4" /> }
      case 'low': return { color: 'bg-green-500', text: 'Low', icon: <CheckCircle className="w-4 h-4" /> }
      default: return { color: 'bg-gray-500', text: 'Unknown', icon: <Shield className="w-4 h-4" /> }
    }
  }
  
  const config = getConfig(level)
  
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background border border-border">
      <div className={`w-2 h-2 rounded-full ${config.color}`} />
      <span className="text-sm font-medium">{config.text}</span>
      <span className="text-xs text-muted-foreground">({score.toFixed(1)})</span>
    </div>
  )
}

const ProgressBar = ({ value, max = 10, color = "primary", label }: { value: number; max?: number; color?: string; label?: string }) => {
  const percentage = (value / max) * 100
  
  const colorClass = {
    red: "bg-red-500",
    orange: "bg-orange-500",
    yellow: "bg-yellow-500",
    green: "bg-green-500",
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    primary: "bg-primary"
  }[color] || "bg-primary"
  
  return (
    <div className="space-y-1">
      {label && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-medium">{value.toFixed(1)}/{max}</span>
        </div>
      )}
      <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
        <div 
          className={`h-full ${colorClass} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

const DataGrid = ({ children, columns = 2 }: { children: React.ReactNode; columns?: number }) => {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-4",
    6: "grid-cols-2 md:grid-cols-6"
  }[columns] || "grid-cols-1 md:grid-cols-2"
  
  return (
    <div className={`grid ${gridCols} gap-4`}>
      {children}
    </div>
  )
}

export default function OverviewDashboard({ 
  combinedAnalysis,
  fileHashes,
  malscore,
  capeData,
  parsedData,
  aiData,
  onCopyJson,
  copied,
  onDownload
}: OverviewDashboardProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    fileInfo: false,
    threatIntel: true,
    behavioral: true,
    aiInsights: true
  })
  const [viewMode, setViewMode] = useState<"overview" | "detailed">("overview")

  // Extract comprehensive statistics
  const stats = useMemo(() => {
    const capeStats = {
      processes: capeData?.behavior?.processes?.length || 0,
      signatures: capeData?.signatures?.length || 0,
      droppedFiles: capeData?.dropped?.length || 0,
      ttpCount: capeData?.ttps?.length || 0,
      registryKeys: capeData?.behavior?.summary?.keys?.length || 0,
      apiCalls: capeData?.behavior?.processes?.reduce((acc: number, proc: any) => 
        acc + (proc.calls?.length || 0), 0) || 0,
      memoryDumps: capeData?.procmemory?.length || 0,
      networkConnections: Object.keys(capeData?.network || {}).length || 0
    }

    const parsedStats = {
      totalStrings: parsedData?.sections?.strings?.metadata?.total_strings_processed || 0,
      whitelistedStrings: parsedData?.sections?.strings?.metadata?.whitelisted_strings || 0,
      stringCategories: parsedData?.sections?.strings?.metadata?.whitelist_categories_used?.length || 0,
      extractedPEs: parsedData?.sections?.memory?.procmemory?.reduce((acc: number, proc: any) => 
        acc + (proc.extracted_pe?.length || 0), 0) || 0,
      suspiciousRegions: parsedData?.sections?.memory?.procmemory?.reduce((acc: number, proc: any) => 
        acc + (proc.address_space_summary?.suspicious_regions?.length || 0), 0) || 0,
      capePayloads: parsedData?.sections?.cape?.payloads?.length || 0,
      mutexes: parsedData?.sections?.behavior?.data?.summary?.mutexes?.length || 0
    }

    const aiStats = {
      sectionsAnalyzed: aiData?.sections_analyzed?.length || 0,
      modelUsed: aiData?.model_used || aiData?.model_usage ? Object.keys(aiData.model_usage)[0] : "Unknown",
      duration: aiData?.duration_seconds || 0,
      hasThreatIntel: aiData?.results?.threat_intelligence !== undefined,
      finalThreatLevel: aiData?.results?.final_synthesis?.analysis?.overall_threat_level || "Unknown"
    }

    return { capeStats, parsedStats, aiStats }
  }, [capeData, parsedData, aiData])

  // Calculate threat level
  const threatLevel = useMemo(() => {
    if (malscore >= 8) return { level: "Critical", color: "destructive", icon: <AlertTriangle className="w-5 h-5" /> }
    if (malscore >= 6) return { level: "High", color: "orange", icon: <AlertCircle className="w-5 h-5" /> }
    if (malscore >= 4) return { level: "Medium", color: "accent", icon: <AlertCircle className="w-5 h-5" /> }
    if (malscore >= 2) return { level: "Low", color: "primary", icon: <CheckCircle className="w-5 h-5" /> }
    return { level: "Very Low", color: "green", icon: <CheckCircle className="w-5 h-5" /> }
  }, [malscore])

  // Extract key AI insights
  const aiInsights = useMemo(() => {
    const insights = []
    
    if (aiData?.results?.final_synthesis?.analysis?.report) {
      insights.push({
        title: "AI Conclusion",
        description: aiData.results.final_synthesis.analysis.report.executive_summary || "AI analysis complete",
        icon: <Brain className="w-4 h-4" />,
        threatLevel: aiData.results.final_synthesis.analysis.overall_threat_level,
        confidence: aiData.results.final_synthesis.analysis.threat_confidence_score
      })
    }
    
    if (aiData?.results?.behavior_analysis?.analysis?.ai_insights_summary) {
      insights.push({
        title: "Behavior Analysis",
        description: aiData.results.behavior_analysis.analysis.ai_insights_summary.key_observations?.[0] || "Behavior insights available",
        icon: <Activity className="w-4 h-4" />
      })
    }
    
    if (aiData?.results?.signatures_analysis?.analysis?.signature_observations) {
      const highSevCount = aiData.results.signatures_analysis.analysis.signature_observations
        .filter((sig: any) => sig.severity >= 3).length
      insights.push({
        title: "Threat Detection",
        description: `${highSevCount} high severity signatures detected`,
        icon: <Shield className="w-4 h-4" />
      })
    }
    
    if (aiData?.results?.memory_analysis?.analysis?.process_memory_analysis) {
      const suspiciousProcesses = aiData.results.memory_analysis.analysis.process_memory_analysis
        .filter((proc: any) => proc.memory_forensic_indicators.process_risk_profile === "High Risk").length
      insights.push({
        title: "Memory Forensics",
        description: `${suspiciousProcesses} suspicious memory processes detected`,
        icon: <HardDrive className="w-4 h-4" />
      })
    }
    
    return insights
  }, [aiData])

  // Extract top signatures with enhanced data
  const topSignatures = useMemo(() => {
    const signatures = []
    
    // From CAPE data
    if (capeData?.signatures) {
      signatures.push(...capeData.signatures.slice(0, 5).map((sig: any) => ({
        name: sig.name,
        severity: sig.severity,
        confidence: sig.confidence || 0,
        description: sig.description,
        categories: sig.categories || [],
        families: sig.families || [],
        source: "CAPE",
        weight: sig.weight || 0
      })))
    }
    
    // From parsed data
    if (parsedData?.sections?.signatures?.signatures) {
      signatures.push(...parsedData.sections.signatures.signatures.slice(0, 5).map((sig: any) => ({
        name: sig.name,
        severity: sig.severity,
        confidence: sig.confidence || 0,
        description: sig.description,
        categories: sig.categories || [],
        families: sig.families || [],
        source: "Parsed",
        weight: sig.weight || 0
      })))
    }
    
    // From AI analysis
    if (aiData?.results?.signatures_analysis?.analysis?.signature_observations) {
      signatures.push(...aiData.results.signatures_analysis.analysis.signature_observations.slice(0, 3).map((sig: any) => ({
        name: sig.signature_name,
        severity: sig.severity,
        confidence: sig.confidence,
        description: sig.description,
        categories: sig.categories || [],
        families: [],
        source: "AI Analysis",
        weight: 0
      })))
    }
    
    // Sort by severity and confidence
    return signatures
      .sort((a, b) => (b.severity * 100 + b.confidence) - (a.severity * 100 + a.confidence))
      .slice(0, 6)
  }, [capeData, parsedData, aiData])

  // Extract MITRE ATT&CK techniques
  const mitreTechniques = useMemo(() => {
    const techniques = []
    
    if (capeData?.ttps) {
      techniques.push(...capeData.ttps.map((ttp: any) => ({
        signature: ttp.signature,
        techniques: ttp.ttps,
        description: ttp.description || ttp.signature,
        source: "CAPE"
      })))
    }
    
    if (parsedData?.sections?.signatures?.ttps) {
      techniques.push(...parsedData.sections.signatures.ttps.map((ttp: any) => ({
        signature: ttp.signature,
        techniques: ttp.ttps,
        description: ttp.description || ttp.signature,
        source: "Parsed"
      })))
    }
    
    return techniques.slice(0, 8)
  }, [capeData, parsedData])

  // Extract process information with enhanced data
  const processInfo = useMemo(() => {
    const processes: any[] = []
    
    // From CAPE data
    if (capeData?.behavior?.processes) {
      capeData.behavior.processes.forEach((proc: any) => {
        processes.push({
          name: proc.process_name,
          pid: proc.process_id,
          calls: proc.calls?.length || 0,
          firstSeen: proc.first_seen,
          source: "CAPE",
          threads: proc.threads?.length || 0,
          bitness: proc.bitness,
          environ: proc.environ
        })
      })
    }
    
    // From parsed data
    if (parsedData?.sections?.behavior?.data?.processes) {
      parsedData.sections.behavior.data.processes.forEach((proc: any) => {
        processes.push({
          name: proc.process_name,
          pid: proc.process_id,
          calls: proc.calls?.length || 0,
          firstSeen: proc.first_seen,
          source: "Parsed",
          threads: proc.threads?.length || 0,
          environ: proc.environ
        })
      })
    }
    
    return processes
      .sort((a, b) => b.calls - a.calls)
      .slice(0, 6)
  }, [capeData, parsedData])

  // Extract file operations
  const fileOperations = useMemo(() => {
    const operations: { written: string[]; deleted: string[]; dropped: string[]; read: string[] } = {
      written: [],
      deleted: [],
      dropped: [],
      read: []
    }
    
    // From CAPE data
    if (capeData?.behavior?.summary) {
      operations.written.push(...(capeData.behavior.summary.write_files || []).slice(0, 5))
      operations.deleted.push(...(capeData.behavior.summary.delete_files || []).slice(0, 5))
    }
    
    if (capeData?.dropped) {
      operations.dropped.push(...capeData.dropped.slice(0, 5).map((f: any) => f.name?.[0] || "Unknown"))
    }
    
    // From parsed data
    if (parsedData?.sections?.behavior?.data?.summary) {
      operations.written.push(...(parsedData.sections.behavior.data.summary.write_files || []).slice(0, 5))
      operations.deleted.push(...(parsedData.sections.behavior.data.summary.delete_files || []).slice(0, 5))
      operations.read.push(...(parsedData.sections.behavior.data.summary.read_files || []).slice(0, 5))
    }
    
    return operations
  }, [capeData, parsedData])

  // Calculate analysis completion status
  const analysisStatus = useMemo(() => {
    const components = [
      { name: "CAPE Analysis", available: !!capeData, icon: capeData ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" /> },
      { name: "Parsed Analysis", available: !!parsedData, icon: parsedData ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" /> },
      { name: "AI Analysis", available: !!aiData, icon: aiData ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" /> }
    ]
    
    const availableCount = components.filter(c => c.available).length
    const totalCount = components.length
    
    return {
      components,
      completionPercentage: Math.round((availableCount / totalCount) * 100),
      status: availableCount === totalCount ? "Complete" : availableCount > 0 ? "Partial" : "None"
    }
  }, [capeData, parsedData, aiData])

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-foreground">Analysis Overview</h1>
          <p className="text-sm text-muted-foreground">
            Comprehensive threat intelligence and behavioral analysis summary
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setViewMode(viewMode === "overview" ? "detailed" : "overview")}
            className="px-3 py-1.5 border border-border rounded-lg hover:bg-muted/20 transition-colors flex items-center gap-2 text-sm"
          >
            {viewMode === "overview" ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            {viewMode === "overview" ? "Detailed View" : "Overview"}
          </button>
          
          {onCopyJson && (
            <button
              onClick={onCopyJson}
              className="px-3 py-1.5 border border-border rounded-lg hover:bg-muted/20 transition-colors flex items-center gap-2 text-sm"
            >
              <Copy className="w-3 h-3" />
              {copied ? "Copied!" : "Copy JSON"}
            </button>
          )}
          
          {onDownload && (
            <button
              onClick={() => onDownload?.("json")}
              className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm"
            >
              <Download className="w-3 h-3" />
              Export
            </button>
          )}
        </div>
      </div>

      {/* Threat Assessment Banner - Enhanced */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`glass border rounded-xl p-6 ${
          threatLevel.color === "destructive" 
            ? "border-destructive/50 bg-destructive/5" 
            : threatLevel.color === "orange"
            ? "border-orange-500/50 bg-orange-500/5"
            : threatLevel.color === "accent"
            ? "border-accent/50 bg-accent/5"
            : "border-primary/50 bg-primary/5"
        }`}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-28 h-28 rounded-full border-4 border-current flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-full border-4 border-current/20 animate-ping" />
                <span className={`text-3xl font-bold ${
                  threatLevel.color === "destructive" ? "text-destructive" :
                  threatLevel.color === "orange" ? "text-orange-500" :
                  threatLevel.color === "accent" ? "text-accent" : "text-primary"
                }`}>
                  {malscore.toFixed(1)}
                </span>
              </div>
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-background px-4 py-1.5 rounded-full border border-border shadow-lg">
                <div className="flex items-center gap-2">
                  {threatLevel.icon}
                  <span className="text-sm font-semibold">{threatLevel.level} Risk</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Threat Assessment</h2>
                <p className="text-muted-foreground">
                  {combinedAnalysis.filename} • {formatDistanceToNow(new Date(combinedAnalysis.created_at), { addSuffix: true })}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="px-3 py-1 bg-muted/20 rounded-lg text-sm">
                  Status: {combinedAnalysis.status}
                </div>
                {combinedAnalysis.analysis_type && (
                  <div className="px-3 py-1 bg-primary/20 text-primary rounded-lg text-sm">
                    Type: {combinedAnalysis.analysis_type}
                  </div>
                )}
                <div className="px-3 py-1 bg-green-500/20 text-green-500 rounded-lg text-sm">
                  Analysis: {analysisStatus.status}
                </div>
              </div>
              <ProgressBar 
                value={malscore} 
                max={10} 
                color={threatLevel.color} 
                label="Threat Score" 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{stats.capeStats.processes}</div>
              <div className="text-xs text-muted-foreground">Processes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{stats.capeStats.signatures}</div>
              <div className="text-xs text-muted-foreground">Signatures</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{stats.capeStats.droppedFiles}</div>
              <div className="text-xs text-muted-foreground">Files Dropped</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Analysis Components */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Stats Grid - Enhanced */}
          <SectionCard title="Analysis Metrics" icon={<BarChart3 className="w-5 h-5" />}>
            <DataGrid columns={3}>
              <StatCard 
                icon={<Cpu className="w-5 h-5" />}
                label="Processes"
                value={stats.capeStats.processes}
                color="blue"
                description="Total spawned"
              />
              <StatCard 
                icon={<AlertTriangle className="w-5 h-5" />}
                label="Signatures"
                value={stats.capeStats.signatures}
                color="red"
                description="Detections"
              />
              <StatCard 
                icon={<Folder className="w-5 h-5" />}
                label="Files Dropped"
                value={stats.capeStats.droppedFiles}
                color="green"
                description="Files written"
              />
              <StatCard 
                icon={<HardDrive className="w-5 h-5" />}
                label="Memory Dumps"
                value={stats.capeStats.memoryDumps}
                color="orange"
                description="Captures"
              />
              <StatCard 
                icon={<Key className="w-5 h-5" />}
                label="Registry Keys"
                value={stats.capeStats.registryKeys}
                color="purple"
                description="Accessed"
              />
              <StatCard 
                icon={<Network className="w-5 h-5" />}
                label="Network Connections"
                value={stats.capeStats.networkConnections}
                color="cyan"
                description="Established"
              />
            </DataGrid>
          </SectionCard>

          {/* Top Signatures - Enhanced */}
          {topSignatures.length > 0 && (
            <SectionCard title="Top Threat Detections" icon={<ShieldAlert className="w-5 h-5" />} collapsible>
              <div className="space-y-3">
                {topSignatures.map((sig, idx) => (
                  <div key={idx} className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-2 h-2 rounded-full ${
                            sig.severity >= 3 ? 'bg-red-500' : 
                            sig.severity >= 2 ? 'bg-yellow-500' : 'bg-green-500'
                          }`} />
                          <h4 className="font-semibold text-foreground truncate">{sig.name}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{sig.description}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 ml-4">
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          sig.severity >= 3 
                            ? "bg-red-500/20 text-red-500" 
                            : sig.severity >= 2
                            ? "bg-yellow-500/20 text-yellow-500"
                            : "bg-green-500/20 text-green-500"
                        }`}>
                          Severity {sig.severity}
                        </div>
                        <div className="px-2 py-1 rounded text-xs font-medium bg-blue-500/20 text-blue-500">
                          {sig.confidence}% confidence
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <div className="flex flex-wrap gap-1">
                        {sig.categories?.map((cat: string, catIdx: number) => (
                          <span key={catIdx} className="px-2 py-0.5 bg-muted/20 rounded">
                            {cat}
                          </span>
                        ))}
                      </div>
                      <span className="text-muted-foreground ml-auto">{sig.source}</span>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Process Activity - Enhanced */}
          {processInfo.length > 0 && (
            <SectionCard title="Process Activity" icon={<Activity className="w-5 h-5" />} collapsible>
              <div className="space-y-3">
                {processInfo.map((proc, idx) => (
                  <div key={idx} className="border border-border rounded-lg p-4 hover:bg-muted/5 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                          <Cpu className="w-4 h-4 text-blue-500" />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{proc.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-0.5 bg-muted/20 rounded">PID: {proc.pid}</span>
                            <span className="text-xs px-2 py-0.5 bg-muted/20 rounded">{proc.calls} API calls</span>
                            <span className="text-xs px-2 py-0.5 bg-muted/20 rounded">{proc.threads} threads</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {proc.bitness && (
                          <span className="text-xs px-2 py-0.5 bg-muted/20 rounded">{proc.bitness}</span>
                        )}
                        <span className="text-xs text-muted-foreground">{proc.source}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </div>

        {/* Right Column - AI Insights & Summary */}
        <div className="space-y-6">
          {/* AI Insights - Enhanced */}
          {aiInsights.length > 0 && (
            <SectionCard title="AI Insights" icon={<Brain className="w-5 h-5" />}>
              <div className="space-y-4">
                {aiInsights.map((insight, idx) => (
                  <div key={idx} className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {insight.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-foreground">{insight.title}</h4>
                          {insight.threatLevel && (
                            <ThreatLevelBadge level={insight.threatLevel} score={insight.confidence || 0} />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{insight.description}</p>
                      </div>
                    </div>
                    {insight.confidence && (
                      <ProgressBar 
                        value={insight.confidence} 
                        max={100} 
                        color="blue" 
                        label="AI Confidence" 
                      />
                    )}
                  </div>
                ))}
                
                {/* AI Analysis Stats */}
                <div className="border-t border-border pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Model Used</p>
                      <p className="text-sm font-medium mt-1">{stats.aiStats.modelUsed}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Duration</p>
                      <p className="text-sm font-medium mt-1">{stats.aiStats.duration.toFixed(1)}s</p>
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>
          )}

          {/* Analysis Components Status */}
          <SectionCard title="Analysis Components" icon={<Layers className="w-5 h-5" />}>
            <div className="space-y-4">
              {analysisStatus.components.map((component, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {component.icon}
                    <span className="text-sm">{component.name}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    component.available 
                      ? "bg-green-500/20 text-green-500" 
                      : "bg-red-500/20 text-red-500"
                  }`}>
                    {component.available ? "Available" : "Not Available"}
                  </span>
                </div>
              ))}
              
              <div className="pt-3 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Completion</span>
                  <span className="text-sm font-medium">{analysisStatus.completionPercentage}%</span>
                </div>
                <ProgressBar 
                  value={analysisStatus.completionPercentage} 
                  max={100} 
                  color={analysisStatus.completionPercentage === 100 ? "green" : "blue"} 
                />
              </div>
            </div>
          </SectionCard>

          {/* MITRE ATT&CK Overview */}
          {mitreTechniques.length > 0 && (
            <SectionCard title="MITRE ATT&CK" icon={<FileCode className="w-5 h-5" />} collapsible>
              <div className="space-y-3">
                {mitreTechniques.map((tech, idx) => (
                  <div key={idx} className="p-3 border border-border rounded-lg hover:bg-muted/5">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h5 className="text-sm font-medium text-foreground">{tech.signature}</h5>
                        <p className="text-xs text-muted-foreground line-clamp-2">{tech.description}</p>
                      </div>
                      <span className="text-xs text-muted-foreground ml-2">{tech.source}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {tech.techniques?.slice(0, 3).map((t: string, tIdx: number) => (
                        <span key={tIdx} className="px-2 py-0.5 bg-purple-500/10 text-purple-500 rounded text-xs">
                          {t}
                        </span>
                      ))}
                      {tech.techniques?.length > 3 && (
                        <span className="px-2 py-0.5 bg-muted/20 text-muted-foreground rounded text-xs">
                          +{tech.techniques.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </div>
      </div>

      {/* File Information - Enhanced */}
      {fileHashes && (
        <SectionCard title="File Information" icon={<File className="w-5 h-5" />} collapsible defaultExpanded={false}>
          <div className="space-y-6">
            <DataGrid columns={4}>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Filename</p>
                <p className="text-foreground text-sm truncate">{fileHashes.filename}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">File Size</p>
                <p className="text-foreground text-sm">{fileHashes.file_size ? (fileHashes.file_size / 1024 / 1024).toFixed(2) + " MB" : "Unknown"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">File Type</p>
                <p className="text-foreground text-sm">{fileHashes.file_type}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">MD5</p>
                <code className="text-primary font-mono text-xs truncate block">{fileHashes.md5}</code>
              </div>
            </DataGrid>
            
            {expandedSections.fileInfo && (
              <>
                <DataGrid columns={3}>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">SHA1</p>
                    <code className="text-primary font-mono text-xs truncate block">{fileHashes.sha1}</code>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">SHA256</p>
                    <code className="text-primary font-mono text-xs truncate block">{fileHashes.sha256}</code>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">SHA512</p>
                    <code className="text-primary font-mono text-xs truncate block">{fileHashes.sha512}</code>
                  </div>
                </DataGrid>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">SSDEEP</p>
                  <code className="text-primary font-mono text-xs truncate block">{fileHashes.ssdeep}</code>
                </div>
              </>
            )}
            
            <div className="flex justify-center pt-4 border-t border-border">
              <button
                onClick={() => toggleSection("fileInfo")}
                className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-muted/20 transition-colors flex items-center gap-2"
              >
                {expandedSections.fileInfo ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Show All Hashes
                  </>
                )}
              </button>
            </div>
          </div>
        </SectionCard>
      )}

      {/* System Activities Summary */}
      {(stats.capeStats.registryKeys > 0 || stats.capeStats.apiCalls > 0) && (
        <SectionCard title="System Activities" icon={<Terminal className="w-5 h-5" />}>
          <DataGrid columns={4}>
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="text-2xl font-bold text-foreground">{stats.capeStats.registryKeys}</div>
              <div className="text-xs text-muted-foreground">Registry Keys</div>
            </div>
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="text-2xl font-bold text-foreground">{stats.capeStats.apiCalls}</div>
              <div className="text-xs text-muted-foreground">API Calls</div>
            </div>
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="text-2xl font-bold text-foreground">{stats.parsedStats.extractedPEs}</div>
              <div className="text-xs text-muted-foreground">Extracted PEs</div>
            </div>
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="text-2xl font-bold text-foreground">{stats.parsedStats.suspiciousRegions}</div>
              <div className="text-xs text-muted-foreground">Suspicious Regions</div>
            </div>
          </DataGrid>
        </SectionCard>
      )}

      {/* File Operations Summary */}
      {(fileOperations.written.length > 0 || fileOperations.deleted.length > 0 || fileOperations.dropped.length > 0) && (
        <SectionCard title="File Operations" icon={<Folder className="w-5 h-5" />} collapsible>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Files Written */}
            {fileOperations.written.length > 0 && (
              <div>
                <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  Files Written ({fileOperations.written.length})
                </h4>
                <div className="space-y-2">
                  {fileOperations.written.slice(0, 3).map((file, idx) => (
                    <div key={idx} className="text-sm text-muted-foreground truncate p-2 border border-border rounded bg-muted/5">
                      {file}
                    </div>
                  ))}
                  {fileOperations.written.length > 3 && (
                    <div className="text-xs text-muted-foreground italic">
                      + {fileOperations.written.length - 3} more files
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Files Deleted */}
            {fileOperations.deleted.length > 0 && (
              <div>
                <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  Files Deleted ({fileOperations.deleted.length})
                </h4>
                <div className="space-y-2">
                  {fileOperations.deleted.slice(0, 3).map((file, idx) => (
                    <div key={idx} className="text-sm text-muted-foreground truncate p-2 border border-border rounded bg-muted/5">
                      {file}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Files Dropped */}
            {fileOperations.dropped.length > 0 && (
              <div>
                <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                  Files Dropped ({fileOperations.dropped.length})
                </h4>
                <div className="space-y-2">
                  {fileOperations.dropped.slice(0, 3).map((file, idx) => (
                    <div key={idx} className="text-sm text-muted-foreground truncate p-2 border border-border rounded bg-muted/5">
                      {file}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </SectionCard>
      )}
    </div>
  )
}