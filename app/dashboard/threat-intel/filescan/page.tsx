'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
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
  Search
} from 'lucide-react';
import { useFilescan } from '@/hooks/useFilescan';
import type { AnalysisResult, FileScanOptions } from '@/lib/types/filescan.types';
import DetailedReportViewer from '@/components/threat-intel/DetailedReportViewer';
import {
  formatFileSize,
  formatDate,
  getVerdictInfo,
  getThreatLevelInfo,
  getFileTypeIcon,
  getFileTypeColor,
  getConfidenceColor,
  getConfidenceLabel,
  truncateHash,
  getHashType,
  getSimilarityColor,
  formatSimilarity,
  calculateProgress
} from '@/lib/utils/filescan.utils';

export default function FilescanScanner() {
  // Use hook
  const {
    scanning,
    error,
    success,
    results,
    currentFlowId,
    polling,
    pollingProgress,
    uploadFile,
    scanUrl: scanUrlFromHook,
    checkFlowId,
    clearResults
  } = useFilescan();
  
  // Local UI state
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'lookup' | 'results'>('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [flowIdInput, setFlowIdInput] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Detailed Report State
  const [showDetailedReport, setShowDetailedReport] = useState(false);
  const [selectedReport, setSelectedReport] = useState<{reportId: string, fileHash: string} | null>(null);
  
  // Advanced options
  const [scanOptions, setScanOptions] = useState<Partial<FileScanOptions>>({
    osint: true,
    extracted_files_osint: true,
    input_file_yara: true,
    extracted_files_yara: true,
    visualization: true,
    files_download: true,
    phishing_detection: true,
  });
  const [description, setDescription] = useState('');

  // Drag and drop with correct MIME types
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setUploadedFile(acceptedFiles[0]);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      // Correct MIME types
      'application/x-msdownload': ['.exe', '.dll'],
      'application/x-msi': ['.msi'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'text/plain': ['.txt'],
      'application/javascript': ['.js'],
      'text/x-python': ['.py'],
      'application/x-msdos-program': ['.bat', '.cmd'],
      'application/x-powershell': ['.ps1'],
      'application/zip': ['.zip'],
      'application/x-rar-compressed': ['.rar'],
      'application/x-7z-compressed': ['.7z'],
      'application/x-tar': ['.tar'],
      'application/gzip': ['.gz'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/bmp': ['.bmp']
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    multiple: false
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setUploadedFile(files[0]);
    }
  };

  const handleScanFile = async () => {
    if (!uploadedFile) {
      return;
    }

    try {
      const options: Partial<FileScanOptions> = {
        ...scanOptions,
        description: description || uploadedFile.name
      };
      
      await uploadFile(uploadedFile, options);
      setActiveTab('results');
    } catch (err) {
      console.error('File scan error:', err);
    }
  };

  const handleScanUrl = async () => {
    if (!urlInput.trim()) {
      return;
    }

    try {
      new URL(urlInput);
    } catch {
      return;
    }

    try {
      const options: FileScanOptions = {
        description: description || urlInput,
        ...scanOptions
      };
      
      await scanUrlFromHook(urlInput, options);
      setActiveTab('results');
    } catch (err) {
      console.error('URL scan error:', err);
    }
  };

  const handleQuickTest = (type: 'malicious' | 'benign') => {
    const testUrls = {
      malicious: 'https://secure.eicar.org/eicar.com.txt',
      benign: 'https://www.google.com/favicon.ico'
    };
    setUrlInput(testUrls[type]);
    setActiveTab('url');
  };

  const handleViewDetailedReport = (reportId: string, fileHash: string) => {
    setSelectedReport({ reportId, fileHash });
    setShowDetailedReport(true);
  };

  const clearUpload = () => {
    setUploadedFile(null);
    setDescription('');
  };

  const toggleScanOption = (option: keyof FileScanOptions) => {
    setScanOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
            <Cpu className="w-8 h-8 text-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Filescan.io Sandbox
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Advanced malware analysis with real-time sandbox execution
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border mb-6">
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-3 font-medium rounded-t-lg transition-colors flex items-center gap-2 ${
            activeTab === 'upload'
              ? 'bg-blue-500/10 text-blue-400 border-b-2 border-blue-600'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
          }`}
        >
          <Upload className="w-4 h-4" />
          File Upload
        </button>
        <button
          onClick={() => setActiveTab('url')}
          className={`px-4 py-3 font-medium rounded-t-lg transition-colors flex items-center gap-2 ${
            activeTab === 'url'
              ? 'bg-blue-500/10 text-blue-400 border-b-2 border-blue-600'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
          }`}
        >
          <Globe className="w-4 h-4" />
          URL Scan
        </button>
        <button
          onClick={() => setActiveTab('results')}
          className={`px-4 py-3 font-medium rounded-t-lg transition-colors flex items-center gap-2 ${
            activeTab === 'results'
              ? 'bg-blue-500/10 text-blue-400 border-b-2 border-blue-600'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
          }`}
        >
          <FileText className="w-4 h-4" />
          Results {results.length > 0 && `(${results.length})`}
        </button>
        <button
          onClick={() => setActiveTab('lookup')}
          className={`px-4 py-3 font-medium rounded-t-lg transition-colors flex items-center gap-2 ${
            activeTab === 'lookup'
              ? 'bg-blue-500/10 text-blue-400 border-b-2 border-blue-600'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
          }`}
        >
          <Search className="w-4 h-4" />
          Lookup Flow ID
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-background rounded-xl border border-border p-4 md:p-6">
        {/* File Upload Tab */}
        {activeTab === 'upload' && (
          <div className="space-y-6">
            {/* Drag & Drop Area */}
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragActive
                  ? 'border-blue-500 bg-blue-500/10 scale-[1.02]'
                  : 'border-border hover:border-blue-400 hover:bg-muted/30'
              }`}
            >
              <input {...getInputProps()} />
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-full mb-4">
                <Upload className="w-8 h-8 text-blue-500" />
              </div>
              <p className="text-lg font-medium text-foreground mb-2">
                {isDragActive ? 'Drop the file here' : 'Drag & drop your file here'}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                or click to browse files
              </p>
              <p className="text-xs text-muted-foreground">
                Supports: EXE, DLL, PDF, DOC, XLS, ZIP, JS, etc. • Max 100MB
              </p>
            </div>

            {/* Selected File */}
            {uploadedFile && (
              <div className="bg-muted/5 rounded-lg p-4 border border-blue-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-background rounded-lg">
                      <File className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {uploadedFile.name}
                      </p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{formatFileSize(uploadedFile.size)}</span>
                        <span>•</span>
                        <span>{uploadedFile.type || 'Unknown type'}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={clearUpload}
                    className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Metadata Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe this file..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Advanced Options */}
            <div className="border-t border-border pt-6">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center justify-between w-full p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <span className="font-medium text-foreground">Advanced Options</span>
                </div>
                {showAdvanced ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>

              {showAdvanced && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 bg-muted/20 p-4 rounded-lg">
                  {[
                    { key: 'osint', label: 'OSINT Lookups' },
                    { key: 'extracted_files_osint', label: 'OSINT on Extracted Files' },
                    { key: 'input_file_yara', label: 'YARA on Input' },
                    { key: 'extracted_files_yara', label: 'YARA on Extracted' },
                    { key: 'visualization', label: 'Visualization' },
                    { key: 'files_download', label: 'Download Files' },
                    { key: 'phishing_detection', label: 'Phishing Detection' },
                    { key: 'extended_osint', label: 'Extended OSINT' },
                    { key: 'whois', label: 'WHOIS Lookup' },
                    { key: 'ips_meta', label: 'IP Metadata' },
                    { key: 'images_ocr', label: 'Image OCR' },
                    { key: 'certificates', label: 'Certificate Extraction' },
                    { key: 'url_analysis', label: 'URL Analysis' },
                    { key: 'extract_strings', label: 'Strings Extraction' },
                    { key: 'ocr_qr', label: 'QR Code Detection' }
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 text-sm cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={!!scanOptions[key as keyof FileScanOptions]}
                        onChange={() => toggleScanOption(key as keyof FileScanOptions)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="text-foreground group-hover:text-foreground transition-colors">
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-4">
              <button
                onClick={handleScanFile}
                disabled={scanning || !uploadedFile}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-background rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                {scanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Cpu className="w-5 h-5" />
                    Start Analysis
                  </>
                )}
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => handleQuickTest('malicious')}
                  disabled={scanning}
                  className="px-4 py-3 bg-red-500/10 text-red-400 border border-red-800/50 rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Test EICAR
                </button>
                <button
                  onClick={() => handleQuickTest('benign')}
                  disabled={scanning}
                  className="px-4 py-3 bg-green-500/10 text-green-400 border border-green-800/50 rounded-lg hover:bg-green-500/20 transition-colors flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Test Benign
                </button>
              </div>
            </div>
          </div>
        )}

        {/* URL Scan Tab */}
        {activeTab === 'url' && (
          <div className="space-y-6">
            {/* URL Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Enter URL to Scan
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://example.com/suspicious-file.exe"
                      className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <button
                  onClick={handleScanUrl}
                  disabled={scanning || !urlInput}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-background rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                >
                  {scanning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Cpu className="w-4 h-4" />
                      Scan URL
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Test Buttons */}
            <div className="flex flex-wrap gap-2">
              <p className="text-sm text-muted-foreground w-full">Quick test with known samples:</p>
              <button
                onClick={() => handleQuickTest('malicious')}
                disabled={scanning}
                className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-800/50 rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-2 text-sm"
              >
                <AlertTriangle className="w-4 h-4" />
                EICAR Test File
              </button>
              <button
                onClick={() => handleQuickTest('benign')}
                disabled={scanning}
                className="px-4 py-2 bg-green-500/10 text-green-400 border border-green-800/50 rounded-lg hover:bg-green-500/20 transition-colors flex items-center gap-2 text-sm"
              >
                <Shield className="w-4 h-4" />
                Google Favicon
              </button>
            </div>

            {/* Metadata Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe this URL..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* Lookup Flow ID Tab */}
        {activeTab === 'lookup' && (
          <div className="space-y-6">
            <div className="bg-blue-500/10 border border-blue-800/50 rounded-xl p-6">
              <div className="flex items-start gap-3 mb-4">
                <Info className="w-5 h-5 text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-400 mb-2">Check Flow ID Status</h3>
                  <p className="text-sm text-gray-300">
                    If your scan timed out or you want to check the status of a previous scan, 
                    enter the Flow ID below. The system will poll the scan until it completes.
                  </p>
                  {currentFlowId && (
                    <p className="text-sm text-gray-400 mt-2">
                      Current Flow ID: <code className="px-2 py-1 bg-black/30 rounded text-blue-300">{currentFlowId}</code>
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Flow ID
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={flowIdInput}
                    onChange={(e) => setFlowIdInput(e.target.value)}
                    placeholder="Enter Flow ID (e.g., 69ad650197feb4afd674b0cb)"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    disabled={scanning || polling}
                  />
                  <button
                    onClick={async () => {
                      if (flowIdInput.trim()) {
                        try {
                          await checkFlowId(flowIdInput.trim());
                          setActiveTab('results');
                        } catch (err) {
                          console.error('Lookup failed:', err);
                        }
                      }
                    }}
                    disabled={scanning || polling || !flowIdInput.trim()}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
                  >
                    {scanning || polling ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        Check Status
                      </>
                    )}
                  </button>
                </div>
              </div>

              {currentFlowId && currentFlowId !== flowIdInput && (
                <button
                  onClick={() => setFlowIdInput(currentFlowId)}
                  className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-2"
                >
                  <Copy className="w-3 h-3" />
                  Use current Flow ID: {currentFlowId}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && (
          <div className="space-y-6">
            {/* Current Scan Status */}
            {polling && currentFlowId && (
              <div className="bg-blue-500/10 border border-blue-800/50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-blue-700 dark:text-blue-300">Analysis in Progress</p>
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-mono">
                        {currentFlowId.substring(0, 8)}...
                      </p>
                    </div>
                    <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${pollingProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      {pollingProgress < 100 ? 'Processing in sandbox...' : 'Finalizing results...'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Results List */}
            {results.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">
                    Scan Results ({results.length})
                  </h3>
                  <button
                    onClick={clearResults}
                    className="px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Clear All
                  </button>
                </div>

                {results.map((result, index) => (
                  <ResultCard 
                    key={index} 
                    result={result} 
                    onViewDetailedReport={handleViewDetailedReport}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-full mb-4">
                  <FileText className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No Scan Results Yet
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Upload a file or scan a URL to start analyzing with the Filescan.io sandbox
                </p>
                <button
                  onClick={() => setActiveTab('upload')}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-background rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
                >
                  Start Your First Scan
                </button>
              </div>
            )}
          </div>
        )}

        {/* Status Messages */}
        {error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-800/50 rounded-xl">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-red-800 dark:text-red-300 mb-1">Error</p>
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                {error.includes('timeout') && currentFlowId && (
                  <div className="mt-3 pt-3 border-t border-red-800/30">
                    <p className="text-xs text-red-600 dark:text-red-400 mb-2">
                      The scan is still processing. You can check it later using the Lookup tab:
                    </p>
                    <div className="flex gap-2 items-center">
                      <code className="px-2 py-1 bg-red-900/30 rounded text-red-300 text-xs font-mono">
                        {currentFlowId}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(currentFlowId);
                        }}
                        className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                        title="Copy Flow ID"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => {
                          setFlowIdInput(currentFlowId);
                          setActiveTab('lookup');
                        }}
                        className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 ml-2"
                      >
                        <Search className="w-3 h-3" />
                        Go to Lookup
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mt-6 p-4 bg-green-500/10 border border-green-800/50 rounded-xl">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-green-800 dark:text-green-300 mb-1">Success</p>
                <p className="text-sm text-green-700 dark:text-green-400">{success}</p>
                {currentFlowId && (
                  <div className="mt-3 pt-3 border-t border-green-800/30">
                    <p className="text-xs text-green-600 dark:text-green-400 mb-2">
                      If scan takes longer than expected, you can check it later:
                    </p>
                    <div className="flex gap-2 items-center">
                      <code className="px-2 py-1 bg-green-900/30 rounded text-green-300 text-xs font-mono">
                        {currentFlowId}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(currentFlowId);
                        }}
                        className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1"
                        title="Copy Flow ID"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => {
                          setFlowIdInput(currentFlowId);
                          setActiveTab('lookup');
                        }}
                        className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1 ml-2"
                      >
                        <Search className="w-3 h-3" />
                        Go to Lookup
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detailed Report Viewer Modal */}
      {showDetailedReport && selectedReport && (
        <DetailedReportViewer
          reportId={selectedReport.reportId}
          fileHash={selectedReport.fileHash}
          onClose={() => {
            setShowDetailedReport(false);
            setSelectedReport(null);
          }}
        />
      )}
    </div>
  );
}

// Updated ResultCard Component with detailed report button
interface ResultCardProps {
  result: AnalysisResult;
  onViewDetailedReport: (reportId: string, fileHash: string) => void;
}

function ResultCard({ result, onViewDetailedReport }: ResultCardProps) {
  const [expanded, setExpanded] = useState(false);
  
  // Add defensive checks
  if (!result || !result.verdict || !result.file) {
    console.error('Invalid result object passed to ResultCard:', result);
    return (
      <div className="border border-red-800/50 rounded-lg p-4 bg-red-500/10">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <div>
            <p className="text-sm text-red-400">Error displaying result</p>
            <p className="text-sm text-red-700 dark:text-red-400">
              Invalid or incomplete scan result data
            </p>
          </div>
        </div>
      </div>
    );
  }

  const verdictInfo = getVerdictInfo(result.verdict.verdict);
  const threatLevelInfo = getThreatLevelInfo(result.verdict.threatLevel);
  const fileTypeColor = getFileTypeColor(result.file?.type || 'unknown');
  const confidenceColor = getConfidenceColor(result.verdict.confidence);
  const confidenceLabel = getConfidenceLabel(result.verdict.confidence);

  return (
    <div className={`border rounded-xl overflow-hidden transition-all duration-300 ${
      result.verdict.verdict === 'MALICIOUS' ? 'border-red-800/50' :
      result.verdict.verdict === 'SUSPICIOUS' ? 'border-yellow-800/50' :
      result.verdict.verdict === 'LIKELY_MALICIOUS' ? 'border-orange-800/50' :
      'border-border'
    }`}>
      {/* Header */}
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`p-2 rounded-lg ${verdictInfo.bgColor}`}>
              <div className={verdictInfo.color}>
                {verdictInfo.icon}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${verdictInfo.bgColor} ${verdictInfo.color}`}>
                  {verdictInfo.label}
                </span>
                <span className={`px-2 py-1 rounded text-xs ${threatLevelInfo.color} bg-gray-100 dark:bg-gray-800`}>
                  Threat: {threatLevelInfo.label}
                </span>
                <span className={`px-2 py-1 rounded text-xs ${confidenceColor} bg-gray-100 dark:bg-gray-800`}>
                  Confidence: {confidenceLabel}
                </span>
              </div>
              
              <div className="space-y-1">
                <p className="font-medium text-foreground truncate">
                  {result.file?.name || 'Unknown file'}
                </p>
                {result.file?.hash && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Hash className="w-3 h-3" />
                    <span className="font-mono">
                      {truncateHash(result.file.hash, 12)}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">
                      {getHashType(result.file.hash)}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-2">
                <div className="flex items-center gap-1">
                  <span className={fileTypeColor}>
                    {getFileTypeIcon(result.file?.type || 'unknown')}
                  </span>
                  <span className="capitalize">{result.file?.type || 'Unknown'}</span>
                </div>
                {result.file?.size && (
                  <div className="flex items-center gap-1">
                    <Database className="w-3 h-3" />
                    <span>{formatFileSize(result.file.size)}</span>
                  </div>
                )}
                {result.created_date && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(result.created_date)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1 ml-4">
            {result.file?.hash && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(result.file.hash);
                }}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                title="Copy Hash"
              >
                <Copy className="w-4 h-4" />
              </button>
            )}
            {result.report_url && (
              <a
                href={result.report_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                title="View on Filescan.io"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <button
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
            >
              {expanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-border bg-muted/20 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* File Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <File className="w-4 h-4" />
                File Information
              </h4>
              <div className="space-y-3">
                <InfoField label="Filename" value={result.file?.name || 'Unknown'} />
                <InfoField label="Hash" value={result.file?.hash || 'N/A'} copyable={!!result.file?.hash} />
                <InfoField label="File Type" value={result.file?.type || 'Unknown'} />
                {result.file?.size && <InfoField label="Size" value={formatFileSize(result.file.size)} />}
                <InfoField label="Scan Date" value={result.created_date ? formatDate(result.created_date) : 'Unknown'} />
                <InfoField label="Flow ID" value={result.flowId} copyable />
                <InfoField label="Report ID" value={result.scanId} copyable />
              </div>
            </div>

            {/* Threat Assessment */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Target className="w-4 h-4" />
                Threat Assessment
              </h4>
              <div className="space-y-3">
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${verdictInfo.bgColor}`}>
                      <div className={verdictInfo.color}>
                        {verdictInfo.icon}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Verdict</p>
                      <p className={`font-bold ${verdictInfo.color}`}>{verdictInfo.label}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${threatLevelInfo.color} bg-gray-100 dark:bg-gray-800`}>
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Threat Level</p>
                      <p className={`font-bold ${threatLevelInfo.color}`}>{threatLevelInfo.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {threatLevelInfo.description}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${confidenceColor} bg-gray-100 dark:bg-gray-800`}>
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Confidence</p>
                      <p className={`font-bold ${confidenceColor}`}>
                        {confidenceLabel} ({(result.verdict.confidence * 100).toFixed(0)}%)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions & Links */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Actions
              </h4>
              <div className="space-y-2">
                <a
                  href={result.report_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Full Report
                </a>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetailedReport(result.scanId, result.file.hash);
                  }}
                  className="w-full flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-green-600 to-emerald-600 text-background rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View Detailed Report
                </button>
                
                {result.file?.hash && (
                  <button
                    onClick={() => navigator.clipboard.writeText(result.file.hash)}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-muted/20 text-muted-foreground rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    Copy File Hash
                  </button>
                )}
                
                {result.scan_url && (
                  <a
                    href={result.scan_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 p-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View Scan Details
                  </a>
                )}
              </div>

              {/* Additional Info */}
              {result.chatGptSummary && (
                <div className="mt-4">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    AI Analysis Summary
                  </h4>
                  <div className="p-3 bg-yellow-500/10 border border-yellow-800/50 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                      {result.chatGptSummary.data}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Generated: {formatDate(result.chatGptSummary.created_date)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Extracted Files */}
          {result.extractedFiles && result.extractedFiles.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-foreground mb-4">
                Extracted Files ({result.extractedFiles.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {result.extractedFiles.slice(0, 6).map((file, idx) => (
                  <div key={idx} className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <File className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {file.name || `File_${idx + 1}`}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatFileSize(file.size)}</span>
                          <span>•</span>
                          <span className="truncate">{file.mediaType}</span>
                        </div>
                        <p className="text-xs font-mono text-muted-foreground truncate mt-1">
                          {truncateHash(file.hash, 10)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {result.extractedFiles.length > 6 && (
                  <div className="p-3 bg-muted/20 rounded-lg border border-border text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      +{result.extractedFiles.length - 6} more files
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Helper component for info fields
function InfoField({ label, value, copyable = false }: { 
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
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        {copyable && (
          <button
            onClick={handleCopy}
            className="p-1 text-muted-foreground hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded"
            title="Copy"
          >
            {copied ? (
              <CheckCircle className="w-3 h-3 text-green-500" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        )}
      </div>
      <p className="text-sm font-medium text-foreground truncate">
        {value}
      </p>
    </div>
  );
}