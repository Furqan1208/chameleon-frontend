// File: @/components/analysis/AIAnalysisDashboard.tsx
"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import {
  Loader,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  Shield,
  Cpu,
  HardDrive,
  Network,
  Activity,
  FileCode,
  Zap,
  Layers,
  AlertCircle,
  Info,
  ExternalLink,
  Copy,
  Download,
  Eye,
  EyeOff,
  Brain,
  File,
  Folder,
  Hash,
  Clock,
  BarChart,
  Code,
  Database,
  Server,
  Terminal,
  Users,
  Lock,
  Unlock,
  Filter,
  Search,
  BarChart3,
  AlertOctagon,
  Binary,
  Calendar,
  ChevronRight,
  Circle,
  Download as DownloadIcon,
  FileArchive,
  FileSearch,
  Fingerprint,
  Globe,
  HardDrive as HardDriveIcon,
  Key,
  Layers as LayersIcon,
  Network as NetworkIcon,
  PieChart,
  Server as ServerIcon,
  ShieldAlert,
  Tag,
  Target,
  Timer,
  TrendingUp,
  Upload,
  UserCheck,
  Wifi,
  XCircle,
  Zap as ZapIcon,
  GitBranch
} from "lucide-react"
import { cn } from "@/lib/utils"

// ========== TYPE DEFINITIONS ==========
interface SectionBase {
  section: string
  type: string
  ai_model: string
  api_key_index: number
  timestamp: string
  status: string
  analysis: AnalysisData
}

interface AnalysisData {
  analysis_stage: string
  overall_threat_level?: string
  threat_confidence_score?: number
  confidence_assessment?: {
    evidence_convergence_level: string
    forensic_completeness: string
    analysis_limitations: string
  }
  ai_insights_summary?: {
    key_observations?: string[]
    key_findings?: string[]
    initial_risk_indication?: string
    confidence_in_observation?: string
    most_concerning_behavior?: string
    likely_threat_category?: string
    certainty_level?: string
    recommended_analysis_path?: string
    recommended_next_steps?: string[]
  }
  ai_forensic_insights?: {
    key_memory_findings: string[]
    most_significant_indicator: string
    memory_risk_assessment: string
    investigation_confidence: string
    recommended_memory_investigation: string[]
  }
  static_forensic_insights?: {
    key_static_findings: string[]
    file_authenticity_assessment: string
    static_analysis_confidence: string
    recommended_static_investigation: string[]
  }
  threat_indicators?: {
    risk_level: string
    confidence_score: number
    key_indicators: ThreatIndicator[]
    mitre_attack_mappings?: MitreMapping[]
  }
  execution_environment_analysis?: ExecutionEnvironmentAnalysis
  processing_efficiency_analysis?: ProcessingEfficiencyAnalysis
  initial_anomaly_detection?: AnomalyDetection
  file_identity_assessment?: FileIdentityAssessment
  pe_structure_analysis?: PEStructureAnalysis
  import_capability_analysis?: ImportCapabilityAnalysis
  signature_observations?: SignatureObservation[]
  detection_framework_mappings?: DetectionFrameworkMapping[]
  process_memory_analysis?: ProcessMemoryAnalysis[]
  report?: ReportData
  execution_overview?: ExecutionOverview
  detailed_behavioral_analysis?: DetailedBehavioralAnalysis
  comprehensive_risk_assessment?: ComprehensiveRiskAssessment
  contextual_integration?: ContextualIntegration
}

interface ThreatIndicator {
  indicator_type: string
  description: string
  artifact: string
  risk_rating: string
  explanation: string
}

interface MitreMapping {
  technique_id: string
  technique_name: string
  evidence: string
  confidence: string
}

interface SignatureObservation {
  signature_name: string
  description: string
  categories: string[]
  severity: number
  confidence: number
  data_summary?: string | null
  data_artifacts?: any
}

interface DetectionFrameworkMapping {
  signature_name: string
  mitre_attack_ids: string[]
  mbcs_codes: string[] | null
}

interface ProcessMemoryAnalysis {
  pid: number
  process_name: string
  process_sha256: string
  memory_forensic_indicators: {
    yara_detection_count: number
    yara_severity_assessment: string
    memory_region_anomalies: number
    pe_extraction_count: number
    process_risk_profile: string
  }
  yara_analysis: YaraAnalysis[]
  extracted_artifacts_analysis: ExtractedArtifact[]
  memory_forensic_summary: {
    evidence_preservation: boolean
    detection_coverage: string
    investigation_priority: string
  }
}

interface YaraAnalysis {
  rule_name: string
  rule_category: string
  match_significance: string
  matched_strings_count: number
  address_ranges: string[]
}

interface ExtractedArtifact {
  artifact_name: string
  artifact_type: string
  hash_confidence: string
  yara_matches_on_artifact: number
  artifact_assessment: string
}

interface ExecutionEnvironmentAnalysis {
  sandbox_platform: string
  analysis_type: string
  package_used: string
  execution_completion_status: string
  total_duration_seconds: number
  environment_assessment: string
}

interface ProcessingEfficiencyAnalysis {
  total_processing_time: number
  processing_to_execution_ratio: number
  most_time_consuming_phase: string
  efficiency_assessment: string
  zero_time_detections_count: number
  detection_density: string
}

interface AnomalyDetection {
  timeout_occurred: boolean
  abnormal_termination: boolean
  zero_payload_anomaly: boolean
  high_processing_anomaly: boolean
  anomaly_summary: string
}

interface FileIdentityAssessment {
  file_name: string
  file_type: string
  file_size_bytes: number
  size_category: string
  file_authenticity_indicators: {
    digitally_signed: boolean
    signature_validity: string
    pdb_path_present: boolean
    compile_timestamp_anomaly: boolean
    file_integrity_assessment: string
  }
}

interface PEStructureAnalysis {
  architecture: string
  entry_point_characteristics: {
    entry_point_offset: string
    entry_point_section: string
    entry_point_anomaly: boolean
  }
  checksum_validation: {
    reported_checksum: string
    actual_checksum: string
    checksum_valid: boolean
    checksum_anomaly: string
  }
  section_forensic_analysis: {
    total_sections: number
    suspicious_section_count: number
    section_entropy_profile: {
      average_entropy: number
      maximum_entropy: number
      entropy_assessment: string
    }
    section_flags_analysis: SectionFlagAnalysis[]
  }
}

interface SectionFlagAnalysis {
  section_name: string
  section_flags: string
  executable: boolean
  writable: boolean
  readable: boolean
  protection_assessment: string
}

interface ImportCapabilityAnalysis {
  imported_dll_count: number
  dll_categorization: {
    system_dlls: number
    network_dlls: number
    crypto_dlls: number
    other_dlls: number
  }
  capability_inference: string[]
  import_complexity_score: number
}

interface ReportData {
  executive_summary: string
  analysis_scope_and_coverage: string
  cross_stage_evidence_correlation: string
  threat_progression_and_kill_chain: string
  integrated_threat_assessment: string
  mitre_attack_mapping: string
  investigation_priority_matrix: string
  incident_response_guidance: string
  threat_intelligence_and_sharing: string
  analyst_insights_and_limitations: string
  lessons_learned_and_recommendations: string
}

interface ExecutionOverview {
  total_processes: number
  process_tree_depth: number
  main_process: string
  execution_environment: string
  sandbox_artifacts_detected: boolean
}

interface DetailedBehavioralAnalysis {
  file_operations_analysis: FileOperationsAnalysis
  registry_activity_analysis: RegistryActivityAnalysis
  process_behavior_analysis: ProcessBehaviorAnalysis
  network_and_execution: NetworkAndExecution
}

interface FileOperationsAnalysis {
  suspicious_files_written: SuspiciousFile[]
  files_deleted: DeletedFile[]
  total_file_operations: number
}

interface SuspiciousFile {
  file_path: string
  location_risk: string
  file_purpose: string
  associated_process: string
}

interface DeletedFile {
  file_path: string
  deletion_pattern: string
  timing_context: string
}

interface RegistryActivityAnalysis {
  registry_keys_accessed: RegistryKey[]
  suspicious_registry_patterns: any[]
  total_registry_operations: number
}

interface RegistryKey {
  key_path: string
  purpose: string
  risk_assessment: string
}

interface ProcessBehaviorAnalysis {
  process_creation_chain: ProcessChain[]
  process_injection_indicators: any[]
  privilege_escalation_signs: any[]
}

interface ProcessChain {
  parent_process: string
  child_process: string
  relationship: string
  suspicion_level: string
}

interface NetworkAndExecution {
  commands_executed: ExecutedCommand[]
  mutexes_created: Mutex[]
}

interface ExecutedCommand {
  command: string
  purpose: string
  tool_used: string
  risk_assessment: string
}

interface Mutex {
  mutex_name: string
  commonality: string
  purpose: string
}

interface ComprehensiveRiskAssessment {
  overall_risk_rating: string
  risk_factors: RiskFactor[]
  behavioral_clusters: BehavioralCluster[]
  defensive_recommendations: DefensiveRecommendation[]
}

interface RiskFactor {
  factor: string
  weight: number
  evidence: string
  explanation: string
}

interface BehavioralCluster {
  cluster_name: string
  observed_behaviors: string[]
  malware_family_associations: string[]
  confidence: string
}

interface DefensiveRecommendation {
  recommendation: string
  priority: string
  justification: string
}

interface ContextualIntegration {
  correlation_with_previous_stages: StageCorrelation[]
  timeline_analysis: TimelineAnalysis
}

interface StageCorrelation {
  stage: string
  finding: string
  behavioral_link: string
}

interface TimelineAnalysis {
  execution_phases: ExecutionPhase[]
}

interface ExecutionPhase {
  phase: string
  behaviors: string[]
  duration_estimate: string
}

// Main data interface
interface AIAnalysisData {
  results: {
    initial_combined_analysis: SectionBase
    target_analysis: SectionBase
    signatures_analysis: SectionBase
    memory_analysis: SectionBase
    behavior_analysis: SectionBase
    final_synthesis: SectionBase
  }
  sections_analyzed: string[]
  model_usage: Record<string, number>
  duration_seconds: number
  timestamp: string
}

interface AIAnalysisDashboardProps {
  data: AIAnalysisData | null
  loading?: boolean
  onCopyJson?: () => void
  copied?: boolean
  onDownload?: (format: string) => void
}

// ========== SUB-COMPONENTS ==========

interface SectionCardProps {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
}

const SectionCard = ({ title, icon, children, className }: SectionCardProps) => (
  <div className={cn("p-4 bg-muted/10 rounded-xl border border-border", className)}>
    <h5 className="font-semibold text-sm mb-3 flex items-center gap-2">
      {icon}
      {title}
    </h5>
    {children}
  </div>
)

interface ThreatIndicatorCardProps {
  indicator: ThreatIndicator
}

const ThreatIndicatorCard = ({ indicator }: ThreatIndicatorCardProps) => {
  const getIcon = () => {
    switch (indicator.indicator_type) {
      case "File_Operation":
        return <File className="w-4 h-4" />
      case "Execution":
        return <Terminal className="w-4 h-4" />
      case "Defense_Evasion":
        return <Shield className="w-4 h-4" />
      default:
        return <AlertTriangle className="w-4 h-4" />
    }
  }

  return (
    <div className="p-3 bg-muted/5 rounded-lg border border-border">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {getIcon()}
          <span className="font-medium text-sm">{indicator.indicator_type}</span>
        </div>
        <span className={cn(
          "px-2 py-0.5 rounded text-xs",
          indicator.risk_rating === "High" ? "bg-red-500/20 text-red-400" :
          indicator.risk_rating === "Medium" ? "bg-yellow-500/20 text-yellow-400" :
          "bg-green-500/20 text-green-400"
        )}>
          {indicator.risk_rating} Risk
        </span>
      </div>
      <p className="text-sm mb-2">{indicator.description}</p>
      <div className="mt-2 p-2 bg-muted/10 rounded text-xs font-mono break-all">
        {indicator.artifact}
      </div>
      <p className="text-xs text-muted-foreground mt-2">{indicator.explanation}</p>
    </div>
  )
}

interface SignatureListProps {
  signatures: SignatureObservation[]
}

const SignatureList = ({ signatures }: SignatureListProps) => (
  <div className="mb-6">
    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
      <AlertTriangle className="w-4 h-4" />
      Signature Observations ({signatures.length})
    </h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {signatures.map((sig, index) => (
        <div key={index} className="p-3 bg-muted/10 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="font-medium text-sm truncate">{sig.signature_name}</span>
            </div>
            <div className="flex gap-2">
              <span className={cn(
                "px-2 py-0.5 rounded text-xs",
                sig.severity === 3 ? "bg-red-500/20 text-red-400" :
                sig.severity === 2 ? "bg-yellow-500/20 text-yellow-400" :
                "bg-green-500/20 text-green-400"
              )}>
                Severity: {sig.severity}
              </span>
              <span className="px-2 py-0.5 rounded text-xs bg-blue-500/20 text-blue-400">
                {sig.confidence}% confidence
              </span>
            </div>
          </div>
          <p className="text-sm text-foreground/80 mb-2">{sig.description}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {sig.categories.map((category, catIndex) => (
              <span key={catIndex} className="px-2 py-0.5 bg-muted/20 rounded text-xs">
                {category}
              </span>
            ))}
          </div>
          {sig.data_summary && (
            <p className="text-xs text-muted-foreground mt-2">Data: {sig.data_summary}</p>
          )}
        </div>
      ))}
    </div>
  </div>
)

interface MemoryProcessCardProps {
  process: ProcessMemoryAnalysis
}

const MemoryProcessCard = ({ process }: MemoryProcessCardProps) => (
  <div className="p-3 bg-muted/5 rounded-lg border border-border">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <Cpu className="w-4 h-4" />
        <div>
          <div className="font-medium">{process.process_name}</div>
          <div className="text-xs text-muted-foreground">PID: {process.pid}</div>
        </div>
      </div>
      <span className={cn(
        "px-2 py-1 rounded text-xs font-medium",
        process.memory_forensic_indicators.process_risk_profile === "High Risk"
          ? "bg-red-500/20 text-red-400"
          : "bg-green-500/20 text-green-400"
      )}>
        {process.memory_forensic_indicators.process_risk_profile}
      </span>
    </div>
    
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
      <div className="text-center p-2 bg-muted/10 rounded">
        <div className="font-semibold">{process.memory_forensic_indicators.yara_detection_count}</div>
        <div className="text-xs text-muted-foreground">YARA Detections</div>
      </div>
      <div className="text-center p-2 bg-muted/10 rounded">
        <div className="font-semibold">{process.memory_forensic_indicators.pe_extraction_count}</div>
        <div className="text-xs text-muted-foreground">PE Extractions</div>
      </div>
      <div className="text-center p-2 bg-muted/10 rounded">
        <div className="font-semibold">{process.memory_forensic_indicators.memory_region_anomalies}</div>
        <div className="text-xs text-muted-foreground">Anomalies</div>
      </div>
      <div className="text-center p-2 bg-muted/10 rounded">
        <div className="font-semibold">{process.memory_forensic_indicators.yara_severity_assessment}</div>
        <div className="text-xs text-muted-foreground">Severity</div>
      </div>
    </div>

    {process.yara_analysis.length > 0 && (
      <div className="mt-3">
        <div className="text-xs font-medium text-muted-foreground mb-1">YARA Matches:</div>
        <div className="space-y-1">
          {process.yara_analysis.map((yara, index) => (
            <div key={index} className="text-xs p-1 bg-muted/5 rounded">
              <span className="font-medium">{yara.rule_name}</span>
              <span className="text-muted-foreground ml-2">({yara.rule_category})</span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
)

interface FileOperationsTableProps {
  fileAnalysis: FileOperationsAnalysis
}

const FileOperationsTable = ({ fileAnalysis }: FileOperationsTableProps) => (
  <SectionCard title="File Operations Analysis" icon={<File className="w-4 h-4" />}>
    <div className="space-y-4">
      <div>
        <h6 className="text-sm font-medium mb-2">Suspicious Files Written</h6>
        <div className="space-y-2">
          {fileAnalysis.suspicious_files_written.map((file, index) => (
            <div key={index} className="p-2 bg-muted/5 rounded flex items-center justify-between">
              <div className="flex items-center gap-2">
                <File className="w-3 h-3" />
                <span className="text-sm font-mono truncate">{file.file_path}</span>
              </div>
              <span className={cn(
                "px-2 py-0.5 rounded text-xs",
                file.location_risk === "High" ? "bg-red-500/20 text-red-400" :
                "bg-yellow-500/20 text-yellow-400"
              )}>
                {file.location_risk} Risk
              </span>
            </div>
          ))}
        </div>
      </div>

      {fileAnalysis.files_deleted.length > 0 && (
        <div>
          <h6 className="text-sm font-medium mb-2">Files Deleted</h6>
          <div className="space-y-2">
            {fileAnalysis.files_deleted.map((file, index) => (
              <div key={index} className="p-2 bg-muted/5 rounded flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="w-3 h-3 text-red-500" />
                  <span className="text-sm font-mono truncate">{file.file_path}</span>
                </div>
                <span className="text-xs text-muted-foreground">{file.deletion_pattern}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-2 border-t border-border">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total File Operations:</span>
          <span className="font-medium">{fileAnalysis.total_file_operations}</span>
        </div>
      </div>
    </div>
  </SectionCard>
)

interface ProcessChainViewProps {
  processAnalysis: ProcessBehaviorAnalysis
}

const ProcessChainView = ({ processAnalysis }: ProcessChainViewProps) => (
  <SectionCard title="Process Creation Chain" icon={<GitBranch className="w-4 h-4" />}>
    <div className="space-y-3">
      {processAnalysis.process_creation_chain.map((chain, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className="flex-1 p-2 bg-muted/5 rounded">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                chain.suspicion_level === "High" ? "bg-red-500" :
                chain.suspicion_level === "Medium" ? "bg-yellow-500" :
                "bg-green-500"
              )} />
              <span className="text-sm font-medium">{chain.parent_process}</span>
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
              <span className="text-sm font-medium">{chain.child_process}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">{chain.relationship}</div>
          </div>
          <span className={cn(
            "px-2 py-1 rounded text-xs",
            chain.suspicion_level === "High" ? "bg-red-500/20 text-red-400" :
            chain.suspicion_level === "Medium" ? "bg-yellow-500/20 text-yellow-400" :
            "bg-green-500/20 text-green-400"
          )}>
            {chain.suspicion_level}
          </span>
        </div>
      ))}
    </div>
  </SectionCard>
)

interface TimelineVisualizationProps {
  timeline: TimelineAnalysis
}

const TimelineVisualization = ({ timeline }: TimelineVisualizationProps) => (
  <SectionCard title="Execution Timeline" icon={<Timer className="w-4 h-4" />}>
    <div className="space-y-4">
      {timeline.execution_phases.map((phase, index) => (
        <div key={index} className="relative pl-6">
          <div className="absolute left-0 top-0 w-3 h-3 bg-primary rounded-full mt-1" />
          <div className="flex justify-between items-start mb-2">
            <h6 className="font-medium">{phase.phase}</h6>
            <span className="text-xs bg-muted/20 px-2 py-0.5 rounded">
              {phase.duration_estimate}
            </span>
          </div>
          <ul className="space-y-1">
            {phase.behaviors.map((behavior, behaviorIndex) => (
              <li key={behaviorIndex} className="text-sm text-foreground/80 flex gap-2">
                <div className="flex-shrink-0 w-1.5 bg-primary/30 rounded-full mt-1.5" />
                <span>{behavior}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </SectionCard>
)

interface MitreAttackMatrixProps {
  mappings: DetectionFrameworkMapping[]
}

const MitreAttackMatrix = ({ mappings }: MitreAttackMatrixProps) => (
  <SectionCard title="MITRE ATT&CK Mappings" icon={<ShieldAlert className="w-4 h-4" />}>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {mappings.map((mapping, index) => (
        <div key={index} className="p-3 bg-muted/20 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {mapping.mitre_attack_ids.map((id, idIndex) => (
                <span key={idIndex} className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
                  {id}
                </span>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {mapping.mbcs_codes?.length || 0} MBCS codes
            </span>
          </div>
          <div className="text-sm font-medium truncate">{mapping.signature_name}</div>
        </div>
      ))}
    </div>
  </SectionCard>
)

// ========== MAIN COMPONENT ==========
export default function AIAnalysisDashboard({ 
  data, 
  loading = false,
  onCopyJson,
  copied = false,
  onDownload
}: AIAnalysisDashboardProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [viewMode, setViewMode] = useState<"structured" | "raw">("structured")
  const [selectedSection, setSelectedSection] = useState<string | null>(null)

  // Memoized sections data
  const sections = useMemo(() => {
    if (!data) return []
    return Object.entries(data.results || {}).map(([key, value]) => ({
      key,
      ...value
    }))
  }, [data])

  // Initialize expanded sections
  useEffect(() => {
    if (sections.length > 0) {
      const initialExpandedState: Record<string, boolean> = {}
      sections.forEach(section => {
        initialExpandedState[section.key] = false
      })
      setExpandedSections(initialExpandedState)
      setSelectedSection(sections[0]?.key || null)
    }
  }, [sections])

  const handleSectionClick = useCallback((sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }))
    setSelectedSection(sectionKey)
    
    const element = document.getElementById(`section-${sectionKey}`)
    if (element) {
      setTimeout(() => {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [])

  const toggleSection = useCallback((sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }))
  }, [])

  const expandAll = useCallback(() => {
    const newState: Record<string, boolean> = {}
    sections.forEach(section => {
      newState[section.key] = true
    })
    setExpandedSections(newState)
  }, [sections])

  const collapseAll = useCallback(() => {
    const newState: Record<string, boolean> = {}
    sections.forEach(section => {
      newState[section.key] = false
    })
    setExpandedSections(newState)
  }, [sections])

  const getSectionIcon = useCallback((sectionName: string) => {
    switch (sectionName.toLowerCase()) {
      case "initial_combined_analysis":
        return <Layers className="w-4 h-4" />
      case "target_analysis":
        return <FileCode className="w-4 h-4" />
      case "signatures_analysis":
        return <Shield className="w-4 h-4" />
      case "memory_analysis":
        return <HardDrive className="w-4 h-4" />
      case "behavior_analysis":
        return <Activity className="w-4 h-4" />
      case "final_synthesis":
        return <Zap className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }, [])

  const getSectionColor = useCallback((sectionName: string) => {
    switch (sectionName.toLowerCase()) {
      case "initial_combined_analysis":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "target_analysis":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20"
      case "signatures_analysis":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20"
      case "memory_analysis":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "behavior_analysis":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      case "final_synthesis":
        return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }, [])

  const getThreatLevelColor = useCallback((level?: string) => {
    switch (level?.toLowerCase()) {
      case "critical":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "high":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "low":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }, [])

  const getConfidenceColor = useCallback((score?: number) => {
    if (!score) return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    if (score >= 90) return "bg-green-500/20 text-green-400 border-green-500/30"
    if (score >= 70) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    return "bg-red-500/20 text-red-400 border-red-500/30"
  }, [])

  const renderSectionContent = useCallback((section: (typeof sections)[0]) => {
    const { analysis } = section
    const isExpanded = expandedSections[section.key]

    if (!isExpanded) return null

    return (
      <div className="p-6 bg-muted/5">
        {/* AI Insights Summary */}
        {(analysis.ai_insights_summary?.key_observations || 
          analysis.ai_forensic_insights?.key_memory_findings ||
          analysis.static_forensic_insights?.key_static_findings ||
          analysis.ai_insights_summary?.key_findings) && (
          <div className="mb-6">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Key AI Insights
            </h4>
            <div className="space-y-3">
              {(analysis.ai_insights_summary?.key_observations || 
                analysis.ai_forensic_insights?.key_memory_findings ||
                analysis.static_forensic_insights?.key_static_findings ||
                analysis.ai_insights_summary?.key_findings)?.map((finding, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-shrink-0 w-1.5 bg-primary/50 rounded-full mt-1.5" />
                  <p className="text-sm text-foreground/80 flex-1">{finding}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section-specific content */}
        <div className="space-y-6">
          {renderSectionSpecificContent(section)}
        </div>
      </div>
    )
  }, [expandedSections])

  const renderSectionSpecificContent = useCallback((section: (typeof sections)[0]) => {
    const { key, analysis } = section

    switch (key) {
      case "initial_combined_analysis":
        return (
          <>
            {analysis.execution_environment_analysis && (
              <SectionCard title="Execution Environment" icon={<Server className="w-4 h-4" />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Platform:</span>
                      <span className="font-medium">{analysis.execution_environment_analysis.sandbox_platform}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <span className={cn(
                        "font-medium",
                        analysis.execution_environment_analysis.execution_completion_status === "Timeout" 
                          ? "text-amber-500" 
                          : "text-green-500"
                      )}>
                        {analysis.execution_environment_analysis.execution_completion_status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Duration:</span>
                      <span className="font-medium">{analysis.execution_environment_analysis.total_duration_seconds}s</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Assessment:</span>
                      <span className={cn(
                        "font-medium",
                        analysis.execution_environment_analysis.environment_assessment === "Suspicious" 
                          ? "text-red-500" 
                          : "text-green-500"
                      )}>
                        {analysis.execution_environment_analysis.environment_assessment}
                      </span>
                    </div>
                  </div>
                </div>
              </SectionCard>
            )}

            {analysis.processing_efficiency_analysis && (
              <SectionCard title="Processing Efficiency" icon={<BarChart className="w-4 h-4" />}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-muted/10 rounded-lg">
                    <div className="text-2xl font-bold">{analysis.processing_efficiency_analysis.total_processing_time}s</div>
                    <div className="text-xs text-muted-foreground">Total Time</div>
                  </div>
                  <div className="text-center p-3 bg-muted/10 rounded-lg">
                    <div className="text-2xl font-bold">{analysis.processing_efficiency_analysis.zero_time_detections_count}</div>
                    <div className="text-xs text-muted-foreground">Zero-time Detections</div>
                  </div>
                  <div className="text-center p-3 bg-muted/10 rounded-lg">
                    <div className="text-2xl font-bold">
                      {analysis.processing_efficiency_analysis.processing_to_execution_ratio.toFixed(4)}
                    </div>
                    <div className="text-xs text-muted-foreground">Processing Ratio</div>
                  </div>
                  <div className="text-center p-3 bg-muted/10 rounded-lg">
                    <div className="text-lg font-bold">{analysis.processing_efficiency_analysis.most_time_consuming_phase}</div>
                    <div className="text-xs text-muted-foreground">Slowest Phase</div>
                  </div>
                </div>
              </SectionCard>
            )}
          </>
        )

      case "target_analysis":
        return (
          <>
            {analysis.file_identity_assessment && (
              <SectionCard title="File Information" icon={<File className="w-4 h-4" />}>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium mb-2">Basic Information</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">File Name:</span>
                          <span className="font-medium">{analysis.file_identity_assessment.file_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Type:</span>
                          <span className="font-medium">{analysis.file_identity_assessment.file_type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Size:</span>
                          <span className="font-medium">
                            {(analysis.file_identity_assessment.file_size_bytes / (1024 * 1024)).toFixed(2)} MB
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium mb-2">Digital Signature</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Signed:</span>
                          <span className={cn(
                            "font-medium",
                            analysis.file_identity_assessment.file_authenticity_indicators.digitally_signed 
                              ? "text-green-500" 
                              : "text-gray-500"
                          )}>
                            {analysis.file_identity_assessment.file_authenticity_indicators.digitally_signed ? "Yes" : "No"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Validity:</span>
                          <span className={cn(
                            "font-medium",
                            analysis.file_identity_assessment.file_authenticity_indicators.signature_validity === "Valid" 
                              ? "text-green-500" 
                              : "text-red-500"
                          )}>
                            {analysis.file_identity_assessment.file_authenticity_indicators.signature_validity}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Integrity:</span>
                          <span className={cn(
                            "font-medium",
                            analysis.file_identity_assessment.file_authenticity_indicators.file_integrity_assessment === "High" 
                              ? "text-green-500" 
                              : "text-red-500"
                          )}>
                            {analysis.file_identity_assessment.file_authenticity_indicators.file_integrity_assessment}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </SectionCard>
            )}

            {analysis.pe_structure_analysis && (
              <SectionCard title="PE Structure Analysis" icon={<Code className="w-4 h-4" />}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-muted/10 rounded-lg">
                      <div className="text-xl font-bold">{analysis.pe_structure_analysis.architecture}</div>
                      <div className="text-xs text-muted-foreground">Architecture</div>
                    </div>
                    <div className="text-center p-3 bg-muted/10 rounded-lg">
                      <div className="text-xl font-bold">
                        {analysis.pe_structure_analysis.section_forensic_analysis.total_sections}
                      </div>
                      <div className="text-xs text-muted-foreground">Sections</div>
                    </div>
                    <div className="text-center p-3 bg-muted/10 rounded-lg">
                      <div className="text-xl font-bold">
                        {analysis.pe_structure_analysis.section_forensic_analysis.suspicious_section_count}
                      </div>
                      <div className="text-xs text-muted-foreground">Suspicious Sections</div>
                    </div>
                    <div className="text-center p-3 bg-muted/10 rounded-lg">
                      <div className="text-xl font-bold">
                        {analysis.pe_structure_analysis.checksum_validation.checksum_valid ? "Valid" : "Invalid"}
                      </div>
                      <div className="text-xs text-muted-foreground">Checksum</div>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium mb-2">Section Entropy</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Average Entropy:</span>
                        <span className="font-medium">
                          {analysis.pe_structure_analysis.section_forensic_analysis.section_entropy_profile.average_entropy.toFixed(3)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Maximum Entropy:</span>
                        <span className="font-medium">
                          {analysis.pe_structure_analysis.section_forensic_analysis.section_entropy_profile.maximum_entropy.toFixed(3)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Assessment:</span>
                        <span className="font-medium">
                          {analysis.pe_structure_analysis.section_forensic_analysis.section_entropy_profile.entropy_assessment}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </SectionCard>
            )}

            {analysis.import_capability_analysis && (
              <SectionCard title="Imported Capabilities" icon={<Database className="w-4 h-4" />}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-muted/10 rounded-lg">
                      <div className="text-xl font-bold">{analysis.import_capability_analysis.imported_dll_count}</div>
                      <div className="text-xs text-muted-foreground">Imported DLLs</div>
                    </div>
                    <div className="text-center p-3 bg-muted/10 rounded-lg">
                      <div className="text-xl font-bold">{analysis.import_capability_analysis.import_complexity_score}</div>
                      <div className="text-xs text-muted-foreground">Complexity Score</div>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium mb-2">DLL Categories</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {Object.entries(analysis.import_capability_analysis.dll_categorization).map(([category, count]) => (
                        <div key={category} className="text-center p-2 bg-muted/5 rounded">
                          <div className="font-semibold">{count}</div>
                          <div className="text-xs text-muted-foreground capitalize">{category.replace('_', ' ')}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium mb-2">Capability Inference</h5>
                    <div className="space-y-2">
                      {analysis.import_capability_analysis.capability_inference.map((capability, index) => (
                        <div key={index} className="flex gap-2">
                          <div className="flex-shrink-0 w-1.5 bg-primary/50 rounded-full mt-1.5" />
                          <p className="text-sm text-foreground/80 flex-1">{capability}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </SectionCard>
            )}
          </>
        )

      case "signatures_analysis":
        return (
          <>
            {analysis.signature_observations && (
              <SignatureList signatures={analysis.signature_observations} />
            )}

            {analysis.detection_framework_mappings && (
              <MitreAttackMatrix mappings={analysis.detection_framework_mappings} />
            )}
          </>
        )

      case "memory_analysis":
        return (
          <>
            {analysis.process_memory_analysis && (
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <HardDrive className="w-4 h-4" />
                  Process Memory Analysis
                </h4>
                <div className="space-y-4">
                  {analysis.process_memory_analysis.map((process, index) => (
                    <MemoryProcessCard key={index} process={process} />
                  ))}
                </div>
              </div>
            )}
          </>
        )

      case "behavior_analysis":
        return (
          <>
            {analysis.execution_overview && (
              <SectionCard title="Execution Overview" icon={<Terminal className="w-4 h-4" />}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-muted/10 rounded-lg">
                    <div className="text-xl font-bold">{analysis.execution_overview.total_processes}</div>
                    <div className="text-xs text-muted-foreground">Total Processes</div>
                  </div>
                  <div className="text-center p-3 bg-muted/10 rounded-lg">
                    <div className="text-xl font-bold">{analysis.execution_overview.process_tree_depth}</div>
                    <div className="text-xs text-muted-foreground">Process Tree Depth</div>
                  </div>
                  <div className="text-center p-3 bg-muted/10 rounded-lg col-span-2">
                    <div className="text-lg font-bold truncate">{analysis.execution_overview.main_process}</div>
                    <div className="text-xs text-muted-foreground">Main Process</div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Environment:</span>
                    <span className="font-medium">{analysis.execution_overview.execution_environment}</span>
                  </div>
                </div>
              </SectionCard>
            )}

            {analysis.threat_indicators?.key_indicators && (
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Threat Indicators ({analysis.threat_indicators.key_indicators.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysis.threat_indicators.key_indicators.map((indicator, index) => (
                    <ThreatIndicatorCard key={index} indicator={indicator} />
                  ))}
                </div>
              </div>
            )}

            {analysis.detailed_behavioral_analysis?.file_operations_analysis && (
              <FileOperationsTable 
                fileAnalysis={analysis.detailed_behavioral_analysis.file_operations_analysis} 
              />
            )}

            {analysis.detailed_behavioral_analysis?.process_behavior_analysis && (
              <ProcessChainView 
                processAnalysis={analysis.detailed_behavioral_analysis.process_behavior_analysis} 
              />
            )}

            {analysis.contextual_integration?.timeline_analysis && (
              <TimelineVisualization 
                timeline={analysis.contextual_integration.timeline_analysis} 
              />
            )}
          </>
        )

      case "final_synthesis":
        return (
          <>
            {analysis.overall_threat_level && (
              <SectionCard title="Threat Assessment" icon={<Shield className="w-4 h-4" />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h5 className="text-sm font-medium mb-2">Overall Threat Level</h5>
                      <div className="flex items-center gap-4">
                        <span className={cn(
                          "text-3xl font-bold",
                          analysis.overall_threat_level === "Critical" ? "text-red-500" :
                          analysis.overall_threat_level === "High" ? "text-orange-500" :
                          analysis.overall_threat_level === "Medium" ? "text-yellow-500" :
                          "text-green-500"
                        )}>
                          {analysis.overall_threat_level}
                        </span>
                        <div className="flex-1">
                          <div className="h-3 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                "h-full",
                                analysis.overall_threat_level === "Critical" ? "bg-red-500" :
                                analysis.overall_threat_level === "High" ? "bg-orange-500" :
                                analysis.overall_threat_level === "Medium" ? "bg-yellow-500" :
                                "bg-green-500"
                              )}
                              style={{ width: `${analysis.threat_confidence_score || 0}%` }}
                            />
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Confidence: {analysis.threat_confidence_score || 0}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {analysis.confidence_assessment && (
                    <div className="space-y-4">
                      <h5 className="text-sm font-medium mb-2">Confidence Assessment</h5>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Evidence Convergence:</span>
                          <span className="font-medium text-green-500">
                            {analysis.confidence_assessment.evidence_convergence_level}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Forensic Completeness:</span>
                          <span className="font-medium text-green-500">
                            {analysis.confidence_assessment.forensic_completeness}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Analysis Limitations:</span>
                          <span className="font-medium text-amber-500">
                            {analysis.confidence_assessment.analysis_limitations}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </SectionCard>
            )}

            {analysis.report && (
              <div className="space-y-6">
                <SectionCard title="Executive Summary" icon={<FileText className="w-4 h-4" />}>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {analysis.report.executive_summary}
                  </p>
                </SectionCard>

                <SectionCard title="Incident Response Guidance" icon={<AlertTriangle className="w-4 h-4" />}>
                  <div className="space-y-4">
                    {analysis.report.incident_response_guidance.split('\n').map((step, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center">
                          <span className="text-xs font-semibold text-amber-500">{index + 1}</span>
                        </div>
                        <p className="text-sm text-foreground/80 flex-1">{step.replace(/\*\*/g, '')}</p>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              </div>
            )}
          </>
        )

      default:
        return null
    }
  }, [])

  const renderStructuredView = () => {
    if (!data) return null

    return (
      <div className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-card border border-border rounded-xl">
            <div className="text-2xl font-bold">{sections.length}</div>
            <div className="text-sm text-muted-foreground">Analysis Sections</div>
          </div>
          <div className="p-4 bg-card border border-border rounded-xl">
            <div className="text-2xl font-bold">{data.model_usage['gemini-2.5-flash'] || 0}</div>
            <div className="text-sm text-muted-foreground">AI Model Calls</div>
          </div>
          <div className="p-4 bg-card border border-border rounded-xl">
            <div className="text-2xl font-bold">{data.duration_seconds.toFixed(1)}s</div>
            <div className="text-sm text-muted-foreground">Total Duration</div>
          </div>
          <div className="p-4 bg-card border border-border rounded-xl">
            <div className="text-2xl font-bold">
              {data.sections_analyzed.includes('final_synthesis') 
                ? data.results.final_synthesis.analysis.overall_threat_level || "N/A"
                : "N/A"
              }
            </div>
            <div className="text-sm text-muted-foreground">Final Threat Level</div>
          </div>
        </div>

        {/* Section Navigation */}
        {sections.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {sections.map(section => (
              <button
                key={section.key}
                onClick={() => handleSectionClick(section.key)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-all border",
                  selectedSection === section.key
                    ? getSectionColor(section.key)
                    : "bg-muted/10 text-muted-foreground border-border hover:bg-muted/20"
                )}
              >
                <div className="flex items-center gap-2">
                  {getSectionIcon(section.key)}
                  {section.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-muted-foreground">
            {sections.length} sections available
          </div>
          <div className="flex gap-2">
            <button
              onClick={expandAll}
              className="px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-muted/20 transition-colors flex items-center gap-2"
            >
              <ChevronDown className="w-3 h-3" />
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-muted/20 transition-colors flex items-center gap-2"
            >
              <ChevronUp className="w-3 h-3" />
              Collapse All
            </button>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map(section => {
            const isExpanded = expandedSections[section.key]
            
            return (
              <div
                key={section.key}
                id={`section-${section.key}`}
                className="border border-border rounded-xl overflow-hidden bg-card/50 backdrop-blur-sm"
              >
                {/* Section Header */}
                <div
                  className={cn(
                    "p-4 cursor-pointer hover:bg-muted/10 transition-colors",
                    isExpanded ? "border-b border-border" : ""
                  )}
                  onClick={() => toggleSection(section.key)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg", getSectionColor(section.key))}>
                        {getSectionIcon(section.key)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">
                          {section.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </h3>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Cpu className="w-3 h-3" />
                            {section.ai_model || "Unknown Model"}
                          </span>
                          {section.timestamp && (
                            <span>
                              {new Date(section.timestamp).toLocaleString()}
                            </span>
                          )}
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-medium",
                            section.status === "completed"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          )}>
                            {section.status || "unknown"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {section.analysis.overall_threat_level && (
                        <span className={cn(
                          "px-2 py-1 rounded-lg text-xs font-medium",
                          getThreatLevelColor(section.analysis.overall_threat_level)
                        )}>
                          {section.analysis.overall_threat_level}
                        </span>
                      )}
                      {section.analysis.threat_confidence_score && (
                        <span className={cn(
                          "px-2 py-1 rounded-lg text-xs font-medium",
                          getConfidenceColor(section.analysis.threat_confidence_score)
                        )}>
                          Confidence: {section.analysis.threat_confidence_score}%
                        </span>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Section Content */}
                {renderSectionContent(section)}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderRawView = () => {
    if (!data) return null

    let displayData: AIAnalysisData | AnalysisData = data
    if (selectedSection && data.results[selectedSection as keyof typeof data.results]) {
      displayData = data.results[selectedSection as keyof typeof data.results].analysis
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("structured")}
              className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-muted/20 transition-colors flex items-center gap-2"
            >
              <EyeOff className="w-4 h-4" />
              Back to Structured View
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onCopyJson?.()}
              className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-muted/20 transition-colors flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              {copied ? "Copied!" : "Copy JSON"}
            </button>
            <button
              onClick={() => onDownload?.("json")}
              className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </div>

        <div className="bg-muted/5 border border-border rounded-xl overflow-hidden">
          <pre className="p-6 text-sm overflow-auto max-h-[600px]">
            {JSON.stringify(displayData, null, 2)}
          </pre>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground">Loading AI analysis...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">No AI analysis data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("structured")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-all border",
              viewMode === "structured"
                ? "bg-primary/10 text-primary border-primary/20"
                : "bg-muted/10 text-muted-foreground border-border hover:bg-muted/20"
            )}
          >
            Structured View
          </button>
          <button
            onClick={() => setViewMode("raw")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-all border",
              viewMode === "raw"
                ? "bg-primary/10 text-primary border-primary/20"
                : "bg-muted/10 text-muted-foreground border-border hover:bg-muted/20"
            )}
          >
            Raw JSON View
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === "structured" ? renderStructuredView() : renderRawView()}
    </div>
  )
}