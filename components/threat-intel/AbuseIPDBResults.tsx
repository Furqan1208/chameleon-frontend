// components/threat-intel/AbuseIPDBResults.tsx - UPDATED
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
  Users,
  Flag,
  Network,
  Building,
  Tag,
  MessageSquare,
  Calendar,
  Eye,
  EyeOff,
  Clock,
  BarChart3
} from 'lucide-react';

interface AbuseIPDBResultsProps {
  results: any[]; // Backend response format
}

export function AbuseIPDBResults({ results }: AbuseIPDBResultsProps) {
  const [expandedResult, setExpandedResult] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleExpand = (ip: string) => {
    setExpandedResult(expandedResult === ip ? null : ip);
  };

  const getThreatColor = (threatLevel: string) => {
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

  const getThreatIcon = (threatLevel: string) => {
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

  const formatDate = (dateString: string): string => {
    if (!dateString || dateString === 'N/A') return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Recent Checks ({results.length})
        </h3>
        <div className="text-sm text-muted-foreground">
          {results.filter(r => r.found).length} found • {results.filter(r => r.threat_level === 'high').length} high risk
        </div>
      </div>

      {results.map((result, index) => {
        const isExpanded = expandedResult === result.ioc;
        const threatColor = getThreatColor(result.threat_level);
        
        return (
          <div
            key={`${result.ioc}-${index}`}
            className={`glass border rounded-xl overflow-hidden transition-all duration-300 ${threatColor}`}
          >
            {/* Result Header */}
            <div className="p-4 cursor-pointer" onClick={() => toggleExpand(result.ioc)}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="p-2 rounded-lg bg-black/10">
                    {getThreatIcon(result.threat_level)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        IP ADDRESS
                      </span>
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
                        <span>Confidence: {result.confidence_score}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{result.total_reports || 0} reports</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        <span>{result.country_name || result.country_code || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(result.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(result.ioc, `copy-ip-${index}`);
                    }}
                    className="p-1.5 rounded hover:bg-black/10 transition-colors"
                    title="Copy IP"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <a
                    href={`https://www.abuseipdb.com/check/${result.ioc}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 rounded hover:bg-black/10 transition-colors"
                    title="View on AbuseIPDB"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    className="p-1.5 rounded hover:bg-black/10 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(result.ioc);
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
              
              {copied === `copy-ip-${index}` && (
                <div className="mt-2 text-xs text-primary animate-pulse">
                  ✓ Copied to clipboard
                </div>
              )}
            </div>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="border-t border-border/50 bg-black/5">
                <div className="p-4 space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      IP Information
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <InfoItem label="ISP" value={result.isp || 'N/A'} icon={<Building className="w-3 h-3" />} />
                      <InfoItem label="Domain" value={result.domain || 'N/A'} icon={<Network className="w-3 h-3" />} />
                      <InfoItem label="Usage Type" value={result.usage_type || 'N/A'} icon={<Tag className="w-3 h-3" />} />
                      <InfoItem label="Country" value={result.country_name || result.country_code || 'N/A'} icon={<Flag className="w-3 h-3" />} />
                      <InfoItem label="Is Tor" value={result.is_tor ? 'Yes' : 'No'} icon={<EyeOff className="w-3 h-3" />} />
                      <InfoItem label="Public IP" value={result.is_public ? 'Yes' : 'No'} icon={<Shield className="w-3 h-3" />} />
                    </div>
                  </div>

                  {/* Report Statistics */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Report Statistics
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <StatItem 
                        label="Confidence" 
                        value={`${result.confidence_score}%`} 
                        color={
                          result.confidence_score >= 90 ? 'destructive' :
                          result.confidence_score >= 70 ? 'accent' :
                          result.confidence_score >= 50 ? 'yellow' : 'primary'
                        } 
                      />
                                            <StatItem label="Total Reports" value={(result.total_reports || 0).toString()} color="blue" />
                                            <StatItem label="Distinct Users" value={(result.num_distinct_users || 0).toString()} color="green" />
                                            <StatItem label="Last Reported" value={formatDate(result.last_reported_at)} color="muted" />
                    </div>
                  </div>

                  {/* Categories */}
                  {result.categories && result.categories.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        Abuse Categories ({result.categories.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {result.categories.map((category, idx) => (
                          <div
                            key={idx}
                            className="px-3 py-1.5 bg-muted/50 rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-foreground">{category.name}</span>
                              <span className="text-xs px-1.5 py-0.5 bg-black/20 rounded">
                                {category.count}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Reports */}
                  {result.reports && result.reports.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Recent Reports ({result.reports.length})
                      </h4>
                      <div className="space-y-3">
                        {result.reports.map((report, idx) => (
                          <div
                            key={idx}
                            className="p-3 border border-border/50 rounded-lg"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Flag className="w-3 h-3 text-muted-foreground" />
                                <span className="text-sm font-medium text-foreground">
                                  {report.reporter_country}
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(report.date)}
                              </span>
                            </div>
                            {report.comment && (
                              <p className="text-sm text-foreground/80 mb-2">{report.comment}</p>
                            )}
                            <div className="flex flex-wrap gap-1">
                              {report.categories.map((category, catIdx) => (
                                <span
                                  key={catIdx}
                                  className="px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded"
                                >
                                  {category}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hostnames */}
                  {result.hostnames && result.hostnames.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Network className="w-4 h-4" />
                        Associated Hostnames ({result.hostnames.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {result.hostnames.slice(0, 10).map((hostname, idx) => (
                          <code
                            key={idx}
                            className="px-2 py-1 text-sm bg-muted/50 text-foreground rounded font-mono"
                          >
                            {hostname}
                          </code>
                        ))}
                        {result.hostnames.length > 10 && (
                          <span className="text-xs text-muted-foreground italic">
                            + {result.hostnames.length - 10} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Raw Data Toggle */}
                  {result.raw_data && (
                    <div>
                      <details className="group">
                        <summary className="cursor-pointer text-sm font-medium text-foreground hover:text-primary transition-colors flex items-center gap-2">
                          <Eye className="w-4 h-4" />
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

// Helper components
function StatItem({ label, value, color }: { label: string; value: string; color: string }) {
  const colorClasses = {
    destructive: 'text-destructive border-destructive/20 bg-destructive/5',
    accent: 'text-accent border-accent/20 bg-accent/5',
    yellow: 'text-yellow-500 border-yellow-500/20 bg-yellow-500/5',
    primary: 'text-primary border-primary/20 bg-primary/5',
    blue: 'text-blue-500 border-blue-500/20 bg-blue-500/5',
    green: 'text-green-500 border-green-500/20 bg-green-500/5',
    muted: 'text-muted-foreground border-border bg-muted/5'
  };

  return (
    <div className={`border rounded-lg p-3 text-center ${colorClasses[color as keyof typeof colorClasses]}`}>
      <p className="text-xl font-bold">{value}</p>
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
      <p className="text-foreground font-medium truncate">{value || 'N/A'}</p>
    </div>
  );
}

// Calendar and BarChart3 components are already imported from lucide-react