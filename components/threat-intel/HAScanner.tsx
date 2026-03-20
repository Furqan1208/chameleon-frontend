'use client';

import { useEffect, useRef, useState } from 'react';
import { HAResults } from './HAResults';
import { HATopThreats } from './HATopThreats';
import { useHybridAnalysis } from '@/hooks/useHybridAnalysis';
import {
  AlertTriangle,
  CheckCircle,
  Cpu,
  FileCheck,
  FileUp,
  Hash,
  Info,
  Loader2,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  Upload,
  X,
  Flame,
} from 'lucide-react';
import { calculateFileHash, validateHash } from '@/lib/utils/hybrid-analysis.utils';

export function HAScanner() {
  const {
    scanning,
    error,
    results,
    threatFeed,
    feedLoading,
    scanIndicator,
    clearResults,
    loadThreatFeed,
  } = useHybridAnalysis();

  const [activeTab, setActiveTab] = useState<'scanner' | 'threats'>('scanner');
  const [hashInput, setHashInput] = useState('');
  const [selectedHash, setSelectedHash] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [calculatingHash, setCalculatingHash] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeTab === 'threats' && threatFeed.length === 0) {
      loadThreatFeed();
    }
  }, [activeTab, threatFeed.length, loadThreatFeed]);

  const handleHashScan = async (hash: string) => {
    try {
      setUploadError(null);
      setUploadSuccess(null);

      const validation = validateHash(hash.trim());
      if (!validation.isValid) {
        setUploadError('Invalid hash format. Enter a valid MD5, SHA1, SHA256, or SHA512 hash.');
        return;
      }

      await scanIndicator({
        indicator: hash.trim(),
        type: 'hash',
        include_metadata: true,
        include_summary: true,
      });

      setHashInput('');
      setUploadSuccess(`Analysis complete for ${validation.type}: ${hash.slice(0, 16)}...`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze hash';
      setUploadError(errorMessage);
    }
  };

  const handleFileUpload = async (files: File[]) => {
    setUploadedFiles((prev) => [...prev, ...files]);
    setUploadError(null);
    setUploadSuccess(null);

    for (const file of files) {
      setCalculatingHash(true);
      try {
        const hash = await calculateFileHash(file, 'sha256');

        if (!hash) {
          setUploadError(`Failed to calculate hash for ${file.name}`);
          continue;
        }

        setUploadSuccess(`Calculated SHA256 for ${file.name}. Querying Hybrid Analysis...`);
        await scanIndicator({
          indicator: hash,
          type: 'hash',
          include_metadata: true,
          include_summary: true,
        });

        setUploadSuccess(`Analysis complete for ${file.name}`);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to process file';
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
    const testHashes = {
      malicious: '275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f',
      benign: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    };

    await handleHashScan(testHashes[type]);
  };

  const removeUploadedFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearUploads = () => {
    setUploadedFiles([]);
    setUploadError(null);
    setUploadSuccess(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary mb-1">Hybrid Analysis Workspace</p>
          <h3 className="text-xl font-semibold text-white">Scanner & Threat Feed</h3>
          <p className="text-sm text-muted-foreground mt-1">Upload files or submit hashes to retrieve sandbox verdicts and behavioral context.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (confirm('Clear all scan results and local upload history?')) {
                clearResults();
                clearUploads();
                setSelectedHash(null);
              }
            }}
            disabled={results.length === 0 && uploadedFiles.length === 0}
            className="px-3 py-2 rounded-lg border border-[#1a1a1a] bg-black/20 text-muted-foreground hover:text-white hover:border-[#2a2a2a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('scanner')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'scanner'
                ? 'bg-primary text-black'
                : 'bg-black/20 border border-[#1a1a1a] text-muted-foreground hover:text-white'
            }`}
          >
            <Search className="w-4 h-4" />
            Scanner
            <span className={`text-[11px] px-1.5 py-0.5 rounded ${activeTab === 'scanner' ? 'bg-black/20' : 'bg-primary/10 text-primary'}`}>
              {results.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('threats')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'threats'
                ? 'bg-primary text-black'
                : 'bg-black/20 border border-[#1a1a1a] text-muted-foreground hover:text-white'
            }`}
          >
            <Flame className="w-4 h-4" />
            Latest Threats
            <span className={`text-[11px] px-1.5 py-0.5 rounded ${activeTab === 'threats' ? 'bg-black/20' : 'bg-destructive/10 text-destructive'}`}>
              {threatFeed.filter((t) => t.verdict === 60).length}
            </span>
          </button>

          <button
            onClick={() => loadThreatFeed()}
            disabled={feedLoading}
            className="ml-auto px-3 py-2 rounded-lg border border-[#1a1a1a] bg-black/20 text-muted-foreground hover:text-white hover:border-[#2a2a2a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${feedLoading ? 'animate-spin' : ''}`} />
            Refresh Feed
          </button>
        </div>
      </div>

      {activeTab === 'scanner' && (
        <div className="space-y-6">
          <div
            className={`rounded-xl border-2 border-dashed p-8 transition-colors cursor-pointer ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-[#2a2a2a] bg-[#0d0d0d] hover:border-primary/40'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 border border-primary/25 mb-4">
                <Upload className="w-7 h-7 text-primary" />
              </div>
              <h4 className="text-white font-semibold">Upload Files for Sandbox Lookup</h4>
              <p className="text-sm text-muted-foreground max-w-xl mt-2 mb-5">
                Drop files here or click to browse. The scanner computes SHA256 locally and queries Hybrid Analysis automatically.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                multiple
                className="hidden"
              />

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="px-5 py-2.5 rounded-lg bg-primary text-black font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <FileUp className="w-4 h-4" />
                Choose Files
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-primary" />
                <h4 className="font-semibold text-white">Manual Hash Lookup</h4>
              </div>
              <p className="text-xs text-muted-foreground">Paste MD5/SHA1/SHA256/SHA512 to run immediate sandbox intelligence lookup.</p>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={hashInput}
                  onChange={(e) => setHashInput(e.target.value)}
                  placeholder="e.g. 275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f"
                  className="w-full px-3 py-2.5 rounded-lg border border-[#1a1a1a] bg-black/20 text-white placeholder:text-muted-foreground/70 focus:outline-none focus:border-primary/40 font-mono text-sm"
                />
                <button
                  onClick={() => handleHashScan(hashInput)}
                  disabled={scanning || !hashInput.trim()}
                  className="px-5 py-2.5 rounded-lg bg-primary text-black font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Analyze
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={() => handleQuickTest('malicious')}
                  disabled={scanning}
                  className="px-3 py-1.5 rounded-lg text-xs border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/15 transition-colors disabled:opacity-50"
                >
                  Test Malicious Sample
                </button>
                <button
                  onClick={() => handleQuickTest('benign')}
                  disabled={scanning}
                  className="px-3 py-1.5 rounded-lg text-xs border border-primary/30 bg-primary/10 text-primary hover:bg-primary/15 transition-colors disabled:opacity-50"
                >
                  Test Clean Sample
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-5">
              <h4 className="font-semibold text-white mb-3">Scanner Status</h4>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Scans queued</span>
                  <span className="text-white font-medium">{uploadedFiles.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Results available</span>
                  <span className="text-white font-medium">{results.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Engine state</span>
                  <span className={`font-medium ${scanning || calculatingHash ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {scanning || calculatingHash ? 'Processing' : 'Ready'}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[#1a1a1a]">
                <p className="text-xs text-muted-foreground">Supported input</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {['MD5', 'SHA1', 'SHA256', 'SHA512', 'URL reports'].map((item) => (
                    <span key={item} className="px-2 py-1 rounded-full text-[11px] border border-[#1a1a1a] bg-black/20 text-muted-foreground">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {calculatingHash && (
            <div className="rounded-lg border border-blue-500/25 bg-blue-500/10 p-3 flex items-center gap-2 text-blue-300 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Calculating hash and preparing sandbox query...
            </div>
          )}

          {uploadSuccess && (
            <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 p-3 flex items-center gap-2 text-emerald-300 text-sm">
              <CheckCircle className="w-4 h-4" />
              {uploadSuccess}
            </div>
          )}

          {uploadError && (
            <div className="rounded-lg border border-destructive/25 bg-destructive/10 p-3 flex items-center gap-2 text-destructive text-sm">
              <AlertTriangle className="w-4 h-4" />
              {uploadError}
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-destructive/25 bg-destructive/10 p-3 flex items-center gap-2 text-destructive text-sm">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}

          {uploadedFiles.length > 0 && (
            <div className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-white">Uploaded Files ({uploadedFiles.length})</h4>
                <button
                  onClick={clearUploads}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-[#1a1a1a] bg-black/20 text-muted-foreground hover:text-white transition-colors flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear uploads
                </button>
              </div>

              <div className="space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="flex items-center justify-between rounded-lg border border-[#1a1a1a] bg-black/20 p-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileCheck className="w-4 h-4 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm text-white truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeUploadedFile(index)}
                      className="text-muted-foreground hover:text-destructive p-1.5 rounded transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.length > 0 ? (
            <HAResults results={results} selectedHash={selectedHash} onSelectHash={setSelectedHash} />
          ) : !scanning && !calculatingHash ? (
            <div className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-8 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 border border-primary/25 mb-4">
                <Cpu className="w-7 h-7 text-primary" />
              </div>
              <h4 className="text-white font-semibold">No Scan Results Yet</h4>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mt-2">
                Start with file upload or hash lookup to build your Hybrid Analysis evidence panel.
              </p>
            </div>
          ) : null}
        </div>
      )}

      {activeTab === 'threats' && (
        <HATopThreats threats={threatFeed} loading={feedLoading} onRefresh={loadThreatFeed} />
      )}

      <div className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-5">
        <h4 className="text-white font-semibold flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-primary" />
          Scanner Workflow
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="rounded-lg border border-[#1a1a1a] bg-black/20 p-3">
            <p className="text-white font-medium mb-1">1. Submit</p>
            <p className="text-muted-foreground text-xs">Upload files or paste hashes for immediate sandbox lookup.</p>
          </div>
          <div className="rounded-lg border border-[#1a1a1a] bg-black/20 p-3">
            <p className="text-white font-medium mb-1">2. Triage</p>
            <p className="text-muted-foreground text-xs">Review verdict, threat score, signatures, and MITRE techniques.</p>
          </div>
          <div className="rounded-lg border border-[#1a1a1a] bg-black/20 p-3">
            <p className="text-white font-medium mb-1">3. Investigate</p>
            <p className="text-muted-foreground text-xs">Open environment reports for detailed behavioral and network telemetry.</p>
          </div>
        </div>
        <div className="mt-4 rounded-lg border border-primary/25 bg-primary/5 p-3 flex items-start gap-2 text-xs text-muted-foreground">
          <Shield className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          Ensure your Hybrid Analysis key is configured in Integrations for consistent feed and report lookups.
        </div>
      </div>
    </div>
  );
}
