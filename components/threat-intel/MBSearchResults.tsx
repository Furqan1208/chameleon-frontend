// components/threat-intel/MBSearchResults.tsx - FINAL FIXED VERSION
'use client';

import { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp,
  Copy,
  ExternalLink,
  FileText,
  Hash,
  Tag,
  Shield,
  Cpu,
  Download,
  EyeOff,
  Globe,
  Calendar,
  User,
  Lock,
  Database,
  Clock,
  BarChart3,
  Network,
  Server,
  FileCode,
  Search,
  Info,
  Upload,
  Link as LinkIcon
} from 'lucide-react';
import type { MBAnalysisResult } from '@/lib/threat-intel/malwarebazaar-types';

interface MBSearchResultsProps {
  results: MBAnalysisResult[];
}

export function MBSearchResults({ results }: MBSearchResultsProps) {
  const [expandedResult, setExpandedResult] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleCopy = (text: string, id: string) => {
    if (isClient && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedResult(expandedResult === id ? null : id);
  };

  const getStatusColor = (found: boolean) => {
    return found 
      ? 'text-primary border-primary/30 bg-primary/5'
      : 'text-muted-foreground border-border bg-muted/5';
  };

  const getStatusIcon = (found: boolean) => {
    return found 
      ? <CheckCircle className="w-5 h-5 text-primary" />
      : <AlertTriangle className="w-5 h-5 text-muted-foreground" />;
  };

  const getIndicatorIcon = (type: MBAnalysisResult['ioc_type']) => {
    switch (type) {
      case 'hash':
        return <Hash className="w-4 h-4" />;
      case 'tag':
        return <Tag className="w-4 h-4" />;
      case 'signature':
        return <Shield className="w-4 h-4" />;
      case 'filename':
        return <FileText className="w-4 h-4" />;
      case 'imphash':
        return <Cpu className="w-4 h-4" />;
      case 'tlsh':
        return <Lock className="w-4 h-4" />;
      case 'ssdeep':
        return <Database className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
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
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Safe data accessors
  const getStringValue = (value: any): string => {
    if (!value && value !== 0) return 'N/A';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') {
      // Special handling for context/value objects
      if (value && value.context && value.value) {
        return value.value; // Just return the URL, not the context
      }
      return JSON.stringify(value);
    }
    return String(value);
  };

  // Get file information as array of objects
  const getFileInformation = (fileInfo: any): Array<{context: string, value: string}> => {
    if (!fileInfo) return [];
    
    try {
      // If it's a string, try to parse it
      if (typeof fileInfo === 'string') {
        const parsed = JSON.parse(fileInfo);
        return Array.isArray(parsed) ? parsed : [];
      }
      
      // If it's already an array
      if (Array.isArray(fileInfo)) {
        return fileInfo.filter(item => 
          item && 
          typeof item === 'object' && 
          item.value && 
          typeof item.value === 'string'
        );
      }
      
      return [];
    } catch (e) {
      console.error('Error parsing file_information:', e);
      return [];
    }
  };

  const getTags = (sample: MBAnalysisResult['sample']): string[] => {
    if (sample?.tags == null) return [];
    if (Array.isArray(sample.tags)) {
      return sample.tags.map(tag => getStringValue(tag));
    }
    // Safely coerce to string (handles unexpected types) and split
    const tagStr = String(sample.tags);
    if (!tagStr || tagStr === 'null' || tagStr === 'undefined') return [];
    return tagStr.split(',').map(tag => tag.trim()).filter(Boolean);
  };

  const getIntelligenceData = (sample: MBAnalysisResult['sample']) => {
    if (!sample?.intelligence) return null;
    
    const intel = sample.intelligence;
    return {
      clamav: Array.isArray(intel.clamav) ? intel.clamav.map(item => getStringValue(item)) : [],
      downloads: intel.downloads ? String(intel.downloads) : '0',
      uploads: intel.uploads ? String(intel.uploads) : '0',
      mail: intel.mail ? String(intel.mail) : '0'
    };
  };

  const getYaraRules = (sample: MBAnalysisResult['sample']) => {
    if (!sample?.yara_rules) return [];
    if (!Array.isArray(sample.yara_rules)) return [];
    
    return sample.yara_rules.map((rule: any) => ({
      rule_name: getStringValue(rule.rule_name || rule.name || ''),
      author: getStringValue(rule.author || ''),
      description: getStringValue(rule.description || '')
    }));
  };

  if (!isClient) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-muted/20 rounded animate-pulse" />
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-32 bg-muted/20 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!results || results.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Search Results ({results.length})
        </h3>
        <div className="text-sm text-muted-foreground">
          {results.filter(r => r?.found).length} found • {results.filter(r => !r?.found).length} not found
        </div>
      </div>

      {results.map((result, index) => {
        if (!result) return null;
        
        const isExpanded = expandedResult === `result-${index}`;
        const statusColor = getStatusColor(result.found);
        const sample = result.sample;
        const tags = getTags(sample);
        const intelligenceData = getIntelligenceData(sample);
        const yaraRules = getYaraRules(sample);
        const fileInformation = sample ? getFileInformation(sample.file_information) : [];
        
        return (
          <div
            key={`result-${index}`}
            className={`glass border rounded-xl overflow-hidden transition-all duration-300 ${statusColor}`}
          >
            {/* Result Header */}
            <div 
              className="p-4 cursor-pointer" 
              onClick={() => toggleExpand(`result-${index}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  toggleExpand(`result-${index}`);
                }
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="p-2 rounded-lg bg-black/10">
                    {getStatusIcon(result.found)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex items-center gap-1.5">
                        {getIndicatorIcon(result.ioc_type)}
                        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          {result.ioc_type || 'unknown'}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        result.found 
                          ? 'bg-primary/20 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {result.found ? 'Sample Found' : 'Not Found'}
                      </span>
                      {sample?.signature && (
                        <span className="px-2 py-0.5 bg-accent/20 text-accent rounded text-xs font-medium">
                          {getStringValue(sample.signature)}
                        </span>
                      )}
                    </div>
                    
                    <p className="font-mono text-sm break-all mb-1">
                      {getStringValue(result.ioc)}
                    </p>
                    
                    {sample && (
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                        <div className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          <span>{getStringValue(sample.file_name)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(sample.first_seen)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          <span>{formatBytes(sample.file_size)}</span>
                        </div>
                        {sample.origin_country && (
                          <div className="flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            <span>{getStringValue(sample.origin_country)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(getStringValue(result.ioc), `copy-ioc-${index}`);
                    }}
                    className="p-1.5 rounded hover:bg-black/10 transition-colors"
                    title="Copy IOC"
                    type="button"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  {sample?.sha256_hash && (
                    <a
                      href={`https://bazaar.abuse.ch/sample/${getStringValue(sample.sha256_hash)}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded hover:bg-black/10 transition-colors"
                      title="View on MalwareBazaar"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    className="p-1.5 rounded hover:bg-black/10 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(`result-${index}`);
                    }}
                    type="button"
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
            {isExpanded && sample && (
              <div className="border-t border-border/50 bg-black/5">
                <div className="p-4 space-y-6">
                  {/* Basic Sample Information */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Sample Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <InfoItem label="Filename" value={getStringValue(sample.file_name)} icon={<FileText className="w-3 h-3" />} />
                      <InfoItem label="File Size" value={formatBytes(sample.file_size)} icon={<Download className="w-3 h-3" />} />
                      <InfoItem label="File Type" value={getStringValue(sample.file_type)} icon={<FileCode className="w-3 h-3" />} />
                      <InfoItem label="MIME Type" value={getStringValue(sample.file_type_mime)} icon={<Cpu className="w-3 h-3" />} />
                      <InfoItem label="First Seen" value={formatDate(sample.first_seen)} icon={<Calendar className="w-3 h-3" />} />
                      <InfoItem label="Last Seen" value={formatDate(sample.last_seen)} icon={<Clock className="w-3 h-3" />} />
                      <InfoItem label="Reporter" value={getStringValue(sample.reporter)} icon={<User className="w-3 h-3" />} />
                      <InfoItem label="Anonymous" value={sample.anonymous ? 'Yes' : 'No'} icon={<EyeOff className="w-3 h-3" />} />
                      <InfoItem label="Origin Country" value={getStringValue(sample.origin_country)} icon={<Globe className="w-3 h-3" />} />
                    </div>
                  </div>

                  {/* Hashes */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      File Hashes
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <HashItem label="SHA256" value={getStringValue(sample.sha256_hash)} onCopy={() => handleCopy(getStringValue(sample.sha256_hash), `sha256-${index}`)} />
                      <HashItem label="SHA1" value={getStringValue(sample.sha1_hash)} onCopy={() => handleCopy(getStringValue(sample.sha1_hash), `sha1-${index}`)} />
                      <HashItem label="MD5" value={getStringValue(sample.md5_hash)} onCopy={() => handleCopy(getStringValue(sample.md5_hash), `md5-${index}`)} />
                      <HashItem label="SSDEEP" value={getStringValue(sample.ssdeep)} onCopy={() => handleCopy(getStringValue(sample.ssdeep), `ssdeep-${index}`)} />
                      {sample.imphash && (
                        <HashItem label="Imphash" value={getStringValue(sample.imphash)} onCopy={() => handleCopy(getStringValue(sample.imphash), `imphash-${index}`)} />
                      )}
                      {sample.tlsh && (
                        <HashItem label="TLSH" value={getStringValue(sample.tlsh)} onCopy={() => handleCopy(getStringValue(sample.tlsh), `tlsh-${index}`)} />
                      )}
                      {sample.telfhash && (
                        <HashItem label="Telfhash" value={getStringValue(sample.telfhash)} onCopy={() => handleCopy(getStringValue(sample.telfhash), `telfhash-${index}`)} />
                      )}
                      {sample.dhash_icon && (
                        <HashItem label="Icon Hash" value={getStringValue(sample.dhash_icon)} onCopy={() => handleCopy(getStringValue(sample.dhash_icon), `icon-${index}`)} />
                      )}
                    </div>
                  </div>

                  {/* Signature and Tags */}
                  {(sample.signature || tags.length > 0) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {sample.signature && (
                        <div>
                          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Antivirus Signature
                          </h4>
                          <div className="p-3 bg-muted/10 rounded-lg">
                            <code className="text-sm font-mono text-foreground break-all">
                              {getStringValue(sample.signature)}
                            </code>
                          </div>
                        </div>
                      )}
                      
                      {tags.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                            <Tag className="w-4 h-4" />
                            Tags ({tags.length})
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1.5 bg-muted text-muted-foreground rounded-lg text-sm hover:bg-muted/80 transition-colors cursor-default"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Intelligence Data */}
                  {intelligenceData && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Network className="w-4 h-4" />
                        Intelligence Data
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {intelligenceData.clamav.length > 0 && (
                          <div className="space-y-2">
                            <h5 className="text-sm font-medium text-foreground flex items-center gap-2">
                              <Shield className="w-3 h-3" />
                              ClamAV Detections ({intelligenceData.clamav.length})
                            </h5>
                            <div className="space-y-1 max-h-48 overflow-y-auto">
                              {intelligenceData.clamav.map((detection, idx) => (
                                <div key={idx} className="text-xs p-2 bg-destructive/5 text-destructive rounded">
                                  {detection}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="space-y-4">
                          <div className="p-3 bg-primary/5 rounded-lg">
                            <h5 className="text-sm font-medium text-foreground flex items-center gap-2">
                              <Download className="w-3 h-3" />
                              Downloads
                            </h5>
                            <p className="text-lg font-bold text-primary mt-1">{intelligenceData.downloads}</p>
                            <p className="text-xs text-muted-foreground">Count</p>
                          </div>
                          
                          <div className="p-3 bg-accent/5 rounded-lg">
                            <h5 className="text-sm font-medium text-foreground flex items-center gap-2">
                              <Upload className="w-3 h-3" />
                              Uploads
                            </h5>
                            <p className="text-lg font-bold text-accent mt-1">{intelligenceData.uploads}</p>
                            <p className="text-xs text-muted-foreground">Count</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Delivery Method and Related URLs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sample.delivery_method && (
                      <div>
                        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                          <Server className="w-4 h-4" />
                          Delivery Method
                        </h4>
                        <div className="p-3 bg-muted/10 rounded-lg">
                          <p className="text-sm text-foreground">{getStringValue(sample.delivery_method)}</p>
                        </div>
                      </div>
                    )}
                    
                    {fileInformation.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                          <LinkIcon className="w-4 h-4" />
                          Related URLs ({fileInformation.length})
                        </h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {fileInformation.map((item, idx) => (
                            <div key={idx} className="p-2 bg-muted/10 rounded-lg hover:bg-muted/20 transition-colors">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                    <Shield className="w-3 h-3" />
                                    {item.context || 'URL'}
                                  </div>
                                  <a
                                    href={item.value}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary hover:underline break-all"
                                  >
                                    {item.value}
                                  </a>
                                </div>
                                <button
                                  onClick={() => handleCopy(item.value, `url-${index}-${idx}`)}
                                  className="p-1 hover:bg-muted rounded ml-2 flex-shrink-0"
                                  type="button"
                                  title="Copy URL"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* YARA Rules */}
                  {yaraRules.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        YARA Rules ({yaraRules.length})
                      </h4>
                      <div className="space-y-3">
                        {yaraRules.map((rule, idx) => (
                          <div key={idx} className="p-3 border border-border rounded-lg hover:border-primary/30 transition-colors">
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="font-medium text-foreground">{rule.rule_name}</h5>
                              <span className="text-xs text-muted-foreground">by {rule.author}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{rule.description || 'No description available'}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                    {sample.sha256_hash && (
                      <a
                        href={`https://bazaar.abuse.ch/sample/${getStringValue(sample.sha256_hash)}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Full Report on MalwareBazaar
                      </a>
                    )}
                    <button
                      onClick={() => {
                        const allHashes = [
                          `SHA256: ${getStringValue(sample.sha256_hash)}`,
                          `SHA1: ${getStringValue(sample.sha1_hash)}`,
                          `MD5: ${getStringValue(sample.md5_hash)}`,
                          `SSDEEP: ${getStringValue(sample.ssdeep)}`,
                          sample.imphash ? `Imphash: ${getStringValue(sample.imphash)}` : '',
                          sample.tlsh ? `TLSH: ${getStringValue(sample.tlsh)}` : '',
                          sample.telfhash ? `Telfhash: ${getStringValue(sample.telfhash)}` : '',
                          sample.dhash_icon ? `Icon Hash: ${getStringValue(sample.dhash_icon)}` : ''
                        ].filter(Boolean).join('\n');
                        handleCopy(allHashes, `full-copy-${index}`);
                      }}
                      className="px-4 py-2 border border-border rounded-lg hover:bg-muted/20 transition-colors flex items-center gap-2"
                      type="button"
                    >
                      <Copy className="w-4 h-4" />
                      Copy All Hashes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Expanded Details - Not Found */}
            {isExpanded && !sample && (
              <div className="border-t border-border/50 bg-black/5 p-4">
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <h4 className="font-semibold text-foreground mb-2">Sample Not Found</h4>
                  <p className="text-muted-foreground mb-4">
                    This indicator was not found in the MalwareBazaar database.
                  </p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Possible reasons:</p>
                    <ul className="list-disc list-inside text-left max-w-md mx-auto">
                      <li>The sample may not be publicly available</li>
                      <li>It might be too recent (check back later)</li>
                      <li>The hash format might be incorrect</li>
                      <li>Try searching with different hash types</li>
                    </ul>
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
function InfoItem({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <p className="text-foreground font-medium break-all">{value}</p>
    </div>
  );
}

function HashItem({ label, value, onCopy }: { label: string; value: string; onCopy: () => void }) {
  if (!value || value === 'N/A') return null;
  
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <button
          onClick={onCopy}
          className="p-1 hover:bg-muted rounded transition-colors"
          title={`Copy ${label}`}
          type="button"
        >
          <Copy className="w-3 h-3" />
        </button>
      </div>
      <code className="text-xs font-mono text-foreground bg-muted/30 p-2 rounded block break-all">
        {value}
      </code>
    </div>
  );
}