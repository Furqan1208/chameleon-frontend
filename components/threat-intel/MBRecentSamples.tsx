// components/threat-intel/MBRecentSamples.tsx
'use client';

import { useState } from 'react';
import {
  Clock,
  Download,
  ExternalLink,
  Copy,
  AlertTriangle,
  Shield,
  Tag,
  Globe,
  FileText,
  Calendar,
  RefreshCw,
  Eye,
  ChevronDown,
  ChevronUp,
  Filter,
  Hash,
  Cpu,
  Users
} from 'lucide-react';

interface MBRecentSamplesProps {
  samples: any[];
  onRefresh: () => Promise<any[]>;
  refreshing: boolean;
}

export function MBRecentSamples({ samples, onRefresh, refreshing }: MBRecentSamplesProps) {
  const [expandedSample, setExpandedSample] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'exe' | 'dll' | 'doc' | 'pdf' | 'apk'>('all');
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleExpand = (hash: string) => {
    setExpandedSample(expandedSample === hash ? null : hash);
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredSamples = filter === 'all' 
    ? samples 
    : samples.filter(sample => sample.file_type?.toLowerCase().includes(filter));

  const fileTypeStats = samples.reduce((stats, sample) => {
    const type = sample.file_type?.toLowerCase() || 'unknown';
    stats[type] = (stats[type] || 0) + 1;
    return stats;
  }, {} as Record<string, number>);

  if (samples.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No Recent Samples</h3>
        <p className="text-muted-foreground mb-4">No recent malware samples found in the database.</p>
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 mx-auto ${
            refreshing
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Recent Malware Samples
          </h3>
          <p className="text-sm text-muted-foreground">
            Latest {samples.length} samples added to MalwareBazaar
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {(Object.entries(fileTypeStats) as [string, number][]).slice(0, 3).map(([type, count]) => (
              <div key={type} className="px-2 py-1 bg-muted/50 rounded text-xs">
                {type}: {count}
              </div>
            ))}
          </div>
          
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 ${
              refreshing
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'border border-border hover:bg-muted/20'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Filter by type:</span>
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
            filter === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'border border-border hover:bg-muted/20'
          }`}
        >
          All ({samples.length})
        </button>
        {['exe', 'dll', 'doc', 'pdf', 'apk'].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type as any)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              filter === type
                ? 'bg-primary text-primary-foreground'
                : 'border border-border hover:bg-muted/20'
            }`}
          >
            {type.toUpperCase()} ({fileTypeStats[type] || 0})
          </button>
        ))}
      </div>

      {/* Samples Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSamples.slice(0, 12).map((sample, index) => {
          const isExpanded = expandedSample === sample.sha256_hash;
          
          return (
            <div
              key={sample.sha256_hash}
              className="border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-colors"
            >
              {/* Sample Header */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`p-2 rounded-lg ${
                        sample.signature ? 'bg-destructive/10' : 'bg-muted'
                      }`}>
                        {sample.signature ? (
                          <AlertTriangle className="w-4 h-4 text-destructive" />
                        ) : (
                          <FileText className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {sample.file_name || 'Unknown'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatBytes(sample.file_size)} • {sample.file_type}
                        </p>
                      </div>
                    </div>
                    
                    {/* Tags and Signature */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {sample.signature && (
                        <span className="px-2 py-0.5 bg-destructive/20 text-destructive text-xs rounded">
                          {sample.signature}
                        </span>
                      )}
                      {sample.tags?.slice(0, 2).map((tag: string, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded">
                          {tag}
                        </span>
                      ))}
                      {sample.tags && sample.tags.length > 2 && (
                        <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded">
                          +{sample.tags.length - 2}
                        </span>
                      )}
                    </div>
                    
                    {/* Quick Info */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(sample.first_seen)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        <span>{sample.origin_country || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{sample.reporter || 'Anonymous'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Cpu className="w-3 h-3" />
                        <span className="truncate">{sample.file_type_mime?.split(';')[0]}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleExpand(sample.sha256_hash)}
                    className="px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-muted/20 transition-colors flex items-center gap-1 flex-1"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-3 h-3" />
                        Hide Details
                      </>
                    ) : (
                      <>
                        <Eye className="w-3 h-3" />
                        View Details
                      </>
                    )}
                  </button>
                  <a
                    href={`https://bazaar.abuse.ch/sample/${sample.sha256_hash}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-muted/20 transition-colors flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View
                  </a>
                  <button
                    onClick={() => handleCopy(sample.sha256_hash, `copy-hash-${index}`)}
                    className="px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-muted/20 transition-colors"
                    title="Copy SHA256"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
                
                {copied === `copy-hash-${index}` && (
                  <div className="mt-2 text-xs text-primary animate-pulse">
                    ✓ Copied to clipboard
                  </div>
                )}
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-border/50 bg-black/5 p-4">
                  <div className="space-y-4">
                    {/* Hashes */}
                    <div>
                      <h5 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                        <Hash className="w-4 h-4" />
                        File Hashes
                      </h5>
                      <div className="space-y-2">
                        <HashDisplay label="SHA256" value={sample.sha256_hash} onCopy={() => handleCopy(sample.sha256_hash, `sha256-full-${index}`)} />
                        <HashDisplay label="MD5" value={sample.md5_hash} onCopy={() => handleCopy(sample.md5_hash, `md5-full-${index}`)} />
                        {sample.ssdeep && (
                          <HashDisplay label="SSDEEP" value={sample.ssdeep} onCopy={() => handleCopy(sample.ssdeep, `ssdeep-full-${index}`)} />
                        )}
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="grid grid-cols-2 gap-3">
                      {sample.imphash && (
                        <div>
                          <p className="text-xs text-muted-foreground">Imphash</p>
                          <code className="text-xs font-mono block truncate">{sample.imphash}</code>
                        </div>
                      )}
                      {sample.tlsh && (
                        <div>
                          <p className="text-xs text-muted-foreground">TLSH</p>
                          <code className="text-xs font-mono block truncate">{sample.tlsh}</code>
                        </div>
                      )}
                    </div>

                    {/* Intelligence */}
                    {sample.intelligence && (
                      <div>
                        <h5 className="text-sm font-medium text-foreground mb-2">Intelligence</h5>
                        <div className="space-y-2">
                          {sample.intelligence.clamav?.length > 0 && (
                            <div>
                              <p className="text-xs text-muted-foreground">ClamAV Detections</p>
                              <div className="flex flex-wrap gap-1">
                                {sample.intelligence.clamav.slice(0, 3).map((det: string, idx: number) => (
                                  <span key={idx} className="px-2 py-0.5 bg-destructive/10 text-destructive text-xs rounded">
                                    {det}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {sample.delivery_method && (
                            <div>
                              <p className="text-xs text-muted-foreground">Delivery Method</p>
                              <p className="text-sm">{sample.delivery_method}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* View All Button */}
      {filteredSamples.length > 12 && (
        <div className="text-center pt-4">
          <button
            onClick={() => alert('Implement pagination or modal view here')}
            className="px-4 py-2 border border-border rounded-lg hover:bg-muted/20 transition-colors flex items-center gap-2 mx-auto"
          >
            <Eye className="w-4 h-4" />
            View All {filteredSamples.length} Samples
          </button>
        </div>
      )}
    </div>
  );
}

// Helper component
function HashDisplay({ label, value, onCopy }: { label: string; value: string; onCopy: () => void }) {
  if (!value) return null;
  
  return (
    <div className="flex items-center justify-between bg-muted/10 p-2 rounded">
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <code className="text-xs font-mono truncate">{value}</code>
      </div>
      <button
        onClick={onCopy}
        className="p-1 hover:bg-black/10 rounded transition-colors"
        title={`Copy ${label}`}
      >
        <Copy className="w-3 h-3" />
      </button>
    </div>
  );
}