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
import type { VTAnalysisResult } from '@/lib/types/virustotal.types';

interface VTResultsProps {
  results: VTAnalysisResult[];
}

export function VTResults({ results }: VTResultsProps) {
  const [expandedResult, setExpandedResult] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [expandedRawDataSections, setExpandedRawDataSections] = useState<Record<string, Record<string, boolean>>>({});

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleRawDataSection = (resultId: string, section: string) => {
    setExpandedRawDataSections(prev => ({
      ...prev,
      [resultId]: {
        ...prev[resultId],
        [section]: !prev[resultId]?.[section]
      }
    }));
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
            {/* Result Header - Enhanced */}
            <div className="relative p-6 cursor-pointer hover:bg-black/5 transition-colors" onClick={() => toggleExpand(`result-${index}`)}>
              {/* Gradient background based on threat level */}
              <div className={`absolute inset-0 opacity-5 pointer-events-none ${
                result.threat_level === 'high' ? 'bg-gradient-to-r from-destructive via-transparent' :
                result.threat_level === 'medium' ? 'bg-gradient-to-r from-accent via-transparent' :
                result.threat_level === 'low' ? 'bg-gradient-to-r from-yellow-500 via-transparent' :
                'bg-gradient-to-r from-primary via-transparent'
              }`}></div>

              <div className="relative flex items-start justify-between gap-4">
                {/* Left Section - Threat Grade & Indicator Info */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {/* Threat Grade Badge */}
                  <div className={`flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center font-bold text-2xl flex items-center justify-center ${
                    result.threat_level === 'high' ? 'bg-gradient-to-br from-destructive to-destructive/60 text-white' :
                    result.threat_level === 'medium' ? 'bg-gradient-to-br from-accent to-accent/60 text-white' :
                    result.threat_level === 'low' ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white' :
                    'bg-gradient-to-br from-primary to-primary/60 text-white'
                  }`}>
                    {result.threat_level === 'high' ? '🔴' : result.threat_level === 'medium' ? '🟠' : result.threat_level === 'low' ? '🟡' : '✓'}
                  </div>

                  {/* Primary Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        {getIndicatorIcon(result.ioc_type)}
                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                          {result.ioc_type}
                        </span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                        result.threat_level === 'high' ? 'bg-destructive/25 text-destructive' :
                        result.threat_level === 'medium' ? 'bg-accent/25 text-accent' :
                        result.threat_level === 'low' ? 'bg-yellow-500/25 text-yellow-600' :
                        result.threat_level === 'clean' ? 'bg-primary/25 text-primary' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {result.threat_level} threat
                      </span>
                    </div>
                    
                    <p className="font-mono text-lg font-bold break-all mb-3 text-foreground">
                      {result.ioc}
                    </p>
                    
                    {/* Key Stats Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-primary/60" />
                        <div>
                          <p className="text-xs text-muted-foreground">Detection</p>
                          <p className="font-bold text-foreground">{result.detection_stats.detection_ratio}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-accent/60" />
                        <div>
                          <p className="text-xs text-muted-foreground">Risk Score</p>
                          <p className="font-bold text-foreground">{result.threat_score.toFixed(1)}/100</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-primary/60" />
                        <div>
                          <p className="text-xs text-muted-foreground">Status</p>
                          <p className="font-bold text-foreground capitalize">{result.found ? 'Found' : 'Not Found'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary/60" />
                        <div>
                          <p className="text-xs text-muted-foreground">Scanned</p>
                          <p className="font-bold text-foreground text-xs">{formatDate(result.timestamp).split(',')[0]}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Right Section - Actions */}
                <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(result.ioc, `copy-ioc-${index}`);
                    }}
                    className="p-2.5 rounded-lg hover:bg-primary/10 transition-colors"
                    title="Copy IOC"
                  >
                    {copied === `copy-ioc-${index}` ? (
                      <span className="text-primary font-bold">✓</span>
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <a
                    href={result.vt_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2.5 rounded-lg hover:bg-primary/10 transition-colors"
                    title="View on VirusTotal"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    className="p-2.5 rounded-lg hover:bg-primary/10 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(`result-${index}`);
                    }}
                  >
                    {expandedResult === `result-${index}` ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="border-t border-border/50 bg-black/5">
                <div className="p-4 space-y-6">
                  {/* Detection Stats with Progress Bars */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Engine Detection Breakdown
                    </h4>
                    <div className="space-y-4">
                      {/* Overall Detection Percentage */}
                      <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-foreground">Overall Detection Rate</span>
                          <span className="text-2xl font-bold text-primary">
                            {result.detection_stats.total > 0 
                              ? Math.round(((result.detection_stats.malicious + result.detection_stats.suspicious) / result.detection_stats.total) * 100)
                              : 0}%
                          </span>
                        </div>
                        <div className="w-full bg-black/20 rounded-full h-2.5 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-primary to-accent h-full rounded-full transition-all duration-500"
                            style={{
                              width: result.detection_stats.total > 0 
                                ? ((result.detection_stats.malicious + result.detection_stats.suspicious) / result.detection_stats.total * 100)
                                : 0
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Individual Detection Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <DetectionStatBar 
                          label="Malicious" 
                          value={result.detection_stats.malicious} 
                          total={result.detection_stats.total}
                          color="destructive"
                          icon="🔴"
                        />
                        <DetectionStatBar 
                          label="Suspicious" 
                          value={result.detection_stats.suspicious} 
                          total={result.detection_stats.total}
                          color="accent"
                          icon="🟠"
                        />
                        <DetectionStatBar 
                          label="Harmless" 
                          value={result.detection_stats.harmless} 
                          total={result.detection_stats.total}
                          color="primary"
                          icon="✓"
                        />
                        <DetectionStatBar 
                          label="Undetected" 
                          value={result.detection_stats.undetected} 
                          total={result.detection_stats.total}
                          color="muted"
                          icon="?"
                        />
                        {result.detection_stats.timeout > 0 && (
                          <DetectionStatBar 
                            label="Timeout" 
                            value={result.detection_stats.timeout} 
                            total={result.detection_stats.total}
                            color="muted"
                            icon="⏱"
                          />
                        )}
                        <DetectionStatBar 
                          label="Total" 
                          value={result.detection_stats.total} 
                          total={result.detection_stats.total}
                          color="foreground"
                          icon="📊"
                        />
                      </div>
                    </div>
                  </div>

                  {/* File Information - Enhanced */}
                  {result.file_info && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        File Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
                          <p className="text-xs text-muted-foreground mb-1">Filename</p>
                          <p className="font-bold text-foreground break-all">{result.file_info.filename || 'N/A'}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20">
                          <p className="text-xs text-muted-foreground mb-1">File Type</p>
                          <p className="font-bold text-foreground">{result.file_info.type_description || 'N/A'}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
                          <p className="text-xs text-muted-foreground mb-1">File Size</p>
                          <p className="font-bold text-foreground">{formatBytes(result.file_info.size)}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-500/20">
                          <p className="text-xs text-muted-foreground mb-1">Reputation Score</p>
                          <p className="font-bold text-foreground">{result.file_info.reputation?.toString() || '0'}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
                          <p className="text-xs text-muted-foreground mb-1">First Seen</p>
                          <p className="font-bold text-foreground text-sm">{formatDate(result.file_info.first_seen)}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-gradient-to-br from-pink-500/10 to-pink-500/5 border border-pink-500/20">
                          <p className="text-xs text-muted-foreground mb-1">Last Analysis</p>
                          <p className="font-bold text-foreground text-sm">{formatDate(result.file_info.last_analysis)}</p>
                        </div>
                      </div>
                      {result.file_info.tags.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-semibold text-foreground mb-2">File Tags</p>
                          <div className="flex flex-wrap gap-2">
                            {result.file_info.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1.5 bg-primary/20 text-primary rounded-full text-xs font-medium hover:bg-primary/30 transition-colors"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Network Information - Enhanced */}
                  {result.network_info && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Network Intelligence
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {result.network_info.asn && (
                          <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
                            <p className="text-xs text-muted-foreground mb-1">Autonomous System</p>
                            <p className="font-bold text-lg text-foreground mb-1">{`AS${result.network_info.asn}`}</p>
                            {result.network_info.as_owner && (
                              <p className="text-sm text-foreground/70">{result.network_info.as_owner}</p>
                            )}
                          </div>
                        )}
                        {result.network_info.country && (
                          <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
                            <p className="text-xs text-muted-foreground mb-1">Country/Region</p>
                            <p className="font-bold text-lg text-foreground">{result.network_info.country}</p>
                          </div>
                        )}
                        {result.network_info.registrar && (
                          <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
                            <p className="text-xs text-muted-foreground mb-1">Registrar</p>
                            <p className="font-bold text-foreground">{result.network_info.registrar}</p>
                          </div>
                        )}
                      </div>
                      {result.network_info.categories.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-semibold text-foreground mb-2">Categories</p>
                          <div className="flex flex-wrap gap-2">
                            {result.network_info.categories.map((category, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-medium"
                              >
                                {category}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Behavioral Indicators - Enhanced */}
                  {result.behavioral_indicators.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Behavioral Analysis
                      </h4>
                      <div className="space-y-2">
                        {result.behavioral_indicators.map((indicator, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20 hover:border-accent/40 transition-colors"
                          >
                            <div className="text-accent/80 font-bold text-lg flex-shrink-0">▸</div>
                            <span className="text-foreground/90 text-sm">{indicator}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Relationships - Enhanced */}
                  {Object.keys(result.relationships).length > 0 && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Network className="w-4 h-4" />
                        Related Threat Indicators
                      </h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {Object.entries(result.relationships).map(([key, values]) => (
                          values.length > 0 && (
                            <div 
                              key={key} 
                              className="p-4 rounded-lg border border-border/30 bg-gradient-to-br from-black/20 to-black/10"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <p className="text-sm font-bold text-foreground capitalize">
                                  {key.replace(/_/g, ' ')}
                                </p>
                                <span className="px-2 py-1 bg-primary/20 text-primary rounded-full text-xs font-bold">
                                  {values.length}
                                </span>
                              </div>
                              
                              <div className="space-y-2 max-h-48 overflow-y-auto">
                                {values.slice(0, 8).map((value, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between p-2 text-xs rounded-lg bg-black/30 hover:bg-black/50 transition-colors group cursor-pointer"
                                  >
                                    <code className="font-mono truncate text-foreground/80">
                                      {value.length > 40 ? `${value.slice(0, 37)}...` : value}
                                    </code>
                                    <button
                                      onClick={() => handleCopy(value, `copy-rel-${index}-${idx}`)}
                                      className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/20"
                                    >
                                      {copied === `copy-rel-${index}-${idx}` ? (
                                        <span className="text-xs text-primary">✓</span>
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                    </button>
                                  </div>
                                ))}
                              </div>
                              
                              {values.length > 8 && (
                                <div className="mt-2 pt-2 border-t border-border/20">
                                  <p className="text-xs text-muted-foreground text-center">
                                    + {values.length - 8} more
                                  </p>
                                </div>
                              )}
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Raw Data Viewer */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Cpu className="w-4 h-4" />
                      Complete Analysis Data
                    </h4>
                    <RawDataViewer 
                      rawData={result.raw_data} 
                      resultId={`result-${index}`}
                      onSectionToggle={(section) => toggleRawDataSection(`result-${index}`, section)}
                      expandedSections={expandedRawDataSections[`result-${index}`] || {}}
                      onCopy={(text, id) => handleCopy(text, id)}
                      copied={copied}
                    />
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

function DetectionStatBar({ 
  label, 
  value, 
  total,
  color,
  icon
}: { 
  label: string
  value: number
  total: number
  color: string
  icon: string
}) {
  const percentage = total > 0 ? (value / total * 100) : 0;
  
  const bgColorMap = {
    destructive: 'from-destructive/40 to-destructive/20',
    accent: 'from-accent/40 to-accent/20',
    primary: 'from-primary/40 to-primary/20',
    muted: 'from-muted-foreground/20 to-muted-foreground/10',
    foreground: 'from-foreground/20 to-foreground/10'
  };

  const barColorMap = {
    destructive: 'from-destructive to-destructive/60',
    accent: 'from-accent to-accent/60',
    primary: 'from-primary to-primary/60',
    muted: 'from-muted-foreground/40 to-muted-foreground/20',
    foreground: 'from-foreground to-foreground/60'
  };

  return (
    <div className={`p-3 rounded-lg bg-gradient-to-br ${bgColorMap[color as keyof typeof bgColorMap]} border border-border/30`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-lg">{icon}</span>
          <span className="text-xs font-bold text-foreground">{label}</span>
        </div>
        <span className="text-sm font-bold text-foreground">{value}</span>
      </div>
      <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden">
        <div 
          className={`bg-gradient-to-r ${barColorMap[color as keyof typeof barColorMap]} h-full rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
      <p className="text-xs text-muted-foreground mt-1">{percentage.toFixed(1)}%</p>
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

// Raw Data Viewer Component
interface RawDataViewerProps {
  rawData: any;
  resultId: string;
  onSectionToggle: (section: string) => void;
  expandedSections: Record<string, boolean>;
  onCopy: (text: string, id: string) => void;
  copied: string | null;
}

function RawDataViewer({ 
  rawData, 
  resultId, 
  onSectionToggle, 
  expandedSections,
  onCopy,
  copied
}: RawDataViewerProps) {
  if (!rawData) return null;

  const data = rawData.data || rawData;
  const attributes = data?.attributes || {};

  // Extract key sections from raw data
  const sections = {
    'File Info': {
      items: {
        'SHA-256': data?.id,
        'Type': attributes?.type_description,
        'Size': attributes?.size ? `${attributes.size} bytes` : null,
        'Magic': attributes?.magic,
        'SSDEEP': attributes?.ssdeep,
      }
    },
    'Detection Results': {
      items: {
        'Last Analysis Date': attributes?.last_analysis_date ? new Date(attributes.last_analysis_date * 1000).toLocaleString() : null,
        'Detection Ratio': attributes?.last_analysis_stats ? 
          `${attributes.last_analysis_stats.malicious || 0}/${attributes.last_analysis_stats.malicious + attributes.last_analysis_stats.undetected + (attributes.last_analysis_stats.suspicious || 0) + (attributes.last_analysis_stats.harmless || 0)}` : 
          null,
      }
    },
    'Voting Results': {
      items: attributes?.total_votes ? {
        'Malicious Votes': attributes.total_votes.malicious || 0,
        'Harmless Votes': attributes.total_votes.harmless || 0,
      } : {}
    },
    'Sandbox Verdicts': {
      isArray: true,
      data: attributes?.sandbox_verdicts || {}
    },
    'Sigma Analysis': {
      isArray: true,
      data: attributes?.sigma_analysis_summary || {}
    },
    'Detection Engines': {
      isArray: true,
      data: attributes?.last_analysis_results || {}
    },
    'Tags': {
      isArray: true,
      data: Array.isArray(attributes?.tags) ? Object.fromEntries(attributes.tags.map((t: string, i: number) => [i, t])) : {}
    },
    'Known Distributors': {
      items: attributes?.known_distributors ? {
        'Count': attributes.known_distributors.distributors?.length || 0,
        'Companies': attributes.known_distributors.distributors?.slice(0, 5).join(', ') || 'N/A'
      } : {}
    }
  };

  return (
    <div className="space-y-2">
      {Object.entries(sections).map(([sectionName, section]) => {
        const isExpanded = expandedSections[sectionName] || false;
        const isArrayData = (section as any).isArray;
        const items = (section as any).items || {};
        const sectionData = (section as any).data || {};
        const hasContent = isArrayData 
          ? Object.keys(sectionData).length > 0
          : Object.values(items).some(v => v !== null && v !== undefined);

        if (!hasContent) return null;

        return (
          <div key={sectionName} className="border border-border/30 rounded-lg overflow-hidden bg-black/5">
            <button
              onClick={() => onSectionToggle(sectionName)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-black/10 transition-colors"
            >
              <span className="font-medium text-foreground text-sm">{sectionName}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
            
            {isExpanded && (
              <div className="border-t border-border/30 p-4 bg-black/10 space-y-3">
                {isArrayData ? (
                  <DataArrayViewer 
                    data={sectionData} 
                    resultId={resultId}
                    sectionName={sectionName}
                    onCopy={onCopy}
                    copied={copied}
                  />
                ) : (
                  <div className="space-y-2">
                    {Object.entries(items).map(([key, value]) => (
                      value !== null && value !== undefined && (
                        <div key={key} className="flex items-start justify-between gap-4 p-2 rounded bg-black/20">
                          <span className="text-xs font-medium text-muted-foreground">{key}</span>
                          <div className="flex items-center gap-2">
                            <code className="text-xs font-mono text-foreground/80 text-right line-clamp-3">
                              {String(value)}
                            </code>
                            <button
                              onClick={() => onCopy(String(value), `${resultId}-${sectionName}-${key}`)}
                              className="p-1 rounded hover:bg-black/30 transition-colors flex-shrink-0"
                              title="Copy value"
                            >
                              {copied === `${resultId}-${sectionName}-${key}` ? (
                                <span className="text-xs text-primary">✓</span>
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Helper component for displaying array data
interface DataArrayViewerProps {
  data: Record<string, any>;
  resultId: string;
  sectionName: string;
  onCopy: (text: string, id: string) => void;
  copied: string | null;
}

function DataArrayViewer({ data, resultId, sectionName, onCopy, copied }: DataArrayViewerProps) {
  const entries = Object.entries(data);
  const displayLimit = 10;
  const [showAll, setShowAll] = useState(false);
  const displayedEntries = showAll ? entries : entries.slice(0, displayLimit);

  return (
    <div className="space-y-2">
      {displayedEntries.map(([key, value], idx) => {
        const displayValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
        
        return (
          <div key={key} className="p-3 rounded bg-black/20 border border-border/20">
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-xs font-semibold text-primary truncate">{key}</span>
              <button
                onClick={() => onCopy(displayValue, `${resultId}-${sectionName}-${idx}`)}
                className="p-1 rounded hover:bg-black/30 transition-colors flex-shrink-0"
                title="Copy value"
              >
                {copied === `${resultId}-${sectionName}-${idx}` ? (
                  <span className="text-xs text-primary">✓</span>
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
            
            {typeof value === 'object' ? (
              <div className="text-xs font-mono text-foreground/70 space-y-1 max-h-32 overflow-y-auto">
                {Object.entries(value).slice(0, 5).map(([k, v]: any[], i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-muted-foreground">{k}:</span>
                    <span className="text-foreground/80 truncate">{String(v)}</span>
                  </div>
                ))}
                {Object.keys(value).length > 5 && (
                  <div className="text-muted-foreground italic">
                    +{Object.keys(value).length - 5} more fields
                  </div>
                )}
              </div>
            ) : (
              <code className="text-xs font-mono text-foreground/80 break-all block">
                {displayValue}
              </code>
            )}
          </div>
        );
      })}
      
      {entries.length > displayLimit && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full px-3 py-2 text-xs text-primary hover:bg-primary/10 rounded transition-colors"
        >
          Show {entries.length - displayLimit} more entries...
        </button>
      )}
      
      {showAll && entries.length > displayLimit && (
        <button
          onClick={() => setShowAll(false)}
          className="w-full px-3 py-2 text-xs text-primary hover:bg-primary/10 rounded transition-colors"
        >
          Show less
        </button>
      )}
    </div>
  );
}