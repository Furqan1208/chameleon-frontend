'use client';

import { useState, useCallback } from 'react';
import { filescanService } from '@/lib/threat-intel/filescan-service';
import type { 
  AnalysisResult, 
  FileScanUploadResponse,
  FileScanOptions 
} from '@/lib/threat-intel/filescan-types';

export function useFilescan() {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [currentFlowId, setCurrentFlowId] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const [pollingProgress, setPollingProgress] = useState(0);

  const uploadFile = useCallback(async (
    file: File,
    options?: Partial<FileScanOptions>,
    description?: string,
    tags?: string[],
    propagateTags?: boolean
  ): Promise<FileScanUploadResponse> => {
    setScanning(true);
    setError(null);
    setSuccess(null);
    setCurrentFlowId(null);
    setPollingProgress(0);

    try {
      console.log('[useFilescan] Starting file upload...');
      const response = await filescanService.uploadFile(
        file,
        options,
        description,
        tags,
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
        setPollingProgress(100);
      } finally {
        clearInterval(pollInterval);
        setPolling(false);
      }

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload file';
      setError(errorMessage);
      setPolling(false);
      setPollingProgress(0);
      throw err;
    } finally {
      setScanning(false);
    }
  }, []);

  const scanUrl = useCallback(async (
    url: string,
    options?: Partial<FileScanOptions>,
    description?: string,
    tags?: string[],
    propagateTags?: boolean
  ): Promise<FileScanUploadResponse> => {
    setScanning(true);
    setError(null);
    setSuccess(null);
    setCurrentFlowId(null);
    setPollingProgress(0);

    try {
      console.log('[useFilescan] Starting URL scan...');
      const response = await filescanService.scanUrl(
        url,
        options,
        description,
        tags,
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
        setPollingProgress(100);
      } finally {
        clearInterval(pollInterval);
        setPolling(false);
      }

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to scan URL';
      setError(errorMessage);
      setPolling(false);
      setPollingProgress(0);
      throw err;
    } finally {
      setScanning(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
    setSuccess(null);
    setCurrentFlowId(null);
    setPolling(false);
    setPollingProgress(0);
  }, []);

  const getResultStats = useCallback(() => {
    const stats = {
      total: results.length,
      malicious: results.filter(r => r.verdict.verdict === 'MALICIOUS').length,
      suspicious: results.filter(r => r.verdict.verdict === 'SUSPICIOUS').length,
      likelyMalicious: results.filter(r => r.verdict.verdict === 'LIKELY_MALICIOUS').length,
      benign: results.filter(r => r.verdict.verdict === 'BENIGN' || r.verdict.verdict === 'NO_THREAT').length,
      informational: results.filter(r => r.verdict.verdict === 'INFORMATIONAL').length,
      unknown: results.filter(r => r.verdict.verdict === 'UNKNOWN').length,
    };

    return stats;
  }, [results]);

  return {
    // State
    scanning,
    error,
    success,
    results,
    currentFlowId,
    polling,
    pollingProgress,
    
    // Stats
    stats: getResultStats(),
    
    // Actions
    uploadFile,
    scanUrl,
    clearResults,
    
    // Utilities
    hasResults: results.length > 0,
    isReady: typeof process !== 'undefined' && !!process.env.NEXT_PUBLIC_FILESCAN_API_KEY,
  };
}