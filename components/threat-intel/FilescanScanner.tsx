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
  Activity
} from 'lucide-react';
import { filescanService } from '@/lib/threat-intel/filescan-service';
import type { AnalysisResult, FileScanOptions } from '@/lib/threat-intel/filescan-types';
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
} from '@/lib/threat-intel/filescan-utils';

export default function FilescanScanner() {
  // State
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'results'>('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [currentFlowId, setCurrentFlowId] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [pollingProgress, setPollingProgress] = useState(0);
  
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
  const [tags, setTags] = useState('');
  const [propagateTags, setPropagateTags] = useState(true);

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
      setError(null);
    }
  };

  const handleScanFile = async () => {
    if (!uploadedFile) {
      setError('Please select a file to scan');
      return;
    }

    setScanning(true);
    setError(null);
    setSuccess(null);
    setCurrentFlowId(null);
    setPollingProgress(0);

    try {
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      console.log('Starting file upload...');
      const response = await filescanService.uploadFile(
        uploadedFile,
        scanOptions,
        description || uploadedFile.name,
        tagsArray.length > 0 ? tagsArray : undefined,
        propagateTags
      );

      setSuccess(`File uploaded successfully! Flow ID: ${response.flow_id}`);
      setCurrentFlowId(response.flow_id);
      setPolling(true);

      // Start polling for results with progress updates
      const startTime = Date.now();
      const maxTime = 5 * 60 * 1000; // 5 minutes max
      
      const pollInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(95, (elapsed / maxTime) * 100);
        setPollingProgress(progress);
      }, 1000);

      try {
        const result = await filescanService.pollUntilComplete(response.flow_id);
        setResults(prev => [result, ...prev]);
        setPolling(false);
        setPollingProgress(100);
        setActiveTab('results');
      } finally {
        clearInterval(pollInterval);
      }
      
    } catch (err) {
      console.error('Scan error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload file');
      setPolling(false);
      setPollingProgress(0);
    } finally {
      setScanning(false);
    }
  };

  const handleScanUrl = async () => {
    if (!urlInput.trim()) {
      setError('Please enter a URL to scan');
      return;
    }

    try {
      new URL(urlInput);
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    setScanning(true);
    setError(null);
    setSuccess(null);
    setCurrentFlowId(null);
    setPollingProgress(0);

    try {
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      console.log('Starting URL scan...');
      const response = await filescanService.scanUrl(
        urlInput,
        scanOptions,
        description || urlInput,
        tagsArray.length > 0 ? tagsArray : undefined,
        propagateTags
      );

      setSuccess(`URL scan started! Flow ID: ${response.flow_id}`);
      setCurrentFlowId(response.flow_id);
      setPolling(true);

      // Start polling for results with progress updates
      const startTime = Date.now();
      const maxTime = 5 * 60 * 1000; // 5 minutes max
      
      const pollInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(95, (elapsed / maxTime) * 100);
        setPollingProgress(progress);
      }, 1000);

      try {
        const result = await filescanService.pollUntilComplete(response.flow_id);
        setResults(prev => [result, ...prev]);
        setPolling(false);
        setPollingProgress(100);
        setActiveTab('results');
      } finally {
        clearInterval(pollInterval);
      }
      
    } catch (err) {
      console.error('URL scan error:', err);
      setError(err instanceof Error ? err.message : 'Failed to scan URL');
      setPolling(false);
      setPollingProgress(0);
    } finally {
      setScanning(false);
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
    setError(null);
    setDescription('');
    setTags('');
  };

  const clearResults = () => {
    setResults([]);
    setError(null);
    setSuccess(null);
    setCurrentFlowId(null);
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
            <Cpu className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Filescan.io Sandbox
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Advanced malware analysis with real-time sandbox execution
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-3 font-medium rounded-t-lg transition-colors flex items-center gap-2 ${
            activeTab === 'upload'
              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
          }`}
        >
          <Upload className="w-4 h-4" />
          File Upload
        </button>
        <button
          onClick={() => setActiveTab('url')}
          className={`px-4 py-3 font-medium rounded-t-lg transition-colors flex items-center gap-2 ${
            activeTab === 'url'
              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
          }`}
        >
          <Globe className="w-4 h-4" />
          URL Scan
        </button>
        <button
          onClick={() => setActiveTab('results')}
          className={`px-4 py-3 font-medium rounded-t-lg transition-colors flex items-center gap-2 ${
            activeTab === 'results'
              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
          }`}
        >
          <FileText className="w-4 h-4" />
          Results {results.length > 0 && `(${results.length})`}
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 md:p-6">
        {/* File Upload Tab */}
        {activeTab === 'upload' && (
          <div className="space-y-6">
            {/* Drag & Drop Area */}
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragActive
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.02]'
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
            >
              <input {...getInputProps()} />
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-full mb-4">
                <Upload className="w-8 h-8 text-blue-500" />
              </div>
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {isDragActive ? 'Drop the file here' : 'Drag & drop your file here'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                or click to browse files
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Supports: EXE, DLL, PDF, DOC, XLS, ZIP, JS, etc. • Max 100MB
              </p>
            </div>

            {/* Selected File */}
            {uploadedFile && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white dark:bg-gray-800 rounded-lg">
                      <File className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {uploadedFile.name}
                      </p>
                      <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <span>{formatFileSize(uploadedFile.size)}</span>
                        <span>•</span>
                        <span>{uploadedFile.type || 'Unknown type'}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={clearUpload}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags (Optional, comma-separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="malware, suspicious, analysis"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={propagateTags}
                  onChange={(e) => setPropagateTags(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Propagate tags to report</span>
              </label>
            </div>

            {/* Advanced Options */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center justify-between w-full p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <span className="font-medium text-gray-900 dark:text-white">Advanced Options</span>
                </div>
                {showAdvanced ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>

              {showAdvanced && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
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
                      <span className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
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
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl"
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
                  className="px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Test EICAR
                </button>
                <button
                  onClick={() => handleQuickTest('benign')}
                  disabled={scanning}
                  className="px-4 py-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors flex items-center gap-2"
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
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://example.com/suspicious-file.exe"
                      className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <button
                  onClick={handleScanUrl}
                  disabled={scanning || !urlInput}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
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
              <p className="text-sm text-gray-500 dark:text-gray-400 w-full">Quick test with known samples:</p>
              <button
                onClick={() => handleQuickTest('malicious')}
                disabled={scanning}
                className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center gap-2 text-sm"
              >
                <AlertTriangle className="w-4 h-4" />
                EICAR Test File
              </button>
              <button
                onClick={() => handleQuickTest('benign')}
                disabled={scanning}
                className="px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors flex items-center gap-2 text-sm"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags (Optional, comma-separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="phishing, malware, suspicious"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={propagateTags}
                  onChange={(e) => setPropagateTags(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Propagate tags to report</span>
              </label>
            </div>
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && (
          <div className="space-y-6">
            {/* Current Scan Status */}
            {polling && currentFlowId && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
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
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Scan Results ({results.length})
                  </h3>
                  <button
                    onClick={clearResults}
                    className="px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2"
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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Scan Results Yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Upload a file or scan a URL to start analyzing with the Filescan.io sandbox
                </p>
                <button
                  onClick={() => setActiveTab('upload')}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
                >
                  Start Your First Scan
                </button>
              </div>
            )}
          </div>
        )}

        {/* Status Messages */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-red-800 dark:text-red-300 mb-1">Error</p>
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-green-800 dark:text-green-300 mb-1">Success</p>
                <p className="text-sm text-green-700 dark:text-green-400">{success}</p>
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

// Result Card Component
interface ResultCardProps {
  result: AnalysisResult;
  onViewDetailedReport: (reportId: string, fileHash: string) => void;
}

function ResultCard({ result, onViewDetailedReport }: ResultCardProps) {
  const [expanded, setExpanded] = useState(false);
  
  // Add defensive checks with better fallbacks
  if (!result) {
    console.error('ResultCard received null/undefined result');
    return null;
  }

  if (!result.verdict) {
    console.error('ResultCard missing verdict:', result);
    return (
      <div className="border border-yellow-300 rounded-lg p-4 bg-yellow-50 dark:bg-yellow-900/20">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          <div>
            <p className="font-medium text-yellow-800 dark:text-yellow-300">Analysis Result</p>
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              Missing verdict data. Flow ID: {result.flowId || 'Unknown'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const verdictInfo = getVerdictInfo(result.verdict.verdict);
  const threatLevelInfo = getThreatLevelInfo(result.verdict.threatLevel || 0);
  const fileTypeColor = getFileTypeColor(result.file?.type || 'unknown');
  const confidenceColor = getConfidenceColor(result.verdict.confidence || 0);
  const confidenceLabel = getConfidenceLabel(result.verdict.confidence || 0);

  // Safely get file information with fallbacks
  const fileName = result.file?.name || result.scanId || 'Unknown file';
  const fileHash = result.file?.hash || result.scanId || 'N/A';
  const fileType = result.file?.type || 'unknown';
  const fileSize = result.file?.size;

  return (
    <div className={`border rounded-xl overflow-hidden transition-all duration-300 ${
      result.verdict.verdict === 'MALICIOUS' ? 'border-red-200 dark:border-red-800' :
      result.verdict.verdict === 'SUSPICIOUS' ? 'border-yellow-200 dark:border-yellow-800' :
      result.verdict.verdict === 'LIKELY_MALICIOUS' ? 'border-orange-200 dark:border-orange-800' :
      'border-gray-200 dark:border-gray-700'
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
                <p className="font-medium text-gray-900 dark:text-white truncate">
                  {fileName}
                </p>
                {fileHash && fileHash !== 'N/A' && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Hash className="w-3 h-3" />
                    <span className="font-mono">
                      {truncateHash(fileHash, 12)}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">
                      {getHashType(fileHash)}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-2">
                <div className="flex items-center gap-1">
                  <span className={fileTypeColor}>
                    {getFileTypeIcon(fileType)}
                  </span>
                  <span className="capitalize">{fileType}</span>
                </div>
                {fileSize && (
                  <div className="flex items-center gap-1">
                    <Database className="w-3 h-3" />
                    <span>{formatFileSize(fileSize)}</span>
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
            {fileHash && fileHash !== 'N/A' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(fileHash);
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
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* File Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <File className="w-4 h-4" />
                File Information
              </h4>
              <div className="space-y-3">
                <InfoField label="Filename" value={fileName} />
                <InfoField label="Hash" value={fileHash} copyable={!!fileHash && fileHash !== 'N/A'} />
                <InfoField label="File Type" value={fileType} />
                {fileSize && <InfoField label="Size" value={formatFileSize(fileSize)} />}
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
                      <p className="text-sm text-gray-500 dark:text-gray-400">Verdict</p>
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
                      <p className="text-sm text-gray-500 dark:text-gray-400">Threat Level</p>
                      <p className={`font-bold ${threatLevelInfo.color}`}>{threatLevelInfo.label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
                      <p className="text-sm text-gray-500 dark:text-gray-400">Confidence</p>
                      <p className={`font-bold ${confidenceColor}`}>
                        {confidenceLabel} ({((result.verdict.confidence || 0) * 100).toFixed(0)}%)
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
                {result.report_url && (
                  <a
                    href={result.report_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Full Report
                  </a>
                )}
                
                {result.scanId && fileHash && fileHash !== 'N/A' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetailedReport(result.scanId, fileHash);
                    }}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View Detailed Report
                  </button>
                )}
                
                {fileHash && fileHash !== 'N/A' && (
                  <button
                    onClick={() => navigator.clipboard.writeText(fileHash)}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
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
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    AI Analysis Summary
                  </h4>
                  <div className="p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                      {result.chatGptSummary.data}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
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
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
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
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {file.name || `File_${idx + 1}`}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>{formatFileSize(file.size)}</span>
                          <span>•</span>
                          <span className="truncate">{file.mediaType}</span>
                        </div>
                        <p className="text-xs font-mono text-gray-400 dark:text-gray-500 truncate mt-1">
                          {truncateHash(file.hash, 10)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {result.extractedFiles.length > 6 && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
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
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        {copyable && (
          <button
            onClick={handleCopy}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded"
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
      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
        {value}
      </p>
    </div>
  );
}