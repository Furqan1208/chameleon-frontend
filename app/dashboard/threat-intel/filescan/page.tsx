'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
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
  Search,
  ChevronRight,
  Radar,
  Network
} from 'lucide-react';
import { useFilescan } from '@/hooks/useFilescan';
import type { AnalysisResult, FileScanOptions } from '@/lib/types/filescan.types';
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function StatCard({ icon, label, value, iconTone }: { icon: React.ReactNode; label: string; value: string; iconTone: string }) {
  return (
    <motion.div variants={itemVariants} className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-4 hover:bg-white/5 transition-colors">
      <div className="flex items-center gap-2 text-muted-foreground mb-2 text-xs uppercase tracking-wider">
        <span className={`inline-flex h-6 w-6 items-center justify-center rounded-md border border-[#1a1a1a] bg-[#101214] ${iconTone}`}>
          {icon}
        </span>
        <span>{label}</span>
      </div>
      <p className="text-2xl font-semibold text-white">{value}</p>
    </motion.div>
  );
}

export default function FilescanPage() {
  return (
    <div className="relative min-h-full bg-[#080808]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-cyan-500/5 blur-3xl" />
      </div>

      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl border border-[#1a1a1a] bg-[#0d0d0d]">
                <Cpu className="w-7 h-7 text-cyan-300" />
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary mb-1">Dynamic Sandbox Analysis</p>
                <h1 className="text-3xl font-bold text-white">Filescan.io</h1>
                <p className="text-muted-foreground mt-2">
                  Detonate files and URLs with multi-engine sandbox telemetry, behavioral verdicting, and deep artifact extraction.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={<Upload className="w-4 h-4" />} label="Ingestion" value="File + URL" iconTone="text-sky-300" />
            <StatCard icon={<Radar className="w-4 h-4" />} label="Engine" value="Behavioral Sandbox" iconTone="text-violet-300" />
            <StatCard icon={<Network className="w-4 h-4" />} label="Output" value="IOC + Similarity" iconTone="text-emerald-300" />
            <StatCard icon={<Clock className="w-4 h-4" />} label="Flow Tracking" value="Real-Time Polling" iconTone="text-slate-300" />
          </motion.div>

          <motion.div variants={itemVariants} className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-6 space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/25">
                  <Search className="w-5 h-5 text-sky-300" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Filescan Sandbox Scanner</h2>
                  <p className="text-xs text-muted-foreground">Upload malware samples, detonate suspicious URLs, and retrieve forensic verdict context</p>
                </div>
              </div>

              <a
                href="/dashboard/integrations"
                className="inline-flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg border border-[#1a1a1a] bg-[#101214] text-slate-200 hover:text-white hover:border-[#2a2a2a] transition-colors"
              >
                Configure API Key
                <ChevronRight className="w-3.5 h-3.5 text-sky-300" />
              </a>
            </div>

            <div className="border-t border-[#1a1a1a] pt-5">
              <FilescanScannerPanel />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-6 space-y-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-300" />
                Recommended Workflow
              </h2>
              <ol className="space-y-3 pt-4 border-t border-[#1a1a1a]">
                <li className="flex gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex-shrink-0">1</span>
                  <span className="text-sm text-muted-foreground">Start with a file upload for executable or document samples and enable advanced options for deeper enrichment.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex-shrink-0">2</span>
                  <span className="text-sm text-muted-foreground">Use the Flow ID lookup tab when detonation exceeds timeout windows to resume tracking without restarting analysis.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex-shrink-0">3</span>
                  <span className="text-sm text-muted-foreground">Correlate verdict confidence, similarity intelligence, and extracted artifacts before escalation or containment decisions.</span>
                </li>
              </ol>
            </div>

            <div className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-6 space-y-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-violet-300" />
                Analysis Coverage
              </h2>
              <div className="space-y-3 pt-4 border-t border-[#1a1a1a]">
                <div className="flex justify-between items-start gap-4">
                  <span className="text-sm text-muted-foreground">Dynamic Execution</span>
                  <span className="text-sm font-medium text-white">Sandbox behavior traces</span>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <span className="text-sm text-muted-foreground">Artifact Enrichment</span>
                  <span className="text-sm font-medium text-white">YARA, OCR, certs, WHOIS</span>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <span className="text-sm text-muted-foreground">Threat Correlation</span>
                  <span className="text-sm font-medium text-white">Similarity graph + tags</span>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <span className="text-sm text-muted-foreground">Analyst Output</span>
                  <span className="text-sm font-medium text-white">Actionable verdict + report links</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="rounded-lg border border-primary/25 bg-gradient-to-r from-primary/10 to-transparent p-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-primary" />
              Analyst Tip
            </h3>
            <p className="text-sm text-muted-foreground">
              Prioritize cases where verdict is malicious or likely malicious with medium-high confidence and strong similarity overlap. Those combinations are the most reliable signal for active threat families.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

function FilescanScannerPanel() {
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
    <div className="space-y-6">

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#1a1a1a]">
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-3 font-medium rounded-t-lg transition-colors flex items-center gap-2 ${
            activeTab === 'upload'
              ? 'bg-cyan-500/10 text-cyan-300 border-b-2 border-cyan-500'
              : 'text-[#9f9f9f] hover:text-white hover:bg-[#131313]'
          }`}
        >
          <Upload className="w-4 h-4" />
          File Upload
        </button>
        <button
          onClick={() => setActiveTab('url')}
          className={`px-4 py-3 font-medium rounded-t-lg transition-colors flex items-center gap-2 ${
            activeTab === 'url'
              ? 'bg-cyan-500/10 text-cyan-300 border-b-2 border-cyan-500'
              : 'text-[#9f9f9f] hover:text-white hover:bg-[#131313]'
          }`}
        >
          <Globe className="w-4 h-4" />
          URL Scan
        </button>
        <button
          onClick={() => setActiveTab('results')}
          className={`px-4 py-3 font-medium rounded-t-lg transition-colors flex items-center gap-2 ${
            activeTab === 'results'
              ? 'bg-cyan-500/10 text-cyan-300 border-b-2 border-cyan-500'
              : 'text-[#9f9f9f] hover:text-white hover:bg-[#131313]'
          }`}
        >
          <FileText className="w-4 h-4" />
          Results {results.length > 0 && `(${results.length})`}
        </button>
        <button
          onClick={() => setActiveTab('lookup')}
          className={`px-4 py-3 font-medium rounded-t-lg transition-colors flex items-center gap-2 ${
            activeTab === 'lookup'
              ? 'bg-cyan-500/10 text-cyan-300 border-b-2 border-cyan-500'
              : 'text-[#9f9f9f] hover:text-white hover:bg-[#131313]'
          }`}
        >
          <Search className="w-4 h-4" />
          Lookup Flow ID
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-[#0d0d0d] rounded-xl border border-[#1a1a1a] p-4 md:p-6">
        {/* File Upload Tab */}
        {activeTab === 'upload' && (
          <div className="space-y-6">
            {/* Drag & Drop Area */}
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragActive
                  ? 'border-blue-500 bg-blue-500/10 scale-[1.02]'
                  : 'border-[#1f1f1f] hover:border-cyan-500/50 hover:bg-[#111111]'
              }`}
            >
              <input {...getInputProps()} />
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 rounded-full mb-4">
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
              <div className="bg-[#101010] rounded-lg p-4 border border-[#1a1a1a]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#080808] rounded-lg border border-[#1a1a1a]">
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
                <label className="block text-sm font-medium text-[#cfcfcf] mb-2">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe this file..."
                  className="w-full px-3 py-2 border border-[#252525] rounded-lg bg-[#090909] text-[#f3f3f3] placeholder:text-[#6f6f6f] focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50"
                />
              </div>
            </div>

            {/* Advanced Options */}
            <div className="border-t border-border pt-6">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center justify-between w-full p-3 bg-[#101010] border border-[#1a1a1a] rounded-lg hover:bg-[#141414] transition-colors"
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
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 bg-[#0b0b0b] border border-[#1a1a1a] p-4 rounded-lg">
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
                        className="rounded border-[#3a3a3a] bg-[#121212] text-cyan-500 focus:ring-cyan-500/40 cursor-pointer"
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
                className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-500 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl"
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
              <label className="block text-sm font-medium text-[#cfcfcf] mb-2">
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
                      className="w-full pl-10 pr-4 py-3 bg-[#090909] text-[#f3f3f3] border border-[#252525] rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50"
                    />
                  </div>
                </div>
                <button
                  onClick={handleScanUrl}
                  disabled={scanning || !urlInput}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-500 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
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
                <label className="block text-sm font-medium text-[#cfcfcf] mb-2">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe this URL..."
                  className="w-full px-3 py-2 border border-[#252525] rounded-lg bg-[#090909] text-[#f3f3f3] placeholder:text-[#6f6f6f] focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50"
                />
              </div>
            </div>
          </div>
        )}

        {/* Lookup Flow ID Tab */}
        {activeTab === 'lookup' && (
          <div className="space-y-6">
            <div className="bg-cyan-500/10 border border-cyan-900/50 rounded-xl p-6">
              <div className="flex items-start gap-3 mb-4">
                <Info className="w-5 h-5 text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-400 mb-2">Check Flow ID Status</h3>
                  <p className="text-sm text-[#b8c8cf]">
                    If your scan timed out or you want to check the status of a previous scan, 
                    enter the Flow ID below. The system will poll the scan until it completes.
                  </p>
                  {currentFlowId && (
                    <p className="text-sm text-[#8ca0a7] mt-2">
                      Current Flow ID: <code className="px-2 py-1 bg-black/30 rounded text-blue-300">{currentFlowId}</code>
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#cfcfcf] mb-2">
                  Flow ID
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={flowIdInput}
                    onChange={(e) => setFlowIdInput(e.target.value)}
                    placeholder="Enter Flow ID (e.g., 69ad650197feb4afd674b0cb)"
                    className="flex-1 px-3 py-2 border border-[#252525] rounded-lg bg-[#090909] text-[#f3f3f3] focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 font-mono text-sm"
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
                    className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-[#3a3a3a] disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
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
              <div className="bg-cyan-500/10 border border-cyan-900/50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-cyan-200">Analysis in Progress</p>
                      <p className="text-sm text-cyan-300 font-mono">
                        {currentFlowId.substring(0, 8)}...
                      </p>
                    </div>
                    <div className="w-full bg-[#1b2b30] rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${pollingProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-cyan-300 mt-1">
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
                  <ResultCard key={index} result={result} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 rounded-full mb-4">
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
                  className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-500 hover:to-blue-500 transition-colors"
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
              <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-red-300 mb-1">Error</p>
                <p className="text-sm text-red-200">{error}</p>
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
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-emerald-300 mb-1">Success</p>
                <p className="text-sm text-emerald-200">{success}</p>
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
    </div>
  );
}

// Updated ResultCard Component with detailed report button
interface ResultCardProps {
  result: AnalysisResult;
}

function ResultCard({ result }: ResultCardProps) {
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
  const VerdictIcon =
    result.verdict.verdict === 'MALICIOUS'
      ? XCircle
      : result.verdict.verdict === 'SUSPICIOUS' || result.verdict.verdict === 'LIKELY_MALICIOUS'
        ? AlertTriangle
        : CheckCircle;
  const similarityItems = Array.isArray(result.similaritySearchResults)
    ? result.similaritySearchResults.slice(0, 6)
    : [];
  const emulationFiles = Array.isArray(result.peEmulationFileMetadata)
    ? result.peEmulationFileMetadata
    : [];

  return (
    <div className={`border rounded-xl overflow-hidden bg-[#0b0b0b] transition-all duration-300 ${
      result.verdict.verdict === 'MALICIOUS' ? 'border-red-800/50' :
      result.verdict.verdict === 'SUSPICIOUS' ? 'border-yellow-800/50' :
      result.verdict.verdict === 'LIKELY_MALICIOUS' ? 'border-orange-800/50' :
      'border-[#1a1a1a]'
    }`}>
      {/* Header */}
      <div 
        className="p-4 cursor-pointer hover:bg-[#131313] transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`p-2 rounded-lg ${verdictInfo.bgColor}`}>
              <div className={verdictInfo.color}>
                    <VerdictIcon className="w-4 h-4" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${verdictInfo.bgColor} ${verdictInfo.color}`}>
                  {verdictInfo.label}
                </span>
                <span className={`px-2 py-1 rounded text-xs ${threatLevelInfo.color} bg-[#141414] border border-[#1f1f1f]`}>
                  Threat: {threatLevelInfo.label}
                </span>
                <span className={`px-2 py-1 rounded text-xs ${confidenceColor} bg-[#141414] border border-[#1f1f1f]`}>
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
                    <span className="text-xs px-1.5 py-0.5 bg-[#151515] border border-[#1f1f1f] rounded">
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
                className="p-1.5 text-[#8f8f8f] hover:text-white transition-colors rounded hover:bg-[#171717]"
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
                className="p-1.5 text-[#8f8f8f] hover:text-white transition-colors rounded hover:bg-[#171717]"
                title="View on Filescan.io"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <button
              className="p-1.5 text-[#8f8f8f] hover:text-white transition-colors rounded hover:bg-[#171717]"
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
        <div className="border-t border-[#1a1a1a] bg-[#101010] p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* File Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
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
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <Target className="w-4 h-4" />
                Threat Assessment
              </h4>
              <div className="space-y-3">
                <div className="p-3 bg-[#0c0c0c] rounded-lg border border-[#1f1f1f]">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${verdictInfo.bgColor}`}>
                      <div className={verdictInfo.color}>
                        <VerdictIcon className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Verdict</p>
                      <p className={`font-bold ${verdictInfo.color}`}>{verdictInfo.label}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-[#0c0c0c] rounded-lg border border-[#1f1f1f]">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${threatLevelInfo.color} bg-[#151515] border border-[#1f1f1f]`}>
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
                
                <div className="p-3 bg-[#0c0c0c] rounded-lg border border-[#1f1f1f]">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${confidenceColor} bg-[#151515] border border-[#1f1f1f]`}>
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
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Actions
              </h4>
              <div className="space-y-2">
                <a
                  href={result.report_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-500 hover:to-blue-500 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Full Report
                </a>
                
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
                    className="flex items-center justify-center gap-2 p-3 bg-[#151515] border border-[#1f1f1f] text-[#cfcfcf] rounded-lg hover:bg-[#1a1a1a] transition-colors"
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
                    <p className="text-sm text-[#d6d6d6] whitespace-pre-line">
                      {result.chatGptSummary.data || 'No AI summary content available.'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Generated: {result.chatGptSummary.created_date ? formatDate(result.chatGptSummary.created_date) : 'N/A'}
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-4">
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Analysis Snapshot
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-2 rounded bg-muted/20 border border-border text-xs">
                    <span className="text-muted-foreground">Overall State:</span>{' '}
                    <span className="text-foreground font-medium">{result.overallState || result.state || 'unknown'}</span>
                  </div>
                  <div className="p-2 rounded bg-muted/20 border border-border text-xs">
                    <span className="text-muted-foreground">Queue Position:</span>{' '}
                    <span className="text-foreground font-medium">{result.positionInQueue ?? 0}</span>
                  </div>
                  <div className="p-2 rounded bg-muted/20 border border-border text-xs">
                    <span className="text-muted-foreground">Engine:</span>{' '}
                    <span className="text-foreground font-medium">{result.scanEngine || 'internal'}</span>
                  </div>
                  <div className="p-2 rounded bg-muted/20 border border-border text-xs">
                    <span className="text-muted-foreground">Estimated Time:</span>{' '}
                    <span className="text-foreground font-medium">{result.estimatedTime || 'n/a'} sec</span>
                  </div>
                  <div className="p-2 rounded bg-muted/20 border border-border text-xs">
                    <span className="text-muted-foreground">All Steps Done:</span>{' '}
                    <span className="text-foreground font-medium">{result.allScanStepsDone ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="p-2 rounded bg-muted/20 border border-border text-xs">
                    <span className="text-muted-foreground">Files Downloaded:</span>{' '}
                    <span className="text-foreground font-medium">{result.filesDownloadFinished ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {similarityItems.length > 0 && (
            <div className="mt-6 pt-6 border-t border-[#1a1a1a]">
              <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Similarity Intelligence ({similarityItems.length})
              </h4>
              <div className="space-y-2">
                {similarityItems.map((item) => (
                  <div key={item.sha256} className="p-3 rounded-lg border border-border bg-background/40">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="text-xs font-mono text-muted-foreground break-all">
                        {item.sha256}
                      </div>
                      <div className={`text-sm font-semibold ${getSimilarityColor(item.overall_similarity)}`}>
                        {formatSimilarity(item.overall_similarity)} match
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <div className="p-2 rounded bg-muted/20 border border-border">
                        <span className="text-muted-foreground">Verdict:</span>{' '}
                        <span className="text-foreground font-medium">{item.details?.verdict || 'unknown'}</span>
                      </div>
                      <div className="p-2 rounded bg-muted/20 border border-border">
                        <span className="text-muted-foreground">Size:</span>{' '}
                        <span className="text-foreground font-medium">{item.details?.file_size ? formatFileSize(item.details.file_size) : 'n/a'}</span>
                      </div>
                      <div className="p-2 rounded bg-muted/20 border border-border">
                        <span className="text-muted-foreground">Architecture:</span>{' '}
                        <span className="text-foreground font-medium">{item.details?.architecture || 'n/a'}</span>
                      </div>
                      <div className="p-2 rounded bg-muted/20 border border-border">
                        <span className="text-muted-foreground">Seen:</span>{' '}
                        <span className="text-foreground font-medium">{item.details?.start_date ? formatDate(item.details.start_date) : 'n/a'}</span>
                      </div>
                    </div>
                    {Array.isArray(item.details?.tags) && item.details.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {item.details.tags.slice(0, 8).map((tag) => (
                          <span key={`${item.sha256}-${tag}`} className="px-2 py-0.5 rounded text-xs border border-[#1a1a1a] bg-black/20 text-muted-foreground">
                            {tag}
                          </span>
                        ))}
                        {item.details.tags.length > 8 && (
                          <span className="px-2 py-0.5 rounded text-xs border border-[#1a1a1a] bg-black/20 text-muted-foreground">
                            +{item.details.tags.length - 8}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {emulationFiles.length > 0 && (
            <div className="mt-6 pt-6 border-t border-[#1a1a1a]">
              <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Database className="w-4 h-4" />
                Emulation Metadata Files ({emulationFiles.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {emulationFiles.map((meta) => (
                  <div key={meta.name} className="p-3 rounded-lg border border-border bg-background/40">
                    <p className="text-sm font-medium text-foreground">{meta.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{meta.description || 'No description'}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>Size: {typeof meta.size === 'number' ? formatFileSize(meta.size) : 'n/a'}</span>
                      <span>Lines: {meta.line_count ?? 'n/a'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.latestReport && (
            <div className="mt-6 pt-6 border-t border-[#1a1a1a]">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Latest Report Reference
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <InfoField label="Report ID" value={result.latestReport.id || 'N/A'} copyable={!!result.latestReport.id} />
                <InfoField label="Flow ID" value={result.latestReport.flowId || result.flowId || 'N/A'} copyable={!!(result.latestReport.flowId || result.flowId)} />
              </div>
            </div>
          )}

          {/* Extracted Files */}
          {result.extractedFiles && result.extractedFiles.length > 0 && (
            <div className="mt-6 pt-6 border-t border-[#1a1a1a]">
              <h4 className="font-semibold text-foreground mb-4">
                Extracted Files ({result.extractedFiles.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {result.extractedFiles.slice(0, 6).map((file: { name?: string; size?: number; mediaType?: string; hash?: string }, idx: number) => (
                  <div key={idx} className="p-3 bg-[#0c0c0c] rounded-lg border border-[#1f1f1f]">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#151515] rounded-lg border border-[#1f1f1f]">
                        <File className="w-4 h-4 text-[#8f8f8f]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {file.name || `File_${idx + 1}`}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{typeof file.size === 'number' ? formatFileSize(file.size) : 'N/A'}</span>
                          <span>•</span>
                          <span className="truncate">{file.mediaType}</span>
                        </div>
                        <p className="text-xs font-mono text-muted-foreground truncate mt-1">
                          {file.hash ? truncateHash(file.hash, 10) : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {result.extractedFiles.length > 6 && (
                  <div className="p-3 bg-muted/20 rounded-lg border border-border text-center">
                    <p className="text-sm text-[#9a9a9a]">
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