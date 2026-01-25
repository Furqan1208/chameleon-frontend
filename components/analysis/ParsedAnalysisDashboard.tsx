// D:\FYP\Chameleon Frontend\components\analysis\ParsedAnalysisDashboard.tsx
"use client"

import { useState, useMemo } from "react"
import {
  FileText,
  File,
  Activity,
  AlertTriangle,
  HardDrive,
  Layers,
  BarChart3,
  Type,
  Code,
  Shield,
  Cpu,
  Network,
  Database,
  Folder,
  Key,
  Terminal,
  Search,
  Filter,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Eye,
  EyeOff,
  Hash,
  Server,
  Clock,
  Users,
  Globe,
  FileCode,
  BarChart,
  PieChart,
  LineChart,
  ExternalLink
} from "lucide-react"
import { motion } from "framer-motion"
import CustomJSONViewer from "./CustomJSONViewer"
import { formatDistanceToNow } from "date-fns"

interface ParsedAnalysisDashboardProps {
  data: any
  loading?: boolean
  onCopyJson?: () => void
  copied?: boolean
  onDownload?: (format: string) => void
}

export default function ParsedAnalysisDashboard({ 
  data, 
  loading = false,
  onCopyJson,
  copied = false,
  onDownload
}: ParsedAnalysisDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>("overview")
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"structured" | "raw">("structured")

  // Extract sections
  const sections = useMemo(() => {
    if (!data?.sections) return {}
    return data.sections
  }, [data])

  // Calculate statistics
  const stats = useMemo(() => {
    if (!sections) return {}

    return {
      processes: sections.behavior?.data?.processes?.length || 0,
      signatures: sections.signatures?.signatures?.length || 0,
      apiCalls: sections.behavior?.data?.processes?.reduce((acc: number, proc: any) => 
        acc + (proc.calls?.length || 0), 0) || 0,
      strings: sections.strings?.metadata?.total_strings_processed || 0,
      memoryDumps: sections.memory?.procmemory?.length || 0,
      payloads: sections.cape?.payloads?.length || 0,
      registryKeys: sections.behavior?.data?.summary?.keys?.length || 0,
      mutexes: sections.behavior?.data?.summary?.mutexes?.length || 0
    }
  }, [sections])

  // Extract file information
  const fileInfo = useMemo(() => {
    if (!sections?.target) return null
    
    return {
      name: sections.target.file_name,
      size: (sections.target.file_size / 1024 / 1024).toFixed(2) + " MB",
      type: sections.target.file_type,
      md5: sections.target.md5,
      sha256: sections.target.sha256,
      sha1: sections.target.sha1,
      ssdeep: sections.target.ssdeep,
      imphash: sections.target.pe_info?.imphash,
      timestamp: sections.target.pe_structure?.timestamp,
      signed: sections.target.pe_info?.signed || false
    }
  }, [sections])

  // Extract behavioral summary
  const behaviorSummary = useMemo(() => {
    if (!sections?.behavior?.data?.summary) return null
    
    const summary = sections.behavior.data.summary
    return {
      files: summary.files?.length || 0,
      readFiles: summary.read_files || "0 items",
      writeFiles: summary.write_files || "0 items",
      deleteFiles: summary.delete_files || "0 items",
      registryKeys: summary.keys?.length || 0,
      readKeys: summary.read_keys?.length || 0,
      writeKeys: summary.write_keys || "0 items",
      deleteKeys: summary.delete_keys || "0 items",
      commands: summary.executed_commands?.length || 0,
      mutexes: summary.mutexes?.length || 0,
      servicesCreated: summary.created_services || "0 items",
      servicesStarted: summary.started_services || "0 items"
    }
  }, [sections])

  // Extract signatures
  const signatures = useMemo(() => {
    if (!sections?.signatures?.signatures) return []
    
    return sections.signatures.signatures.map((sig: any) => ({
      ...sig,
      severityClass: sig.severity >= 3 ? "high" : sig.severity >= 2 ? "medium" : "low"
    }))
  }, [sections])

  // Extract process calls timeline
  const processCalls = useMemo(() => {
    if (!sections?.behavior?.data?.processes) return []
    
    const calls: any[] = []
    sections.behavior.data.processes.forEach((proc: any) => {
      if (proc.calls) {
        proc.calls.forEach((call: any) => {
          calls.push({
            timestamp: call.timestamp,
            pid: proc.process_id,
            process: proc.process_name,
            category: call.category,
            api: call.api,
            status: call.status,
            return: call.return_,
            arguments: call.arguments
          })
        })
      }
    })
    
    // Sort by timestamp
    return calls.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime()
      const timeB = new Date(b.timestamp).getTime()
      return timeA - timeB
    })
  }, [sections])

  // Extract string categories
  const stringCategories = useMemo(() => {
    if (!sections?.strings?.categories) return []
    
    return Object.entries(sections.strings.categories).map(([category, strings]) => ({
      category,
      count: Array.isArray(strings) ? strings.length : 0,
      samples: Array.isArray(strings) ? strings.slice(0, 5) : []
    }))
  }, [sections])

  // Extract memory information
  const memoryInfo = useMemo(() => {
    if (!sections?.memory?.procmemory) return []
    
    return sections.memory.procmemory.map((proc: any) => ({
      pid: proc.pid,
      name: proc.name,
      size: (proc.size || 0) / 1024 / 1024,
      sha256: proc.sha256,
      extractedPE: proc.extracted_pe?.length || 0,
      suspiciousRegions: proc.address_space_summary?.suspicious_regions?.length || 0
    }))
  }, [sections])

  // Extract PE information
  const peInfo = useMemo(() => {
    if (!sections?.target?.pe_structure) return null
    
    const pe = sections.target.pe_structure
    return {
      importedDLLs: pe.imported_dlls?.length || 0,
      sections: pe.sections?.length || 0,
      resources: pe.resources?.length || 0,
      directories: pe.directories?.length || 0,
      imphash: pe.imphash,
      compileTime: pe.timestamp,
      entryPoint: pe.entrypoint
    }
  }, [sections])

  // Toggle item expansion
  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  if (!data || !sections || Object.keys(sections).length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No parsed data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Top toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-foreground">Parsed Analysis</h1>
          <p className="text-sm text-muted-foreground">
            Structured insights from CAPE sandbox analysis
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
          <CustomJSONViewer data={data} mode="raw" />
        </div>
      ) : (
        <>
          {/* Stats Banner */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass border border-primary/20 rounded-xl p-6 bg-primary/5"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{Object.keys(sections).length}</div>
                <div className="text-xs text-muted-foreground">Sections</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.processes}</div>
                <div className="text-xs text-muted-foreground">Processes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.signatures}</div>
                <div className="text-xs text-muted-foreground">Signatures</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.apiCalls}</div>
                <div className="text-xs text-muted-foreground">API Calls</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.strings.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Strings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.memoryDumps}</div>
                <div className="text-xs text-muted-foreground">Memory Dumps</div>
              </div>
            </div>
          </motion.div>

          {/* Navigation Tabs */}
          <div className="border-b border-border">
            <nav className="flex overflow-x-auto -mb-px">
              {[
                { id: "overview", label: "Overview", icon: <Layers className="w-4 h-4" /> },
                { id: "target", label: "Target", icon: <File className="w-4 h-4" /> },
                { id: "behavior", label: "Behavior", icon: <Activity className="w-4 h-4" /> },
                { id: "signatures", label: "Signatures", icon: <AlertTriangle className="w-4 h-4" /> },
                { id: "processes", label: "Process Calls", icon: <Cpu className="w-4 h-4" /> },
                { id: "strings", label: "Strings", icon: <Type className="w-4 h-4" /> },
                { id: "memory", label: "Memory", icon: <HardDrive className="w-4 h-4" /> },
                { id: "cape", label: "CAPE Payloads", icon: <Code className="w-4 h-4" /> },
                { id: "statistics", label: "Statistics", icon: <BarChart3 className="w-4 h-4" /> },
                { id: "raw", label: "Raw Data", icon: <FileText className="w-4 h-4" /> }
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
                signatures={signatures}
                sections={sections}
              />
            )}

            {activeTab === "target" && (
              <TargetTab 
                targetInfo={sections.target}
                peInfo={peInfo}
              />
            )}

            {activeTab === "behavior" && (
              <BehaviorTab 
                summary={sections.behavior?.data?.summary}
                processes={sections.behavior?.data?.processes}
                processCalls={processCalls}
              />
            )}

            {activeTab === "signatures" && (
              <SignaturesTab 
                signatures={signatures}
                malscore={sections.signatures?.malscore}
                malstatus={sections.signatures?.malstatus}
                ttps={sections.signatures?.ttps}
              />
            )}

            {activeTab === "processes" && (
              <ProcessCallsTab 
                processCalls={processCalls}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            )}

            {activeTab === "strings" && (
              <StringsTab 
                strings={sections.strings}
                categories={stringCategories}
              />
            )}

            {activeTab === "memory" && (
              <MemoryTab 
                memoryInfo={memoryInfo}
                procmemory={sections.memory?.procmemory}
              />
            )}

            {activeTab === "cape" && (
              <CapeTab 
                payloads={sections.cape?.payloads}
              />
            )}

            {activeTab === "statistics" && (
              <StatisticsTab 
                stats={sections.statistics}
                processing={sections.statistics?.processing_summary}
              />
            )}

            {activeTab === "raw" && (
              <div className="glass border border-border rounded-xl p-4">
                <CustomJSONViewer data={data} mode="pretty" />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// Sub-components for each tab
function OverviewTab({ fileInfo, behaviorSummary, stats, signatures, sections }: any) {
  return (
    <div className="space-y-6">
      {/* File Information */}
      {fileInfo && (
        <div className="glass border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <File className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">File Information</h3>
              <p className="text-sm text-muted-foreground">Analysis target summary</p>
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
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Digital Signature</p>
              <p className={`text-sm ${fileInfo.signed ? 'text-green-500' : 'text-red-500'}`}>
                {fileInfo.signed ? "Signed" : "Unsigned"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Threat Assessment */}
      {sections.signatures && (
        <div className={`glass border rounded-xl p-6 ${
          sections.signatures.malscore >= 7 
            ? "border-destructive/50 bg-destructive/5" 
            : sections.signatures.malscore >= 4
            ? "border-accent/50 bg-accent/5"
            : "border-primary/50 bg-primary/5"
        }`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-current/10">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Threat Assessment</h3>
                <p className="text-sm text-muted-foreground">Analysis verdict</p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-lg text-sm font-medium ${
              sections.signatures.malstatus === "Malicious"
                ? "bg-destructive/20 text-destructive"
                : sections.signatures.malstatus === "Suspicious"
                ? "bg-accent/20 text-accent"
                : "bg-primary/20 text-primary"
            }`}>
              {sections.signatures.malstatus}
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Threat Score</p>
                <p className="text-3xl font-bold">{sections.signatures.malscore?.toFixed(1)} / 10</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Signatures Detected</p>
                <p className="text-2xl font-bold">{signatures.length}</p>
              </div>
            </div>
            
            {/* MITRE ATT&CK Techniques */}
            {sections.signatures.ttps && sections.signatures.ttps.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">MITRE ATT&CK Techniques</p>
                <div className="flex flex-wrap gap-2">
                  {sections.signatures.ttps.slice(0, 5).map((ttp: any, idx: number) => (
                    <span key={idx} className="px-2 py-1 bg-purple-500/10 text-purple-500 rounded text-xs">
                      {ttp.signature}
                    </span>
                  ))}
                  {sections.signatures.ttps.length > 5 && (
                    <span className="px-2 py-1 bg-muted/20 text-muted-foreground rounded text-xs">
                      +{sections.signatures.ttps.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          icon={<Cpu className="w-5 h-5" />}
          label="API Calls"
          value={stats.apiCalls}
          color="blue"
        />
        <StatCard 
          icon={<Folder className="w-5 h-5" />}
          label="File Operations"
          value={behaviorSummary?.files || 0}
          color="green"
        />
        <StatCard 
          icon={<Key className="w-5 h-5" />}
          label="Registry Keys"
          value={stats.registryKeys}
          color="purple"
        />
        <StatCard 
          icon={<HardDrive className="w-5 h-5" />}
          label="Memory Dumps"
          value={stats.memoryDumps}
          color="orange"
        />
      </div>

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
              <div key={idx} className="border border-border rounded-lg p-4 hover:bg-muted/10 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground">{sig.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{sig.description}</p>
                  </div>
                  <div className={`ml-4 px-3 py-1 rounded text-sm font-medium ${
                    sig.severityClass === "high" 
                      ? "bg-destructive/20 text-destructive" 
                      : sig.severityClass === "medium"
                      ? "bg-accent/20 text-accent"
                      : "bg-primary/20 text-primary"
                  }`}>
                    Severity: {sig.severity}
                  </div>
                </div>
                {sig.data_summary && (
                  <p className="text-xs text-muted-foreground mt-2">{sig.data_summary}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function TargetTab({ targetInfo, peInfo }: any) {
  if (!targetInfo) return null

  return (
    <div className="space-y-6">
      {/* Basic File Info */}
      <div className="glass border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">File Properties</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Category</p>
              <p className="text-foreground text-sm capitalize">{targetInfo.category}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">File Path</p>
              <code className="text-foreground font-mono text-xs break-all">{targetInfo.file_path}</code>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">SHA1</p>
              <code className="text-primary font-mono text-xs break-all">{targetInfo.sha1}</code>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">ssdeep</p>
              <code className="text-primary font-mono text-xs break-all">{targetInfo.ssdeep}</code>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">TLSH</p>
              <code className="text-primary font-mono text-xs break-all">{targetInfo.tlsh}</code>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">YARA Hits</p>
              <p className="text-foreground text-sm">{targetInfo.yara_hits || 0}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">PE Signature</p>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${targetInfo.pe_info?.signed ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-foreground text-sm">
                  {targetInfo.pe_info?.signed ? "Digitally Signed" : "Not Signed"}
                </span>
              </div>
              {targetInfo.pe_info?.signing_error && (
                <p className="text-xs text-red-500 mt-1">{targetInfo.pe_info.signing_error}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">DIE Summary</p>
              <div className="space-y-1">
                {targetInfo.die_summary?.map((item: string, idx: number) => (
                  <p key={idx} className="text-foreground text-sm">{item}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PE Structure */}
      {peInfo && (
        <div className="glass border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Code className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">PE Structure</h3>
              <p className="text-sm text-muted-foreground">Portable Executable analysis</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Import Hash</p>
                <code className="text-primary font-mono text-xs break-all">{peInfo.imphash}</code>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Entry Point</p>
                <code className="text-foreground font-mono text-sm">{peInfo.entryPoint}</code>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Compile Time</p>
                <p className="text-foreground text-sm">
                  {peInfo.compileTime ? formatDistanceToNow(new Date(peInfo.compileTime), { addSuffix: true }) : "Unknown"}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 border border-border rounded-lg">
                <div className="text-2xl font-bold text-foreground">{peInfo.importedDLLs}</div>
                <div className="text-xs text-muted-foreground">Imported DLLs</div>
              </div>
              <div className="text-center p-4 border border-border rounded-lg">
                <div className="text-2xl font-bold text-foreground">{peInfo.sections}</div>
                <div className="text-xs text-muted-foreground">Sections</div>
              </div>
              <div className="text-center p-4 border border-border rounded-lg">
                <div className="text-2xl font-bold text-foreground">{peInfo.resources}</div>
                <div className="text-xs text-muted-foreground">Resources</div>
              </div>
              <div className="text-center p-4 border border-border rounded-lg">
                <div className="text-2xl font-bold text-foreground">{peInfo.directories}</div>
                <div className="text-xs text-muted-foreground">Directories</div>
              </div>
            </div>
          </div>

          {/* Imported DLLs */}
          {targetInfo.pe_structure?.imported_dlls && (
            <div className="mt-6">
              <h4 className="font-semibold text-foreground mb-3">Imported DLLs</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {targetInfo.pe_structure.imported_dlls.map((dll: any, idx: number) => (
                  <div key={idx} className="border border-border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <code className="text-primary font-mono text-sm">{dll.dll}</code>
                      <span className="text-xs text-muted-foreground">{dll.count} imports</span>
                    </div>
                    {dll.top_imports && (
                      <div className="space-y-1">
                        {dll.top_imports.slice(0, 3).map((importFunc: string, impIdx: number) => (
                          <div key={impIdx} className="text-xs text-muted-foreground truncate">
                            • {importFunc}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function BehaviorTab({ summary, processes, processCalls }: any) {
  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      {summary && (
        <div className="glass border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Activity className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Behavioral Summary</h3>
              <p className="text-sm text-muted-foreground">System activities observed</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="text-2xl font-bold text-foreground">{summary.files || 0}</div>
              <div className="text-xs text-muted-foreground">File Operations</div>
            </div>
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="text-2xl font-bold text-foreground">{summary.registryKeys || 0}</div>
              <div className="text-xs text-muted-foreground">Registry Keys</div>
            </div>
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="text-2xl font-bold text-foreground">{summary.commands || 0}</div>
              <div className="text-xs text-muted-foreground">Commands</div>
            </div>
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="text-2xl font-bold text-foreground">{summary.mutexes || 0}</div>
              <div className="text-xs text-muted-foreground">Mutexes</div>
            </div>
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="text-2xl font-bold text-foreground">{summary.servicesCreated || 0}</div>
              <div className="text-xs text-muted-foreground">Services</div>
            </div>
          </div>
        </div>
      )}

      {/* Processes */}
      {processes && processes.length > 0 && (
        <div className="glass border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Processes ({processes.length})</h3>
          
          <div className="space-y-4">
            {processes.map((proc: any, idx: number) => (
              <div key={idx} className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Cpu className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{proc.process_name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 bg-muted/20 rounded">PID: {proc.process_id}</span>
                        <span className="text-xs px-2 py-0.5 bg-muted/20 rounded">Parent: {proc.parent_id}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      {proc.calls?.length || 0} API calls
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {proc.module_path}
                    </div>
                  </div>
                </div>
                
                {/* Process Environment */}
                {proc.environ && proc.environ.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <h5 className="text-sm font-medium text-foreground mb-2">Environment</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      {Object.entries(proc.environ[0] || {}).slice(0, 6).map(([key, value]: [string, any]) => (
                        <div key={key} className="flex">
                          <span className="text-muted-foreground min-w-[120px]">{key}:</span>
                          <span className="text-foreground truncate ml-2">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Mutexes */}
      {summary?.mutexes && summary.mutexes.length > 0 && (
        <div className="glass border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Mutexes Created</h3>
          <div className="flex flex-wrap gap-2">
            {summary.mutexes.map((mutex: string, idx: number) => (
              <div key={idx} className="px-3 py-1.5 bg-muted/20 rounded-lg text-sm text-muted-foreground border border-border">
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

function SignaturesTab({ signatures, malscore, malstatus, ttps }: any) {
  return (
    <div className="space-y-6">
      {/* Threat Assessment Banner */}
      <div className={`glass border rounded-xl p-6 ${
        malscore >= 7 
          ? "border-destructive/50 bg-destructive/5" 
          : malscore >= 4
          ? "border-accent/50 bg-accent/5"
          : "border-primary/50 bg-primary/5"
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Threat Assessment</h3>
            <p className="text-sm text-muted-foreground">Overall analysis verdict</p>
          </div>
          <div className="text-right">
            <div className={`px-3 py-1 rounded-lg text-sm font-medium mb-2 ${
              malstatus === "Malicious"
                ? "bg-destructive/20 text-destructive"
                : malstatus === "Suspicious"
                ? "bg-accent/20 text-accent"
                : "bg-primary/20 text-primary"
            }`}>
              {malstatus}
            </div>
            <div className="text-3xl font-bold">{malscore?.toFixed(1)} / 10</div>
          </div>
        </div>
      </div>

      {/* Signatures List */}
      <div className="glass border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Detection Signatures</h3>
            <p className="text-sm text-muted-foreground">{signatures.length} signatures detected</p>
          </div>
        </div>

        <div className="space-y-4">
          {signatures.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No signatures detected</p>
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
                  
                  <div className="flex flex-col items-end gap-1 ml-4">
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      sig.severityClass === "high" 
                        ? "bg-destructive/20 text-destructive" 
                        : sig.severityClass === "medium"
                        ? "bg-accent/20 text-accent"
                        : "bg-primary/20 text-primary"
                    }`}>
                      Severity: {sig.severity}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Confidence: {sig.confidence}%
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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
                  
                  {sig.data_summary && (
                    <div>
                      <span className="text-muted-foreground">Detection Details:</span>
                      <p className="text-sm text-foreground mt-1">{sig.data_summary}</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MITRE ATT&CK Techniques */}
      {ttps && ttps.length > 0 && (
        <div className="glass border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <FileCode className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">MITRE ATT&CK Techniques</h3>
              <p className="text-sm text-muted-foreground">Tactics, techniques, and procedures</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {ttps.map((ttp: any, idx: number) => (
              <div key={idx} className="border border-border rounded-lg p-4 hover:border-purple-500/50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{ttp.signature}</h4>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {ttp.ttps?.map((technique: string, tIdx: number) => (
                      <span key={tIdx} className="px-2 py-1 bg-purple-500/10 text-purple-500 rounded text-xs font-medium">
                        {technique}
                      </span>
                    ))}
                  </div>
                </div>
                
                {ttp.mbcs && (
                  <div>
                    <span className="text-sm text-muted-foreground">MBCS:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {ttp.mbcs.map((mbc: string, mIdx: number) => (
                        <span key={mIdx} className="px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded text-xs">
                          {mbc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ProcessCallsTab({ processCalls, searchQuery, onSearchChange, selectedCategory, onCategoryChange }: any) {
  // Extract unique categories
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>()
    processCalls.forEach((call: any) => {
      if (call.category) uniqueCategories.add(call.category)
    })
    return Array.from(uniqueCategories)
  }, [processCalls])

  // Filter calls
  const filteredCalls = useMemo(() => {
    let filtered = processCalls
    
    if (selectedCategory !== "all") {
      filtered = filtered.filter((call: any) => call.category === selectedCategory)
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((call: any) => 
        call.api?.toLowerCase().includes(query) ||
        call.process?.toLowerCase().includes(query) ||
        call.category?.toLowerCase().includes(query)
      )
    }
    
    return filtered
  }, [processCalls, selectedCategory, searchQuery])

  // Group calls by timestamp
  const groupedCalls = useMemo(() => {
    const groups: Record<string, any[]> = {}
    
    filteredCalls.forEach((call: any) => {
      if (!call.timestamp) return
      
      const timeKey = call.timestamp.split(',')[0] // Get just the date part
      if (!groups[timeKey]) {
        groups[timeKey] = []
      }
      groups[timeKey].push(call)
    })
    
    return groups
  }, [filteredCalls])

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="glass border border-border rounded-xl p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">API Call Timeline</h3>
            <p className="text-sm text-muted-foreground">{processCalls.length} calls recorded</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search API calls..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* API Calls Timeline */}
        <div className="space-y-6">
          {Object.entries(groupedCalls).length === 0 ? (
            <div className="text-center py-8">
              <Cpu className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                {searchQuery || selectedCategory !== "all" 
                  ? "No API calls match your filters" 
                  : "No API call data available"}
              </p>
            </div>
          ) : (
            Object.entries(groupedCalls).map(([time, calls]) => (
              <div key={time} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <h4 className="font-medium text-foreground">{time}</h4>
                  <span className="text-sm text-muted-foreground">({calls.length} calls)</span>
                </div>
                
                <div className="ml-6 space-y-3 border-l border-border pl-6">
                  {calls.map((call: any, idx: number) => (
                    <div key={idx} className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <code className="text-sm font-medium text-foreground">{call.api}</code>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              call.category === "system" ? "bg-blue-500/20 text-blue-500" :
                              call.category === "process" ? "bg-green-500/20 text-green-500" :
                              call.category === "file" ? "bg-purple-500/20 text-purple-500" :
                              call.category === "registry" ? "bg-orange-500/20 text-orange-500" :
                              call.category === "network" ? "bg-cyan-500/20 text-cyan-500" :
                              "bg-muted/20 text-muted-foreground"
                            }`}>
                              {call.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>PID: {call.pid}</span>
                            <span>•</span>
                            <span>{call.process}</span>
                            <span>•</span>
                            <span>{call.timestamp?.split(',')[1]?.trim() || ""}</span>
                          </div>
                        </div>
                        
                        <div className={`text-xs px-2 py-1 rounded ${
                          call.status ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                        }`}>
                          {call.status ? "Success" : "Failed"}
                        </div>
                      </div>
                      
                      {call.arguments && call.arguments.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <h5 className="text-sm font-medium text-foreground mb-2">Arguments</h5>
                          <div className="space-y-1">
                            {call.arguments.slice(0, 3).map((arg: any, argIdx: number) => (
                              <div key={argIdx} className="text-sm">
                                <span className="text-muted-foreground">{arg.name}: </span>
                                <code className="text-foreground font-mono text-xs break-all">
                                  {typeof arg.value === 'string' ? arg.value : JSON.stringify(arg.value)}
                                </code>
                              </div>
                            ))}
                            {call.arguments.length > 3 && (
                              <div className="text-xs text-muted-foreground italic">
                                + {call.arguments.length - 3} more arguments
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {call.return && (
                        <div className="mt-2">
                          <span className="text-sm text-muted-foreground">Return: </span>
                          <code className="text-sm text-foreground font-mono">{call.return}</code>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function StringsTab({ strings, categories }: any) {
  if (!strings) return null

  return (
    <div className="space-y-6">
      {/* Strings Summary */}
      <div className="glass border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Strings Analysis</h3>
            <p className="text-sm text-muted-foreground">
              {strings.metadata?.total_strings_processed?.toLocaleString() || 0} strings processed
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {strings.metadata?.reduction_percentage || "0%"}
            </div>
            <div className="text-xs text-muted-foreground">Reduction</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 border border-border rounded-lg">
            <div className="text-2xl font-bold text-foreground">
              {strings.metadata?.whitelisted_strings?.toLocaleString() || 0}
            </div>
            <div className="text-xs text-muted-foreground">Whitelisted</div>
          </div>
          <div className="p-4 border border-border rounded-lg">
            <div className="text-2xl font-bold text-foreground">
              {strings.metadata?.garbage_removed?.toLocaleString() || 0}
            </div>
            <div className="text-xs text-muted-foreground">Garbage Removed</div>
          </div>
          <div className="p-4 border border-border rounded-lg">
            <div className="text-2xl font-bold text-foreground">
              {strings.metadata?.whitelist_categories_used?.length || 0}
            </div>
            <div className="text-xs text-muted-foreground">Categories Used</div>
          </div>
          <div className="p-4 border border-border rounded-lg">
            <div className="text-2xl font-bold text-foreground">
              {strings.all_clean_strings?.length?.toLocaleString() || 0}
            </div>
            <div className="text-xs text-muted-foreground">Clean Strings</div>
          </div>
        </div>
      </div>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <div className="glass border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">String Categories</h3>
          
          <div className="space-y-6">
            {categories.map((category: any, idx: number) => (
              <div key={idx} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-foreground capitalize">{category.category.replace(/_/g, ' ')}</h4>
                  <span className="text-sm text-muted-foreground">{category.count} strings</span>
                </div>
                
                <div className="space-y-2">
                  {category.samples.map((sample: string, sampleIdx: number) => (
                    <div key={sampleIdx} className="text-sm text-muted-foreground truncate">
                      {sample}
                    </div>
                  ))}
                  {category.count > 5 && (
                    <div className="text-xs text-muted-foreground italic">
                      + {category.count - 5} more strings
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MemoryTab({ memoryInfo, procmemory }: any) {
  if (!memoryInfo || memoryInfo.length === 0) return null

  return (
    <div className="space-y-6">
      {/* Memory Dumps Summary */}
      <div className="glass border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Memory Analysis</h3>
            <p className="text-sm text-muted-foreground">{memoryInfo.length} process memory dumps</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {memoryInfo.map((proc: any, idx: number) => (
            <div key={idx} className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/10 rounded-lg">
                    <HardDrive className="w-4 h-4 text-orange-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{proc.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 bg-muted/20 rounded">PID: {proc.pid}</span>
                      <span className="text-xs px-2 py-0.5 bg-muted/20 rounded">{proc.size.toFixed(2)} MB</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">
                    {proc.extractedPE} extracted PEs
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {proc.suspiciousRegions} suspicious regions
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">SHA256:</span>
                  <code className="block text-xs text-primary font-mono truncate">
                    {proc.sha256}
                  </code>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CapeTab({ payloads }: any) {
  if (!payloads || payloads.length === 0) return null

  return (
    <div className="space-y-6">
      <div className="glass border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">CAPE Payloads</h3>
            <p className="text-sm text-muted-foreground">{payloads.length} payloads extracted</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {payloads.map((payload: any, idx: number) => (
            <div key={idx} className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{payload.cape_type}</h4>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <span>{payload.process_name}</span>
                    <span>•</span>
                    <span>PID: {payload.pid}</span>
                    <span>•</span>
                    <span>{(payload.size / 1024).toFixed(1)} KB</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-500 rounded">
                    {payload.type}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">MD5:</span>
                  <code className="block text-xs text-primary font-mono truncate">
                    {payload.md5}
                  </code>
                </div>
                <div>
                  <span className="text-muted-foreground">SHA256:</span>
                  <code className="block text-xs text-primary font-mono truncate">
                    {payload.sha256}
                  </code>
                </div>
              </div>
              
              {payload.data && (
                <div className="mt-3 pt-3 border-t border-border">
                  <span className="text-sm text-muted-foreground">Data:</span>
                  <pre className="text-xs text-foreground font-mono bg-muted/20 p-2 rounded mt-1 overflow-auto">
                    {payload.data}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatisticsTab({ stats, processing }: any) {
  if (!stats) return null

  return (
    <div className="space-y-6">
      {/* Processing Summary */}
      <div className="glass border border-border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <BarChart3 className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Processing Statistics</h3>
            <p className="text-sm text-muted-foreground">Analysis performance metrics</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 border border-border rounded-lg">
            <div className="text-2xl font-bold text-foreground">{stats.total_processing_time?.toFixed(3)}s</div>
            <div className="text-xs text-muted-foreground">Total Processing Time</div>
          </div>
          <div className="p-4 border border-border rounded-lg">
            <div className="text-2xl font-bold text-foreground">{stats.zero_time_processing_count || 0}</div>
            <div className="text-xs text-muted-foreground">Zero-time Processes</div>
          </div>
          <div className="p-4 border border-border rounded-lg">
            <div className="text-2xl font-bold text-foreground">{stats.zero_time_signatures_count || 0}</div>
            <div className="text-xs text-muted-foreground">Zero-time Signatures</div>
          </div>
        </div>
      </div>

      {/* Processing Breakdown */}
      {processing && processing.length > 0 && (
        <div className="glass border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Processing Breakdown</h3>
          
          <div className="space-y-4">
            {processing.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm text-foreground">
                  {Object.keys(item)[0]}
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    {String(Object.values(item)[0])}s
                  </span>
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full"
                      style={{ 
                        width: `${(Number(Object.values(item)[0]) / stats.total_processing_time * 100)}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon, label, value, color = "primary" }: any) {
  const colorClasses = {
    blue: "border-blue-500/20 bg-blue-500/5 text-blue-500",
    red: "border-red-500/20 bg-red-500/5 text-red-500",
    green: "border-green-500/20 bg-green-500/5 text-green-500",
    purple: "border-purple-500/20 bg-purple-500/5 text-purple-500",
    orange: "border-orange-500/20 bg-orange-500/5 text-orange-500",
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