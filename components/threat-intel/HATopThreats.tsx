// components/threat-intel/HATopThreats.tsx
'use client';

import { useState } from 'react';
import {
  Flame,
  AlertTriangle,
  Shield,
  Clock,
  Download,
  ExternalLink,
  Hash,
  FileText,
  Cpu,
  RefreshCw,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  BarChart3,
  Network,
  Globe,
  Tag,
  Users,
  Calendar
} from 'lucide-react';
import type { HAThreatFeedItem } from '@/lib/types/hybrid-analysis.types';
import { formatDate, getVerdictInfo, formatFileSize } from '@/lib/utils/hybrid-analysis.utils';

interface HATopThreatsProps {
  threats: HAThreatFeedItem[];
  loading: boolean;
  onRefresh: () => Promise<void>;
}

export function HATopThreats({ threats, loading, onRefresh }: HATopThreatsProps) {
  const [expandedThreat, setExpandedThreat] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'malicious' | 'suspicious'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'verdict' | 'size'>('date');
  const [searchQuery, setSearchQuery] = useState('');

  const handleRefresh = async () => {
    await onRefresh();
  };

  const getVerdictColor = (verdict: number) => {
    if (verdict === 60) return 'text-destructive';
    if (verdict === 50) return 'text-accent';
    if (verdict === 40) return 'text-yellow-500';
    if (verdict === 30) return 'text-blue-500';
    if (verdict === 20) return 'text-green-500';
    return 'text-muted-foreground';
  };

  const getVerdictLabel = (verdict: number) => {
    if (verdict === 60) return 'Malicious';
    if (verdict === 50) return 'Suspicious';
    if (verdict === 40) return 'No Specific Threat';
    if (verdict === 30) return 'No Verdict';
    if (verdict === 20) return 'Whitelisted';
    return 'Unknown';
  };

  const filteredThreats = threats
    .filter(threat => {
      if (filter === 'malicious') return threat.verdict === 60;
      if (filter === 'suspicious') return threat.verdict === 50;
      return true;
    })
    .filter(threat => 
      threat.sha256?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      threat.submit_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      threat.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      threat.environment_description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'verdict') return (b.verdict || 0) - (a.verdict || 0);
      if (sortBy === 'size') return (b.size || 0) - (a.size || 0);
      // Default sort by date (most recent first)
      return 0;
    })
    .slice(0, 50);

  const toggleExpand = (sha256: string) => {
    setExpandedThreat(expandedThreat === sha256 ? null : sha256);
  };

  if (loading && threats.length === 0) {
    return (
      <div className="glass border border-border rounded-xl p-12 text-center">
        <RefreshCw className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-spin" />
        <p className="text-muted-foreground">Loading threat feed...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Latest Threat Detections</h3>
          <p className="text-sm text-muted-foreground">
            Real-time malware submissions from Hybrid Analysis
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <div className="flex items-center gap-1 border border-border rounded-lg overflow-hidden">
            {(['all', 'malicious', 'suspicious'] as const).map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors capitalize ${
                  filter === filterType
                    ? filterType === 'malicious' 
                      ? 'bg-destructive text-white' 
                      : filterType === 'suspicious'
                      ? 'bg-accent text-white'
                      : 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted/20 text-muted-foreground'
                }`}
              >
                {filterType}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Threats"
          value={threats.length}
          icon={<Flame className="w-5 h-5" />}
          color="orange"
        />
        <StatCard
          label="Malicious"
          value={threats.filter(t => t.verdict === 60).length}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="destructive"
        />
        <StatCard
          label="Suspicious"
          value={threats.filter(t => t.verdict === 50).length}
          icon={<Shield className="w-5 h-5" />}
          color="accent"
        />
        <StatCard
          label="Updated"
          value="Live"
          icon={<Clock className="w-5 h-5" />}
          color="blue"
        />
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <Search className="w-4 h-4 text-muted-foreground" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search threats by hash, filename, or type..."
          className="w-full pl-10 pr-10 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-primary transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>

      {/* Threats List */}
      {filteredThreats.length > 0 ? (
        <div className="space-y-3">
          {filteredThreats.map((threat, index) => {
            const isExpanded = expandedThreat === threat.sha256;
            const verdictColor = getVerdictColor(threat.verdict || 0);
            const verdictLabel = getVerdictLabel(threat.verdict || 0);
            
            return (
              <div
                key={index}
                className={`glass border rounded-xl overflow-hidden transition-all duration-300 ${
                  threat.verdict === 60 ? 'border-destructive/30' :
                  threat.verdict === 50 ? 'border-accent/30' :
                  'border-border'
                }`}
              >
                {/* Threat Header */}
                <div className="p-4 cursor-pointer" onClick={() => toggleExpand(threat.sha256!)}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`p-2 rounded-lg ${
                        threat.verdict === 60 ? 'bg-destructive/10' :
                        threat.verdict === 50 ? 'bg-accent/10' :
                        threat.verdict === 20 ? 'bg-green-500/10' :
                        'bg-muted'
                      }`}>
                        {threat.verdict === 60 ? (
                          <AlertTriangle className="w-5 h-5 text-destructive" />
                        ) : threat.verdict === 50 ? (
                          <Shield className="w-5 h-5 text-accent" />
                        ) : (
                          <Eye className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${verdictColor} ${
                            threat.verdict === 60 ? 'bg-destructive/20' :
                            threat.verdict === 50 ? 'bg-accent/20' :
                            'bg-muted/50'
                          }`}>
                            {verdictLabel}
                          </span>
                          {threat.environment_description && (
                            <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs">
                              {threat.environment_description}
                            </span>
                          )}
                        </div>
                        
                        <div className="space-y-1">
                          <p className="font-mono text-sm break-all">
                            {threat.sha256?.substring(0, 16)}...{threat.sha256?.substring(48)}
                          </p>
                          {threat.submit_name && (
                            <p className="text-sm text-foreground truncate">
                              {threat.submit_name}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                          {threat.type && (
                            <div className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              <span>{threat.type}</span>
                            </div>
                          )}
                          {threat.size && (
                            <div className="flex items-center gap-1">
                              <Database className="w-3 h-3" />
                              <span>{formatFileSize(threat.size)}</span>
                            </div>
                          )}
                          {threat.mime && (
                            <div className="flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              <span>{threat.mime.split(';')[0]}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(threat.sha256!);
                        }}
                        className="p-1.5 rounded hover:bg-black/10 transition-colors"
                        title="Copy Hash"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <a
                        href={`https://www.hybrid-analysis.com/sample/${threat.sha256}`}
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
                          toggleExpand(threat.sha256!);
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
                </div>

                {/* Expanded Details */}
                {isExpanded && threat.sha256 && (
                  <div className="border-t border-border/50 bg-black/5">
                    <div className="p-6 space-y-6">
                      {/* Hash Information */}
                      <div>
                        <h5 className="font-semibold text-foreground mb-3">Hash Information</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InfoField label="SHA256" value={threat.sha256} copyable />
                          {threat.md5 && <InfoField label="MD5" value={threat.md5} copyable />}
                          {threat.sha1 && <InfoField label="SHA1" value={threat.sha1} copyable />}
                          {threat.sha512 && <InfoField label="SHA512" value={threat.sha512} copyable />}
                        </div>
                      </div>

                      {/* File Information */}
                      <div>
                        <h5 className="font-semibold text-foreground mb-3">File Information</h5>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          <InfoField label="Filename" value={threat.submit_name || 'Unknown'} />
                          <InfoField label="File Size" value={threat.size ? formatFileSize(threat.size) : 'Unknown'} />
                          <InfoField label="File Type" value={threat.type || 'Unknown'} />
                          <InfoField label="MIME Type" value={threat.mime || 'Unknown'} />
                          <InfoField label="URL Analysis" value={threat.url_analysis ? 'Yes' : 'No'} />
                          {threat.environment_description && (
                            <InfoField label="Environment" value={threat.environment_description} />
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3">
                        <a
                          href={`https://www.hybrid-analysis.com/sample/${threat.sha256}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View Full Report
                        </a>
                        <button
                          onClick={() => navigator.clipboard.writeText(threat.sha256!)}
                          className="px-4 py-2 border border-border rounded-lg hover:bg-muted/20 transition-colors flex items-center gap-2"
                        >
                          <Copy className="w-4 h-4" />
                          Copy Hash
                        </button>
                        {threat.report_id && (
                          <button
                            onClick={() => window.open(`https://www.hybrid-analysis.com/report/${threat.report_id}`, '_blank')}
                            className="px-4 py-2 border border-border rounded-lg hover:bg-muted/20 transition-colors flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View Report
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass border border-border rounded-xl p-12 text-center">
          <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No threats found</p>
          <p className="text-sm text-muted-foreground mt-1">
            {searchQuery ? 'Try a different search term' : 'Threat feed is empty or loading'}
          </p>
        </div>
      )}
    </div>
  );
}

// Helper Components
function StatCard({ label, value, icon, color }: { label: string; value: any; icon: React.ReactNode; color: string }) {
  const colorClasses = {
    destructive: 'text-destructive border-destructive/20 bg-destructive/5',
    accent: 'text-accent border-accent/20 bg-accent/5',
    orange: 'text-orange-500 border-orange-500/20 bg-orange-500/5',
    blue: 'text-blue-500 border-blue-500/20 bg-blue-500/5',
    green: 'text-green-500 border-green-500/20 bg-green-500/5'
  };

  return (
    <div className={`border rounded-xl p-4 ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses].split(' ')[0].replace('text-', 'bg-')} bg-opacity-10`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  );
}

function InfoField({ label, value, copyable = false }: { label: string; value: string; copyable?: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        {copyable && (
          <button
            onClick={handleCopy}
            className="p-1 hover:bg-black/10 rounded transition-colors"
            title="Copy"
          >
            <Copy className="w-3 h-3" />
          </button>
        )}
      </div>
      <p className="text-sm font-medium text-foreground font-mono truncate">
        {value}
        {copied && <span className="ml-2 text-xs text-primary">✓</span>}
      </p>
    </div>
  );
}

function Search({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function Database({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14a9 3 0 0 0 18 0V5" />
      <path d="M3 12a9 3 0 0 0 18 0" />
    </svg>
  );
}