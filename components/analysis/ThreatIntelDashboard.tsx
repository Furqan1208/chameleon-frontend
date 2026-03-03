// components/analysis/ThreatIntelDashboard.tsx
"use client"

import { useState, useEffect } from "react"
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Globe,
  Database,
  Brain,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  FileText,
  Hash,
  Tag,
  Clock,
  Calendar,
  Download,
  Eye,
  EyeOff,
  Network,
  Activity,
  Users,
  Cpu,
  Link as LinkIcon,
  Server,
  FileCode,
  Upload,
  Info,
  Code,
  Target,
  Skull,
  Award,
  BarChart3,
  PieChart,
  Bug,
  AlertCircle,
  Lock,
  Unlock
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { virusTotalService } from "@/lib/threat-intel/virustotal-service"
import { malwareBazaarService } from "@/lib/threat-intel/malwarebazaar-service"
import { hybridAnalysisService } from "@/lib/threat-intel/hybrid-analysis-service"
import { alienvaultOTXService } from "@/lib/threat-intel/alienvault-service"
import { threatCache } from "@/lib/threat-intel/cache-service"
import type { VTAnalysisResult } from "@/lib/threat-intel/vt-types"
import type { MBAnalysisResult } from "@/lib/threat-intel/malwarebazaar-types"
import type { HAAnalysisResult } from "@/lib/threat-intel/ha-types"
import type { OTXResult } from "@/lib/threat-intel/otx-types"

interface ThreatIntelDashboardProps {
  fileHashes: {
    md5: string
    sha1: string
    sha256: string
    sha512?: string
    filename: string
  } | null
  onCopyJson?: () => void
  copied?: boolean
}

interface ThreatIntelData {
  virustotal: VTAnalysisResult | null
  malwarebazaar: MBAnalysisResult | null
  hybridanalysis: HAAnalysisResult | null
  alienvault: OTXResult | null
}

interface ServiceStatus {
  virustotal: 'loading' | 'complete' | 'error'
  malwarebazaar: 'loading' | 'complete' | 'error'
  hybridanalysis: 'loading' | 'complete' | 'error'
  alienvault: 'loading' | 'complete' | 'error'
}

// Utility functions
const formatBytes = (bytes?: number): string => {
  if (!bytes) return 'N/A'
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Byte'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i]
}

const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return 'Invalid date'
  }
}

const getVerdictInfo = (verdict?: string) => {
  if (!verdict) return { label: 'Unknown', color: 'text-muted-foreground', bgColor: 'bg-muted/10', icon: <Shield className="w-4 h-4" /> }
  
  const lowerVerdict = verdict.toLowerCase()
  if (lowerVerdict.includes('malicious') || lowerVerdict.includes('malware')) {
    return { 
      label: 'Malicious', 
      color: 'text-destructive', 
      bgColor: 'bg-destructive/10', 
      icon: <AlertTriangle className="w-4 h-4 text-destructive" /> 
    }
  }
  if (lowerVerdict.includes('suspicious')) {
    return { 
      label: 'Suspicious', 
      color: 'text-accent', 
      bgColor: 'bg-accent/10', 
      icon: <AlertCircle className="w-4 h-4 text-accent" /> 
    }
  }
  if (lowerVerdict.includes('clean') || lowerVerdict.includes('harmless')) {
    return { 
      label: 'Clean', 
      color: 'text-green-500', 
      bgColor: 'bg-green-500/10', 
      icon: <CheckCircle className="w-4 h-4 text-green-500" /> 
    }
  }
  if (lowerVerdict.includes('no specific threat') || lowerVerdict.includes('no_specific_threat')) {
    return { 
      label: 'No Threat', 
      color: 'text-blue-500', 
      bgColor: 'bg-blue-500/10', 
      icon: <Shield className="w-4 h-4 text-blue-500" /> 
    }
  }
  
  return { label: verdict, color: 'text-muted-foreground', bgColor: 'bg-muted/10', icon: <Shield className="w-4 h-4" /> }
}

const ServiceCard = ({ 
  name, 
  icon, 
  status, 
  result, 
  error,
  onRetry 
}: { 
  name: string
  icon: React.ReactNode
  status: 'loading' | 'complete' | 'error'
  result: any
  error?: string
  onRetry?: () => void
}) => {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const getStatusDisplay = () => {
    if (status === 'loading') {
      return { text: 'Scanning...', icon: <RefreshCw className="w-3 h-3 text-blue-500 animate-spin" />, color: 'text-blue-500' }
    }
    if (status === 'error') {
      return { text: 'Error', icon: <XCircle className="w-3 h-3 text-destructive" />, color: 'text-destructive' }
    }
    if (!result?.found) {
      return { text: 'Not Found', icon: <CheckCircle className="w-3 h-3 text-green-500" />, color: 'text-green-500' }
    }
    
    // Get verdict info if available
    if (result.verdict) {
      const verdictInfo = getVerdictInfo(result.verdict)
      return { 
        text: verdictInfo.label, 
        icon: verdictInfo.icon, 
        color: verdictInfo.color 
      }
    }
    
    // Check for threat level
    if (result.threat_level) {
      if (result.threat_level === 'malicious') {
        return { text: 'Malicious', icon: <AlertTriangle className="w-3 h-3 text-destructive" />, color: 'text-destructive' }
      }
      if (result.threat_level === 'suspicious') {
        return { text: 'Suspicious', icon: <AlertCircle className="w-3 h-3 text-accent" />, color: 'text-accent' }
      }
    }
    
    return { text: 'Found', icon: <CheckCircle className="w-3 h-3 text-primary" />, color: 'text-primary' }
  }

  const statusDisplay = getStatusDisplay()

  return (
    <div className="glass border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div 
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/10 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            status === 'loading' ? 'bg-blue-500/10' :
            status === 'complete' ? result?.found ? 
              statusDisplay.color.includes('destructive') ? 'bg-destructive/10' :
              statusDisplay.color.includes('accent') ? 'bg-accent/10' :
              statusDisplay.color.includes('green') ? 'bg-green-500/10' :
              'bg-primary/10' : 'bg-gray-500/10' :
            'bg-destructive/10'
          }`}>
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <div className={`flex items-center gap-1 ${statusDisplay.color}`}>
                {statusDisplay.icon}
                <span className="text-xs font-medium">{statusDisplay.text}</span>
              </div>
              {result?.sample?.signature && (
                <span className="text-xs px-1.5 py-0.5 bg-accent/20 text-accent rounded">
                  {result.sample.signature}
                </span>
              )}
              {result?.vx_family && (
                <span className="text-xs px-1.5 py-0.5 bg-destructive/20 text-destructive rounded">
                  {result.vx_family}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {status === 'error' && onRetry && (
            <button
              onClick={(e) => { e.stopPropagation(); onRetry(); }}
              className="p-1 hover:bg-muted/20 rounded"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-border"
          >
            <div className="p-4 space-y-4">
              {status === 'loading' && (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                </div>
              )}

              {status === 'error' && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-center">
                  <XCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
                  <p className="text-sm text-destructive font-medium">Failed to fetch data</p>
                  <p className="text-xs text-muted-foreground mt-1">{error || 'An error occurred while scanning'}</p>
                </div>
              )}

              {status === 'complete' && result && (
                <>
                  {/* VirusTotal Display */}
                  {name === 'VirusTotal' && result.file_info && (
                    <VTContent result={result} onCopy={handleCopy} copied={copied} />
                  )}

                  {/* MalwareBazaar Display */}
                  {name === 'MalwareBazaar' && result.sample && (
                    <MBContent result={result} onCopy={handleCopy} copied={copied} />
                  )}

                  {/* Hybrid Analysis Display */}
                  {name === 'Hybrid Analysis' && (
                    <HAContent result={result} onCopy={handleCopy} copied={copied} />
                  )}

                  {/* AlienVault OTX Display */}
                  {name === 'AlienVault OTX' && (
                    <OTXContent result={result} onCopy={handleCopy} copied={copied} />
                  )}

                  {!result.found && (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-3">
                        <Search className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <h4 className="font-medium text-foreground mb-1">No Data Found</h4>
                      <p className="text-sm text-muted-foreground">
                        This indicator was not found in {name}'s database
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// VirusTotal Content Component
function VTContent({ result, onCopy, copied }: { result: VTAnalysisResult, onCopy: (text: string, id: string) => void, copied: string | null }) {
  return (
    <div className="space-y-4">
      {/* Detection Stats */}
      {result.detection_stats && (
        <div>
          <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
            <Shield className="w-4 h-4 text-blue-500" />
            Detection Statistics
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <StatBox label="Malicious" value={result.detection_stats.malicious || 0} color="destructive" />
            <StatBox label="Suspicious" value={result.detection_stats.suspicious || 0} color="accent" />
            <StatBox label="Harmless" value={result.detection_stats.harmless || 0} color="green" />
            <StatBox label="Undetected" value={result.detection_stats.undetected || 0} color="muted" />
          </div>
        </div>
      )}

      {/* File Information */}
      {result.file_info && (
        <div>
          <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
            <FileText className="w-4 h-4" />
            File Information
          </h4>
          <div className="space-y-2 bg-muted/5 p-3 rounded-lg">
            {result.file_info.filename && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Filename</span>
                <span className="text-xs font-mono text-foreground">{result.file_info.filename}</span>
              </div>
            )}
            {result.file_info.size && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Size</span>
                <span className="text-xs text-foreground">{formatBytes(result.file_info.size)}</span>
              </div>
            )}
            {result.file_info.type_description && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Type</span>
                <span className="text-xs text-foreground">{result.file_info.type_description}</span>
              </div>
            )}
            {result.file_info.first_seen && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">First Seen</span>
                <span className="text-xs text-foreground">{formatDate(result.file_info.first_seen)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tags */}
      {result.file_info?.tags && result.file_info.tags.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
            <Tag className="w-4 h-4" />
            Tags
          </h4>
          <div className="flex flex-wrap gap-1">
            {result.file_info.tags.slice(0, 10).map((tag, idx) => (
              <span key={idx} className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* External Link */}
      {result.vt_url && (
        <div className="pt-2">
          <a
            href={result.vt_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-blue-500 hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            View full report on VirusTotal
          </a>
        </div>
      )}
    </div>
  )
}

// MalwareBazaar Content Component
function MBContent({ result, onCopy, copied }: { result: MBAnalysisResult, onCopy: (text: string, id: string) => void, copied: string | null }) {
  const sample = result.sample
  if (!sample) return null

  return (
    <div className="space-y-4">
      {/* Sample Details */}
      <div>
        <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
          <Database className="w-4 h-4 text-purple-500" />
          Sample Details
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/5 p-2 rounded">
            <span className="text-xs text-muted-foreground block">Filename</span>
            <span className="text-xs font-medium text-foreground break-all">{sample.file_name || 'N/A'}</span>
          </div>
          <div className="bg-muted/5 p-2 rounded">
            <span className="text-xs text-muted-foreground block">File Size</span>
            <span className="text-xs font-medium text-foreground">{formatBytes(sample.file_size)}</span>
          </div>
          <div className="bg-muted/5 p-2 rounded">
            <span className="text-xs text-muted-foreground block">File Type</span>
            <span className="text-xs font-medium text-foreground break-all">{sample.file_type || 'N/A'}</span>
          </div>
          <div className="bg-muted/5 p-2 rounded">
            <span className="text-xs text-muted-foreground block">MIME Type</span>
            <span className="text-xs font-medium text-foreground">{sample.file_type_mime || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Signature & Tags */}
      {sample.signature && (
        <div>
          <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
            <Shield className="w-4 h-4 text-accent" />
            Signature
          </h4>
          <div className="bg-accent/10 text-accent p-2 rounded-lg text-sm font-medium">
            {sample.signature}
          </div>
        </div>
      )}

      {/* Tags */}
      {sample.tags && sample.tags.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
            <Tag className="w-4 h-4" />
            Tags
          </h4>
          <div className="flex flex-wrap gap-1">
            {sample.tags.slice(0, 10).map((tag, idx) => (
              <span key={idx} className="px-2 py-1 bg-purple-500/10 text-purple-500 rounded text-xs">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Hashes */}
      <div>
        <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
          <Hash className="w-4 h-4" />
          Hashes
        </h4>
        <div className="space-y-2">
          {sample.sha256_hash && (
            <HashRow label="SHA256" value={sample.sha256_hash} onCopy={() => onCopy(sample.sha256_hash!, 'sha256')} copied={copied === 'sha256'} />
          )}
          {sample.sha1_hash && (
            <HashRow label="SHA1" value={sample.sha1_hash} onCopy={() => onCopy(sample.sha1_hash!, 'sha1')} copied={copied === 'sha1'} />
          )}
          {sample.md5_hash && (
            <HashRow label="MD5" value={sample.md5_hash} onCopy={() => onCopy(sample.md5_hash!, 'md5')} copied={copied === 'md5'} />
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-muted/5 p-2 rounded">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            First Seen
          </span>
          <span className="text-xs font-medium text-foreground">{formatDate(sample.first_seen)}</span>
        </div>
        <div className="bg-muted/5 p-2 rounded">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Last Seen
          </span>
          <span className="text-xs font-medium text-foreground">{formatDate(sample.last_seen)}</span>
        </div>
      </div>

      {/* External Link */}
      {sample.sha256_hash && (
        <div className="pt-2">
          <a
            href={`https://bazaar.abuse.ch/sample/${sample.sha256_hash}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-purple-500 hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            View on MalwareBazaar
          </a>
        </div>
      )}
    </div>
  )
}

// Hybrid Analysis Content Component
function HAContent({ result, onCopy, copied }: { result: HAAnalysisResult, onCopy: (text: string, id: string) => void, copied: string | null }) {
  const verdictInfo = getVerdictInfo(result.verdict)

  return (
    <div className="space-y-4">
      {/* Verdict */}
      <div className={`p-3 rounded-lg border ${verdictInfo.bgColor} border-current/20`}>
        <div className="flex items-center gap-2">
          {verdictInfo.icon}
          <div>
            <span className={`text-sm font-medium ${verdictInfo.color}`}>{verdictInfo.label}</span>
            {result.vx_family && (
              <span className="text-xs text-muted-foreground ml-2">Family: {result.vx_family}</span>
            )}
          </div>
        </div>
      </div>

      {/* File Info */}
      <div>
        <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
          <FileText className="w-4 h-4 text-yellow-500" />
          File Information
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {result.last_file_name && (
            <div className="bg-muted/5 p-2 rounded">
              <span className="text-xs text-muted-foreground block">Filename</span>
              <span className="text-xs font-medium text-foreground break-all">{result.last_file_name}</span>
            </div>
          )}
          {result.size && (
            <div className="bg-muted/5 p-2 rounded">
              <span className="text-xs text-muted-foreground block">Size</span>
              <span className="text-xs font-medium text-foreground">{formatBytes(result.size)}</span>
            </div>
          )}
          {result.type && (
            <div className="bg-muted/5 p-2 rounded col-span-2">
              <span className="text-xs text-muted-foreground block">Type</span>
              <span className="text-xs font-medium text-foreground break-all">{result.type}</span>
            </div>
          )}
        </div>
      </div>

      {/* Hash */}
      <div>
        <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
          <Hash className="w-4 h-4" />
          SHA256
        </h4>
        <HashRow 
          label="SHA256" 
          value={result.sha256} 
          onCopy={() => onCopy(result.sha256, 'hash')} 
          copied={copied === 'hash'} 
        />
      </div>

      {/* Tags */}
      {result.tags && result.tags.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
            <Tag className="w-4 h-4" />
            Tags
          </h4>
          <div className="flex flex-wrap gap-1">
            {result.tags.slice(0, 10).map((tag, idx) => (
              <span key={idx} className="px-2 py-1 bg-yellow-500/10 text-yellow-500 rounded text-xs">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* MITRE ATT&CK */}
      {result.mitre_attcks && result.mitre_attcks.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
            <Target className="w-4 h-4 text-destructive" />
            MITRE ATT&CK Techniques
          </h4>
          <div className="space-y-1">
            {result.mitre_attcks.slice(0, 5).map((technique, idx) => (
              <div key={idx} className="text-xs bg-muted/5 p-2 rounded">
                <span className="font-medium text-foreground">{technique.technique}</span>
                <span className="text-muted-foreground ml-2">({technique.tactic})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* External Link */}
      {result.ha_url && (
        <div className="pt-2">
          <a
            href={result.ha_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-yellow-500 hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            View on Hybrid Analysis
          </a>
        </div>
      )}
    </div>
  )
}

// AlienVault OTX Content Component
function OTXContent({ result, onCopy, copied }: { result: OTXResult, onCopy: (text: string, id: string) => void, copied: string | null }) {
  const verdictInfo = getVerdictInfo(result.threat_level)

  return (
    <div className="space-y-4">
      {/* Threat Level */}
      <div className={`p-3 rounded-lg border ${verdictInfo.bgColor} border-current/20`}>
        <div className="flex items-center gap-2">
          {verdictInfo.icon}
          <span className={`text-sm font-medium ${verdictInfo.color}`}>{verdictInfo.label}</span>
        </div>
      </div>

      {/* General Info */}
      {result.sections.general && (
        <div>
          <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
            <Globe className="w-4 h-4 text-green-500" />
            General Information
          </h4>
          <div className="space-y-2 bg-muted/5 p-3 rounded-lg">
            {result.sections.general.type && (
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Type</span>
                <span className="text-xs text-foreground">{result.sections.general.type}</span>
              </div>
            )}
            {result.sections.general.asn && (
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">ASN</span>
                <span className="text-xs text-foreground">{result.sections.general.asn}</span>
              </div>
            )}
            {result.sections.general.country_name && (
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Country</span>
                <span className="text-xs text-foreground">{result.sections.general.country_name}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pulse Count */}
      {result.pulse_count > 0 && (
        <div>
          <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
            <Activity className="w-4 h-4" />
            Pulses ({result.pulse_count})
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {result.sections.general?.pulse_info?.pulses?.slice(0, 5).map((pulse, idx) => (
              <div key={idx} className="text-xs bg-muted/5 p-2 rounded">
                <div className="font-medium text-foreground">{pulse.name}</div>
                {pulse.description && (
                  <div className="text-muted-foreground mt-1 line-clamp-2">{pulse.description}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Malware Samples */}
      {result.malware_count > 0 && (
        <div>
          <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
            <Bug className="w-4 h-4 text-destructive" />
            Malware Samples ({result.malware_count})
          </h4>
          <div className="text-xs text-muted-foreground">
            {result.malware_count} associated malware samples found
          </div>
        </div>
      )}

      {/* External Link */}
      {result.otx_url && (
        <div className="pt-2">
          <a
            href={result.otx_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-green-500 hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            View on AlienVault OTX
          </a>
        </div>
      )}
    </div>
  )
}

// Helper Components
function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  const colorClasses = {
    destructive: 'bg-destructive/10 text-destructive border-destructive/20',
    accent: 'bg-accent/10 text-accent border-accent/20',
    green: 'bg-green-500/10 text-green-500 border-green-500/20',
    muted: 'bg-muted/10 text-muted-foreground border-border',
    primary: 'bg-primary/10 text-primary border-primary/20'
  }

  return (
    <div className={`p-2 border rounded-lg text-center ${colorClasses[color as keyof typeof colorClasses] || colorClasses.muted}`}>
      <div className="text-lg font-bold">{value}</div>
      <div className="text-xs">{label}</div>
    </div>
  )
}

function HashRow({ label, value, onCopy, copied }: { label: string; value: string; onCopy: () => void; copied: boolean }) {
  return (
    <div className="flex items-center justify-between bg-muted/5 p-2 rounded group">
      <div className="min-w-0 flex-1">
        <span className="text-xs text-muted-foreground mr-2">{label}:</span>
        <code className="text-xs font-mono text-foreground break-all">{value}</code>
      </div>
      <button
        onClick={onCopy}
        className="ml-2 p-1 hover:bg-muted/20 rounded flex-shrink-0"
        title={`Copy ${label}`}
      >
        <Copy className="w-3 h-3" />
      </button>
      {copied && (
        <span className="text-xs text-primary ml-2 animate-pulse">✓</span>
      )}
    </div>
  )
}

function Search({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  )
}

// Main Component
export default function ThreatIntelDashboard({
  fileHashes,
  onCopyJson,
  copied
}: ThreatIntelDashboardProps) {
  const [data, setData] = useState<ThreatIntelData>({
    virustotal: null,
    malwarebazaar: null,
    hybridanalysis: null,
    alienvault: null
  })
  const [status, setStatus] = useState<ServiceStatus>({
    virustotal: 'loading',
    malwarebazaar: 'loading',
    hybridanalysis: 'loading',
    alienvault: 'loading'
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const scanAllServices = async (forceRefresh = false) => {
    if (!fileHashes) return

    const hashToUse = fileHashes.sha256 || fileHashes.sha1 || fileHashes.md5

    // Check cache first if not forcing refresh
    if (!forceRefresh) {
      const cachedVT = threatCache.get('virustotal', hashToUse) as VTAnalysisResult | null
      const cachedMB = threatCache.get('malwarebazaar', hashToUse) as MBAnalysisResult | null
      const cachedHA = threatCache.get('hybridanalysis', hashToUse) as HAAnalysisResult | null
      const cachedOTX = threatCache.get('alienvault', hashToUse) as OTXResult | null

      setData({
        virustotal: cachedVT || null,
        malwarebazaar: cachedMB || null,
        hybridanalysis: cachedHA || null,
        alienvault: cachedOTX || null
      })
      
      setStatus({
        virustotal: cachedVT ? 'complete' : 'loading',
        malwarebazaar: cachedMB ? 'complete' : 'loading',
        hybridanalysis: cachedHA ? 'complete' : 'loading',
        alienvault: cachedOTX ? 'complete' : 'loading'
      })
    } else {
      setStatus({
        virustotal: 'loading',
        malwarebazaar: 'loading',
        hybridanalysis: 'loading',
        alienvault: 'loading'
      })
      setErrors({})
    }

    // Scan VirusTotal
    if (!data.virustotal || forceRefresh) {
      try {
        const vtResult = await virusTotalService.scanIndicator({
          indicator: hashToUse,
          type: 'hash',
          include_relationships: true
        })
        setData(prev => ({ ...prev, virustotal: vtResult }))
        setStatus(prev => ({ ...prev, virustotal: 'complete' }))
        threatCache.set('virustotal', hashToUse, vtResult)
      } catch (error) {
        setStatus(prev => ({ ...prev, virustotal: 'error' }))
        setErrors(prev => ({ ...prev, virustotal: error instanceof Error ? error.message : 'Failed to scan' }))
      }
    }

    // Scan MalwareBazaar
    if (!data.malwarebazaar || forceRefresh) {
      try {
        const mbResult = await malwareBazaarService.searchIndicator({
          query: hashToUse,
          type: 'hash'
        })
        setData(prev => ({ ...prev, malwarebazaar: mbResult }))
        setStatus(prev => ({ ...prev, malwarebazaar: 'complete' }))
        threatCache.set('malwarebazaar', hashToUse, mbResult)
      } catch (error) {
        setStatus(prev => ({ ...prev, malwarebazaar: 'error' }))
        setErrors(prev => ({ ...prev, malwarebazaar: error instanceof Error ? error.message : 'Failed to scan' }))
      }
    }

    // Scan Hybrid Analysis
    if (!data.hybridanalysis || forceRefresh) {
      try {
        const haResult = await hybridAnalysisService.scanIndicator({
          indicator: hashToUse,
          type: 'hash',
          include_metadata: true,
          include_summary: true
        })
        setData(prev => ({ ...prev, hybridanalysis: haResult }))
        setStatus(prev => ({ ...prev, hybridanalysis: 'complete' }))
        threatCache.set('hybridanalysis', hashToUse, haResult)
      } catch (error) {
        setStatus(prev => ({ ...prev, hybridanalysis: 'error' }))
        setErrors(prev => ({ ...prev, hybridanalysis: error instanceof Error ? error.message : 'Failed to scan' }))
      }
    }

    // Scan AlienVault OTX
    if (!data.alienvault || forceRefresh) {
      try {
        const otxResult = await alienvaultOTXService.scanIndicator({
          indicator: hashToUse,
          type: 'file',
          include_all_sections: true
        })
        setData(prev => ({ ...prev, alienvault: otxResult }))
        setStatus(prev => ({ ...prev, alienvault: 'complete' }))
        threatCache.set('alienvault', hashToUse, otxResult)
      } catch (error) {
        setStatus(prev => ({ ...prev, alienvault: 'error' }))
        setErrors(prev => ({ ...prev, alienvault: error instanceof Error ? error.message : 'Failed to scan' }))
      }
    }
  }

  // Initial scan
  useEffect(() => {
    if (fileHashes) {
      scanAllServices()
    }
  }, [fileHashes])

  if (!fileHashes) {
    return (
      <div className="glass border border-border rounded-xl p-8 text-center">
        <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">No file hashes available for threat intelligence lookup</p>
      </div>
    )
  }

  const completedCount = Object.values(status).filter(s => s === 'complete').length
  const threatsFound = Object.values(data).filter(d => d?.found).length

  return (
    <div className="space-y-6">
      {/* Header - Single header only */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Globe className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Threat Intelligence</h2>
            <p className="text-sm text-muted-foreground">
              Real-time threat intelligence from multiple sources
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => scanAllServices(true)}
            className="px-3 py-1.5 border border-border rounded-lg hover:bg-muted/20 transition-colors flex items-center gap-2 text-sm"
          >
            <RefreshCw className="w-3 h-3" />
            Refresh All
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
        </div>
      </div>

      {/* Service Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* VirusTotal */}
        <ServiceCard
          name="VirusTotal"
          icon={<Shield className="w-4 h-4 text-blue-500" />}
          status={status.virustotal}
          result={data.virustotal}
          error={errors.virustotal}
          onRetry={() => {
            setStatus(prev => ({ ...prev, virustotal: 'loading' }))
            virusTotalService.scanIndicator({
              indicator: fileHashes.sha256,
              type: 'hash',
              include_relationships: true
            }).then(result => {
              setData(prev => ({ ...prev, virustotal: result }))
              setStatus(prev => ({ ...prev, virustotal: 'complete' }))
              threatCache.set('virustotal', fileHashes.sha256, result)
            }).catch(error => {
              setStatus(prev => ({ ...prev, virustotal: 'error' }))
              setErrors(prev => ({ ...prev, virustotal: error.message }))
            })
          }}
        />

        {/* MalwareBazaar */}
        <ServiceCard
          name="MalwareBazaar"
          icon={<Database className="w-4 h-4 text-purple-500" />}
          status={status.malwarebazaar}
          result={data.malwarebazaar}
          error={errors.malwarebazaar}
          onRetry={() => {
            setStatus(prev => ({ ...prev, malwarebazaar: 'loading' }))
            malwareBazaarService.searchIndicator({
              query: fileHashes.sha256,
              type: 'hash'
            }).then(result => {
              setData(prev => ({ ...prev, malwarebazaar: result }))
              setStatus(prev => ({ ...prev, malwarebazaar: 'complete' }))
              threatCache.set('malwarebazaar', fileHashes.sha256, result)
            }).catch(error => {
              setStatus(prev => ({ ...prev, malwarebazaar: 'error' }))
              setErrors(prev => ({ ...prev, malwarebazaar: error.message }))
            })
          }}
        />

        {/* Hybrid Analysis */}
        <ServiceCard
          name="Hybrid Analysis"
          icon={<Brain className="w-4 h-4 text-yellow-500" />}
          status={status.hybridanalysis}
          result={data.hybridanalysis}
          error={errors.hybridanalysis}
          onRetry={() => {
            setStatus(prev => ({ ...prev, hybridanalysis: 'loading' }))
            hybridAnalysisService.scanIndicator({
              indicator: fileHashes.sha256,
              type: 'hash',
              include_metadata: true,
              include_summary: true
            }).then(result => {
              setData(prev => ({ ...prev, hybridanalysis: result }))
              setStatus(prev => ({ ...prev, hybridanalysis: 'complete' }))
              threatCache.set('hybridanalysis', fileHashes.sha256, result)
            }).catch(error => {
              setStatus(prev => ({ ...prev, hybridanalysis: 'error' }))
              setErrors(prev => ({ ...prev, hybridanalysis: error.message }))
            })
          }}
        />

        {/* AlienVault OTX */}
        <ServiceCard
          name="AlienVault OTX"
          icon={<Globe className="w-4 h-4 text-green-500" />}
          status={status.alienvault}
          result={data.alienvault}
          error={errors.alienvault}
          onRetry={() => {
            setStatus(prev => ({ ...prev, alienvault: 'loading' }))
            alienvaultOTXService.scanIndicator({
              indicator: fileHashes.sha256,
              type: 'file',
              include_all_sections: true
            }).then(result => {
              setData(prev => ({ ...prev, alienvault: result }))
              setStatus(prev => ({ ...prev, alienvault: 'complete' }))
              threatCache.set('alienvault', fileHashes.sha256, result)
            }).catch(error => {
              setStatus(prev => ({ ...prev, alienvault: 'error' }))
              setErrors(prev => ({ ...prev, alienvault: error.message }))
            })
          }}
        />
      </div>

      {/* Summary Stats */}
      <div className="glass border border-border rounded-xl p-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{completedCount}/4</p>
            <p className="text-xs text-muted-foreground">Sources Completed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{threatsFound}</p>
            <p className="text-xs text-muted-foreground">Threats Found</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-mono text-xs text-foreground break-all max-w-[200px] mx-auto">
              {fileHashes.sha256.substring(0, 16)}...
            </p>
            <p className="text-xs text-muted-foreground mt-1">SHA256</p>
          </div>
        </div>
      </div>
    </div>
  )
}