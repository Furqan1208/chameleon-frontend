// components/threat-intel/UnifiedScanner.tsx
'use client';

import { useState, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { unifiedService, type UnifiedResponse, type InputType } from '@/lib/threat-intel/unified-service';
import {
  Search,
  Upload,
  FileText,
  Globe,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  ExternalLink,
  Copy,
  ChevronDown,
  ChevronUp,
  Shield,
  Cpu,
  Database,
  Hash,
  Eye,
  Download,
  BarChart3,
  Tag,
  Clock,
  Info,
  HelpCircle,
  File,
  Settings,
  X,
  Zap,
  Target,
  Activity,
  Network,
  Server,
  Link,
  Flag,
  Users,
  PieChart,
  Layers,
  Filter,
  Briefcase,
  Award,
  AlertOctagon,
  ShieldAlert,
  ShieldCheck,
  ShieldOff
} from 'lucide-react';

interface ScannerTabProps {
  onSearch: (input: string) => void;
  onFileUpload: (file: File) => void;
  isLoading: boolean;
}

type ThreatState = 'malicious' | 'suspicious' | 'clean' | 'unknown' | 'failed';

function normalizeSource(source: string): string {
  return source.toLowerCase().replace(/\s+/g, '_');
}

function formatBytes(bytes?: number): string {
  if (bytes == null || Number.isNaN(bytes)) return 'Unknown';
  if (bytes === 0) return '0 Bytes';
  const units = ['Bytes', 'KB', 'MB', 'GB'];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, exponent);
  return `${value.toFixed(exponent === 0 ? 0 : 2)} ${units[exponent]}`;
}

function getServiceThreatState(result: { source: string; success: boolean; data: any; error?: string }): ThreatState {
  const source = normalizeSource(result.source);
  const data = result.data || {};

  if (!result.success || result.error || data?.error) {
    return 'failed';
  }

  switch (source) {
    case 'virustotal': {
      const stats = data.detection_stats || {};
      if ((stats.malicious || 0) > 0) return 'malicious';
      if ((stats.suspicious || 0) > 0) return 'suspicious';
      if ((stats.harmless || 0) > 0) return 'clean';
      return 'unknown';
    }
    case 'abuseipdb': {
      const score = data.confidence_score || data.abuseConfidenceScore || 0;
      if (score > 50) return 'malicious';
      if (score > 20) return 'suspicious';
      return 'clean';
    }
    case 'malwarebazaar':
      return data.found ? 'malicious' : 'clean';
    case 'threatfox':
      if (data.query_status === 'error') return 'failed';
      return (data.total || 0) > 0 ? 'malicious' : 'clean';
    case 'hybridanalysis':
    case 'hybrid_analysis': {
      const verdict = String(data.verdict || data.threat_level || '').toLowerCase();
      if (verdict.includes('malicious')) return 'malicious';
      if (verdict.includes('suspicious')) return 'suspicious';
      if (verdict.includes('benign') || verdict.includes('clean') || verdict.includes('no specific threat')) return 'clean';
      return 'unknown';
    }
    case 'alienvault':
    case 'alienvault_otx': {
      const level = String(data.threat_level || '').toLowerCase();
      if (level === 'high') return 'malicious';
      if (level === 'medium') return 'suspicious';
      if (level === 'clean' || level === 'low') return 'clean';
      return (data.pulse_count || 0) > 0 ? 'suspicious' : 'unknown';
    }
    case 'filescan':
      {
        const verdict = String(data?.verdict?.verdict || data?.verdict || '').toLowerCase();
        const numericThreat = Number(data?.verdict?.threatLevel ?? data?.threat_level ?? data?.threat_score ?? 0);
        const state = String(data?.state || '').toLowerCase();

        if (verdict.includes('malicious') || numericThreat >= 70) return 'malicious';
        if (verdict.includes('suspicious') || verdict.includes('likely') || numericThreat >= 40) return 'suspicious';
        if (verdict.includes('benign') || verdict.includes('clean') || verdict.includes('no_threat')) return 'clean';
        if (state === 'finished') return 'clean';
        return 'unknown';
      }
    default: {
      const level = String(data.threat_level || '').toLowerCase();
      if (level.includes('malicious') || level === 'high') return 'malicious';
      if (level.includes('suspicious') || level === 'medium') return 'suspicious';
      if (level.includes('clean') || level.includes('benign') || level === 'low') return 'clean';
      return 'unknown';
    }
  }
}

export function UnifiedScanner() {
  // State
  const [searchInput, setSearchInput] = useState('');
  const [detectedType, setDetectedType] = useState<InputType>('unknown');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [results, setResults] = useState<UnifiedResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'search' | 'upload' | 'results'>('search');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [expandedServices, setExpandedServices] = useState<Record<string, boolean>>({});
  const [filterMalicious, setFilterMalicious] = useState(false);
  const [showAllResults, setShowAllResults] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Detect input type as user types
  const handleInputChange = (value: string) => {
    setSearchInput(value);
    if (value.trim()) {
      const type = unifiedService.detectInputType(value);
      setDetectedType(type);
    } else {
      setDetectedType('unknown');
    }
  };

  // Handle search
  const handleSearch = async (inputOverride?: string) => {
    const query = (inputOverride ?? searchInput).trim();

    if (!query) {
      setError('Please enter something to search');
      return;
    }

    // Keep input/type state in sync when search is triggered from quick examples/history.
    if (inputOverride !== undefined) {
      setSearchInput(query);
      setDetectedType(unifiedService.detectInputType(query));
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await unifiedService.unifiedSearch(query);
      setResults(response);
      setActiveTab('results');
      
      // Add to history
      setSearchHistory(prev => {
        const newHistory = [query, ...prev.filter(s => s !== query)];
        return newHistory.slice(0, 10);
      });

      setSuccess(`Found results from ${response.summary?.successful ?? response.results.length} threat intelligence sources`);
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Failed to perform search');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file upload
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploadedFile(file);
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024, // 100MB
  });

  const handleFileUpload = async () => {
    if (!uploadedFile) {
      setError('Please select a file to upload');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await unifiedService.uploadFile(uploadedFile);
      setResults(response);
      setActiveTab('results');
      const filescanResult = response.results.find((item) => normalizeSource(item.source) === 'filescan');
      const flowId = filescanResult?.data?.flow_id || filescanResult?.data?.flowId;
      setSuccess(
        flowId
          ? `File hashed and analyzed across ${response.results.length} sources. FileScan Flow ID: ${flowId}`
          : `File hashed and analyzed across ${response.results.length} sources.`
      );
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle service expansion
  const toggleService = (serviceName: string) => {
    setExpandedServices(prev => ({
      ...prev,
      [serviceName]: !prev[serviceName]
    }));
  };

  // Clear current results
  const clearResults = () => {
    setResults(null);
    setSearchInput('');
    setUploadedFile(null);
    setActiveTab('search');
    setError(null);
    setSuccess(null);
    setExpandedServices({});
  };

  // Filter results by maliciousness
  const filteredResults = useMemo(() => {
    if (!results || !filterMalicious) return results?.results || [];

    return results.results.filter((r) => getServiceThreatState(r) === 'malicious');
  }, [results, filterMalicious]);

  const summaryStats = useMemo(() => {
    const all = results?.results || [];
    const total = all.length;
    let successful = 0;
    let failed = 0;
    let malicious = 0;
    let suspicious = 0;
    let clean = 0;
    let unknown = 0;

    for (const result of all) {
      const state = getServiceThreatState(result);
      if (state === 'failed') {
        failed += 1;
        continue;
      }

      successful += 1;
      if (state === 'malicious') malicious += 1;
      else if (state === 'suspicious') suspicious += 1;
      else if (state === 'clean') clean += 1;
      else unknown += 1;
    }

    return {
      total,
      successful,
      failed,
      malicious,
      suspicious,
      clean,
      unknown,
    };
  }, [results]);

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Quick Stats */}
      <div className="mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<Shield className="w-4 h-4" />}
            label="VirusTotal"
            value="Files, IPs, URLs"
            color="blue"
          />
          <StatCard
            icon={<Database className="w-4 h-4" />}
            label="MalwareBazaar"
            value="Hashes, Tags"
            color="purple"
          />
          <StatCard
            icon={<Target className="w-4 h-4" />}
            label="HybridAnalysis"
            value="Sandbox"
            color="orange"
          />
          <StatCard
            icon={<Activity className="w-4 h-4" />}
            label="AlienVault"
            value="IOCs, Pulses"
            color="green"
          />
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#1a1a1a] mb-6">
        <button
          onClick={() => setActiveTab('search')}
          className={`px-4 py-3 font-medium rounded-t-lg transition-colors flex items-center gap-2 ${
            activeTab === 'search'
              ? 'bg-[#0d0d0d] text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-white hover:bg-black/20'
          }`}
        >
          <Search className="w-4 h-4" />
          Smart Search
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-3 font-medium rounded-t-lg transition-colors flex items-center gap-2 ${
            activeTab === 'upload'
              ? 'bg-[#0d0d0d] text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-white hover:bg-black/20'
          }`}
        >
          <Upload className="w-4 h-4" />
          Upload File
        </button>
        {results && (
          <button
            onClick={() => setActiveTab('results')}
            className={`px-4 py-3 font-medium rounded-t-lg transition-colors flex items-center gap-2 ${
              activeTab === 'results'
                ? 'bg-[#0d0d0d] text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-white hover:bg-black/20'
            }`}
          >
            <FileText className="w-4 h-4" />
            Results ({results.results.length})
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-6">
        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            {/* Search Input */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Enter IP, Domain, URL, Hash, or Tag
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchInput}
                      onChange={(e) => handleInputChange(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="e.g., 8.8.8.8, google.com, https://..., 275a021bbfb6..."
                      className="w-full pl-10 pr-4 py-3 bg-black/30 border border-[#1a1a1a] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSearch}
                  disabled={isLoading || !searchInput.trim()}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Search All Sources
                    </>
                  )}
                </button>
              </div>

              {/* Input Type Detector */}
              {searchInput && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="text-sm text-muted-foreground">
                    Detected as:
                  </div>
                  <InputTypeBadge type={detectedType} />
                  <button
                    onClick={() => setSearchInput('275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f')}
                    className="ml-auto text-xs text-primary hover:underline"
                  >
                    Test with EICAR hash
                  </button>
                </div>
              )}
            </div>

            {/* Search History */}
            {searchHistory.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-foreground mb-2">
                  Recent Searches
                </h3>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSearch(item)}
                      className="px-3 py-1.5 bg-black/30 border border-[#1a1a1a] text-white rounded-lg text-sm hover:bg-black/50 transition-colors"
                    >
                      {item.length > 30 ? item.substring(0, 30) + '...' : item}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Examples */}
            <div className="border-t border-border pt-6">
              <h3 className="text-sm font-medium text-foreground mb-3">
                Try these examples:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <ExampleCard
                  icon={<Globe className="w-4 h-4" />}
                  label="IP Address"
                  value="8.8.8.8"
                  onClick={() => handleSearch('8.8.8.8')}
                />
                <ExampleCard
                  icon={<Globe className="w-4 h-4" />}
                  label="Domain"
                  value="google.com"
                  onClick={() => handleSearch('google.com')}
                />
                <ExampleCard
                  icon={<Hash className="w-4 h-4" />}
                  label="Malware Hash"
                  value="275a021bbfb6489e54d471899f7db9d16..."
                  onClick={() => handleSearch('275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f')}
                />
                <ExampleCard
                  icon={<Tag className="w-4 h-4" />}
                  label="Malware Tag"
                  value="TrickBot"
                  onClick={() => handleSearch('TrickBot')}
                />
              </div>
            </div>
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="space-y-6">
            {/* Dropzone */}
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragActive
                  ? 'border-primary/50 bg-primary/10 scale-[1.02]'
                  : 'border-[#1a1a1a] hover:border-primary/40 hover:bg-primary/5'
              }`}
            >
              <input {...getInputProps()} />
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4 border border-primary/20">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <p className="text-lg font-medium text-foreground mb-2">
                {isDragActive ? 'Drop the file here' : 'Drag & drop your file here'}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                or click to browse files
              </p>
              <p className="text-xs text-muted-foreground/70">
                Will be scanned by Filescan.io and Hybrid Analysis sandboxes • Max 100MB
              </p>
            </div>

            {/* Selected File */}
            {uploadedFile && (
              <div className="bg-muted/5 rounded-lg p-4 border border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-black/30 border border-[#1a1a1a] rounded-lg">
                      <File className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {uploadedFile.name}
                      </p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                        <span>•</span>
                        <span>{uploadedFile.type || 'Unknown type'}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setUploadedFile(null)}
                    className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Upload Button */}
            {uploadedFile && (
              <button
                onClick={handleFileUpload}
                disabled={isLoading}
                className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Uploading and Scanning...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload & Scan File
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && results && (
          <div className="space-y-6">
            {/* Summary Header */}
            <div className="bg-black/30 rounded-lg p-6 border border-[#1a1a1a]">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-xl font-bold text-foreground">
                      Results for: 
                    </h2>
                    <code className="px-3 py-1 bg-background rounded-lg font-mono text-sm">
                      {results.query}
                    </code>
                    <InputTypeBadge type={results.type} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Searched across {summaryStats.total} threat intelligence sources
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setFilterMalicious(!filterMalicious)}
                    className={`px-3 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                      filterMalicious
                        ? 'bg-red-500/10 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-700 dark:text-red-400'
                        : 'border-border hover:bg-muted/30'
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                    {filterMalicious ? 'Showing Malicious' : 'Filter Malicious'}
                  </button>
                  <button
                    onClick={clearResults}
                    className="px-3 py-2 border border-border rounded-lg hover:bg-muted/30 transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    New Search
                  </button>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                <SummaryStat
                  label="Successful"
                  value={summaryStats.successful}
                  total={summaryStats.total}
                  color="green"
                />
                <SummaryStat
                  label="Failed"
                  value={summaryStats.failed}
                  total={summaryStats.total}
                  color="red"
                />
                <SummaryStat
                  label="Malicious"
                  value={summaryStats.malicious}
                  total={summaryStats.total}
                  color="red"
                />
                <SummaryStat
                  label="Suspicious"
                  value={summaryStats.suspicious}
                  total={summaryStats.total}
                  color="yellow"
                />
                <SummaryStat
                  label="Clean"
                  value={summaryStats.clean}
                  total={summaryStats.total}
                  color="green"
                />
              </div>
            </div>

            {/* Results List */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Source Results ({filteredResults.length} of {results.results.length})
              </h3>

              {(filterMalicious ? filteredResults : results.results).map((result, idx) => (
                <ServiceResultCard
                  key={idx}
                  result={result}
                  expanded={expandedServices[result.source] || false}
                  onToggle={() => toggleService(result.source)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Status Messages */}
        {error && (
          <div className="mt-6 p-4 bg-red-500/10 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-red-800 dark:text-red-300 mb-1">Error</p>
                <p className="text-sm text-red-700 dark:text-red-400 text-foreground">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mt-6 p-4 bg-green-500/10 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-green-800 dark:text-green-300 mb-1">Success</p>
                <p className="text-sm text-green-700 dark:text-green-400 text-foreground">{success}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper Components

function InputTypeBadge({ type }: { type: InputType | undefined }) {
  const typeConfig = {
    ip: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: <Network className="w-3 h-3" /> },
    domain: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: <Globe className="w-3 h-3" /> },
    url: { color: 'bg-primary/20 text-primary', icon: <Link className="w-3 h-3" /> },
    hash: { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400', icon: <Hash className="w-3 h-3" /> },
    tag: { color: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400', icon: <Tag className="w-3 h-3" /> },
    file: { color: 'bg-primary/20 text-primary', icon: <File className="w-3 h-3" /> },
    unknown: { color: 'bg-muted/20 text-muted-foreground dark:bg-muted/30 dark:text-muted-foreground', icon: <HelpCircle className="w-3 h-3" /> }
  };

  const safeType = type || 'unknown';
  const config = typeConfig[safeType] || typeConfig.unknown;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.icon}
      {safeType.charAt(0).toUpperCase() + safeType.slice(1)}
    </span>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  const colorClasses = {
    blue: 'bg-black/30 border-[#1a1a1a]',
    purple: 'bg-black/30 border-[#1a1a1a]',
    orange: 'bg-black/30 border-[#1a1a1a]',
    green: 'bg-black/30 border-[#1a1a1a]'
  };

  return (
    <div className={`p-3 rounded-lg border ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex items-center gap-2">
        <div className={`text-${color}-500`}>{icon}</div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-sm font-semibold text-foreground">{value}</p>
        </div>
      </div>
    </div>
  );
}

function ExampleCard({ icon, label, value, onClick }: { icon: React.ReactNode; label: string; value: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="p-3 border border-[#1a1a1a] rounded-lg hover:border-primary/40 hover:bg-primary/5 transition-all text-left"
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="text-primary">{icon}</div>
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <code className="text-sm font-mono text-foreground truncate block">
        {value}
      </code>
    </button>
  );
}

function SummaryStat({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  
  const colorClasses = {
    green: 'text-green-600 dark:text-green-400',
    red: 'text-red-600 dark:text-red-400',
    yellow: 'text-yellow-600 dark:text-yellow-400'
  };

  return (
    <div className="text-center">
      <div className={`text-2xl font-bold ${colorClasses[color as keyof typeof colorClasses]}`}>
        {value}
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-xs text-muted-foreground/70">{percentage}%</div>
    </div>
  );
}

function ServiceResultCard({ result, expanded, onToggle }: { 
  result: any; 
  expanded: boolean; 
  onToggle: () => void;
}) {
  const threatState = getServiceThreatState(result);
  const isFailed = threatState === 'failed';

  const getStatusColor = () => {
    if (threatState === 'failed') return 'border-red-300 dark:border-red-700 bg-red-500/10 dark:bg-red-900/20';
    if (threatState === 'malicious') return 'border-red-300 dark:border-red-700 bg-red-500/10 dark:bg-red-900/20';
    if (threatState === 'suspicious') return 'border-yellow-300 dark:border-yellow-700 bg-yellow-500/10 dark:bg-yellow-900/20';
    if (threatState === 'clean') return 'border-green-300 dark:border-green-700 bg-green-500/10 dark:bg-green-900/20';
    return 'border-[#2a2a2a] bg-black/20';
  };

  const getStatusIcon = () => {
    if (threatState === 'failed') return <XCircle className="w-5 h-5 text-red-500" />;
    if (threatState === 'malicious') return <ShieldAlert className="w-5 h-5 text-red-500" />;
    if (threatState === 'suspicious') return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    if (threatState === 'clean') return <ShieldCheck className="w-5 h-5 text-green-500" />;
    return <HelpCircle className="w-5 h-5 text-muted-foreground" />;
  };

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${getStatusColor()}`}>
      {/* Header */}
      <div 
        className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex-shrink-0">
              {getStatusIcon()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">
                  {result.source}
                </h3>
                {!isFailed ? (
                  <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                    Success
                  </span>
                ) : (
                  <span className="text-xs px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full">
                    Failed
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {result.timestamp ? new Date(result.timestamp).toLocaleString() : 'Unknown time'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="p-4 border-t border-inherit bg-background space-y-4">
          {result.error ? (
            <div className="text-red-600 dark:text-red-400 text-sm p-3 bg-red-500/10 rounded-lg">
              ⚠️ Error: {result.error}
            </div>
          ) : (
            <>
              {/* Service-specific formatted results */}
              <ServiceResultDetails service={result.source} data={result.data} />
              
              {/* Raw Data Toggle */}
              <details className="text-xs">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors py-2">
                  📋 View Raw Data
                </summary>
                <pre className="mt-2 overflow-auto max-h-96 p-3 bg-muted/20 rounded-lg text-xs">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </details>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Service-specific result detail formatter
function ServiceResultDetails({ service, data }: { service: string; data: any }) {
  if (!data) return <div className="text-muted-foreground text-sm">No data available</div>;

  const normalized = normalizeSource(service);

  switch (normalized) {
    case 'virustotal':
      return <VirusTotalDetails data={data} />;
    case 'malwarebazaar':
      return <MalwareBazaarDetails data={data} />;
    case 'alienvault':
    case 'alienvault_otx':
      return <AlienVaultDetails data={data} />;
    case 'abuseipdb':
      return <AbuseIPDBDetails data={data} />;
    case 'threatfox':
      return <ThreatFoxDetails data={data} />;
    case 'filescan':
      return <FileScanDetails data={data} />;
    case 'hybrid_analysis':
    case 'hybridanalysis':
      return <HybridAnalysisDetails data={data} />;
    default:
      return <DefaultDetails data={data} />;
  }
}

// VirusTotal formatter
function VirusTotalDetails({ data }: { data: any }) {
  const stats = data.detection_stats || {};
  const fileInfo = data.file_info || {};

  return (
    <div className="space-y-4">
      {/* Threat Level */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-red-500/10 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-xs text-muted-foreground mb-1">Threat Level</p>
          <p className="font-semibold text-red-600 dark:text-red-400 text-sm uppercase">{data.threat_level || 'unknown'}</p>
        </div>
        <div className="p-3 bg-blue-500/10 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-muted-foreground mb-1">Detection Ratio</p>
          <p className="font-semibold text-blue-600 dark:text-blue-400 text-sm">{stats.detection_ratio || '0/0'}</p>
        </div>
      </div>

      {/* Detection Stats */}
      <div>
        <p className="text-xs font-semibold text-foreground mb-2">Detection Statistics</p>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Malicious', value: stats.malicious || 0, color: 'text-red-600 dark:text-red-400' },
            { label: 'Suspicious', value: stats.suspicious || 0, color: 'text-yellow-600 dark:text-yellow-400' },
            { label: 'Harmless', value: stats.harmless || 0, color: 'text-green-600 dark:text-green-400' },
            { label: 'Undetected', value: stats.undetected || 0, color: 'text-muted-foreground' },
          ].map((item) => (
            <div key={item.label} className="p-2 bg-muted/50 rounded-lg text-center">
              <p className={`font-bold text-sm ${item.color}`}>{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* File Info */}
      {fileInfo.filename && (
        <div className="p-3 bg-muted/30 rounded-lg border border-border">
          <p className="text-xs font-semibold mb-2">File Information</p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Filename:</span>
              <span className="font-mono">{fileInfo.filename}</span>
            </div>
            {fileInfo.size && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Size:</span>
                <span>{(fileInfo.size / 1024).toFixed(2)} KB</span>
              </div>
            )}
            {fileInfo.type_description && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span>{fileInfo.type_description}</span>
              </div>
            )}
            {fileInfo.reputation && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reputation:</span>
                <span className="font-bold text-red-600 dark:text-red-400">{fileInfo.reputation}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tags */}
      {fileInfo.tags && fileInfo.tags.length > 0 && (
        <div>
          <p className="text-xs font-semibold mb-2">Tags</p>
          <div className="flex flex-wrap gap-1">
            {fileInfo.tags.slice(0, 8).map((tag: string) => (
              <span key={tag} className="px-2 py-1 text-xs bg-primary/20 text-primary rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// MalwareBazaar formatter
function MalwareBazaarDetails({ data }: { data: any }) {
  return (
    <div className="space-y-3">
      {data.found ? (
        <div className="p-3 bg-green-500/10 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <p className="font-semibold text-green-600 dark:text-green-400">✓ Malware Found</p>
        </div>
      ) : (
        <div className="p-3 bg-blue-500/10 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="font-semibold text-blue-600 dark:text-blue-400">No malware detected in MalwareBazaar</p>
        </div>
      )}

      {data.total && (
        <div className="text-sm text-muted-foreground">
          <strong>{data.total}</strong> {data.total === 1 ? 'sample' : 'samples'} found
        </div>
      )}
    </div>
  );
}

// AlienVault OTX formatter
function AlienVaultDetails({ data }: { data: any }) {
  return (
    <div className="space-y-4">
      {/* Threat Level */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`p-3 rounded-lg border ${
          data.threat_level === 'high'
            ? 'bg-red-500/10 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            : 'bg-blue-500/10 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
        }`}>
          <p className="text-xs text-muted-foreground mb-1">Threat Level</p>
          <p className={`font-semibold text-sm uppercase ${
            data.threat_level === 'high'
              ? 'text-red-600 dark:text-red-400'
              : 'text-blue-600 dark:text-blue-400'
          }`}>
            {data.threat_level || 'unknown'}
          </p>
        </div>
        <div className="p-3 bg-purple-500/10 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <p className="text-xs text-muted-foreground mb-1">Pulses</p>
          <p className="font-semibold text-purple-600 dark:text-purple-400 text-sm">{data.pulse_count || 0}</p>
        </div>
      </div>

      {/* Tags */}
      {data.tags && data.tags.length > 0 && (
        <div>
          <p className="text-xs font-semibold mb-2">Tags ({data.tags.length})</p>
          <div className="flex flex-wrap gap-1">
            {data.tags.slice(0, 10).map((tag: string) => (
              <span key={tag} className="px-2 py-1 text-xs bg-primary/20 text-primary rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Malware Families */}
      {data.malware_families && data.malware_families.length > 0 && (
        <div>
          <p className="text-xs font-semibold mb-2">Malware Families</p>
          <div className="flex flex-wrap gap-1">
            {data.malware_families.filter(Boolean).slice(0, 5).map((family: string) => (
              <span key={family} className="px-2 py-1 text-xs bg-red-500/20 text-red-600 dark:text-red-400 rounded-full">
                {family}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// AbuseIPDB formatter
function AbuseIPDBDetails({ data }: { data: any }) {
  const score = data.confidence_score || 0;

  return (
    <div className="space-y-3">
      <div className={`p-3 rounded-lg border ${
        score > 50
          ? 'bg-red-500/10 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          : score > 20
          ? 'bg-yellow-500/10 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
          : 'bg-green-500/10 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      }`}>
        <p className="text-xs text-muted-foreground mb-1">Abuse Confidence Score</p>
        <p className={`font-bold text-2xl ${
          score > 50
            ? 'text-red-600 dark:text-red-400'
            : score > 20
            ? 'text-yellow-600 dark:text-yellow-400'
            : 'text-green-600 dark:text-green-400'
        }`}>
          {score}%
        </p>
      </div>

      {data.report_count && (
        <div className="text-sm text-muted-foreground p-2 bg-muted/30 rounded">
          <strong>{data.report_count}</strong> abuse report(s)
        </div>
      )}
    </div>
  );
}

// ThreatFox formatter
function ThreatFoxDetails({ data }: { data: any }) {
  const iocCount = data.total || 0;
  const hasError = data.query_status === 'error' || Boolean(data.error);

  return (
    <div className="space-y-3">
      {data.query_status === 'ok' ? (
        <div className="p-3 bg-red-500/10 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <p className="font-semibold text-red-600 dark:text-red-400">Threat Found</p>
          <p className="text-xs text-muted-foreground mt-1">{iocCount} IOC(s) detected</p>
        </div>
      ) : hasError ? (
        <div className="p-3 bg-red-500/10 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <p className="font-semibold text-red-600 dark:text-red-400">ThreatFox Query Failed</p>
          {data.error && <p className="text-xs text-muted-foreground mt-1">{data.error}</p>}
        </div>
      ) : (
        <div className="p-3 bg-blue-500/10 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="font-semibold text-blue-600 dark:text-blue-400">No threats detected</p>
        </div>
      )}
    </div>
  );
}

// FileScan formatter
function FileScanDetails({ data }: { data: any }) {
  const verdictText = String(data?.verdict?.verdict || data?.verdict || '').toUpperCase();
  const threatLevel = data?.verdict?.threatLevel ?? data?.threat_level ?? data?.threat_score;
  const confidence = data?.verdict?.confidence;
  const isPending = data?.analysis_pending === true || (data?.flow_id && !data?.scanId && !data?.scan_id);
  const flowId = data?.flow_id || data?.flowId;
  const scanId = data?.scan_id || data?.scanId;
  const file = data?.file || {};

  return (
    <div className="space-y-4">
      {isPending ? (
        <div className="p-3 bg-yellow-500/10 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="font-semibold text-yellow-700 dark:text-yellow-400">FileScan submitted, analysis in progress</p>
          {flowId && <p className="text-xs text-muted-foreground mt-1">Flow ID: {flowId}</p>}
          {data?.polling_error && <p className="text-xs text-muted-foreground mt-1">{data.polling_error}</p>}
        </div>
      ) : (
        <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
          <p className="text-xs text-muted-foreground mb-1">Verdict</p>
          <p className="font-semibold text-sm text-foreground">{verdictText || 'UNKNOWN'}</p>
          {(threatLevel !== undefined || confidence !== undefined) && (
            <p className="text-xs text-muted-foreground mt-1">
              Threat Level: {threatLevel ?? 'n/a'}
              {confidence !== undefined ? ` | Confidence: ${confidence}%` : ''}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 bg-muted/30 rounded-lg text-xs">
          <p className="text-muted-foreground">State</p>
          <p className="font-semibold">{data?.state || data?.overallState || 'unknown'}</p>
        </div>
        <div className="p-2 bg-muted/30 rounded-lg text-xs">
          <p className="text-muted-foreground">Interesting Score</p>
          <p className="font-semibold">{data?.interestingScore ?? data?.interesting_score ?? 'n/a'}</p>
        </div>
        <div className="p-2 bg-muted/30 rounded-lg text-xs">
          <p className="text-muted-foreground">VT Rate</p>
          <p className="font-semibold">{data?.vtRate ?? data?.vt_rate ?? 'n/a'}</p>
        </div>
        <div className="p-2 bg-muted/30 rounded-lg text-xs">
          <p className="text-muted-foreground">Queue Position</p>
          <p className="font-semibold">{data?.positionInQueue ?? data?.position_in_queue ?? 'n/a'}</p>
        </div>
      </div>

      <div className="p-3 bg-muted/20 rounded-lg border border-border text-xs space-y-1">
        {flowId && (
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">Flow ID:</span>
            <span className="font-mono break-all text-right">{flowId}</span>
          </div>
        )}
        {scanId && (
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">Scan ID:</span>
            <span className="font-mono break-all text-right">{scanId}</span>
          </div>
        )}
        {file.hash && (
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">File Hash:</span>
            <span className="font-mono break-all text-right">{file.hash}</span>
          </div>
        )}
        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">Name:</span>
          <span className="break-all text-right">{file.name || data?.file_name || 'Unknown'}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">Size:</span>
          <span className="text-right">{formatBytes(file.size ?? data?.file_size)}</span>
        </div>
        {(file.type || file.mime) && (
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">Type:</span>
            <span className="text-right">{file.type || file.mime}</span>
          </div>
        )}
      </div>

      {(data?.scan_url || data?.report_url) && (
        <div className="flex flex-wrap gap-2">
          {data?.scan_url && (
            <a
              href={data.scan_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-border rounded-lg hover:bg-muted/40"
            >
              <ExternalLink className="w-3 h-3" />
              Open Scan
            </a>
          )}
          {data?.report_url && (
            <a
              href={data.report_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-border rounded-lg hover:bg-muted/40"
            >
              <ExternalLink className="w-3 h-3" />
              Open Report
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// HybridAnalysis formatter
function HybridAnalysisDetails({ data }: { data: any }) {
  const verdict = data.verdict || 'unknown';
  const threatLevel = data.threat_level || 'unknown';

  const verdictColor = {
    malicious: 'text-red-600 dark:text-red-400',
    suspicious: 'text-yellow-600 dark:text-yellow-400',
    benign: 'text-green-600 dark:text-green-400',
    'no specific threat': 'text-blue-600 dark:text-blue-400',
  }[verdict.toLowerCase()] || 'text-gray-600 dark:text-gray-400';

  return (
    <div className="space-y-4">
      {/* Verdict */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`p-3 rounded-lg border ${
          verdict === 'malicious'
            ? 'bg-red-500/10 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            : 'bg-blue-500/10 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
        }`}>
          <p className="text-xs text-muted-foreground mb-1">Verdict</p>
          <p className={`font-semibold capitalize text-sm ${verdictColor}`}>{verdict}</p>
        </div>
        <div className="p-3 bg-purple-500/10 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <p className="text-xs text-muted-foreground mb-1">Threat Score</p>
          <p className="font-bold text-purple-600 dark:text-purple-400 text-sm">{data.threat_score || 0}/100</p>
        </div>
      </div>

      {/* File Type & Size */}
      {(data.type || data.size) && (
        <div className="p-3 bg-muted/30 rounded-lg text-xs space-y-1">
          {data.type && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type:</span>
              <span>{data.type}</span>
            </div>
          )}
          {data.size && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Size:</span>
              <span>{(data.size / 1024).toFixed(2)} KB</span>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 bg-muted/30 rounded-lg text-xs">
          <p className="text-muted-foreground">Reports</p>
          <p className="font-semibold">{Array.isArray(data.reports) ? data.reports.length : 0}</p>
        </div>
        <div className="p-2 bg-muted/30 rounded-lg text-xs">
          <p className="text-muted-foreground">Signatures</p>
          <p className="font-semibold">{data.total_signatures ?? 0}</p>
        </div>
        <div className="p-2 bg-muted/30 rounded-lg text-xs">
          <p className="text-muted-foreground">Processes</p>
          <p className="font-semibold">{data.total_processes ?? 0}</p>
        </div>
        <div className="p-2 bg-muted/30 rounded-lg text-xs">
          <p className="text-muted-foreground">Network Connections</p>
          <p className="font-semibold">{data.total_network_connections ?? 0}</p>
        </div>
      </div>

      {(data.submitted_at || data.analysis_date || data.ha_url) && (
        <div className="p-3 bg-muted/20 rounded-lg border border-border text-xs space-y-1">
          {data.submitted_at && (
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Submitted:</span>
              <span className="text-right">{new Date(data.submitted_at).toLocaleString()}</span>
            </div>
          )}
          {data.analysis_date && (
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Analyzed:</span>
              <span className="text-right">{new Date(data.analysis_date).toLocaleString()}</span>
            </div>
          )}
          {data.ha_url && (
            <div className="pt-2">
              <a
                href={data.ha_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-border rounded-lg hover:bg-muted/40"
              >
                <ExternalLink className="w-3 h-3" />
                Open Hybrid Analysis Report
              </a>
            </div>
          )}
        </div>
      )}

      {/* Tags */}
      {data.tags && data.tags.length > 0 && (
        <div>
          <p className="text-xs font-semibold mb-2">Tags ({data.tags.length})</p>
          <div className="flex flex-wrap gap-1">
            {data.tags.slice(0, 8).map((tag: string) => (
              <span key={tag} className="px-2 py-1 text-xs bg-primary/20 text-primary rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Default formatter for unknown services
function DefaultDetails({ data }: { data: any }) {
  return (
    <div className="p-3 bg-muted/30 rounded-lg text-xs">
      <p className="text-muted-foreground mb-2">Service response:</p>
      <div className="max-h-64 overflow-auto">
        {typeof data === 'object' ? (
          <pre className="whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>
        ) : (
          <p>{String(data)}</p>
        )}
      </div>
    </div>
  );
}