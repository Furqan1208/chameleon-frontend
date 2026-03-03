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
  const handleSearch = async () => {
    if (!searchInput.trim()) {
      setError('Please enter something to search');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await unifiedService.unifiedSearch(searchInput.trim());
      setResults(response);
      setActiveTab('results');
      
      // Add to history
      setSearchHistory(prev => {
        const newHistory = [searchInput.trim(), ...prev.filter(s => s !== searchInput.trim())];
        return newHistory.slice(0, 10);
      });

      setSuccess(`Found results from ${response.summary.successful} threat intelligence sources`);
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
      setSuccess(`File uploaded and submitted to ${response.results.length} sandboxes`);
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
    
    return results.results.filter(r => {
      if (!r.success || !r.data) return false;
      
      // Check if result indicates malicious activity
      switch (r.source) {
        case 'VirusTotal':
          const vtData = r.data as any;
          return vtData.detection_stats?.malicious > 0;
        case 'AbuseIPDB':
          const abuseData = r.data as any;
          return abuseData.confidence_score > 50;
        case 'MalwareBazaar':
          const mbData = r.data as any;
          return mbData.found === true;
        case 'ThreatFox':
          const tfData = r.data as any;
          return tfData.query_status === 'ok';
        case 'HybridAnalysis':
          const haData = r.data as any;
          return haData.threat_level === 'malicious';
        case 'AlienVault OTX':
          const otxData = r.data as any;
          return otxData.pulse_count > 0;
        default:
          return false;
      }
    });
  }, [results, filterMalicious]);

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
      <div className="flex flex-wrap gap-2 border-b border-border mb-6">
        <button
          onClick={() => setActiveTab('search')}
          className={`px-4 py-3 font-medium rounded-t-lg transition-colors flex items-center gap-2 ${
            activeTab === 'search'
              ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
          }`}
        >
          <Search className="w-4 h-4" />
          Smart Search
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-3 font-medium rounded-t-lg transition-colors flex items-center gap-2 ${
            activeTab === 'upload'
              ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
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
                ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
            }`}
          >
            <FileText className="w-4 h-4" />
            Results ({results.results.length})
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="bg-background rounded-xl border border-border p-6 shadow-lg">
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
                      className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSearch}
                  disabled={isLoading || !searchInput.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-background rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap shadow-md"
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
                    className="ml-auto text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
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
                      onClick={() => {
                        setSearchInput(item);
                        handleSearch();
                      }}
                      className="px-3 py-1.5 bg-muted/20 text-foreground rounded-lg text-sm hover:bg-muted/30 transition-colors"
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
                  onClick={() => {
                    setSearchInput('8.8.8.8');
                    handleSearch();
                  }}
                />
                <ExampleCard
                  icon={<Globe className="w-4 h-4" />}
                  label="Domain"
                  value="google.com"
                  onClick={() => {
                    setSearchInput('google.com');
                    handleSearch();
                  }}
                />
                <ExampleCard
                  icon={<Hash className="w-4 h-4" />}
                  label="Malware Hash"
                  value="275a021bbfb6489e54d471899f7db9d16..."
                  onClick={() => {
                    setSearchInput('275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f');
                    handleSearch();
                  }}
                />
                <ExampleCard
                  icon={<Tag className="w-4 h-4" />}
                  label="Malware Tag"
                  value="TrickBot"
                  onClick={() => {
                    setSearchInput('TrickBot');
                    handleSearch();
                  }}
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
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 scale-[1.02]'
                  : 'border-border hover:border-indigo-400 hover:bg-muted/30'
              }`}
            >
              <input {...getInputProps()} />
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 rounded-full mb-4">
                <Upload className="w-8 h-8 text-indigo-500" />
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
                    <div className="p-2 bg-background rounded-lg">
                      <File className="w-5 h-5 text-indigo-500" />
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
                className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-background rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
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
            <div className="bg-muted/5 dark:bg-muted/5 rounded-xl p-6 border border-border">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-xl font-bold text-foreground">
                      Results for: 
                    </h2>
                    <code className="px-3 py-1 bg-background rounded-lg font-mono text-sm">
                      {results.input}
                    </code>
                    <InputTypeBadge type={results.inputType} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Searched across {results.summary.totalServices} threat intelligence sources
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
                  value={results.summary.successful}
                  total={results.summary.totalServices}
                  color="green"
                />
                <SummaryStat
                  label="Failed"
                  value={results.summary.failed}
                  total={results.summary.totalServices}
                  color="red"
                />
                <SummaryStat
                  label="Malicious"
                  value={results.summary.maliciousCount}
                  total={results.summary.totalServices}
                  color="red"
                />
                <SummaryStat
                  label="Suspicious"
                  value={results.summary.suspiciousCount}
                  total={results.summary.totalServices}
                  color="yellow"
                />
                <SummaryStat
                  label="Clean"
                  value={results.summary.cleanCount}
                  total={results.summary.totalServices}
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

function InputTypeBadge({ type }: { type: InputType }) {
  const typeConfig = {
    ip: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: <Network className="w-3 h-3" /> },
    domain: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: <Globe className="w-3 h-3" /> },
    url: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', icon: <Link className="w-3 h-3" /> },
    hash: { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400', icon: <Hash className="w-3 h-3" /> },
    tag: { color: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400', icon: <Tag className="w-3 h-3" /> },
    file: { color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400', icon: <File className="w-3 h-3" /> },
    unknown: { color: 'bg-muted/20 text-muted-foreground dark:bg-muted/30 dark:text-muted-foreground', icon: <HelpCircle className="w-3 h-3" /> }
  };

  const config = typeConfig[type] || typeConfig.unknown;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.icon}
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  const colorClasses = {
    blue: 'bg-blue-500/10 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    purple: 'bg-purple-500/10 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
    orange: 'bg-orange-500/10 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
    green: 'bg-green-500/10 dark:bg-green-900/20 border-green-200 dark:border-green-800'
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
      className="p-3 border border-border rounded-lg hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all text-left"
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="text-indigo-500">{icon}</div>
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
  const getStatusColor = () => {
    if (!result.success) return 'border-red-300 dark:border-red-700 bg-red-500/10 dark:bg-red-900/20';
    
    // Determine based on result data
    switch (result.source) {
      case 'VirusTotal':
        if (result.data?.detection_stats?.malicious > 0) return 'border-red-300 dark:border-red-700 bg-red-500/10 dark:bg-red-900/20';
        if (result.data?.detection_stats?.suspicious > 0) return 'border-yellow-300 dark:border-yellow-700 bg-yellow-500/10 dark:bg-yellow-900/20';
        return 'border-green-300 dark:border-green-700 bg-green-500/10 dark:bg-green-900/20';
      case 'AbuseIPDB':
        if (result.data?.confidence_score > 50) return 'border-red-300 dark:border-red-700 bg-red-500/10 dark:bg-red-900/20';
        if (result.data?.confidence_score > 20) return 'border-yellow-300 dark:border-yellow-700 bg-yellow-500/10 dark:bg-yellow-900/20';
        return 'border-green-300 dark:border-green-700 bg-green-500/10 dark:bg-green-900/20';
      default:
        return result.success 
          ? 'border-green-300 dark:border-green-700 bg-green-500/10 dark:bg-green-900/20'
          : 'border-red-300 dark:border-red-700 bg-red-500/10 dark:bg-red-900/20';
    }
  };

  const getStatusIcon = () => {
    if (!result.success) return <XCircle className="w-5 h-5 text-red-500" />;
    
    switch (result.source) {
      case 'VirusTotal':
        if (result.data?.detection_stats?.malicious > 0) return <ShieldAlert className="w-5 h-5 text-red-500" />;
        if (result.data?.detection_stats?.suspicious > 0) return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
        return <ShieldCheck className="w-5 h-5 text-green-500" />;
      case 'AbuseIPDB':
        if (result.data?.confidence_score > 50) return <ShieldAlert className="w-5 h-5 text-red-500" />;
        if (result.data?.confidence_score > 20) return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
        return <ShieldCheck className="w-5 h-5 text-green-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
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
                {result.success ? (
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
        <div className="p-4 border-t border-inherit bg-background">
          {result.error ? (
            <div className="text-red-600 dark:text-red-400 text-sm">
              Error: {result.error}
            </div>
          ) : (
            <pre className="text-xs overflow-auto max-h-96 p-3 bg-muted/20 rounded-lg">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}