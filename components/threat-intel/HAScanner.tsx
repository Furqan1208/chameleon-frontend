// components/threat-intel/HAScanner.tsx
'use client';

import { useState, useCallback, useRef } from 'react';
import { HAResults } from './HAResults';
import { HAStatsCards } from './HAStatsCards';
import { HAAnalysisDashboard } from './HAAnalysisDashboard';
import { HATopThreats } from './HATopThreats';
import { useHybridAnalysis } from '@/hooks/useHybridAnalysis';
import { 
  Cpu, 
  AlertTriangle, 
  CheckCircle, 
  Trash2,
  RefreshCw,
  Zap,
  Database,
  Info,
  FileText,
  Shield,
  Network,
  Activity,
  Search,
  Hash,
  Globe,
  ExternalLink,
  Flame,
  BarChart,
  Upload,
  Calculator,
  FileCheck,
  X,
  FileUp,
  File
} from 'lucide-react';
import type { HAIndicatorType } from '@/lib/threat-intel/ha-types';
import { calculateFileHash, validateHash } from '@/lib/threat-intel/ha-utils';

export function HAScanner() {
  const {
    scanning,
    error,
    results,
    stats,
    rateLimit,
    threatFeed,
    feedLoading,
    scanIndicator,
    clearResults,
    clearCache,
    loadThreatFeed
  } = useHybridAnalysis();

  const [activeTab, setActiveTab] = useState<'scanner' | 'threats' | 'analysis'>('scanner');
  const [showRateLimitInfo, setShowRateLimitInfo] = useState(false);
  const [hashInput, setHashInput] = useState('');
  const [selectedHash, setSelectedHash] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [calculatingHash, setCalculatingHash] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleHashScan = async (hash: string) => {
    try {
      setUploadError(null);
      setUploadSuccess(null);
      
      const validation = validateHash(hash);
      if (!validation.isValid) {
        setUploadError(`Invalid hash format. Please enter a valid MD5, SHA1, SHA256, or SHA512 hash.`);
        return;
      }

      await scanIndicator({
        indicator: hash,
        type: 'hash',
        include_metadata: true,
        include_summary: true
      });
      
      setHashInput('');
      setUploadSuccess(`Successfully analyzed ${validation.type} hash: ${hash.substring(0, 16)}...`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze hash';
      console.error('Scan failed:', err);
      setUploadError(errorMessage);
    }
  };

  const handleFileUpload = async (files: File[]) => {
    setUploadedFiles(prev => [...prev, ...files]);
    setUploadError(null);
    setUploadSuccess(null);
    
    for (const file of files) {
      setCalculatingHash(true);
      try {
        // Calculate SHA256 hash of the file
        const hash = await calculateFileHash(file, 'sha256');
        
        if (hash) {
          setUploadSuccess(`Calculated SHA256: ${hash.substring(0, 16)}... Analyzing...`);
          
          // Scan the calculated hash
          await scanIndicator({
            indicator: hash,
            type: 'hash',
            include_metadata: true,
            include_summary: true
          });
          
          setUploadSuccess(`Successfully analyzed file: ${file.name}`);
        } else {
          setUploadError(`Failed to calculate hash for: ${file.name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to process file';
        console.error('Failed to process file:', error);
        setUploadError(`Error processing ${file.name}: ${errorMessage}`);
      } finally {
        setCalculatingHash(false);
      }
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleFileUpload(Array.from(files));
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(Array.from(files));
    }
  };

  const handleQuickTest = async (type: 'malicious' | 'benign') => {
    // Test hashes
    const testHashes = {
      malicious: [
        '275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f', // EICAR test SHA256
        '44d88612fea8a8f36de82e1278abb02f', // EICAR test MD5
        '3395856ce81f2b7382dee72602f798b642f14140' // EICAR test SHA1
      ],
      benign: [
        'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', // Empty file SHA256
        'd41d8cd98f00b204e9800998ecf8427e', // Empty file MD5
        'da39a3ee5e6b4b0d3255bfef95601890afd80709' // Empty file SHA1
      ]
    };

    const hashToTest = testHashes[type][0]; // Use first hash
    await handleHashScan(hashToTest);
  };

  const handleClearCache = () => {
    if (confirm('Clear all cached Hybrid Analysis data?')) {
      clearCache();
    }
  };

  const removeUploadedFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearUploads = () => {
    setUploadedFiles([]);
    setUploadError(null);
    setUploadSuccess(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatTimeUntilReset = () => {
    if (rateLimit.minutesUntilReset <= 0) return 'Resets now';
    const minutes = Math.ceil(rateLimit.minutesUntilReset);
    return `Resets in ${minutes}m`;
  };

  const getRateLimitColor = () => {
    if (rateLimit.remaining === 0) return 'bg-destructive/10 text-destructive border-destructive/20';
    if (rateLimit.remaining <= 1) return 'bg-accent/10 text-accent border-accent/20';
    return 'bg-primary/10 text-primary border-primary/20';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Cpu className="w-8 h-8 text-purple-500" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Hybrid Analysis</h1>
            <p className="text-sm text-muted-foreground">
              Advanced sandbox malware analysis • Deep file inspection
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* Rate Limit Indicator */}
          <div className="relative">
            <div className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg ${getRateLimitColor()}`}>
              <Zap className="w-4 h-4" />
              <div className="text-xs">
                <div className="font-medium">
                  {rateLimit.remaining} / {rateLimit.limit} req
                </div>
                <div className="text-xs opacity-80">
                  {formatTimeUntilReset()}
                </div>
              </div>
              <button
                onClick={() => setShowRateLimitInfo(!showRateLimitInfo)}
                className="ml-1"
              >
                <Info className="w-3 h-3" />
              </button>
            </div>
            
            {/* Rate limit tooltip */}
            {showRateLimitInfo && (
              <div className="absolute right-0 top-full mt-2 w-64 p-3 glass border border-border rounded-lg shadow-lg z-10">
                <h4 className="font-semibold text-foreground mb-2">Rate Limit</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5"></div>
                    <span><strong>Free Tier:</strong> 4 requests/minute</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5"></div>
                    <span><strong>Current:</strong> {rateLimit.remaining} remaining</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5"></div>
                    <span>Results cached for 1 hour</span>
                  </li>
                </ul>
                <button
                  onClick={() => setShowRateLimitInfo(false)}
                  className="mt-3 w-full text-xs text-primary hover:underline"
                >
                  Close
                </button>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <button
            onClick={handleClearCache}
            className="px-3 py-1.5 border border-border rounded-lg hover:bg-muted/20 transition-colors flex items-center gap-2 text-sm"
            title="Clear cached API responses"
          >
            <RefreshCw className="w-4 h-4" />
            Clear Cache
          </button>
          
          {results.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Clear all scan results?')) {
                  clearResults();
                  clearUploads();
                }
              }}
              className="px-3 py-1.5 border border-destructive/30 text-destructive rounded-lg hover:bg-destructive/10 transition-colors flex items-center gap-2 text-sm"
              title="Clear all scan results"
            >
              <Trash2 className="w-4 h-4" />
              Clear Results
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <HAStatsCards results={results} threatFeed={threatFeed} />

      {/* Main Content */}
      <div className="glass border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('scanner')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'scanner'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted/20 text-muted-foreground'
            }`}
          >
            <Search className="w-4 h-4" />
            Scanner
            {results.length > 0 && (
              <span className="px-1.5 py-0.5 text-xs bg-primary/20 rounded">
                {results.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('threats')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'threats'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted/20 text-muted-foreground'
            }`}
          >
            <Flame className="w-4 h-4" />
            Latest Threats
            {threatFeed.length > 0 && (
              <span className="px-1.5 py-0.5 text-xs bg-destructive/20 text-destructive rounded">
                {threatFeed.filter(t => t.verdict === 60).length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'analysis'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted/20 text-muted-foreground'
            }`}
          >
            <BarChart className="w-4 h-4" />
            Analysis
          </button>
        </div>

        {activeTab === 'scanner' ? (
          <div className="space-y-6">
            {/* File Upload Section */}
            <div 
              className={`border-2 border-dashed rounded-xl p-8 transition-colors cursor-pointer ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 hover:bg-muted/5'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-full mb-4">
                  <Upload className="w-8 h-8 text-purple-500" />
                </div>
                
                <h3 className="font-semibold text-foreground mb-2">Upload & Analyze Files</h3>
                <p className="text-sm text-muted-foreground max-w-md mb-6">
                  Drag & drop files or click to browse. We'll calculate the SHA256 hash and analyze it with Hybrid Analysis.
                </p>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  multiple
                  className="hidden"
                  id="file-upload"
                />
                
                <button
                  type="button"
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  <FileUp className="w-5 h-5" />
                  Choose Files
                </button>
                
                <p className="text-xs text-muted-foreground mt-3">
                  Supports executable files (EXE, DLL), documents (PDF, DOCX), scripts, archives, and more
                </p>
              </div>
            </div>

            {/* Upload Status */}
            {calculatingHash && (
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calculator className="w-5 h-5 text-blue-500 animate-pulse" />
                  <div>
                    <p className="font-medium text-blue-500">Calculating file hash...</p>
                    <p className="text-sm text-muted-foreground">
                      Processing uploaded file{uploadedFiles.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {uploadSuccess && (
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div className="flex-1">
                    <p className="font-medium text-green-500">{uploadSuccess}</p>
                  </div>
                </div>
              </div>
            )}

            {uploadError && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <div className="flex-1">
                    <p className="font-medium text-destructive">Upload Error</p>
                    <p className="text-sm text-muted-foreground">{uploadError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-foreground">Uploaded Files ({uploadedFiles.length})</h4>
                  <button
                    onClick={clearUploads}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Clear All
                  </button>
                </div>
                
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg group">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileCheck className="w-5 h-5 text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024).toFixed(2)} KB • {file.type || 'Unknown type'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeUploadedFile(index);
                        }}
                        className="p-1.5 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hash Input Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Hash className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="font-semibold text-foreground">Manual Hash Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter MD5, SHA1, SHA256, or SHA512 hash for direct analysis
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={hashInput}
                      onChange={(e) => setHashInput(e.target.value)}
                      placeholder="e.g., 275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f"
                      className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-primary transition-colors font-mono text-sm"
                    />
                  </div>
                </div>
                <button
                  onClick={() => handleHashScan(hashInput)}
                  disabled={scanning || !hashInput.trim()}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                >
                  {scanning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Analyze Hash
                    </>
                  )}
                </button>
              </div>

              {/* Quick Test Buttons */}
              <div className="flex flex-wrap gap-2 pt-2">
                <p className="text-sm text-muted-foreground w-full">Quick test with known samples:</p>
                <button
                  onClick={() => handleQuickTest('malicious')}
                  className="px-4 py-2 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg hover:bg-destructive/20 transition-colors flex items-center gap-2 text-sm"
                  disabled={scanning}
                >
                  <AlertTriangle className="w-4 h-4" />
                  Test Malicious (EICAR)
                </button>
                <button
                  onClick={() => handleQuickTest('benign')}
                  className="px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-2 text-sm"
                  disabled={scanning}
                >
                  <Shield className="w-4 h-4" />
                  Test Clean (Empty File)
                </button>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-4 border border-destructive/30 bg-destructive/5 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-destructive mb-1">Analysis Failed</p>
                    <p className="text-sm text-foreground/80">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Results */}
            {results.length > 0 ? (
              <div className="mt-8">
                <HAResults 
                  results={results}
                  selectedHash={selectedHash}
                  onSelectHash={setSelectedHash}
                />
              </div>
            ) : !scanning && !calculatingHash && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-full mb-4">
                  <Cpu className="w-8 h-8 text-purple-500" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Ready to Analyze</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  Upload a file or enter a hash to analyze with Hybrid Analysis sandbox
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-lg mx-auto">
                  <div className="p-4 border border-border rounded-lg text-center hover:border-primary/30 transition-colors">
                    <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium">Upload File</p>
                    <p className="text-xs text-muted-foreground">Auto-calculate hash</p>
                  </div>
                  <div className="p-4 border border-border rounded-lg text-center hover:border-primary/30 transition-colors">
                    <Hash className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium">Manual Hash</p>
                    <p className="text-xs text-muted-foreground">Any hash format</p>
                  </div>
                  <div className="p-4 border border-border rounded-lg text-center hover:border-primary/30 transition-colors">
                    <Database className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium">Latest Threats</p>
                    <p className="text-xs text-muted-foreground">View recent detections</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : activeTab === 'threats' ? (
          <HATopThreats 
            threats={threatFeed}
            loading={feedLoading}
            onRefresh={loadThreatFeed}
          />
        ) : (
          <HAAnalysisDashboard 
            results={results}
            threatFeed={threatFeed}
          />
        )}
      </div>

      {/* Information Section */}
      <div className="glass border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-primary" />
          About Hybrid Analysis
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-primary" />
              <span className="font-medium text-foreground">Sandbox Analysis</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Execute files in isolated environments to observe behavior and detect malware.
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-accent" />
              <span className="font-medium text-foreground">Threat Intelligence</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Access detailed reports including MITRE ATT&CK techniques, network analysis, and more.
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-secondary" />
              <span className="font-medium text-foreground">File Support</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Windows executables, documents, scripts, archives, and various file formats.
            </p>
          </div>
        </div>
        
        <div className="pt-6 border-t border-border">
          <h3 className="font-medium text-foreground mb-3">Getting Started</h3>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="mt-0.5">1.</span>
              <span>Upload any file or enter a hash to analyze</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5">2.</span>
              <span>View detailed sandbox analysis including behavioral data and threat indicators</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5">3.</span>
              <span>Check the Latest Threats tab for recent malware detections</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}