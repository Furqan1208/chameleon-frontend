// components/threat-intel/AbuseChResults.tsx - FINAL CORRECTED VERSION
'use client';

import { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Shield, 
  ChevronDown, 
  ChevronUp,
  Copy,
  ExternalLink,
  Globe,
  FileText,
  Tag,
  Users,
  Calendar,
  Eye,
  Download,
  Link as LinkIcon,
  Database,
  Hash,
  Server,
  Cpu,
  Clock,
  Network
} from 'lucide-react';
import type { AbuseChCombinedResult } from '@/hooks/useAbuseCh';

interface AbuseChResultsProps {
  results: AbuseChCombinedResult[];
  onDownloadMalware?: (sha256: string) => Promise<void>;
}

export function AbuseChResults({ results, onDownloadMalware }: AbuseChResultsProps) {
  const [expandedResult, setExpandedResult] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'urlhaus' | 'threatfox'>('urlhaus');

  // Auto-switch to ThreatFox tab when only ThreatFox has data
  useEffect(() => {
    if (expandedResult) {
      const currentResult = results.find(r => r.indicator === expandedResult);
      if (currentResult) {
        const hasURLhaus = hasURLhausData(currentResult);
        const hasThreatFox = hasThreatFoxData(currentResult);
        
        // Auto-select the tab with data
        if (hasThreatFox && !hasURLhaus) {
          setActiveTab('threatfox');
        } else if (hasURLhaus && !hasThreatFox) {
          setActiveTab('urlhaus');
        }
      }
    }
  }, [expandedResult, results]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleExpand = (indicator: string) => {
    if (expandedResult === indicator) {
      setExpandedResult(null);
    } else {
      setExpandedResult(indicator);
      // Reset tab to default when expanding a new result
      setActiveTab('urlhaus');
    }
  };

  const formatDate = (dateString?: string): string => {
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

  const getIndicatorType = (indicator: string) => {
    if (indicator.startsWith('http')) return { type: 'URL', icon: <LinkIcon className="w-4 h-4" /> };
    if (/^[a-f0-9]{64}$/i.test(indicator)) return { type: 'SHA256', icon: <Hash className="w-4 h-4" /> };
    if (/^[a-f0-9]{32}$/i.test(indicator)) return { type: 'MD5', icon: <Hash className="w-4 h-4" /> };
    if (/^\d+$/.test(indicator)) return { type: 'ID', icon: <Tag className="w-4 h-4" /> };
    if (indicator.includes('.')) return { type: 'Domain/IP', icon: <Globe className="w-4 h-4" /> };
    return { type: 'IOC', icon: <Cpu className="w-4 h-4" /> };
  };

  // Check if ThreatFox has actual data
  const hasThreatFoxData = (result: AbuseChCombinedResult) => {
    if (!result.threatfox) return false;
    
    // Check if data exists directly on threatfox object
    if (result.threatfox.id || result.threatfox.ioc) {
      return true;
    }
    
    // Also check raw_data
    if (result.threatfox.raw_data?.query_status === 'ok') {
      const rawData = result.threatfox.raw_data;
      if (Array.isArray(rawData.data) && rawData.data.length > 0) return true;
      if (rawData.id || rawData.ioc) return true;
    }
    
    return false;
  };

  // Check if URLhaus has data
  const hasURLhausData = (result: AbuseChCombinedResult) => {
    if (!result.urlhaus) return false;
    
    // URLhaus query_status check
    if (result.urlhaus.query_status === 'ok') {
      return true;
    }
    
    // Also check raw_data
    if (result.urlhaus.raw_data?.query_status === 'ok') {
      return true;
    }
    
    return false;
  };

  // Get the correct ThreatFox data object
  const getThreatFoxDisplayData = (result: AbuseChCombinedResult) => {
    if (!result.threatfox) return null;
    
    // Priority 1: Data is directly on threatfox object
    if (result.threatfox.id || result.threatfox.ioc) {
      return result.threatfox;
    }
    
    // Priority 2: Data is in raw_data.data array
    if (result.threatfox.raw_data?.data && Array.isArray(result.threatfox.raw_data.data)) {
      return result.threatfox.raw_data.data[0] || result.threatfox.raw_data;
    }
    
    // Priority 3: raw_data itself has the data
    if (result.threatfox.raw_data && (result.threatfox.raw_data.id || result.threatfox.raw_data.ioc)) {
      return result.threatfox.raw_data;
    }
    
    return null;
  };

  // Get URLhaus data for display
  const getURLhausDisplayData = (result: AbuseChCombinedResult) => {
    if (!result.urlhaus) return null;
    
    // Use raw_data if available, otherwise use the object itself
    return result.urlhaus.raw_data || result.urlhaus;
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
          {results.filter(r => hasURLhausData(r) || hasThreatFoxData(r)).length} found
        </div>
      </div>

      {results.map((result, index) => {
        const isExpanded = expandedResult === result.indicator;
        const indicatorInfo = getIndicatorType(result.indicator);
        
        const hasURLhaus = hasURLhausData(result);
        const hasThreatFox = hasThreatFoxData(result);
        const threatFoxData = getThreatFoxDisplayData(result);
        const urlhausData = getURLhausDisplayData(result);
        
        const resultId = `result-${index}`;
        
        return (
          <div
            key={resultId}
            className={`glass border rounded-xl overflow-hidden transition-all duration-300 ${
              hasURLhaus 
                ? 'border-green-500/20 bg-green-500/5'
                : hasThreatFox 
                  ? 'border-purple-500/20 bg-purple-500/5'
                  : 'border-border bg-muted/5'
            }`}
          >
            {/* Result Header */}
            <div className="p-4 cursor-pointer" onClick={() => toggleExpand(result.indicator)}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="p-2 rounded-lg bg-black/10">
                    {indicatorInfo.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {indicatorInfo.type}
                      </span>
                      
                      {hasURLhaus && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-500">
                          URLhaus
                        </span>
                      )}
                      
                      {hasThreatFox && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-500/20 text-purple-500">
                          ThreatFox
                        </span>
                      )}
                    </div>
                    
                    <p className="font-mono text-sm break-all mb-1">
                      {result.indicator}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {/* URLhaus threat */}
                      {hasURLhaus && urlhausData && (
                        <>
                          {urlhausData.threat && (
                            <div className="flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>{urlhausData.threat}</span>
                            </div>
                          )}
                          
                          {/* For tag searches, show count */}
                          {Array.isArray(urlhausData.urls) && (
                            <div className="flex items-center gap-1">
                              <Database className="w-3 h-3" />
                              <span>{urlhausData.urls.length} URLs</span>
                            </div>
                          )}
                        </>
                      )}
                      
                      {/* ThreatFox data */}
                      {hasThreatFox && threatFoxData && (
                        <>
                          {threatFoxData.confidence_level && (
                            <div className="flex items-center gap-1">
                              <Shield className="w-3 h-3" />
                              <span>{threatFoxData.confidence_level}% confidence</span>
                            </div>
                          )}
                          
                          {threatFoxData.malware_printable && (
                            <div className="flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>{threatFoxData.malware_printable}</span>
                            </div>
                          )}
                          
                          {threatFoxData.threat_type_desc && !threatFoxData.malware_printable && (
                            <div className="flex items-center gap-1">
                              <Network className="w-3 h-3" />
                              <span>{threatFoxData.threat_type_desc}</span>
                            </div>
                          )}
                        </>
                      )}
                      
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
                      handleCopy(result.indicator, `copy-${resultId}`);
                    }}
                    className="p-1.5 rounded hover:bg-black/10 transition-colors"
                    title="Copy indicator"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    className="p-1.5 rounded hover:bg-black/10 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(result.indicator);
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
              
              {copied === `copy-${resultId}` && (
                <div className="mt-2 text-xs text-primary animate-pulse">
                  ✓ Copied to clipboard
                </div>
              )}
            </div>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="border-t border-border/50 bg-black/5">
                <div className="p-4 space-y-6">
                  {/* Service Tabs */}
                  {(hasURLhaus || hasThreatFox) && (
                    <div className="flex items-center gap-2 border-b border-border pb-2">
                      {hasURLhaus && (
                        <button
                          onClick={() => setActiveTab('urlhaus')}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            activeTab === 'urlhaus'
                              ? 'bg-green-500 text-white'
                              : 'hover:bg-muted/20 text-muted-foreground'
                          }`}
                        >
                          <Database className="w-4 h-4 inline mr-2" />
                          URLhaus
                        </button>
                      )}
                      
                      {hasThreatFox && (
                        <button
                          onClick={() => setActiveTab('threatfox')}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            activeTab === 'threatfox'
                              ? 'bg-purple-500 text-white'
                              : 'hover:bg-muted/20 text-muted-foreground'
                          }`}
                        >
                          <Shield className="w-4 h-4 inline mr-2" />
                          ThreatFox
                        </button>
                      )}
                    </div>
                  )}

                  {/* URLhaus Details - ORIGINAL WORKING VERSION */}
                  {activeTab === 'urlhaus' && hasURLhaus && urlhausData && (
                    <div className="space-y-4">
                      {/* For URL results */}
                      {urlhausData.url && (
                        <>
                          <div>
                            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                              <Database className="w-4 h-4" />
                              URL Information
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              <InfoItem 
                                label="Status" 
                                value={urlhausData.url_status || 'N/A'} 
                                icon={<Eye className="w-3 h-3" />} 
                              />
                              <InfoItem 
                                label="Host" 
                                value={urlhausData.host || 'N/A'} 
                                icon={<Server className="w-3 h-3" />} 
                              />
                              <InfoItem 
                                label="Threat" 
                                value={urlhausData.threat || 'N/A'} 
                                icon={<AlertTriangle className="w-3 h-3" />} 
                              />
                              <InfoItem 
                                label="Date Added" 
                                value={formatDate(urlhausData.date_added)} 
                                icon={<Calendar className="w-3 h-3" />} 
                              />
                              <InfoItem 
                                label="Reporter" 
                                value={urlhausData.reporter || 'N/A'} 
                                icon={<Users className="w-3 h-3" />} 
                              />
                              <InfoItem 
                                label="ID" 
                                value={urlhausData.id || 'N/A'} 
                                icon={<Tag className="w-3 h-3" />} 
                              />
                            </div>
                          </div>

                          {/* Tags for URL results */}
                          {urlhausData.tags && Array.isArray(urlhausData.tags) && urlhausData.tags.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                <Tag className="w-4 h-4" />
                                Tags ({urlhausData.tags.length})
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {urlhausData.tags.map((tag: string, idx: number) => (
                                  <span
                                    key={idx}
                                    className="px-3 py-1.5 bg-muted/50 rounded-lg"
                                  >
                                    <span className="text-sm font-medium text-foreground">{tag}</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Payloads */}
                          {urlhausData.payloads && Array.isArray(urlhausData.payloads) && urlhausData.payloads.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Payloads ({urlhausData.payloads.length})
                              </h4>
                              <div className="space-y-3">
                                {urlhausData.payloads.map((payload: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className="p-3 border border-border/50 rounded-lg"
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <FileText className="w-3 h-3 text-muted-foreground" />
                                        <span className="text-sm font-medium text-foreground">
                                          {payload.filename}
                                        </span>
                                      </div>
                                      <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-500 rounded">
                                        {payload.file_type}
                                      </span>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                      <div>
                                        <p className="text-muted-foreground">SHA256</p>
                                        <code className="text-foreground font-mono truncate block">
                                          {payload.response_sha256}
                                        </code>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground">Signature</p>
                                        <p className="text-foreground">{payload.signature}</p>
                                      </div>
                                    </div>
                                    
                                    {onDownloadMalware && payload.response_sha256 && (
                                      <button
                                        onClick={() => onDownloadMalware(payload.response_sha256)}
                                        className="mt-2 px-3 py-1 text-xs border border-border rounded hover:bg-muted/20 transition-colors flex items-center gap-1"
                                      >
                                        <Download className="w-3 h-3" />
                                        Download Sample
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {/* For TAG results */}
                      {Array.isArray(urlhausData.urls) && urlhausData.urls.length > 0 && (
                        <>
                          <div>
                            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                              <Tag className="w-4 h-4" />
                              Tag Search: {result.indicator} ({urlhausData.urls.length} URLs)
                            </h4>
                            <p className="text-sm text-muted-foreground mb-4">
                              Showing URLs tagged with "{result.indicator}"
                            </p>
                          </div>

                          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                            {urlhausData.urls.slice(0, 10).map((urlItem: any, idx: number) => (
                              <div
                                key={idx}
                                className="p-3 border border-border/50 rounded-lg hover:bg-muted/10 transition-colors"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <LinkIcon className="w-3 h-3 text-muted-foreground" />
                                      <code className="text-xs font-mono text-foreground break-all">
                                        {urlItem.url}
                                      </code>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                                      <span className={`px-2 py-0.5 rounded ${urlItem.url_status === 'online' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                        {urlItem.url_status}
                                      </span>
                                      <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-500">
                                        {urlItem.threat}
                                      </span>
                                      <span>
                                        {formatDate(urlItem.dateadded)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Tags for each URL */}
                                {urlItem.tags && urlItem.tags.length > 0 && (
                                  <div className="mt-2">
                                    <div className="flex flex-wrap gap-1">
                                      {urlItem.tags.map((tag: string, tagIdx: number) => (
                                        <span
                                          key={tagIdx}
                                          className="px-2 py-0.5 text-xs bg-muted/50 rounded"
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Reference link */}
                                {urlItem.urlhaus_reference && (
                                  <div className="mt-2">
                                    <a 
                                      href={urlItem.urlhaus_reference}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-blue-500 hover:text-blue-600 hover:underline flex items-center gap-1"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                      View on URLhaus
                                    </a>
                                  </div>
                                )}
                              </div>
                            ))}
                            
                            {urlhausData.urls.length > 10 && (
                              <div className="text-center py-2 text-sm text-muted-foreground">
                                Showing 10 of {urlhausData.urls.length} URLs. Use the raw data view to see all results.
                              </div>
                            )}
                          </div>
                        </>
                      )}

                      {/* Raw Data Section */}
                      <div className="mt-4">
                        <details className="group">
                          <summary className="cursor-pointer text-sm font-medium text-foreground hover:text-green-600 transition-colors flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            View Raw Data
                            <span className="ml-auto group-open:rotate-90 transition-transform">→</span>
                          </summary>
                          <div className="mt-3 p-3 bg-black/10 rounded-lg overflow-x-auto">
                            <pre className="text-xs font-mono text-foreground/80 whitespace-pre-wrap">
                              {JSON.stringify(urlhausData, null, 2)}
                            </pre>
                          </div>
                        </details>
                      </div>
                    </div>
                  )}

                  {/* ThreatFox Details - WITH FIXES */}
                  {activeTab === 'threatfox' && hasThreatFox && threatFoxData && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          ThreatFox IOC Details
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <InfoItem 
                            label="IOC" 
                            value={threatFoxData.ioc || 'N/A'} 
                            icon={<Tag className="w-3 h-3" />} 
                          />
                          <InfoItem 
                            label="Malware" 
                            value={threatFoxData.malware_printable || threatFoxData.malware || 'Unknown'} 
                            icon={<AlertTriangle className="w-3 h-3" />} 
                          />
                          <InfoItem 
                            label="Threat Type" 
                            value={threatFoxData.threat_type_desc || threatFoxData.threat_type || 'N/A'} 
                            icon={<Shield className="w-3 h-3" />} 
                          />
                          <InfoItem 
                            label="IOC Type" 
                            value={threatFoxData.ioc_type_desc || threatFoxData.ioc_type || 'N/A'} 
                            icon={<Cpu className="w-3 h-3" />} 
                          />
                          <InfoItem 
                            label="Confidence" 
                            value={`${threatFoxData.confidence_level || 0}%`} 
                            icon={<Users className="w-3 h-3" />} 
                          />
                          <InfoItem 
                            label="First Seen" 
                            value={formatDate(threatFoxData.first_seen)} 
                            icon={<Calendar className="w-3 h-3" />} 
                          />
                          {threatFoxData.last_seen && (
                            <InfoItem 
                              label="Last Seen" 
                              value={formatDate(threatFoxData.last_seen)} 
                              icon={<Clock className="w-3 h-3" />} 
                            />
                          )}
                          <InfoItem 
                            label="Reporter" 
                            value={threatFoxData.reporter || 'N/A'} 
                            icon={<Users className="w-3 h-3" />} 
                          />
                          <InfoItem 
                            label="ThreatFox ID" 
                            value={threatFoxData.id || 'N/A'} 
                            icon={<Database className="w-3 h-3" />} 
                          />
                        </div>
                      </div>

                      {/* Tags - FIXED: Your tags are strings, not objects */}
                      {threatFoxData.tags && Array.isArray(threatFoxData.tags) && threatFoxData.tags.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                            <Tag className="w-4 h-4" />
                            Tags ({threatFoxData.tags.length})
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {threatFoxData.tags.map((tag: string | any, idx: number) => (
                              <div
                                key={idx}
                                className="px-3 py-1.5 bg-muted/50 rounded-lg"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-foreground">
                                    {typeof tag === 'string' ? tag : tag.tag || 'Unknown'}
                                  </span>
                                  {typeof tag === 'object' && tag.tagset && (
                                    <span className="text-xs px-1.5 py-0.5 bg-black/20 rounded">
                                      {tag.tagset}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Reference Link */}
                      {threatFoxData.reference && (
                        <div>
                          <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                            <ExternalLink className="w-4 h-4" />
                            Reference
                          </h4>
                          <a 
                            href={threatFoxData.reference} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-500 hover:text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            View Source
                          </a>
                        </div>
                      )}

                      {/* Malpedia Link */}
                      {threatFoxData.malware_malpedia && (
                        <div>
                          <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                            <ExternalLink className="w-4 h-4" />
                            Malpedia
                          </h4>
                          <a 
                            href={threatFoxData.malware_malpedia} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-500 hover:text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            View on Malpedia
                          </a>
                        </div>
                      )}

                      {/* Raw Data Section */}
                      <div className="mt-4">
                        <details className="group">
                          <summary className="cursor-pointer text-sm font-medium text-foreground hover:text-purple-600 transition-colors flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            View Raw Data
                            <span className="ml-auto group-open:rotate-90 transition-transform">→</span>
                          </summary>
                          <div className="mt-3 p-3 bg-black/10 rounded-lg overflow-x-auto">
                            <pre className="text-xs font-mono text-foreground/80 whitespace-pre-wrap">
                              {JSON.stringify(threatFoxData, null, 2)}
                            </pre>
                          </div>
                        </details>
                      </div>
                    </div>
                  )}

                  {/* No results message */}
                  {!hasURLhaus && !hasThreatFox && (
                    <div className="p-4 border border-yellow-500/30 bg-yellow-500/5 rounded-lg">
                      <p className="text-sm text-yellow-700">
                        ⚠️ No results found for this indicator.
                      </p>
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

// Helper component
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