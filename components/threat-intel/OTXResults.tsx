// D:\FYP\Chameleon Frontend\components\threat-intel\OTXResults.tsx

'use client';

import { useState } from 'react';
import { 
  AlertTriangle, 
  Shield, 
  ChevronDown, 
  ChevronUp,
  Copy,
  ExternalLink,
  Globe,
  FileText,
  Hash,
  Link as LinkIcon,
  Network,
  Cpu,
  Download,
  Users,
  Tag,
  Calendar,
  Star,
  StarOff,
  Database,
  BarChart3,
  MapPin,
  Lock,
  Unlock,
  Code,
  Activity,
  Bug,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  ArrowRight,
  DownloadCloud,
  Search,
  Filter,
  Clock,
  TrendingUp,
  TrendingDown,
  PieChart
} from 'lucide-react';
import type { OTXResult } from '@/lib/types/alienvault.types';

interface OTXResultsProps {
  results: OTXResult[];
  onToggleFavorite?: (id: string) => Promise<void>;
}

export function OTXResults({ results, onToggleFavorite }: OTXResultsProps) {
  const [expandedResult, setExpandedResult] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [showAllMalware, setShowAllMalware] = useState<Record<string, boolean>>({});
  const [showAllURLs, setShowAllURLs] = useState<Record<string, boolean>>({});

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleExpand = (id: string) => {
    setExpandedResult(expandedResult === id ? null : id);
  };

  const toggleShowAllMalware = (resultId: string) => {
    setShowAllMalware(prev => ({
      ...prev,
      [resultId]: !prev[resultId]
    }));
  };

  const toggleShowAllURLs = (resultId: string) => {
    setShowAllURLs(prev => ({
      ...prev,
      [resultId]: !prev[resultId]
    }));
  };

  const getThreatColor = (threatLevel: OTXResult['threat_level']) => {
    switch (threatLevel) {
      case 'high':
        return 'text-destructive border-destructive/20 bg-destructive/5';
      case 'medium':
        return 'text-accent border-accent/20 bg-accent/5';
      case 'low':
        return 'text-yellow-500 border-yellow-500/20 bg-yellow-500/5';
      case 'clean':
        return 'text-green-500 border-green-500/20 bg-green-500/5';
      default:
        return 'text-muted-foreground border-[#1a1a1a] bg-[#0d0d0d]';
    }
  };

  const getThreatIcon = (threatLevel: OTXResult['threat_level']) => {
    switch (threatLevel) {
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-destructive" />;
      case 'medium':
        return <AlertCircle className="w-5 h-5 text-accent" />;
      case 'low':
        return <Shield className="w-5 h-5 text-yellow-500" />;
      case 'clean':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Shield className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getIndicatorIcon = (type: OTXResult['ioc_type']) => {
    switch (type) {
      case 'IPv4':
      case 'IPv6':
        return <Network className="w-4 h-4" />;
      case 'domain':
        return <Globe className="w-4 h-4" />;
      case 'hostname':
        return <Globe className="w-4 h-4" />;
      case 'url':
        return <LinkIcon className="w-4 h-4" />;
      case 'file':
        return <FileText className="w-4 h-4" />;
      case 'cve':
        return <Lock className="w-4 h-4" />;
      default:
        return <Cpu className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (isNaN(date.getTime())) {
        return dateString;
      }
      
      if (diffDays === 0) {
        return 'Today ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      } else if (diffDays === 1) {
        return 'Yesterday ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else if (diffDays < 30) {
        return `${Math.floor(diffDays / 7)} weeks ago`;
      } else {
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
    } catch {
      return dateString;
    }
  };

  const formatDetailedDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getFileTypeName = (fileType?: string): string => {
    if (!fileType) return 'Unknown';
    
    const typeMap: Record<string, string> = {
      'exe': 'Executable',
      'dll': 'Dynamic Link Library',
      'pdf': 'PDF Document',
      'doc': 'Word Document',
      'docx': 'Word Document',
      'xls': 'Excel Spreadsheet',
      'xlsx': 'Excel Spreadsheet',
      'ppt': 'PowerPoint Presentation',
      'pptx': 'PowerPoint Presentation',
      'zip': 'Zip Archive',
      'rar': 'RAR Archive',
      '7z': '7-Zip Archive',
      'js': 'JavaScript',
      'php': 'PHP Script',
      'py': 'Python Script',
      'sh': 'Shell Script',
      'bat': 'Batch File',
      'ps1': 'PowerShell Script',
      'txt': 'Text File',
      'log': 'Log File',
      'csv': 'CSV File',
      'xml': 'XML File',
      'json': 'JSON File',
      'html': 'HTML File',
      'htm': 'HTML File',
      'svg': 'SVG Image',
      'png': 'PNG Image',
      'jpg': 'JPEG Image',
      'jpeg': 'JPEG Image',
      'gif': 'GIF Image',
      'bmp': 'Bitmap Image',
      'ico': 'Icon File',
      'msi': 'Windows Installer',
      'iso': 'Disk Image',
      'vhd': 'Virtual Hard Disk',
      'ova': 'Open Virtual Appliance',
      'ovf': 'Open Virtualization Format'
    };
    
    const lowerType = fileType.toLowerCase();
    return typeMap[lowerType] || fileType.charAt(0).toUpperCase() + fileType.slice(1);
  };

  const getMalwareDetectionCount = (detections: Record<string, string | null> = {}): number => {
    return Object.values(detections).filter(detection => detection && detection !== 'null' && detection !== '').length;
  };

  const getMalwareSeverity = (detections: Record<string, string | null> = {}): string => {
    const count = getMalwareDetectionCount(detections);
    if (count >= 10) return 'High';
    if (count >= 5) return 'Medium';
    if (count >= 1) return 'Low';
    return 'None';
  };

  const getPopularAVDetections = (detections: Record<string, string | null> = {}): Array<{name: string, detection: string}> => {
    const popularAVs = ['msdefender', 'avast', 'clamav', 'kaspersky', 'bitdefender', 'eset', 'symantec', 'mcafee'];
    
    return popularAVs
      .map(av => ({
        name: av,
        detection: detections[av]
      }))
      .filter((item): item is {name: string, detection: string} => {
        return item.detection !== null && item.detection !== undefined && item.detection !== 'null' && item.detection !== '';
      })
      .slice(0, 3);
  };

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          Scan Results ({results.length})
        </h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <PieChart className="w-4 h-4" />
          <span>{results.filter(r => r.threat_level === 'high' || r.threat_level === 'medium').length} threats detected</span>
          <span className="mx-1">•</span>
          <span>{results.reduce((sum, r) => sum + r.pulse_count, 0)} total pulses</span>
        </div>
      </div>

      {results.map((result, index) => {
        const resultId = `result-${index}`;
        const isExpanded = expandedResult === resultId;
        const threatColor = getThreatColor(result.threat_level);
        const showAllMalwareForResult = showAllMalware[resultId] || false;
        const showAllURLsForResult = showAllURLs[resultId] || false;
        
        // Defensive check for malware data
        const malwareDetectionStats = result.sections?.malware?.data?.reduce((stats, malware) => {
          const detectionCount = getMalwareDetectionCount(malware.detections);
          if (detectionCount >= 10) stats.high++;
          else if (detectionCount >= 5) stats.medium++;
          else if (detectionCount >= 1) stats.low++;
          else stats.none++;
          return stats;
        }, { high: 0, medium: 0, low: 0, none: 0 }) || { high: 0, medium: 0, low: 0, none: 0 };
        
        return (
          <div
            key={resultId}
            className={`rounded-lg border overflow-hidden transition-all duration-300 ${threatColor}`}
          >
            {/* Result Header */}
            <div className="p-4 cursor-pointer" onClick={() => toggleExpand(resultId)}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`p-2 rounded-lg ${
                    result.threat_level === 'high' ? 'bg-destructive/10' :
                    result.threat_level === 'medium' ? 'bg-accent/10' :
                    result.threat_level === 'low' ? 'bg-yellow-500/10' :
                    result.threat_level === 'clean' ? 'bg-green-500/10' :
                    'bg-muted'
                  }`}>
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
                      <div className="flex items-center gap-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${
                          result.threat_level === 'high' ? 'bg-destructive/20 text-destructive' :
                          result.threat_level === 'medium' ? 'bg-accent/20 text-accent' :
                          result.threat_level === 'low' ? 'bg-yellow-500/20 text-yellow-500' :
                          result.threat_level === 'clean' ? 'bg-green-500/20 text-green-500' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {result.threat_level === 'clean' ? 'Clean' : `${result.threat_level} Risk`}
                        </span>
                        {result.pulse_count > 0 && (
                          <span className="px-2 py-0.5 bg-orange-500/20 text-orange-500 rounded text-xs font-medium flex items-center gap-1">
                            <Activity className="w-3 h-3" />
                            {result.pulse_count} pulse{result.pulse_count !== 1 ? 's' : ''}
                          </span>
                        )}
                        {result.malware_count > 0 && (
                          <span className="px-2 py-0.5 bg-destructive/20 text-destructive rounded text-xs font-medium flex items-center gap-1">
                            <Bug className="w-3 h-3" />
                            {result.malware_count} malware
                          </span>
                        )}
                        {result.url_count > 0 && (
                          <span className="px-2 py-0.5 bg-blue-500/20 text-blue-500 rounded text-xs font-medium flex items-center gap-1">
                            <LinkIcon className="w-3 h-3" />
                            {result.url_count} URLs
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className="font-mono text-sm break-all mb-2 bg-black/20 p-2 rounded border border-[#1a1a1a]">
                      {result.ioc}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      {/* Threat Score */}
                      <div className="flex items-center gap-1">
                        <BarChart3 className="w-3 h-3" />
                        <span className="font-medium">
                          Threat Score: 
                          <span className={`ml-1 ${
                            (result.threat_score ?? 0) >= 70 ? 'text-destructive' :
                            (result.threat_score ?? 0) >= 50 ? 'text-accent' :
                            (result.threat_score ?? 0) >= 30 ? 'text-yellow-500' :
                            (result.threat_score ?? 0) >= 10 ? 'text-primary' :
                            'text-green-500'
                          }`}>
                            {(result.threat_score ?? 0).toFixed(1)}/100
                          </span>
                        </span>
                      </div>
                      
                      {/* ASN */}
                      {result.sections?.general?.asn && (
                        <div className="flex items-center gap-1">
                          <Network className="w-3 h-3" />
                          <span>{result.sections.general.asn}</span>
                        </div>
                      )}
                      
                      {/* File Type for hashes */}
                      {result.ioc_type === 'file' && result.file_type && (
                        <div className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          <span>{getFileTypeName(result.file_type)}</span>
                        </div>
                      )}
                      
                      {/* Location */}
                      {(result.sections?.general?.latitude && result.sections?.general?.longitude) && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>
                            {result.sections.general.city || result.sections.general.region || result.sections.general.country_name || 'Unknown location'}
                          </span>
                        </div>
                      )}
                      
                      {/* Timestamp */}
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
                      handleCopy(result.ioc, `copy-ioc-${index}`);
                    }}
                    className="p-1.5 rounded hover:bg-black/10 transition-colors"
                    title="Copy IOC"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <a
                    href={result.otx_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 rounded hover:bg-black/10 transition-colors"
                    title="View on AlienVault OTX"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    className="p-1.5 rounded hover:bg-black/10 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(resultId);
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
                <div className="mt-2 text-xs text-primary animate-pulse flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Copied to clipboard
                </div>
              )}
            </div>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="border-t border-[#1a1a1a] bg-black/20">
                <div className="p-4 space-y-6">
                  {/* General Information */}
                  {result.sections?.general && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        General Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {result.sections.general.indicator && (
                          <InfoItem label="Indicator" value={result.sections.general.indicator} icon={<Cpu className="w-3 h-3" />} />
                        )}
                        {result.sections.general.type && (
                          <InfoItem label="Type" value={result.sections.general.type} icon={<Tag className="w-3 h-3" />} />
                        )}
                        {result.sections.general.asn && (
                          <InfoItem label="ASN" value={result.sections.general.asn} icon={<Network className="w-3 h-3" />} />
                        )}
                        {(result.sections.general.latitude && result.sections.general.longitude) && (
                          <InfoItem 
                            label="Location" 
                            value={
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-3 h-3" />
                                  <span>
                                    {result.sections.general.city || result.sections.general.region || 'Unknown'}
                                    {result.sections.general.country_name && `, ${result.sections.general.country_name}`}
                                  </span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {result.sections.general.latitude.toFixed(4)}, {result.sections.general.longitude.toFixed(4)}
                                </div>
                              </div>
                            } 
                            icon={<Globe className="w-3 h-3" />} 
                          />
                        )}
                        {(result.sections.general as any).organization && (
                          <InfoItem label="Organization" value={(result.sections.general as any).organization} icon={<Users className="w-3 h-3" />} />
                        )}
                        {result.sections.general.isp && (
                          <InfoItem label="ISP" value={result.sections.general.isp} icon={<Network className="w-3 h-3" />} />
                        )}
                        {result.ioc_type === 'file' && result.file_type && (
                          <InfoItem label="File Type" value={getFileTypeName(result.file_type)} icon={<FileText className="w-3 h-3" />} />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Threat Score Breakdown */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Threat Analysis
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-3 border border-border rounded-lg bg-background/50 text-center">
                        <div className={`text-2xl font-bold ${
                          (result.threat_score ?? 0) >= 70 ? 'text-destructive' :
                          (result.threat_score ?? 0) >= 50 ? 'text-accent' :
                          (result.threat_score ?? 0) >= 30 ? 'text-yellow-500' :
                          (result.threat_score ?? 0) >= 10 ? 'text-primary' :
                          'text-green-500'
                        }`}>
                          {(result.threat_score ?? 0).toFixed(1)}
                        </div>
                        <div className="text-xs text-muted-foreground">Threat Score</div>
                      </div>
                      <div className="p-3 border border-border rounded-lg bg-background/50 text-center">
                        <div className={`text-2xl font-bold ${result.pulse_count > 0 ? 'text-orange-500' : 'text-muted-foreground'}`}>
                          {result.pulse_count}
                        </div>
                        <div className="text-xs text-muted-foreground">Pulses</div>
                      </div>
                      <div className="p-3 border border-border rounded-lg bg-background/50 text-center">
                        <div className={`text-2xl font-bold ${result.malware_count > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                          {result.malware_count}
                        </div>
                        <div className="text-xs text-muted-foreground">Malware Samples</div>
                      </div>
                      <div className="p-3 border border-border rounded-lg bg-background/50 text-center">
                        <div className="text-2xl font-bold text-blue-500">
                          {result.url_count}
                        </div>
                        <div className="text-xs text-muted-foreground">URLs</div>
                      </div>
                    </div>
                    
                    {/* Threat Level Description */}
                    <div className={`mt-3 p-3 rounded-lg text-sm ${
                      result.threat_level === 'high' ? 'bg-destructive/10 text-destructive' :
                      result.threat_level === 'medium' ? 'bg-accent/10 text-accent' :
                      result.threat_level === 'low' ? 'bg-yellow-500/10 text-yellow-500' :
                      'bg-green-500/10 text-green-500'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        {result.threat_level === 'high' ? (
                          <AlertTriangle className="w-4 h-4" />
                        ) : result.threat_level === 'clean' ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <AlertCircle className="w-4 h-4" />
                        )}
                        <span className="font-medium">
                          {result.threat_level === 'high' ? 'High Risk' :
                           result.threat_level === 'medium' ? 'Medium Risk' :
                           result.threat_level === 'low' ? 'Low Risk' :
                           'Clean'}
                        </span>
                      </div>
                      <p>
                        {result.threat_level === 'high' ? 'This indicator has been associated with significant malicious activity.' :
                         result.threat_level === 'medium' ? 'This indicator shows some suspicious characteristics.' :
                         result.threat_level === 'low' ? 'This indicator has minimal threat indicators.' :
                         'No significant threat indicators detected.'}
                      </p>
                    </div>
                  </div>

                  {/* Pulse Information */}
                  {result.sections?.general?.pulse_info && result.pulse_count > 0 && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Threat Intelligence Pulses ({result.pulse_count})
                      </h4>
                      <div className="space-y-3">
                        {result.sections.general.pulse_info.pulses.slice(0, 3).map((pulse, idx) => (
                          <div key={idx} className="p-3 border border-border rounded-lg bg-background/50 hover:bg-background/70 transition-colors">
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="font-medium text-foreground">{pulse.name}</h5>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(pulse.modified)}
                              </span>
                            </div>
                            {pulse.description && (
                              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                {pulse.description}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              {pulse.TLP && (
                                <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded">
                                  TLP: {pulse.TLP}
                                </span>
                              )}
                              {pulse.tags && pulse.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {pulse.tags.slice(0, 5).map((tag, tagIdx) => (
                                    <span
                                      key={tagIdx}
                                      className="text-xs px-2 py-0.5 bg-muted/50 text-muted-foreground rounded"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                  {pulse.tags.length > 5 && (
                                    <span className="text-xs px-2 py-0.5 bg-muted/30 text-muted-foreground rounded">
                                      +{pulse.tags.length - 5}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Users className="w-3 h-3" />
                                <span>{pulse.subscriber_count || 0} subscribers</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Database className="w-3 h-3" />
                                <span>{pulse.indicator_count || 0} indicators</span>
                              </div>
                            </div>
                          </div>
                        ))}
                        {result.pulse_count > 3 && (
                          <p className="text-sm text-muted-foreground italic text-center">
                            + {result.pulse_count - 3} more pulses
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Malware Data */}
                  {result.sections?.malware?.data && result.malware_count > 0 && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Bug className="w-4 h-4 text-destructive" />
                        Associated Malware Samples ({result.malware_count})
                        <span className="ml-2 text-xs px-2 py-0.5 bg-destructive/10 text-destructive rounded">
                          {malwareDetectionStats.high} high, {malwareDetectionStats.medium} medium, {malwareDetectionStats.low} low
                        </span>
                      </h4>
                      
                      {/* Malware Statistics */}
                      {result.malware_count > 5 && (
                        <div className="mb-4 p-3 border border-border rounded-lg bg-background/50">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="text-center">
                              <div className="text-lg font-bold text-destructive">{malwareDetectionStats.high}</div>
                              <div className="text-xs text-muted-foreground">High Detection</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-accent">{malwareDetectionStats.medium}</div>
                              <div className="text-xs text-muted-foreground">Medium Detection</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-yellow-500">{malwareDetectionStats.low}</div>
                              <div className="text-xs text-muted-foreground">Low Detection</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-muted-foreground">{malwareDetectionStats.none}</div>
                              <div className="text-xs text-muted-foreground">No Detection</div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        {result.sections.malware.data
                          .slice(0, showAllMalwareForResult ? undefined : 5)
                          .map((malware, idx) => {
                            const detectionCount = getMalwareDetectionCount(malware.detections);
                            const severity = getMalwareSeverity(malware.detections);
                            const popularDetections = getPopularAVDetections(malware.detections);
                            
                            return (
                              <div
                                key={idx}
                                className="p-3 border border-border rounded-lg bg-background/50 hover:bg-background/70 transition-colors"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <code className="text-xs font-mono text-foreground truncate">
                                        {malware.hash}
                                      </code>
                                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                                        severity === 'High' ? 'bg-destructive/20 text-destructive' :
                                        severity === 'Medium' ? 'bg-accent/20 text-accent' :
                                        'bg-yellow-500/20 text-yellow-500'
                                      }`}>
                                        {detectionCount} detections
                                      </span>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                      <Clock className="w-3 h-3" />
                                      <span>{formatDetailedDate(malware.date)}</span>
                                    </div>
                                    
                                    {/* Popular AV Detections */}
                                    {popularDetections.length > 0 && (
                                      <div className="mt-2">
                                        <p className="text-xs text-muted-foreground mb-1">Detected by:</p>
                                        <div className="flex flex-wrap gap-1">
                                          {popularDetections.map((detection, detIdx) => (
                                            <span
                                              key={detIdx}
                                              className="text-xs px-1.5 py-0.5 bg-muted text-muted-foreground rounded"
                                            >
                                              {detection.name}: {detection.detection}
                                            </span>
                                          ))}
                                          {Object.keys(malware.detections || {}).length > popularDetections.length && (
                                            <span className="text-xs px-1.5 py-0.5 bg-muted/50 text-muted-foreground rounded">
                                              +{Object.keys(malware.detections || {}).length - popularDetections.length} more
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex flex-col items-end gap-2 ml-2">
                                    <button
                                      onClick={() => handleCopy(malware.hash, `copy-malware-${index}-${idx}`)}
                                      className="p-1 hover:bg-black/10 rounded transition-colors"
                                      title="Copy hash"
                                    >
                                      <Copy className="w-3 h-3" />
                                    </button>
                                    {malware.hash.length === 64 && (
                                      <a
                                        href={`https://www.virustotal.com/gui/file/${malware.hash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1 hover:bg-black/10 rounded transition-colors"
                                        title="View on VirusTotal"
                                      >
                                        <ExternalLink className="w-3 h-3" />
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                      
                      {result.malware_count > 5 && (
                        <button
                          onClick={() => toggleShowAllMalware(resultId)}
                          className="mt-3 w-full py-2 text-sm border border-border rounded-lg hover:bg-muted/20 transition-colors flex items-center justify-center gap-2"
                        >
                          {showAllMalwareForResult ? (
                            <>
                              <EyeOff className="w-4 h-4" />
                              Show less
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4" />
                              Show all {result.malware_count} samples
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}

                  {/* URL List */}
                  {result.sections?.url_list?.url_list && result.url_count > 0 && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <LinkIcon className="w-4 h-4" />
                        Associated URLs ({result.url_count})
                      </h4>
                      <div className="space-y-2">
                        {result.sections.url_list.url_list
                          .slice(0, showAllURLsForResult ? undefined : 5)
                          .map((urlEntry, idx) => (
                            <div
                              key={idx}
                              className="p-3 border border-border rounded-lg bg-background/50 hover:bg-background/70 transition-colors"
                            >
                              <div className="flex items-start justify-between">
                                <div className="min-w-0 flex-1">
                                  <a
                                    href={urlEntry.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-foreground hover:text-orange-500 transition-colors break-all block mb-1"
                                  >
                                    {urlEntry.url}
                                  </a>
                                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      <span>{formatDate(urlEntry.date)}</span>
                                    </div>
                                    <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${
                                      urlEntry.httpcode === 200 ? 'bg-green-500/10 text-green-500' :
                                      urlEntry.httpcode >= 400 ? 'bg-destructive/10 text-destructive' :
                                      'bg-muted/50 text-muted-foreground'
                                    }`}>
                                      HTTP {urlEntry.httpcode}
                                    </div>
                                    {urlEntry.domain && (
                                      <div className="flex items-center gap-1 px-1.5 py-0.5 bg-muted/30 text-muted-foreground rounded">
                                        <Globe className="w-3 h-3" />
                                        <span>{urlEntry.domain}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-2 ml-2">
                                  <button
                                    onClick={() => handleCopy(urlEntry.url, `copy-url-${index}-${idx}`)}
                                    className="p-1 hover:bg-black/10 rounded transition-colors"
                                    title="Copy URL"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                  <a
                                    href={urlEntry.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 hover:bg-black/10 rounded transition-colors"
                                    title="Open URL"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                      
                      {result.url_count > 5 && (
                        <button
                          onClick={() => toggleShowAllURLs(resultId)}
                          className="mt-3 w-full py-2 text-sm border border-border rounded-lg hover:bg-muted/20 transition-colors flex items-center justify-center gap-2"
                        >
                          {showAllURLsForResult ? (
                            <>
                              <EyeOff className="w-4 h-4" />
                              Show less
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4" />
                              Show all {result.url_count} URLs
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Passive DNS */}
                  {result.sections?.passive_dns?.passive_dns && result.passive_dns_count > 0 && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        Passive DNS Records ({result.passive_dns_count})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {result.sections.passive_dns.passive_dns.slice(0, 4).map((record, idx) => (
                          <div
                            key={idx}
                            className="p-3 border border-border rounded-lg bg-background/50"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-foreground">
                                  {record.record_type} Record
                                </span>
                                {record.asn && (
                                  <span className="text-xs text-muted-foreground">
                                    {record.asn}
                                  </span>
                                )}
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs font-mono text-foreground break-all">
                                  {record.hostname}
                                </p>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <ArrowRight className="w-3 h-3" />
                                  <p className="font-mono break-all">{record.address}</p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
                                <div>
                                  <div>First seen: {formatDate(record.first)}</div>
                                  <div>Last seen: {formatDate(record.last)}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {result.passive_dns_count > 4 && (
                        <p className="text-sm text-muted-foreground italic text-center mt-3">
                          + {result.passive_dns_count - 4} more DNS records
                        </p>
                      )}
                    </div>
                  )}

                  {/* HTTP Scans */}
                  {result.sections?.http_scans?.data && result.sections.http_scans.data.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        HTTP Scan Results
                      </h4>
                      <div className="space-y-3">
                        {result.sections.http_scans.data.slice(0, 3).map((scan, idx) => (
                          <div
                            key={idx}
                            className="p-3 border border-border rounded-lg bg-background/50"
                          >
                            <h5 className="text-sm font-medium text-foreground mb-2">{scan.name}</h5>
                            <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap break-all max-h-40 overflow-y-auto p-2 bg-black/10 rounded">
                              {scan.value}
                            </pre>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* File Analysis */}
                  {result.sections?.analysis?.analysis && Object.keys(result.sections.analysis.analysis).length > 0 && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Search className="w-4 h-4" />
                        File Analysis
                      </h4>
                      <div className="p-3 border border-border rounded-lg bg-background/50">
                        <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap break-all max-h-60 overflow-y-auto">
                          {JSON.stringify(result.sections.analysis.analysis, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Raw Data Toggle */}
                  {result.raw_data && (
                    <div>
                      <details className="group">
                        <summary className="cursor-pointer text-sm font-medium text-foreground hover:text-orange-500 transition-colors flex items-center gap-2">
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

// Helper components
function InfoItem({ label, value, icon }: { 
  label: string; 
  value: React.ReactNode; 
  icon: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-foreground font-medium break-all">
        {value}
      </div>
    </div>
  );
}