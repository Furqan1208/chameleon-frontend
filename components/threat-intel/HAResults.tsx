// components/threat-intel/HAResults.tsx
'use client';

import { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  Shield, 
  ChevronDown, 
  ChevronUp,
  Copy,
  ExternalLink,
  Globe,
  FileText,
  Hash,
  Cpu,
  Download,
  Eye,
  EyeOff,
  Network,
  Activity,
  Users,
  Clock,
  Code,
  Terminal,
  Layers,
  Database,
  BarChart3,
  FileSearch,
  Tag,
  Award,
  Flag,
  Link,
  FileArchive,
  Settings,
  BookOpen,
  Target,
  Zap,
  Lock,
  Unlock,
  Server,
  HardDrive,
  Skull as SkullIcon,
  Search,
  Filter,
  BarChart,
  PieChart,
  LineChart,
  Flame,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import type { HAAnalysisResult } from '@/lib/threat-intel/ha-types';
import { formatFileSize, formatDate, getVerdictInfo, getThreatLevelColor, getThreatLevelLabel, getMimeType } from '@/lib/threat-intel/ha-utils';

interface HAResultsProps {
  results: HAAnalysisResult[];
  selectedHash?: string | null;
  onSelectHash?: (hash: string | null) => void;
}

export function HAResults({ results, selectedHash, onSelectHash }: HAResultsProps) {
  const [expandedResult, setExpandedResult] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleExpand = (hash: string) => {
    if (expandedResult === hash) {
      setExpandedResult(null);
      onSelectHash?.(null);
    } else {
      setExpandedResult(hash);
      onSelectHash?.(hash);
    }
  };

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Analysis Results ({results.length})
        </h3>
        <div className="text-sm text-muted-foreground">
          {results.filter(r => r.found).length} found • {results.filter(r => !r.found).length} not found
        </div>
      </div>

      {results.map((result, index) => {
        const isExpanded = expandedResult === result.sha256;
        const verdictInfo = getVerdictInfo(result.verdict || result.verdict_numeric || 'unknown');
        const threatColor = getThreatLevelColor(result.threat_score_computed);
        
        return (
          <div
            key={`result-${index}`}
            className={`glass border rounded-xl overflow-hidden transition-all duration-300 ${
              result.threat_level === 'malicious' ? 'border-destructive/30' :
              result.threat_level === 'suspicious' ? 'border-accent/30' :
              result.threat_level === 'whitelisted' ? 'border-green-500/30' :
              'border-border'
            }`}
          >
            <div className="p-4 cursor-pointer" onClick={() => toggleExpand(result.sha256)}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`p-2 rounded-lg ${verdictInfo.bgColor}`}>
                    <div className={verdictInfo.color}>
                      {verdictInfo.icon}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex items-center gap-1.5">
                        <Hash className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          {result.sha256.length === 64 ? 'SHA256' :
                           result.sha256.length === 40 ? 'SHA1' :
                           result.sha256.length === 32 ? 'MD5' : 'HASH'}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${verdictInfo.bgColor} ${verdictInfo.color}`}>
                        {verdictInfo.label}
                      </span>
                      {result.threat_score_computed && result.threat_score_computed > 0 && (
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${threatColor} bg-black/10`}>
                          Score: {result.threat_score_computed.toFixed(0)}
                        </span>
                      )}
                    </div>
                    
                    <p className="font-mono text-sm break-all mb-1">
                      {result.sha256.substring(0, 16)}...{result.sha256.substring(48)}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {result.last_file_name && (
                        <div className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          <span className="truncate max-w-[200px]">{result.last_file_name}</span>
                        </div>
                      )}
                      {result.size && (
                        <div className="flex items-center gap-1">
                          <Database className="w-3 h-3" />
                          <span>{formatFileSize(result.size)}</span>
                        </div>
                      )}
                      {result.type && (
                        <div className="flex items-center gap-1">
                          <Code className="w-3 h-3" />
                          <span className="truncate max-w-[200px]">{result.type}</span>
                        </div>
                      )}
                      {result.analysis_date && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(result.analysis_date)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(result.sha256, `copy-hash-${index}`);
                    }}
                    className="p-1.5 rounded hover:bg-black/10 transition-colors"
                    title="Copy Hash"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <a
                    href={result.ha_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 rounded hover:bg-black/10 transition-colors"
                    title="View on Hybrid Analysis"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    className="p-1.5 rounded hover:bg-black/10 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(result.sha256);
                    }}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              
              {copied === `copy-hash-${index}` && (
                <div className="mt-2 text-xs text-primary animate-pulse">
                  ✓ Hash copied to clipboard
                </div>
              )}
            </div>

            {isExpanded && (
              <div className="border-t border-border/50 bg-black/5">
                <div className="p-6 space-y-8">
                  {/* File Information Section */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      File Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <InfoItem 
                        label="SHA256" 
                        value={result.sha256}
                        icon={<Hash className="w-4 h-4" />}
                        copyable
                      />
                      {((result as any).md5 || (result.file_metadata as any)?.md5 || result.raw_data?.overview?.md5) && (
                        <InfoItem
                          label="MD5"
                          value={(result as any).md5 || (result.file_metadata as any)?.md5 || result.raw_data?.overview?.md5}
                          icon={<Hash className="w-4 h-4" />}
                          copyable
                        />
                      )}
                      {((result as any).sha1 || (result.file_metadata as any)?.sha1 || result.raw_data?.overview?.sha1) && (
                        <InfoItem
                          label="SHA1"
                          value={(result as any).sha1 || (result.file_metadata as any)?.sha1 || result.raw_data?.overview?.sha1}
                          icon={<Hash className="w-4 h-4" />}
                          copyable
                        />
                      )}
                      <InfoItem 
                        label="Filename" 
                        value={result.last_file_name || 'Unknown'}
                        icon={<FileText className="w-4 h-4" />}
                      />
                      <InfoItem 
                        label="File Size" 
                        value={result.size ? formatFileSize(result.size) : 'Unknown'}
                        icon={<Database className="w-4 h-4" />}
                      />
                      <InfoItem 
                        label="File Type" 
                        value={result.type || 'Unknown'}
                        icon={<Code className="w-4 h-4" />}
                      />
                      <InfoItem 
                        label="MIME Type" 
                        value={getMimeType(result.raw_data?.overview)}
                        icon={<FileArchive className="w-4 h-4" />}
                      />
                      {result.architecture && (
                        <InfoItem 
                          label="Architecture" 
                          value={result.architecture}
                          icon={<Server className="w-4 h-4" />}
                        />
                      )}
                      {result.vx_family && (
                        <InfoItem 
                          label="Malware Family" 
                          value={result.vx_family}
                          icon={<SkullIcon className="w-4 h-4" />}
                        />
                      )}
                    </div>
                  </div>

                  {/* Threat Assessment Section */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-destructive" />
                      Threat Assessment
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <ThreatStat 
                        label="Threat Score" 
                        value={result.threat_score_computed || 0}
                        max={100}
                        color={threatColor}
                        icon={<BarChart3 className="w-5 h-5" />}
                        showValue={result.threat_score_computed !== undefined}
                      />
                      <ThreatStat 
                        label="Verdict" 
                        value={verdictInfo.label}
                        color={verdictInfo.color}
                        icon={<Award className="w-5 h-5" />}
                      />
                      {result.multiscan_result !== undefined && (
                        <ThreatStat 
                          label="Multiscan Result" 
                          value={`${result.multiscan_result}/100`}
                          icon={<Shield className="w-5 h-5" />}
                        />
                      )}
                      <ThreatStat 
                        label="Sandbox Analysis" 
                        value={result.reports?.length || 0}
                        sublabel="environments"
                        icon={<Cpu className="w-5 h-5" />}
                      />
                    </div>
                    
                    {(result.tags || []).length > 0 && (
                      <div className="mt-6">
                        <h5 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                          <Tag className="w-4 h-4" />
                          Tags
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {(result.tags || []).map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Behavioral Analysis Section */}
                  {(((result.mitre_attcks || []).length > 0) || ((result.signatures || []).length > 0)) && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-accent" />
                        Behavioral Analysis
                      </h4>
                      
                      {(result.mitre_attcks || []).length > 0 && (
                        <div className="mb-6">
                          <h5 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            MITRE ATT&CK Techniques ({(result.mitre_attcks || []).length})
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {(result.mitre_attcks || []).slice(0, 8).map((attack, idx) => (
                              <div key={idx} className="p-3 border border-border rounded-lg bg-black/5">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-foreground text-sm">
                                    {attack.technique}
                                  </span>
                                  {attack.attck_id && (
                                    <span className="text-xs px-2 py-1 bg-muted rounded">
                                      {attack.attck_id}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">{attack.tactic}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {(result.signatures || []).length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                            <Flag className="w-4 h-4" />
                            Detection Signatures ({(result.signatures || []).length})
                          </h5>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {(result.signatures || [])
                              .filter(sig => sig.threat_level >= 2)
                              .slice(0, 10)
                              .map((signature, idx) => (
                                <div
                                  key={idx}
                                  className={`p-3 rounded-lg border ${
                                    signature.threat_level >= 3 ? 'border-destructive/30 bg-destructive/5' :
                                    signature.threat_level === 2 ? 'border-accent/30 bg-accent/5' :
                                    'border-border bg-black/5'
                                  }`}
                                >
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <p className="font-medium text-foreground text-sm">
                                        {signature.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {signature.description}
                                      </p>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded ${
                                      signature.threat_level >= 3 ? 'bg-destructive/20 text-destructive' :
                                      signature.threat_level === 2 ? 'bg-accent/20 text-accent' :
                                      'bg-muted text-muted-foreground'
                                    }`}>
                                      Level {signature.threat_level}
                                    </span>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Network Analysis Section */}
                  {(((result.summary as any)?.domains || [])?.length > 0 || ((result.summary as any)?.hosts || [])?.length > 0) && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-blue-500" />
                        Network Analysis
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {((result.summary as any)?.domains || [])?.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-foreground mb-3">
                              Contacted Domains ({((result.summary as any)?.domains || []).length})
                            </h5>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {((result.summary as any)?.domains || []).slice(0, 10).map((domain: string, idx: number) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between p-2 text-xs rounded bg-black/5 hover:bg-black/10 transition-colors"
                                >
                                  <code className="font-mono truncate">{domain}</code>
                                  <button
                                    onClick={() => handleCopy(domain, `copy-domain-${index}-${idx}`)}
                                    className="p-1 rounded hover:bg-black/20 transition-colors"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {((result.summary as any)?.hosts || [])?.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-foreground mb-3">
                              Contacted Hosts ({((result.summary as any)?.hosts || []).length})
                            </h5>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {((result.summary as any)?.hosts || []).slice(0, 10).map((host: string, idx: number) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between p-2 text-xs rounded bg-black/5 hover:bg-black/10 transition-colors"
                                >
                                  <code className="font-mono truncate">{host}</code>
                                  <button
                                    onClick={() => handleCopy(host, `copy-host-${index}-${idx}`)}
                                    className="p-1 rounded hover:bg-black/20 transition-colors"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Sandbox Reports */}
                  {(result.reports || []).length > 0 && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Cpu className="w-5 h-5 text-purple-500" />
                        Sandbox Environments ({(result.reports || []).length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(result.reports || []).slice(0, 6).map((report, idx) => (
                          <div key={idx} className="p-3 border border-border rounded-lg hover:border-primary/30 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-foreground text-sm">
                                {report.environment_description || `Env ${report.environment_id}`}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded capitalize ${
                                report.verdict === 'malicious' ? 'bg-destructive/20 text-destructive' :
                                report.verdict === 'suspicious' ? 'bg-accent/20 text-accent' :
                                report.verdict === 'whitelisted' ? 'bg-green-500/20 text-green-500' :
                                report.verdict === 'no specific threat' || report.verdict === 'no_specific_threat' ? 'bg-yellow-500/20 text-yellow-600' :
                                'bg-muted text-muted-foreground'
                              }`}>
                                {report.verdict || report.state}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>ID: {report.id?.substring(0, 8)}...</span>
                              {report.state === 'SUCCESS' && report.id && (
                                <a
                                  href={`/dashboard/threat-intel/hybridanalysis/report/${report.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline flex items-center gap-1"
                                >
                                  View Details
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.raw_data && (
                    <div>
                      <details className="group">
                        <summary className="cursor-pointer text-sm font-medium text-foreground hover:text-primary transition-colors flex items-center gap-2">
                          <Code className="w-4 h-4" />
                          View Raw Data
                          <span className="ml-auto group-open:rotate-90 transition-transform">→</span>
                        </summary>
                        <div className="mt-3 p-3 bg-black/10 rounded-lg overflow-x-auto">
                          <pre className="text-xs font-mono text-foreground/80">
                            {JSON.stringify(result.raw_data, null, 2)}
                          </pre>
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function InfoItem({ 
  label, 
  value, 
  icon, 
  copyable = false 
}: { 
  label: string; 
  value: string; 
  icon: React.ReactNode;
  copyable?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        <span>{label}</span>
        {copyable && (
          <button
            onClick={handleCopy}
            className="ml-auto p-1 hover:bg-black/10 rounded transition-colors"
            title="Copy"
          >
            <Copy className="w-3 h-3" />
          </button>
        )}
      </div>
      <p className="text-foreground font-medium font-mono text-sm break-all">
        {value}
        {copied && (
          <span className="ml-2 text-xs text-primary animate-pulse">✓ Copied</span>
        )}
      </p>
    </div>
  );
}

function ThreatStat({ 
  label, 
  value, 
  max, 
  color = '', 
  icon, 
  sublabel,
  showValue = true
}: { 
  label: string; 
  value: any;
  max?: number;
  color?: string;
  icon: React.ReactNode;
  sublabel?: string;
  showValue?: boolean;
}) {
  const displayValue = showValue ? value : '-';
  
  return (
    <div className="border border-border rounded-lg p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${color ? `${color}/20` : 'bg-primary/10'}`}>
          <div className={color || 'text-primary'}>
            {icon}
          </div>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className={`text-2xl font-bold ${color}`}>
            {typeof value === 'number' && max ? (
              <>
                {displayValue}
                <span className="text-lg text-muted-foreground">/{max}</span>
              </>
            ) : (
              displayValue
            )}
          </p>
          {sublabel && (
            <p className="text-xs text-muted-foreground">{sublabel}</p>
          )}
        </div>
      </div>
    </div>
  );
}