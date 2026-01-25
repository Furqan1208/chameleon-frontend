// D:\FYP\Chameleon Frontend\components\analysis\OverviewDashboard.tsx
"use client"

import { useState, useMemo } from "react"
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
  LineChart
} from "lucide-react"
import { motion } from "framer-motion"
import { formatDistanceToNow } from "date-fns"

interface OverviewDashboardProps {
  combinedAnalysis: any
  fileHashes: any
  malscore: number
  capeData: any
  parsedData: any
  aiData: any
}

export default function OverviewDashboard({ 
  combinedAnalysis,
  fileHashes,
  malscore,
  capeData,
  parsedData,
  aiData
}: OverviewDashboardProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})

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
      memoryDumps: capeData?.procmemory?.length || 0
    }

    const parsedStats = {
      totalStrings: parsedData?.sections?.strings?.metadata?.total_strings_processed || 0,
      whitelistedStrings: parsedData?.sections?.strings?.metadata?.whitelisted_strings || 0,
      stringCategories: parsedData?.sections?.strings?.metadata?.whitelist_categories_used?.length || 0,
      extractedPEs: parsedData?.sections?.memory?.procmemory?.reduce((acc: number, proc: any) => 
        acc + (proc.extracted_pe?.length || 0), 0) || 0,
      suspiciousRegions: parsedData?.sections?.memory?.procmemory?.reduce((acc: number, proc: any) => 
        acc + (proc.address_space_summary?.suspicious_regions?.length || 0), 0) || 0,
      capePayloads: parsedData?.sections?.cape?.payloads?.length || 0
    }

    const aiStats = {
      sectionsAnalyzed: aiData?.sections_analyzed?.length || 0,
      modelUsed: aiData?.model_used || "Unknown",
      duration: aiData?.duration_seconds || 0,
      hasThreatIntel: aiData?.results?.threat_intelligence !== undefined
    }

    return { capeStats, parsedStats, aiStats }
  }, [capeData, parsedData, aiData])

  // Calculate threat level
  const threatLevel = useMemo(() => {
    if (malscore >= 7) return { level: "High", color: "destructive", icon: <AlertTriangle className="w-4 h-4" /> }
    if (malscore >= 4) return { level: "Medium", color: "accent", icon: <AlertCircle className="w-4 h-4" /> }
    return { level: "Low", color: "primary", icon: <CheckCircle className="w-4 h-4" /> }
  }, [malscore])

  // Extract key indicators from AI analysis
  const aiInsights = useMemo(() => {
    if (!aiData?.results) return null
    
    const insights = []
    
    // Check for threat intelligence
    if (aiData.results.threat_intelligence) {
      insights.push({
        title: "Threat Intelligence",
        description: aiData.results.threat_intelligence.summary || "Threat intel available",
        icon: <Shield className="w-4 h-4" />
      })
    }
    
    // Check for behavior analysis
    if (aiData.results.behavior_analysis) {
      insights.push({
        title: "Behavior Analysis",
        description: aiData.results.behavior_analysis.summary || "Behavior insights available",
        icon: <Activity className="w-4 h-4" />
      })
    }
    
    // Check for final synthesis
    if (aiData.results.final_synthesis) {
      insights.push({
        title: "AI Conclusion",
        description: aiData.results.final_synthesis.conclusion || "AI analysis complete",
        icon: <Brain className="w-4 h-4" />
      })
    }
    
    return insights
  }, [aiData])

  // Extract top signatures
  const topSignatures = useMemo(() => {
    const signatures = []
    
    // From CAPE data
    if (capeData?.signatures) {
      signatures.push(...capeData.signatures.slice(0, 3).map((sig: any) => ({
        name: sig.name,
        severity: sig.severity,
        description: sig.description,
        source: "CAPE"
      })))
    }
    
    // From parsed data
    if (parsedData?.sections?.signatures?.signatures) {
      signatures.push(...parsedData.sections.signatures.signatures.slice(0, 3).map((sig: any) => ({
        name: sig.name,
        severity: sig.severity,
        description: sig.description,
        source: "Parsed"
      })))
    }
    
    // Sort by severity
    return signatures.sort((a, b) => b.severity - a.severity).slice(0, 5)
  }, [capeData, parsedData])

  // Extract process information
  const processInfo = useMemo(() => {
    const processes: { name: any; pid: any; calls: any; firstSeen: any; source: string }[] = []
    
    // From CAPE data
    if (capeData?.behavior?.processes) {
      capeData.behavior.processes.forEach((proc: any) => {
        processes.push({
          name: proc.process_name,
          pid: proc.process_id,
          calls: proc.calls?.length || 0,
          firstSeen: proc.first_seen,
          source: "CAPE"
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
          source: "Parsed"
        })
      })
    }
    
    return processes.slice(0, 5)
  }, [capeData, parsedData])

  // Extract file operations
  const fileOperations = useMemo(() => {
    const operations: { written: any[]; deleted: any[]; dropped: any[] } = {
      written: [],
      deleted: [],
      dropped: []
    }
    
    // From CAPE data
    if (capeData?.behavior?.summary?.write_files) {
      operations.written.push(...capeData.behavior.summary.write_files.slice(0, 3))
    }
    if (capeData?.behavior?.summary?.delete_files) {
      operations.deleted.push(...capeData.behavior.summary.delete_files.slice(0, 3))
    }
    if (capeData?.dropped) {
      operations.dropped.push(...capeData.dropped.slice(0, 3).map((f: any) => f.name?.[0] || "Unknown"))
    }
    
    // From parsed data
    if (parsedData?.sections?.behavior?.data?.summary?.write_files) {
      operations.written.push(...parsedData.sections.behavior.data.summary.write_files.slice(0, 3))
    }
    if (parsedData?.sections?.behavior?.data?.summary?.delete_files) {
      operations.deleted.push(...parsedData.sections.behavior.data.summary.delete_files.slice(0, 3))
    }
    
    return operations
  }, [capeData, parsedData])

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  return (
    <div className="space-y-6">
      {/* Threat Assessment Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`glass border rounded-xl p-6 ${
          threatLevel.color === "destructive" 
            ? "border-destructive/50 bg-destructive/5" 
            : threatLevel.color === "accent"
            ? "border-accent/50 bg-accent/5"
            : "border-primary/50 bg-primary/5"
        }`}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-current flex items-center justify-center">
                <span className={`text-3xl font-bold ${
                  threatLevel.color === "destructive" ? "text-destructive" :
                  threatLevel.color === "accent" ? "text-accent" : "text-primary"
                }`}>
                  {malscore.toFixed(1)}
                </span>
              </div>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-background px-3 py-1 rounded-full border border-border">
                <div className="flex items-center gap-2">
                  {threatLevel.icon}
                  <span className="text-sm font-medium">{threatLevel.level} Risk</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Threat Assessment</h2>
              <p className="text-muted-foreground">
                {combinedAnalysis.filename} • {formatDistanceToNow(new Date(combinedAnalysis.created_at), { addSuffix: true })}
              </p>
              <div className="flex flex-wrap gap-2">
                <div className="px-3 py-1 bg-muted/20 rounded-lg text-sm">
                  Status: {combinedAnalysis.status}
                </div>
                {combinedAnalysis.analysis_type && (
                  <div className="px-3 py-1 bg-primary/20 text-primary rounded-lg text-sm">
                    Type: {combinedAnalysis.analysis_type}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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

      {/* File Information Grid */}
      {fileHashes && (
        <div className="glass border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <File className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">File Information</h3>
                <p className="text-sm text-muted-foreground">Analysis target details</p>
              </div>
            </div>
            <button
              onClick={() => toggleSection("fileInfo")}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              {expandedSections.fileInfo ? (
                <Zap className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Zap className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
            {expandedSections.fileInfo && (
              <>
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
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">SSDEEP</p>
                  <code className="text-primary font-mono text-xs truncate block">{fileHashes.ssdeep}</code>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <StatCard 
          icon={<Cpu className="w-5 h-5" />}
          label="Processes"
          value={stats.capeStats.processes}
          color="blue"
          description="Total processes spawned"
        />
        <StatCard 
          icon={<AlertTriangle className="w-5 h-5" />}
          label="Signatures"
          value={stats.capeStats.signatures}
          color="red"
          description="Detection signatures"
        />
        <StatCard 
          icon={<Folder className="w-5 h-5" />}
          label="Files Dropped"
          value={stats.capeStats.droppedFiles}
          color="green"
          description="Files written to disk"
        />
        <StatCard 
          icon={<Type className="w-5 h-5" />}
          label="Strings"
          value={stats.parsedStats.totalStrings.toLocaleString()}
          color="purple"
          description="Strings extracted"
        />
        <StatCard 
          icon={<HardDrive className="w-5 h-5" />}
          label="Memory Dumps"
          value={stats.capeStats.memoryDumps}
          color="orange"
          description="Process memory captures"
        />
        <StatCard 
          icon={<FileCode className="w-5 h-5" />}
          label="MITRE TTPs"
          value={stats.capeStats.ttpCount}
          color="pink"
          description="Attack techniques"
        />
      </div>

      {/* AI Insights Section */}
      {aiInsights && aiInsights.length > 0 && (
        <div className="glass border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">AI Insights</h3>
              <p className="text-sm text-muted-foreground">AI-powered analysis highlights</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {aiInsights.map((insight, idx) => (
              <div key={idx} className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {insight.icon}
                  </div>
                  <h4 className="font-medium text-foreground">{insight.title}</h4>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{insight.description}</p>
              </div>
            ))}
            
            <div className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-green-500" />
                </div>
                <h4 className="font-medium text-foreground">Analysis Stats</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sections:</span>
                  <span className="text-foreground font-medium">{stats.aiStats.sectionsAnalyzed}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Model:</span>
                  <span className="text-foreground font-medium">{stats.aiStats.modelUsed}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="text-foreground font-medium">{stats.aiStats.duration.toFixed(1)}s</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Signatures & Processes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Signatures */}
        {topSignatures.length > 0 && (
          <div className="glass border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Top Detections</h3>
                <p className="text-sm text-muted-foreground">Most significant signatures</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {topSignatures.map((sig, idx) => (
                <div key={idx} className="border border-border rounded-lg p-3 hover:bg-muted/10 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">{sig.name}</h4>
                      <p className="text-sm text-muted-foreground truncate mt-1">{sig.description}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        sig.severity >= 3 
                          ? "bg-destructive/20 text-destructive" 
                          : sig.severity >= 2
                          ? "bg-accent/20 text-accent"
                          : "bg-primary/20 text-primary"
                      }`}>
                        Severity {sig.severity}
                      </div>
                      <span className="text-xs text-muted-foreground">{sig.source}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Process Activity */}
        {processInfo.length > 0 && (
          <div className="glass border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Activity className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Process Activity</h3>
                <p className="text-sm text-muted-foreground">Key processes observed</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {processInfo.map((proc, idx) => (
                <div key={idx} className="border border-border rounded-lg p-3 hover:bg-muted/10 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Cpu className="w-4 h-4 text-blue-500" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{proc.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 bg-muted/20 rounded">PID: {proc.pid}</span>
                          <span className="text-xs px-2 py-0.5 bg-muted/20 rounded">{proc.calls} calls</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{proc.source}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* File Operations */}
      {(fileOperations.written.length > 0 || fileOperations.deleted.length > 0 || fileOperations.dropped.length > 0) && (
        <div className="glass border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Folder className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">File Operations</h3>
              <p className="text-sm text-muted-foreground">Key file system activities</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Files Written */}
            {fileOperations.written.length > 0 && (
              <div>
                <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  Files Written ({fileOperations.written.length})
                </h4>
                <div className="space-y-2">
                  {fileOperations.written.map((file, idx) => (
                    <div key={idx} className="text-sm text-muted-foreground truncate p-2 border border-border rounded">
                      {file}
                    </div>
                  ))}
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
                  {fileOperations.deleted.map((file, idx) => (
                    <div key={idx} className="text-sm text-muted-foreground truncate p-2 border border-border rounded">
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
                  {fileOperations.dropped.map((file, idx) => (
                    <div key={idx} className="text-sm text-muted-foreground truncate p-2 border border-border rounded">
                      {file}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Registry & System Activities */}
      {stats.capeStats.registryKeys > 0 && (
        <div className="glass border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Key className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">System Activities</h3>
              <p className="text-sm text-muted-foreground">Registry and system interactions</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          </div>
        </div>
      )}

      {/* Analysis Summary */}
      <div className="glass border border-border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gray-500/10 rounded-lg">
            <Layers className="w-5 h-5 text-gray-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Analysis Summary</h3>
            <p className="text-sm text-muted-foreground">Complete analysis overview</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Analysis Components</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">CAPE Analysis</span>
                <div className="flex items-center gap-2">
                  {capeData ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-sm">{capeData ? "Available" : "Not Available"}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Parsed Analysis</span>
                <div className="flex items-center gap-2">
                  {parsedData ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-sm">{parsedData ? "Available" : "Not Available"}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">AI Analysis</span>
                <div className="flex items-center gap-2">
                  {aiData ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-sm">{aiData ? "Available" : "Not Available"}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Key Metrics</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Threat Score</span>
                <span className="text-sm font-medium text-foreground">{malscore.toFixed(1)}/10</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Processes</span>
                <span className="text-sm font-medium text-foreground">{stats.capeStats.processes}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Signatures</span>
                <span className="text-sm font-medium text-foreground">{stats.capeStats.signatures}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Memory Analysis</span>
                <span className="text-sm font-medium text-foreground">{stats.capeStats.memoryDumps} dumps</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color = "primary", description }: any) {
  const colorClasses = {
    blue: "border-blue-500/20 bg-blue-500/5 text-blue-500",
    red: "border-red-500/20 bg-red-500/5 text-red-500",
    green: "border-green-500/20 bg-green-500/5 text-green-500",
    purple: "border-purple-500/20 bg-purple-500/5 text-purple-500",
    orange: "border-orange-500/20 bg-orange-500/5 text-orange-500",
    pink: "border-pink-500/20 bg-pink-500/5 text-pink-500",
    primary: "border-primary/20 bg-primary/5 text-primary"
  }

  return (
    <div className={`glass border rounded-xl p-4 hover:scale-[1.02] transition-transform ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="p-2 rounded-lg bg-current/10">
          {icon}
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </div>
      {description && (
        <p className="text-xs text-muted-foreground mt-2">{description}</p>
      )}
    </div>
  )
}