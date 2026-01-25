// D:\FYP\Chameleon Frontend\components\analysis\CapeAnalysisDashboard.tsx
"use client"

import { useState, useMemo, useEffect } from "react"
import {
  FileJson,
  Shield,
  AlertTriangle,
  File,
  Activity,
  Globe,
  HardDrive,
  BarChart3,
  FileCode,
  Type,
  FileText,
  Code,
  Copy,
  Download,
  Eye,
  EyeOff,
  ChevronRight,
  Cpu,
  Network,
  Clock,
  Users,
  Folder,
  Key,
  Terminal,
  Search,
  Filter,
  ExternalLink,
  BarChart,
  LineChart,
  PieChart,
  Layers,
  Hash,
  Server,
  Database
} from "lucide-react"
import { motion } from "framer-motion"
import CustomJSONViewer from "./CustomJSONViewer"
import { formatDistanceToNow } from "date-fns"

interface CapeAnalysisDashboardProps {
  capeData: any
  loading: boolean
  onCopyJson: () => void
  copied: boolean
  onDownload?: (format: string) => void
}

export default function CapeAnalysisDashboard({ 
  capeData, 
  loading, 
  onCopyJson, 
  copied,
  onDownload
}: CapeAnalysisDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>("overview")
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"structured" | "raw">("structured")

  // Calculate statistics
  const stats = useMemo(() => {
    if (!capeData) return {}

    return {
      processes: capeData.behavior?.processes?.length || 0,
      signatures: capeData.signatures?.length || 0,
      droppedFiles: capeData.dropped?.length || 0,
      ttpCount: capeData.ttps?.length || 0,
      networkConnections: Object.keys(capeData.network || {}).length || 0,
      registryKeys: capeData.behavior?.summary?.keys?.length || 0,
      apiCalls: capeData.behavior?.processes?.reduce((acc: number, proc: any) => 
        acc + (proc.calls?.length || 0), 0) || 0,
      memoryDumps: capeData.procmemory?.length || 0
    }
  }, [capeData])

  // Extract file information
  const fileInfo = useMemo(() => {
    if (!capeData?.target?.file) return null
    
    return {
      name: capeData.target.file.name,
      size: (capeData.target.file.size / 1024 / 1024).toFixed(2) + " MB",
      type: capeData.target.file.type,
      md5: capeData.target.file.md5,
      sha256: capeData.target.file.sha256,
      imphash: capeData.target.file.pe?.imphash,
      timestamp: capeData.target.file.pe?.timestamp,
      icon: capeData.target.file.icon
    }
  }, [capeData])

  // Extract behavioral summary
  const behaviorSummary = useMemo(() => {
    if (!capeData?.behavior?.summary) return null
    
    const summary = capeData.behavior.summary
    return {
      filesWritten: summary.write_files?.length || 0,
      filesDeleted: summary.delete_files?.length || 0,
      registryKeys: summary.keys?.length || 0,
      mutexes: summary.mutexes?.length || 0,
      commands: summary.executed_commands?.length || 0,
      services: summary.started_services?.length || 0
    }
  }, [capeData])

  // Extract MITRE ATT&CK techniques
  const mitreTechniques = useMemo(() => {
    if (!capeData?.ttps) return []
    
    return capeData.ttps.map((ttp: any) => ({
      signature: ttp.signature,
      techniques: ttp.ttps,
      description: ttp.signature
    }))
  }, [capeData])

  // Extract process tree
  const processTree = useMemo(() => {
    if (!capeData?.behavior?.processtree) return []
    
    const flattenTree = (node: any, depth = 0) => {
      const children = node.children?.flatMap((child: any) => flattenTree(child, depth + 1)) || []
      return [{ ...node, depth }, ...children]
    }
    
    return capeData.behavior.processtree.flatMap((node: any) => flattenTree(node))
  }, [capeData])

  // Extract signatures with severity
  const signatures = useMemo(() => {
    if (!capeData?.signatures) return []
    
    return capeData.signatures.map((sig: any) => ({
      ...sig,
      severityClass: sig.severity >= 3 ? "high" : sig.severity >= 2 ? "medium" : "low"
    }))
  }, [capeData])

  // Filter signatures by severity
  const filteredSignatures = useMemo(() => {
    if (selectedSeverity === "all") return signatures
    return signatures.filter((sig: any) => sig.severityClass === selectedSeverity)
  }, [signatures, selectedSeverity])

  // Search functionality
  const filteredProcessTree = useMemo(() => {
    if (!searchQuery) return processTree
    const query = searchQuery.toLowerCase()
    return processTree.filter((proc: any) => 
      proc.name.toLowerCase().includes(query) ||
      proc.module_path?.toLowerCase().includes(query) ||
      proc.commandLine?.toLowerCase().includes(query)
    )
  }, [processTree, searchQuery])

  // Extract network activity
  const networkActivity = useMemo(() => {
    if (!capeData?.network) return []
    
    // This would parse network data from the CAPE report
    // For now, return placeholder
    return []
  }, [capeData])

  // Toggle item expansion
  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  if (!capeData || Object.keys(capeData).length === 0) {
    return (
      <div className="text-center py-12">
        <FileJson className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No CAPE data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Top toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-foreground">CAPE Sandbox Analysis</h1>
          <p className="text-sm text-muted-foreground">
            Detailed behavioral analysis and threat intelligence
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setViewMode(viewMode === "structured" ? "raw" : "structured")}
            className="px-3 py-1.5 border border-border rounded-lg hover:bg-muted/20 transition-colors flex items-center gap-2 text-sm"
          >
            {viewMode === "structured" ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            {viewMode === "structured" ? "Raw View" : "Structured View"}
          </button>
          
          <button
            onClick={onCopyJson}
            className="px-3 py-1.5 border border-border rounded-lg hover:bg-muted/20 transition-colors flex items-center gap-2 text-sm"
          >
            <Copy className="w-3 h-3" />
            {copied ? "Copied!" : "Copy JSON"}
          </button>
          
          {onDownload && (
            <button
              onClick={() => onDownload("json")}
              className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm"
            >
              <Download className="w-3 h-3" />
              Export
            </button>
          )}
        </div>
      </div>

      {viewMode === "raw" ? (
        <div className="glass border border-border rounded-xl p-4">
          <CustomJSONViewer data={capeData} mode="raw" />
        </div>
      ) : (
        <>
          {/* Threat Score Banner */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass border rounded-xl p-6 ${
              capeData.malscore >= 7 
                ? "border-destructive/50 bg-destructive/5" 
                : capeData.malscore >= 4
                ? "border-accent/50 bg-accent/5"
                : "border-primary/50 bg-primary/5"
            }`}
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-current flex items-center justify-center">
                    <span className={`text-2xl font-bold ${
                      capeData.malscore >= 7 ? "text-destructive" :
                      capeData.malscore >= 4 ? "text-accent" : "text-primary"
                    }`}>
                      {capeData.malscore?.toFixed(1) || 0}
                    </span>
                  </div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                    <Shield className="w-5 h-5" />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Threat Score</h3>
                  <p className="text-sm text-muted-foreground">
                    {capeData.malstatus === "Malicious" ? "🚨 Highly malicious file detected" :
                     capeData.malstatus === "Suspicious" ? "⚠️ Suspicious activity observed" :
                     "✅ Likely benign"}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      capeData.malstatus === "Malicious"
                        ? "bg-destructive/20 text-destructive"
                        : capeData.malstatus === "Suspicious"
                        ? "bg-accent/20 text-accent"
                        : "bg-primary/20 text-primary"
                    }`}>
                      Status: {capeData.malstatus || "Unknown"}
                    </div>
                    {capeData.info?.duration && (
                      <div className="px-2 py-1 rounded text-xs font-medium bg-muted/20 text-muted-foreground">
                        Duration: {Math.floor(capeData.info.duration / 60)}m {capeData.info.duration % 60}s
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">{stats.processes}</div>
                  <div className="text-xs text-muted-foreground">Processes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">{stats.signatures}</div>
                  <div className="text-xs text-muted-foreground">Signatures</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">{stats.droppedFiles}</div>
                  <div className="text-xs text-muted-foreground">Files Dropped</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Navigation Tabs */}
          <div className="border-b border-border">
            <nav className="flex overflow-x-auto -mb-px">
              {[
                { id: "overview", label: "Overview", icon: <Layers className="w-4 h-4" /> },
                { id: "behavior", label: "Behavior", icon: <Activity className="w-4 h-4" /> },
                { id: "signatures", label: "Signatures", icon: <AlertTriangle className="w-4 h-4" /> },
                { id: "processes", label: "Processes", icon: <Cpu className="w-4 h-4" /> },
                { id: "network", label: "Network", icon: <Globe className="w-4 h-4" /> },
                { id: "files", label: "Files", icon: <Folder className="w-4 h-4" /> },
                { id: "registry", label: "Registry", icon: <Key className="w-4 h-4" /> },
                { id: "memory", label: "Memory", icon: <HardDrive className="w-4 h-4" /> },
                { id: "mitre", label: "MITRE ATT&CK", icon: <FileCode className="w-4 h-4" /> },
                { id: "raw", label: "Raw Data", icon: <FileJson className="w-4 h-4" /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors whitespace-nowrap border-b-2 ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="min-h-[500px]">
            {activeTab === "overview" && (
              <OverviewTab 
                fileInfo={fileInfo}
                behaviorSummary={behaviorSummary}
                stats={stats}
                mitreTechniques={mitreTechniques}
                signatures={signatures}
              />
            )}

            {activeTab === "behavior" && (
              <BehaviorTab 
                summary={capeData.behavior?.summary}
                processes={capeData.behavior?.processes}
              />
            )}

            {activeTab === "signatures" && (
              <SignaturesTab 
                signatures={filteredSignatures}
                selectedSeverity={selectedSeverity}
                onSeverityChange={setSelectedSeverity}
                totalSignatures={signatures.length}
              />
            )}

            {activeTab === "processes" && (
              <ProcessesTab 
                processTree={filteredProcessTree}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                expandedItems={expandedItems}
                onToggleExpand={toggleExpand}
              />
            )}

            {activeTab === "files" && (
              <FilesTab 
                droppedFiles={capeData.dropped}
                fileWrites={capeData.behavior?.summary?.write_files}
                fileDeletes={capeData.behavior?.summary?.delete_files}
              />
            )}

            {activeTab === "mitre" && (
              <MitreTab 
                techniques={mitreTechniques}
                ttps={capeData.ttps}
              />
            )}

            {activeTab === "raw" && (
              <div className="glass border border-border rounded-xl p-4">
                <CustomJSONViewer data={capeData} mode="pretty" />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// Sub-components for each tab
function OverviewTab({ fileInfo, behaviorSummary, stats, mitreTechniques, signatures }: any) {
  return (
    <div className="space-y-6">
      {/* File Information Card */}
      {fileInfo && (
        <div className="glass border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <File className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">File Information</h3>
              <p className="text-sm text-muted-foreground">Analysis target details</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Filename</p>
              <p className="text-foreground font-mono text-sm truncate">{fileInfo.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">File Size</p>
              <p className="text-foreground text-sm">{fileInfo.size}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">File Type</p>
              <p className="text-foreground text-sm">{fileInfo.type}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">MD5</p>
              <code className="text-primary font-mono text-xs break-all">{fileInfo.md5}</code>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">SHA256</p>
              <code className="text-primary font-mono text-xs break-all">{fileInfo.sha256}</code>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Compile Time</p>
              <p className="text-foreground text-sm">{fileInfo.timestamp ? formatDistanceToNow(new Date(fileInfo.timestamp), { addSuffix: true }) : "Unknown"}</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          icon={<Cpu className="w-5 h-5" />}
          label="Processes"
          value={stats.processes}
          color="blue"
        />
        <StatCard 
          icon={<AlertTriangle className="w-5 h-5" />}
          label="Signatures"
          value={stats.signatures}
          color="red"
        />
        <StatCard 
          icon={<Folder className="w-5 h-5" />}
          label="Files Dropped"
          value={stats.droppedFiles}
          color="green"
        />
        <StatCard 
          icon={<FileCode className="w-5 h-5" />}
          label="MITRE Techniques"
          value={stats.ttpCount}
          color="purple"
        />
      </div>

      {/* Behavioral Summary */}
      {behaviorSummary && (
        <div className="glass border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Activity className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Behavioral Summary</h3>
              <p className="text-sm text-muted-foreground">Key activities observed</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Files Written</p>
              <p className="text-xl font-semibold text-foreground">{behaviorSummary.filesWritten}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Files Deleted</p>
              <p className="text-xl font-semibold text-foreground">{behaviorSummary.filesDeleted}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Registry Keys</p>
              <p className="text-xl font-semibold text-foreground">{behaviorSummary.registryKeys}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Mutexes Created</p>
              <p className="text-xl font-semibold text-foreground">{behaviorSummary.mutexes}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Commands Executed</p>
              <p className="text-xl font-semibold text-foreground">{behaviorSummary.commands}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Services Started</p>
              <p className="text-xl font-semibold text-foreground">{behaviorSummary.services}</p>
            </div>
          </div>
        </div>
      )}

      {/* Top Signatures */}
      {signatures.length > 0 && (
        <div className="glass border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Top Detections</h3>
                <p className="text-sm text-muted-foreground">Most significant signatures</p>
              </div>
            </div>
            <span className="text-sm text-muted-foreground">{signatures.length} total</span>
          </div>
          
          <div className="space-y-3">
            {signatures.slice(0, 5).map((sig: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/10 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{sig.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{sig.description}</p>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  sig.severityClass === "high" 
                    ? "bg-destructive/20 text-destructive" 
                    : sig.severityClass === "medium"
                    ? "bg-accent/20 text-accent"
                    : "bg-primary/20 text-primary"
                }`}>
                  {sig.severityClass === "high" ? "High" : 
                   sig.severityClass === "medium" ? "Medium" : "Low"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function BehaviorTab({ summary, processes }: any) {
  return (
    <div className="space-y-6">
      {/* File Operations */}
      <div className="glass border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">File Operations</h3>
        <div className="space-y-4">
          {summary?.write_files && summary.write_files.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-foreground">Files Written ({summary.write_files.length})</span>
              </div>
              <div className="space-y-1 ml-6">
                {summary.write_files.slice(0, 10).map((file: string, idx: number) => (
                  <div key={idx} className="text-sm text-muted-foreground truncate">
                    {file}
                  </div>
                ))}
                {summary.write_files.length > 10 && (
                  <div className="text-xs text-muted-foreground italic">
                    + {summary.write_files.length - 10} more files
                  </div>
                )}
              </div>
            </div>
          )}
          
          {summary?.delete_files && summary.delete_files.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium text-foreground">Files Deleted ({summary.delete_files.length})</span>
              </div>
              <div className="space-y-1 ml-6">
                {summary.delete_files.slice(0, 10).map((file: string, idx: number) => (
                  <div key={idx} className="text-sm text-muted-foreground truncate">
                    {file}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Registry Operations */}
      {summary?.keys && summary.keys.length > 0 && (
        <div className="glass border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Registry Operations</h3>
          <div className="space-y-2">
            {summary.keys.slice(0, 15).map((key: string, idx: number) => (
              <div key={idx} className="flex items-center gap-2 p-2 border border-border rounded hover:bg-muted/10">
                <Key className="w-4 h-4 text-purple-500" />
                <code className="text-sm text-foreground font-mono truncate flex-1">{key}</code>
              </div>
            ))}
            {summary.keys.length > 15 && (
              <div className="text-center py-2">
                <span className="text-xs text-muted-foreground italic">
                  + {summary.keys.length - 15} more registry keys
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* System Mutexes */}
      {summary?.mutexes && summary.mutexes.length > 0 && (
        <div className="glass border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Mutexes Created</h3>
          <div className="flex flex-wrap gap-2">
            {summary.mutexes.map((mutex: string, idx: number) => (
              <div key={idx} className="px-3 py-1 bg-muted/20 rounded-lg text-sm text-muted-foreground border border-border">
                {mutex}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Executed Commands */}
      {summary?.executed_commands && summary.executed_commands.length > 0 && (
        <div className="glass border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Executed Commands</h3>
          <div className="space-y-2">
            {summary.executed_commands.map((cmd: string, idx: number) => (
              <div key={idx} className="p-3 border border-border rounded-lg bg-muted/5">
                <div className="flex items-start gap-2">
                  <Terminal className="w-4 h-4 text-orange-500 mt-0.5" />
                  <code className="text-sm text-foreground font-mono flex-1">{cmd}</code>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function SignaturesTab({ signatures, selectedSeverity, onSeverityChange, totalSignatures }: any) {
  const severityCounts = {
    high: signatures.filter((s: any) => s.severityClass === "high").length,
    medium: signatures.filter((s: any) => s.severityClass === "medium").length,
    low: signatures.filter((s: any) => s.severityClass === "low").length
  }

  return (
    <div className="space-y-6">
      {/* Severity Filter */}
      <div className="glass border border-border rounded-xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Detection Signatures</h3>
            <p className="text-sm text-muted-foreground">{totalSignatures} signatures detected</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onSeverityChange("all")}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                selectedSeverity === "all"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted/20 border border-border"
              }`}
            >
              All ({totalSignatures})
            </button>
            <button
              onClick={() => onSeverityChange("high")}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                selectedSeverity === "high"
                  ? "bg-destructive text-destructive-foreground"
                  : "hover:bg-destructive/10 border border-border"
              }`}
            >
              High ({severityCounts.high})
            </button>
            <button
              onClick={() => onSeverityChange("medium")}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                selectedSeverity === "medium"
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/10 border border-border"
              }`}
            >
              Medium ({severityCounts.medium})
            </button>
            <button
              onClick={() => onSeverityChange("low")}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                selectedSeverity === "low"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-primary/10 border border-border"
              }`}
            >
              Low ({severityCounts.low})
            </button>
          </div>
        </div>

        {/* Signatures List */}
        <div className="space-y-4">
          {signatures.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No signatures match the selected filter</p>
            </div>
          ) : (
            signatures.map((sig: any, idx: number) => (
              <div key={idx} className="border border-border rounded-xl p-4 hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-block w-3 h-3 rounded-full ${
                        sig.severityClass === "high" ? "bg-destructive" :
                        sig.severityClass === "medium" ? "bg-accent" : "bg-primary"
                      }`}></span>
                      <h4 className="text-base font-semibold text-foreground truncate">{sig.name}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">{sig.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      sig.severityClass === "high" 
                        ? "bg-destructive/20 text-destructive" 
                        : sig.severityClass === "medium"
                        ? "bg-accent/20 text-accent"
                        : "bg-primary/20 text-primary"
                    }`}>
                      Severity: {sig.severity}
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium bg-muted/20 text-muted-foreground`}>
                      Weight: {sig.weight}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Categories:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {sig.categories?.map((cat: string, catIdx: number) => (
                        <span key={catIdx} className="px-2 py-0.5 bg-muted/20 rounded text-xs">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {sig.families && sig.families.length > 0 && (
                    <div>
                      <span className="text-muted-foreground">Families:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {sig.families.map((family: string, famIdx: number) => (
                          <span key={famIdx} className="px-2 py-0.5 bg-purple-500/20 text-purple-500 rounded text-xs">
                            {family}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {sig.alert && (
                    <div>
                      <span className="text-muted-foreground">Alert Triggered:</span>
                      <div className="mt-1">
                        <span className="px-2 py-0.5 bg-destructive/20 text-destructive rounded text-xs">
                          ⚠️ Requires Investigation
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function ProcessesTab({ processTree, searchQuery, onSearchChange, expandedItems, onToggleExpand }: any) {
  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="glass border border-border rounded-xl p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Process Tree</h3>
            <p className="text-sm text-muted-foreground">Execution flow and process hierarchy</p>
          </div>
          
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search processes..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        {/* Process Tree Visualization */}
        <div className="space-y-2">
          {processTree.length === 0 ? (
            <div className="text-center py-8">
              <Cpu className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                {searchQuery ? "No processes match your search" : "No process data available"}
              </p>
            </div>
          ) : (
            processTree.map((proc: any, idx: number) => (
              <div
                key={idx}
                className={`border border-border rounded-lg hover:border-primary/50 transition-colors ${
                  proc.depth > 0 ? "ml-6" : ""
                }`}
              >
                <div 
                  className="p-4 cursor-pointer hover:bg-muted/10 transition-colors"
                  onClick={() => onToggleExpand(proc.pid)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Cpu className="w-4 h-4 text-blue-500" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{proc.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 bg-muted/20 rounded">PID: {proc.pid}</span>
                          <span className="text-xs px-2 py-0.5 bg-muted/20 rounded">Parent: {proc.parent_id}</span>
                          {proc.bitness && (
                            <span className="text-xs px-2 py-0.5 bg-muted/20 rounded">{proc.bitness}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                          {proc.threads?.length || 0} threads
                        </div>
                        <div className="text-xs text-muted-foreground">
                          First seen: {proc.first_seen?.split(',')[0] || "N/A"}
                        </div>
                      </div>
                      <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${
                        expandedItems[proc.pid] ? "rotate-90" : ""
                      }`} />
                    </div>
                  </div>
                </div>
                
                {expandedItems[proc.pid] && proc.environ && (
                  <div className="border-t border-border p-4 bg-muted/5">
                    <h5 className="text-sm font-medium text-foreground mb-2">Environment</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {Object.entries(proc.environ).map(([key, value]: [string, any]) => (
                        <div key={key} className="space-y-1">
                          <span className="text-xs text-muted-foreground uppercase tracking-wider">{key}</span>
                          <code className="block text-xs text-foreground font-mono break-all bg-muted/20 p-2 rounded">
                            {String(value)}
                          </code>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function FilesTab({ droppedFiles, fileWrites, fileDeletes }: any) {
  return (
    <div className="space-y-6">
      {/* Dropped Files */}
      {droppedFiles && droppedFiles.length > 0 && (
        <div className="glass border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Download className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Dropped Files</h3>
                <p className="text-sm text-muted-foreground">{droppedFiles.length} files extracted during execution</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {droppedFiles.map((file: any, idx: number) => (
              <div key={idx} className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground truncate">{file.name?.[0] || "Unknown"}</h4>
                    {file.guest_paths?.[0] && (
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        Path: {file.guest_paths[0]}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-muted/20 rounded">
                      {file.type}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">MD5:</span>
                    <code className="block text-xs text-primary font-mono truncate">
                      {file.md5}
                    </code>
                  </div>
                  <div>
                    <span className="text-muted-foreground">SHA256:</span>
                    <code className="block text-xs text-primary font-mono truncate">
                      {file.sha256}
                    </code>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File Operations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Files Written */}
        {fileWrites && fileWrites.length > 0 && (
          <div className="glass border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <FileText className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Files Written</h3>
                <p className="text-sm text-muted-foreground">{fileWrites.length} files</p>
              </div>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {fileWrites.slice(0, 20).map((file: string, idx: number) => (
                <div key={idx} className="p-2 border border-border rounded hover:bg-muted/10">
                  <code className="text-xs text-foreground font-mono break-all">{file}</code>
                </div>
              ))}
              {fileWrites.length > 20 && (
                <div className="text-center py-2">
                  <span className="text-xs text-muted-foreground italic">
                    + {fileWrites.length - 20} more files
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Files Deleted */}
        {fileDeletes && fileDeletes.length > 0 && (
          <div className="glass border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <FileText className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Files Deleted</h3>
                <p className="text-sm text-muted-foreground">{fileDeletes.length} files</p>
              </div>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {fileDeletes.slice(0, 20).map((file: string, idx: number) => (
                <div key={idx} className="p-2 border border-border rounded hover:bg-muted/10">
                  <code className="text-xs text-foreground font-mono break-all">{file}</code>
                </div>
              ))}
              {fileDeletes.length > 20 && (
                <div className="text-center py-2">
                  <span className="text-xs text-muted-foreground italic">
                    + {fileDeletes.length - 20} more files
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function MitreTab({ techniques, ttps }: any) {
  return (
    <div className="space-y-6">
      {/* MITRE ATT&CK Matrix Overview */}
      <div className="glass border border-border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <FileCode className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">MITRE ATT&CK Mapping</h3>
            <p className="text-sm text-muted-foreground">
              Tactics, techniques, and procedures identified
            </p>
          </div>
        </div>
        
        {techniques.length === 0 ? (
          <div className="text-center py-8">
            <FileCode className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No MITRE ATT&CK techniques identified</p>
          </div>
        ) : (
          <div className="space-y-4">
            {techniques.map((tech: any, idx: number) => (
              <div key={idx} className="border border-border rounded-lg p-4 hover:border-purple-500/50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{tech.signature}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{tech.description}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {tech.techniques?.map((tactic: string, tIdx: number) => (
                      <span key={tIdx} className="px-2 py-1 bg-purple-500/10 text-purple-500 rounded text-xs font-medium">
                        {tactic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color = "primary" }: any) {
  const colorClasses = {
    blue: "border-blue-500/20 bg-blue-500/5 text-blue-500",
    red: "border-red-500/20 bg-red-500/5 text-red-500",
    green: "border-green-500/20 bg-green-500/5 text-green-500",
    purple: "border-purple-500/20 bg-purple-500/5 text-purple-500",
    primary: "border-primary/20 bg-primary/5 text-primary"
  }

  return (
    <div className={`glass border rounded-xl p-4 ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex items-center justify-between">
        <div className="p-2 rounded-lg bg-current/10">
          {icon}
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </div>
    </div>
  )
}