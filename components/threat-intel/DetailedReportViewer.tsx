'use client';

import { useState, useEffect } from 'react';
import {
  FileText,
  Cpu,
  Network,
  Globe,
  Shield,
  AlertTriangle,
  Code,
  Database,
  Hash,
  Eye,
  Download,
  BarChart3,
  Tag,
  Layers,
  Terminal,
  File,
  ExternalLink,
  Copy,
  ChevronDown,
  ChevronUp,
  X,
  Search,
  Filter,
  Activity,
  Target,
  Zap,
  Cpu as CpuIcon,
  Server,
  Lock,
  Unlock,
  Key,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Calendar,
  Info,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import type { DetailedAnalysisResult } from '@/lib/threat-intel/filescan-types';
import { filescanService } from '@/lib/threat-intel/filescan-service';
import {
  formatFileSize,
  formatDate,
  getVerdictInfo,
  getThreatLevelInfo,
  getConfidenceColor,
  getConfidenceLabel,
  truncateHash,
  getHashType,
  getFileTypeIcon,
  getFileTypeColor
} from '@/lib/threat-intel/filescan-utils';

interface DetailedReportViewerProps {
  reportId: string;
  fileHash: string;
  onClose?: () => void;
}

export default function DetailedReportViewer({ reportId, fileHash, onClose }: DetailedReportViewerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailedReport, setDetailedReport] = useState<DetailedAnalysisResult | null>(null);
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const loadDetailedReport = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading detailed report for:', reportId, fileHash);
      
      // Use the service to get detailed analysis
      const report = await filescanService.getDetailedAnalysis(reportId, fileHash);
      setDetailedReport(report);
      
      console.log('Detailed report loaded successfully:', report);
      
    } catch (err) {
      console.error('Failed to load detailed report:', err);
      setError(err instanceof Error ? err.message : 'Failed to load detailed report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetailedReport();
  }, [reportId, fileHash]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Sections for the detailed report
  const sections = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'verdict', label: 'Verdict', icon: Shield },
    { id: 'yara', label: 'YARA Matches', icon: Search },
    { id: 'network', label: 'Network', icon: Network },
    { id: 'strings', label: 'Strings', icon: Terminal },
    { id: 'behavior', label: 'Behavior', icon: Activity },
    { id: 'mitre', label: 'MITRE ATT&CK', icon: Target },
    { id: 'osint', label: 'OSINT', icon: Globe },
    { id: 'pe', label: 'PE Analysis', icon: CpuIcon },
    { id: 'raw', label: 'Raw Data', icon: Code },
  ];

  const renderSectionContent = () => {
    if (!detailedReport) return null;

    switch (activeSection) {
      case 'overview':
        return renderOverview();
      case 'verdict':
        return renderVerdict();
      case 'yara':
        return renderYaraMatches();
      case 'network':
        return renderNetwork();
      case 'strings':
        return renderStrings();
      case 'behavior':
        return renderBehavior();
      case 'mitre':
        return renderMitre();
      case 'osint':
        return renderOsint();
      case 'pe':
        return renderPEAnalysis();
      case 'raw':
        return renderRawData();
      default:
        return renderOverview();
    }
  };

  const renderOverview = () => {
    if (!detailedReport) return null;
    
    const verdictInfo = getVerdictInfo(detailedReport.verdict.verdict);
    const threatLevelInfo = getThreatLevelInfo(detailedReport.verdict.threatLevel || 0);
    
    return (
      <div className="space-y-6">
        {/* File Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">File Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Filename</p>
                <p className="font-medium text-gray-900 dark:text-white">{detailedReport.file?.name || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Hash (SHA256)</p>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-gray-900 dark:text-white">{truncateHash(detailedReport.fileHash, 24)}</p>
                  <button
                    onClick={() => navigator.clipboard.writeText(detailedReport.fileHash)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    title="Copy Hash"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">File Type</p>
                <div className="flex items-center gap-2">
                  <span className={getFileTypeColor(detailedReport.file?.type || '')}>
                    {getFileTypeIcon(detailedReport.file?.type || '')}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white capitalize">
                    {detailedReport.file?.type || 'unknown'}
                  </span>
                </div>
              </div>
              {detailedReport.file?.size && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Size</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatFileSize(detailedReport.file.size)}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Scan Date</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatDate(detailedReport.created_date)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Threat Assessment</h3>
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${verdictInfo.bgColor} border ${verdictInfo.color.replace('text', 'border')}`}>
                <div className="flex items-center gap-3">
                  <div className={verdictInfo.color}>
                    {verdictInfo.icon}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Final Verdict</p>
                    <p className={`text-xl font-bold ${verdictInfo.color}`}>{verdictInfo.label}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <AlertTriangle className={`w-5 h-5 ${threatLevelInfo.color}`} />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Threat Level</p>
                    <p className={`font-bold ${threatLevelInfo.color}`}>{threatLevelInfo.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{threatLevelInfo.description}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <BarChart3 className={`w-5 h-5 ${getConfidenceColor(detailedReport.verdict.confidence || 0)}`} />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Confidence</p>
                    <p className={`font-bold ${getConfidenceColor(detailedReport.verdict.confidence || 0)}`}>
                      {getConfidenceLabel(detailedReport.verdict.confidence || 0)} ({(detailedReport.verdict.confidence || 0) * 100}%)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Search className="w-4 h-4 text-blue-500" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">YARA Matches</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {detailedReport.yaraMatches?.length || 0}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Network className="w-4 h-4 text-green-500" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">Network Connections</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {detailedReport.networkConnections?.length || 0}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-red-500" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">MITRE Techniques</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {detailedReport.mitreTechniques?.length || 0}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <File className="w-4 h-4 text-purple-500" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">Extracted Files</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {detailedReport.extractedFiles?.length || 0}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderVerdict = () => {
    if (!detailedReport) return null;
    
    const verdictInfo = getVerdictInfo(detailedReport.verdict.verdict);
    
    return (
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Final Verdict Details</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Verdict</span>
              <span className={`font-semibold ${verdictInfo.color}`}>{verdictInfo.label}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Threat Level</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {detailedReport.verdict.threatLevel || 0}/5
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Confidence</span>
              <span className={`font-semibold ${getConfidenceColor(detailedReport.verdict.confidence || 0)}`}>
                {((detailedReport.verdict.confidence || 0) * 100).toFixed(1)}%
              </span>
            </div>
            {detailedReport.verdict.verdictLabel && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Verdict Label</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {detailedReport.verdict.verdictLabel}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderYaraMatches = () => {
    if (!detailedReport?.yaraMatches || detailedReport.yaraMatches.length === 0) {
      return (
        <div className="text-center py-8">
          <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No YARA rule matches found</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            YARA Rule Matches ({detailedReport.yaraMatches.length})
          </h3>
        </div>
        
        <div className="space-y-3">
          {detailedReport.yaraMatches.slice(0, 10).map((match: any, index: number) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white mb-1">
                    {match.rule_name || `Rule ${index + 1}`}
                  </p>
                  {match.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {match.description}
                    </p>
                  )}
                  {match.author && (
                    <p className="text-xs text-gray-500 dark:text-gray-500">Author: {match.author}</p>
                  )}
                </div>
                {match.threat_level && (
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    match.threat_level >= 4 ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                    match.threat_level >= 2 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                    'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  }`}>
                    Level {match.threat_level}
                  </span>
                )}
              </div>
              {match.matches && Array.isArray(match.matches) && match.matches.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Matches:</p>
                  <div className="space-y-1">
                    {match.matches.slice(0, 3).map((m: any, idx: number) => (
                      <div key={idx} className="text-xs font-mono bg-gray-50 dark:bg-gray-800/50 p-2 rounded">
                        {m.string || m.offset || 'Match found'}
                      </div>
                    ))}
                    {match.matches.length > 3 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        +{match.matches.length - 3} more matches
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderNetwork = () => {
    const hasNetworkData = detailedReport?.networkConnections?.length || 
                         detailedReport?.extractedUrls?.length ||
                         detailedReport?.extractedDomains?.length ||
                         detailedReport?.extractedIps?.length;

    if (!hasNetworkData) {
      return (
        <div className="text-center py-8">
          <Network className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No network activity detected</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Network Connections */}
        {detailedReport?.networkConnections && detailedReport.networkConnections.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Network Connections ({detailedReport.networkConnections.length})
            </h3>
            <div className="space-y-2">
              {detailedReport.networkConnections.slice(0, 10).map((conn: any, index: number) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {conn.destination || conn.ip || 'Unknown'}
                      </p>
                      {conn.port && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">Port: {conn.port}</p>
                      )}
                      {conn.protocol && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">Protocol: {conn.protocol}</p>
                      )}
                    </div>
                    {conn.threat_level && (
                      <span className={`px-2 py-1 rounded text-xs ${
                        conn.threat_level >= 4 ? 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20' :
                        conn.threat_level >= 2 ? 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20' :
                        'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20'
                      }`}>
                        Threat: {conn.threat_level}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Extracted URLs */}
        {detailedReport?.extractedUrls && detailedReport.extractedUrls.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Extracted URLs ({detailedReport.extractedUrls.length})
            </h3>
            <div className="space-y-2">
              {detailedReport.extractedUrls.slice(0, 10).map((url: any, index: number) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                  <p className="font-mono text-sm text-blue-600 dark:text-blue-400 break-all">
                    {typeof url === 'string' ? url : url.url || JSON.stringify(url)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Extracted Domains */}
        {detailedReport?.extractedDomains && detailedReport.extractedDomains.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Extracted Domains ({detailedReport.extractedDomains.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {detailedReport.extractedDomains.slice(0, 10).map((domain: any, index: number) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {typeof domain === 'string' ? domain : domain.domain || JSON.stringify(domain)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Other render methods would follow similar patterns...

  const renderStrings = () => {
    return (
      <div className="text-center py-8">
        <Terminal className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400">String analysis data will be available here</p>
      </div>
    );
  };

  const renderBehavior = () => {
    return (
      <div className="text-center py-8">
        <Activity className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400">Behavioral analysis data will be available here</p>
      </div>
    );
  };

  const renderMitre = () => {
    return (
      <div className="text-center py-8">
        <Target className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400">MITRE ATT&CK data will be available here</p>
      </div>
    );
  };

  const renderOsint = () => {
    return (
      <div className="text-center py-8">
        <Globe className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400">OSINT data will be available here</p>
      </div>
    );
  };

  const renderPEAnalysis = () => {
    return (
      <div className="text-center py-8">
        <CpuIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400">PE analysis data will be available here</p>
      </div>
    );
  };

  const renderRawData = () => {
    if (!detailedReport?.raw_detailed_data) {
      return (
        <div className="text-center py-8">
          <Code className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No raw data available</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">Raw Report Data</h3>
          <button
            onClick={() => navigator.clipboard.writeText(JSON.stringify(detailedReport.raw_detailed_data, null, 2))}
            className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            Copy JSON
          </button>
        </div>
        
        <div className="bg-gray-900 rounded-lg p-4 overflow-auto">
          <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap">
            {JSON.stringify(detailedReport.raw_detailed_data, null, 2)}
          </pre>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Detailed Analysis Report</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {reportId.substring(0, 8)}... • {truncateHash(fileHash, 12)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <a
              href={`https://www.filescan.io/reports/${reportId}/${fileHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              View on Filescan
            </a>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-y-auto">
            <div className="p-4">
              <div className="space-y-1">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                        activeSection === section.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{section.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Status */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Report Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Data Available</span>
                    <span className={`text-sm font-medium ${
                      detailedReport ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {detailedReport ? 'Yes' : 'Loading...'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Last Updated</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {detailedReport?.timestamp ? formatDate(detailedReport.timestamp) : 'Now'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Loading detailed analysis report...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Unable to Load Detailed Report
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  {error}
                </p>
                <button
                  onClick={loadDetailedReport}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors flex items-center gap-2 mx-auto"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
              </div>
            ) : !detailedReport ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Load Detailed Report
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Click the button below to fetch comprehensive analysis data.
                </p>
                <button
                  onClick={loadDetailedReport}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
                >
                  Load Now
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {renderSectionContent()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}