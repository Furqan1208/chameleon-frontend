// components/threat-intel/VTResults.tsx
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
  Link as LinkIcon,
  FolderTree,
  Activity,
  Users,
  Network,
  Cpu,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';
import type { VTAnalysisResult } from '@/lib/threat-intel/vt-types';

interface VTResultsProps {
  results: VTAnalysisResult[];
}

export function VTResults({ results }: VTResultsProps) {
  const [expandedResult, setExpandedResult] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleExpand = (id: string) => {
    setExpandedResult(expandedResult === id ? null : id);
  };

  const getThreatColor = (threatLevel: VTAnalysisResult['threat_level']) => {
    switch (threatLevel) {
      case 'high':
        return 'text-destructive border-destructive/30 bg-destructive/5';
      case 'medium':
        return 'text-accent border-accent/30 bg-accent/5';
      case 'low':
        return 'text-yellow-500 border-yellow-500/30 bg-yellow-500/5';
      case 'clean':
        return 'text-primary border-primary/30 bg-primary/5';
      default:
        return 'text-muted-foreground border-border bg-muted/5';
    }
  };

  const getThreatIcon = (threatLevel: VTAnalysisResult['threat_level']) => {
    switch (threatLevel) {
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-destructive" />;
      case 'medium':
        return <AlertTriangle className="w-5 h-5 text-accent" />;
      case 'low':
        return <Shield className="w-5 h-5 text-yellow-500" />;
      case 'clean':
        return <CheckCircle className="w-5 h-5 text-primary" />;
      default:
        return <Shield className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getIndicatorIcon = (type: VTAnalysisResult['ioc_type']) => {
    switch (type) {
      case 'hash':
        return <Hash className="w-4 h-4" />;
      case 'ip':
        return <Globe className="w-4 h-4" />;
      case 'domain':
        return <Globe className="w-4 h-4" />;
      case 'url':
        return <LinkIcon className="w-4 h-4" />;
      case 'filename':
        return <FileText className="w-4 h-4" />;
      default:
        return <Cpu className="w-4 h-4" />;
    }
  };

  const formatBytes = (bytes?: number): string => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Recent Scans ({results.length})
        </h3>
        <div className="text-sm text-muted-foreground">
          {results.filter(r => r.found).length} found • {results.filter(r => !r.found).length} not found
        </div>
      </div>

      {results.map((result, index) => {
        const isExpanded = expandedResult === `result-${index}`;
        const threatColor = getThreatColor(result.threat_level);
        
        return (
          <div
            key={`result-${index}`}
            className={`glass border rounded-xl overflow-hidden transition-all duration-300 ${threatColor}`}
          >
            {/* Result Header */}
            <div className="p-4 cursor-pointer" onClick={() => toggleExpand(`result-${index}`)}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="p-2 rounded-lg bg-black/10">
                    {getThreatIcon(result.threat_level)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex items-center gap-1.5">
                        {getIndicatorIcon(result.ioc_type)}
                        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          {result.ioc_type}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${
                        result.threat_level === 'high' ? 'bg-destructive/20 text-destructive' :
                        result.threat_level === 'medium' ? 'bg-accent/20 text-accent' :
                        result.threat_level === 'low' ? 'bg-yellow-500/20 text-yellow-500' :
                        result.threat_level === 'clean' ? 'bg-primary/20 text-primary' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {result.threat_level} threat
                      </span>
                    </div>
                    
                    <p className="font-mono text-sm break-all mb-1">
                      {result.ioc}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        <span>{result.detection_stats.detection_ratio}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BarChart3 className="w-3 h-3" />
                        <span>Score: {result.threat_score.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(result.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(result.ioc, `copy-ioc-${index}`);
                    }}
                    className="p-1.5 rounded hover:bg-black/10 transition-colors"
                    title="Copy IOC"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <a
                    href={result.vt_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 rounded hover:bg-black/10 transition-colors"
                    title="View on VirusTotal"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    className="p-1.5 rounded hover:bg-black/10 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(`result-${index}`);
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
              
              {copied === `copy-ioc-${index}` && (
                <div className="mt-2 text-xs text-primary animate-pulse">
                  ✓ Copied to clipboard
                </div>
              )}
            </div>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="border-t border-border/50 bg-black/5">
                <div className="p-4 space-y-6">
                  {/* Detection Stats */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Detection Statistics
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                      <StatItem label="Malicious" value={result.detection_stats.malicious} color="destructive" />
                      <StatItem label="Suspicious" value={result.detection_stats.suspicious} color="accent" />
                      <StatItem label="Harmless" value={result.detection_stats.harmless} color="primary" />
                      <StatItem label="Undetected" value={result.detection_stats.undetected} color="muted" />
                      <StatItem label="Timeout" value={result.detection_stats.timeout} color="muted" />
                      <StatItem label="Total" value={result.detection_stats.total} color="foreground" />
                    </div>
                  </div>

                  {/* File Information */}
                  {result.file_info && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        File Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoItem label="Filename" value={result.file_info.filename || 'N/A'} icon={<FileText className="w-3 h-3" />} />
                        <InfoItem label="File Type" value={result.file_info.type_description || 'N/A'} icon={<Cpu className="w-3 h-3" />} />
                        <InfoItem label="File Size" value={formatBytes(result.file_info.size)} icon={<Download className="w-3 h-3" />} />
                        <InfoItem label="Reputation" value={result.file_info.reputation?.toString() || '0'} icon={<Users className="w-3 h-3" />} />
                        <InfoItem label="First Seen" value={formatDate(result.file_info.first_seen)} icon={<Eye className="w-3 h-3" />} />
                        <InfoItem label="Last Analysis" value={formatDate(result.file_info.last_analysis)} icon={<EyeOff className="w-3 h-3" />} />
                      </div>
                      {result.file_info.tags.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm text-muted-foreground mb-2">Tags:</p>
                          <div className="flex flex-wrap gap-1">
                            {result.file_info.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Network Information */}
                  {result.network_info && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Network Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {result.network_info.asn && (
                          <InfoItem label="ASN" value={`AS${result.network_info.asn}`} icon={<Network className="w-3 h-3" />} />
                        )}
                        {result.network_info.as_owner && (
                          <InfoItem label="AS Owner" value={result.network_info.as_owner} icon={<Users className="w-3 h-3" />} />
                        )}
                        {result.network_info.country && (
                          <InfoItem label="Country" value={result.network_info.country} icon={<Globe className="w-3 h-3" />} />
                        )}
                        {result.network_info.registrar && (
                          <InfoItem label="Registrar" value={result.network_info.registrar} icon={<FolderTree className="w-3 h-3" />} />
                        )}
                      </div>
                      {result.network_info.categories.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm text-muted-foreground mb-2">Categories:</p>
                          <div className="flex flex-wrap gap-1">
                            {result.network_info.categories.map((category, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs"
                              >
                                {category}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Behavioral Indicators */}
                  {result.behavioral_indicators.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Behavioral Indicators
                      </h4>
                      <div className="space-y-2">
                        {result.behavioral_indicators.map((indicator, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-sm"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/50"></div>
                            <span className="text-foreground/90">{indicator}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Relationships */}
                  {Object.keys(result.relationships).length > 0 && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Network className="w-4 h-4" />
                        Related Indicators
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(result.relationships).map(([key, values]) => (
                          values.length > 0 && (
                            <div key={key} className="space-y-2">
                              <p className="text-sm font-medium text-foreground capitalize">
                                {key.replace(/_/g, ' ')} ({values.length})
                              </p>
                              <div className="max-h-32 overflow-y-auto">
                                {values.slice(0, 10).map((value, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between p-2 text-xs rounded bg-black/5 hover:bg-black/10 transition-colors"
                                  >
                                    <code className="font-mono truncate">{value}</code>
                                    <button
                                      onClick={() => handleCopy(value, `copy-rel-${index}-${idx}`)}
                                      className="p-1 rounded hover:bg-black/20 transition-colors"
                                    >
                                      <Copy className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                                {values.length > 10 && (
                                  <p className="text-xs text-muted-foreground italic mt-2">
                                    + {values.length - 10} more
                                  </p>
                                )}
                              </div>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Raw Data Toggle */}
                  <div>
                    <details className="group">
                      <summary className="cursor-pointer text-sm font-medium text-foreground hover:text-primary transition-colors flex items-center gap-2">
                        <Cpu className="w-4 h-4" />
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
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Helper components
function StatItem({ label, value, color }: { label: string; value: number; color: string }) {
  const colorClasses = {
    destructive: 'text-destructive border-destructive/20 bg-destructive/5',
    accent: 'text-accent border-accent/20 bg-accent/5',
    primary: 'text-primary border-primary/20 bg-primary/5',
    muted: 'text-muted-foreground border-border bg-muted/5',
    foreground: 'text-foreground border-border bg-muted/5'
  };

  return (
    <div className={`border rounded-lg p-3 text-center ${colorClasses[color as keyof typeof colorClasses]}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

function InfoItem({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <p className="text-foreground font-medium">{value}</p>
    </div>
  );
}

function Clock({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function BarChart3({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 20V10" />
      <path d="M12 20V4" />
      <path d="M6 20v-6" />
    </svg>
  );
}