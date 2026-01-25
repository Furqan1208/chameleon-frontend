// components/threat-intel/HAMetadataPanel.tsx
'use client';

import { useState } from 'react';
import {
  Info,
  FileText,
  Hash,
  Code,
  Database,
  Settings,
  Layers,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Network,
  Globe,
  Activity,
  Terminal,
  FolderTree,
  BookOpen,
  Link,
  FileArchive,
  Cpu,
  Target,
  Zap,
  Lock,
  Unlock,
  Server,
  HardDrive,
  Wifi,
  Key,
  FileSignature,
  Binary,
  Package
} from 'lucide-react';
import type { HAAnalysisResult } from '@/lib/threat-intel/ha-types';
import { formatFileSize, formatDate } from '@/lib/threat-intel/ha-utils';

interface HAMetadataPanelProps {
  result: HAAnalysisResult;
}

export function HAMetadataPanel({ result }: HAMetadataPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'behavior' | 'network' | 'static'>('overview');

  if (!result.found) {
    return (
      <div className="glass border border-border rounded-xl p-6">
        <div className="text-center">
          <Info className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No analysis data available</p>
          <p className="text-sm text-muted-foreground mt-1">
            File not found in Hybrid Analysis database
          </p>
        </div>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Basic Info */}
      <div>
        <h5 className="font-semibold text-foreground mb-3">Basic Information</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoField icon={<Hash className="w-4 h-4" />} label="SHA256" value={result.sha256} copyable />
          {((result as any).md5 || (result.file_metadata as any)?.md5 || result.raw_data?.overview?.md5) && (
            <InfoField icon={<Hash className="w-4 h-4" />} label="MD5" value={(result as any).md5 || (result.file_metadata as any)?.md5 || result.raw_data?.overview?.md5} copyable />
          )}
          {((result as any).sha1 || (result.file_metadata as any)?.sha1 || result.raw_data?.overview?.sha1) && (
            <InfoField icon={<Hash className="w-4 h-4" />} label="SHA1" value={(result as any).sha1 || (result.file_metadata as any)?.sha1 || result.raw_data?.overview?.sha1} copyable />
          )}
          <InfoField icon={<FileText className="w-4 h-4" />} label="Filename" value={result.last_file_name || 'Unknown'} />
          <InfoField icon={<Database className="w-4 h-4" />} label="File Size" value={result.size ? formatFileSize(result.size) : 'Unknown'} />
          <InfoField icon={<Code className="w-4 h-4" />} label="File Type" value={result.type || 'Unknown'} />
          <InfoField icon={<Server className="w-4 h-4" />} label="Architecture" value={result.architecture || 'Unknown'} />
          {result.vx_family && <InfoField icon={<Target className="w-4 h-4" />} label="Malware Family" value={result.vx_family} />}
        </div>
      </div>

      {/* Analysis Info */}
      <div>
        <h5 className="font-semibold text-foreground mb-3">Analysis Information</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoField icon={<Clock className="w-4 h-4" />} label="Submitted" value={result.submitted_at ? formatDate(result.submitted_at) : 'Unknown'} />
          <InfoField icon={<Activity className="w-4 h-4" />} label="Analysis Started" value={result.analysis_start_time ? formatDate(result.analysis_start_time) : 'Unknown'} />
          <InfoField icon={<Shield className="w-4 h-4" />} label="Threat Score" value={`${result.threat_score_computed.toFixed(0)}/100`} />
          <InfoField icon={<Target className="w-4 h-4" />} label="Verdict" value={result.verdict || 'Unknown'} />
          {result.multiscan_result && <InfoField icon={<Zap className="w-4 h-4" />} label="Multiscan Result" value={`${result.multiscan_result}/100`} />}
        </div>
      </div>

      {/* Tags */}
      {(result.tags || []).length > 0 && (
        <div>
          <h5 className="font-semibold text-foreground mb-3">Tags</h5>
          <div className="flex flex-wrap gap-2">
            {(result.tags || []).map((tag, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 bg-muted text-muted-foreground rounded-lg text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderBehavior = () => (
    <div className="space-y-6">
      {/* Signatures */}
      {(result.signatures || []).length > 0 && (
        <div>
          <h5 className="font-semibold text-foreground mb-3">Detection Signatures ({(result.signatures || []).length})</h5>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {(result.signatures || [])
              .slice()
              .sort((a, b) => b.threat_level - a.threat_level)
              .slice(0, 15)
              .map((sig, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border ${
                    sig.threat_level >= 3 ? 'border-destructive/30 bg-destructive/5' :
                    sig.threat_level === 2 ? 'border-accent/30 bg-accent/5' :
                    'border-border bg-black/5'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-foreground text-sm">{sig.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{sig.description}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      sig.threat_level >= 3 ? 'bg-destructive/20 text-destructive' :
                      sig.threat_level === 2 ? 'bg-accent/20 text-accent' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      Level {sig.threat_level}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-0.5 bg-muted rounded">{sig.category}</span>
                    <span className="px-2 py-0.5 bg-muted rounded">{sig.type}</span>
                    {sig.origin && <span className="px-2 py-0.5 bg-muted rounded">{sig.origin}</span>}
                    {sig.attck_id && <span className="px-2 py-0.5 bg-muted rounded">{sig.attck_id}</span>}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* MITRE ATT&CK */}
      {(result.mitre_attcks || []).length > 0 && (
        <div>
          <h5 className="font-semibold text-foreground mb-3">MITRE ATT&CK Techniques ({(result.mitre_attcks || []).length})</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(result.mitre_attcks || []).slice(0, 8).map((attack, idx) => (
              <div key={idx} className="p-3 border border-border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-foreground text-sm">{attack.technique}</p>
                    <p className="text-xs text-muted-foreground">{attack.tactic}</p>
                  </div>
                  {attack.attck_id && (
                    <span className="text-xs px-2 py-1 bg-muted rounded">
                      {attack.attck_id}
                    </span>
                  )}
                </div>
                {attack.parent && (
                  <div className="text-xs text-muted-foreground mt-2">
                    Parent: {attack.parent.technique}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Processes */}
      {(result.processes || []).length > 0 && (
        <div>
          <h5 className="font-semibold text-foreground mb-3">Processes ({(result.processes || []).length})</h5>
          <div className="space-y-2">
            {(result.processes || []).slice(0, 10).map((process, idx) => (
              <div key={idx} className="p-2 border border-border rounded">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{process.name}</span>
                  <span className="text-xs text-muted-foreground">PID: {process.process_id}</span>
                </div>
                {process.command_line && (
                  <code className="text-xs text-muted-foreground mt-1 block truncate">
                    {process.command_line}
                  </code>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderNetwork = () => (
    <div className="space-y-6">
      {/* Domains */}
      {((result.summary?.domains || []) as string[]).length > 0 && (
        <div>
          <h5 className="font-semibold text-foreground mb-3">Contacted Domains ({((result.summary?.domains || []) as string[]).length})</h5>
          <div className="space-y-2">
            {((result.summary?.domains || []) as string[]).slice(0, 15).map((domain, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 border border-border rounded hover:bg-muted/10">
                <code className="text-sm font-mono">{domain}</code>
                <button
                  onClick={() => navigator.clipboard.writeText(domain)}
                  className="p-1 hover:bg-black/10 rounded"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hosts */}
      {((result.summary?.hosts || []) as string[]).length > 0 && (
        <div>
          <h5 className="font-semibold text-foreground mb-3">Contacted Hosts ({((result.summary?.hosts || []) as string[]).length})</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {((result.summary?.hosts || []) as string[]).slice(0, 10).map((host, idx) => (
              <div key={idx} className="p-2 border border-border rounded">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <code className="text-sm font-mono">{host}</code>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certificates */}
      {((result.summary?.certificates || []) as any[]).length > 0 && (
        <div>
          <h5 className="font-semibold text-foreground mb-3">Certificates ({((result.summary?.certificates || []) as any[]).length})</h5>
          <div className="space-y-3">
            {((result.summary?.certificates || []) as any[]).slice(0, 5).map((cert, idx) => (
              <div key={idx} className="p-3 border border-border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{cert.owner || 'Unknown'}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    result.summary?.is_certificates_valid ? 'bg-green-500/20 text-green-500' : 'bg-destructive/20 text-destructive'
                  }`}>
                    {result.summary?.is_certificates_valid ? 'Valid' : 'Invalid'}
                  </span>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div>Issuer: {cert.issuer || 'Unknown'}</div>
                  <div>Valid: {cert.valid_from ? formatDate(cert.valid_from) : 'Unknown'} - {cert.valid_until ? formatDate(cert.valid_until) : 'Unknown'}</div>
                  {cert.serial_number && <div>Serial: {cert.serial_number.substring(0, 16)}...</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderStatic = () => (
    <div className="space-y-6">
      {/* PE Information */}
      {result.summary && (
        <div>
          <h5 className="font-semibold text-foreground mb-3">PE Information</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.summary.entrypoint && <InfoField icon={<Binary className="w-4 h-4" />} label="Entry Point" value={result.summary.entrypoint} />}
            {result.summary.entrypoint_section && <InfoField icon={<Layers className="w-4 h-4" />} label="Entry Section" value={result.summary.entrypoint_section} />}
            {result.summary.image_base && <InfoField icon={<HardDrive className="w-4 h-4" />} label="Image Base" value={result.summary.image_base} />}
            {result.summary.subsystem && <InfoField icon={<Terminal className="w-4 h-4" />} label="Subsystem" value={result.summary.subsystem} />}
            {result.summary.major_os_version && <InfoField icon={<Settings className="w-4 h-4" />} label="OS Version" value={`${result.summary.major_os_version}.${result.summary.minor_os_version}`} />}
            {result.summary.av_detect && <InfoField icon={<Shield className="w-4 h-4" />} label="AV Detection" value={`${result.summary.av_detect}/100`} />}
          </div>
        </div>
      )}

      {/* File Metadata */}
      {result.file_metadata && (
        <div>
          <h5 className="font-semibold text-foreground mb-3">File Metadata</h5>
          <div className="space-y-4">
            {result.file_metadata.total_file_compositions_imports && (
              <InfoField 
                icon={<Package className="w-4 h-4" />} 
                label="Total Imports" 
                value={result.file_metadata.total_file_compositions_imports.toString()} 
              />
            )}
          </div>
        </div>
      )}

      {/* Extracted Files */}
      {(result.extracted_files || []).length > 0 && (
        <div>
          <h5 className="font-semibold text-foreground mb-3">Extracted Files ({(result.extracted_files || []).length})</h5>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {(result.extracted_files || []).slice(0, 10).map((file, idx) => (
              <div key={idx} className="p-2 border border-border rounded">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{file.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span>{formatFileSize(file.file_size)}</span>
                      <span>•</span>
                      <span>{file.threat_level_readable}</span>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    file.threat_level >= 3 ? 'bg-destructive/20 text-destructive' :
                    file.threat_level === 2 ? 'bg-accent/20 text-accent' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    Level {file.threat_level}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="glass border border-border rounded-xl overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-border">
        {([
          { id: 'overview', label: 'Overview', icon: <Info className="w-4 h-4" /> },
          { id: 'behavior', label: 'Behavior', icon: <Activity className="w-4 h-4" /> },
          { id: 'network', label: 'Network', icon: <Network className="w-4 h-4" /> },
          { id: 'static', label: 'Static Analysis', icon: <Code className="w-4 h-4" /> }
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted/20 text-muted-foreground'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'behavior' && renderBehavior()}
        {activeTab === 'network' && renderNetwork()}
        {activeTab === 'static' && renderStatic()}
      </div>
    </div>
  );
}

function InfoField({ icon, label, value, copyable = false }: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
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
      <p className="text-foreground font-medium text-sm break-all">
        {value}
        {copied && (
          <span className="ml-2 text-xs text-primary animate-pulse">✓ Copied</span>
        )}
      </p>
    </div>
  );
}

function Copy({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}