// hooks/useFilescan.ts
'use client';

import { useState } from 'react';
import { fileScanApi } from '@/services/api/threat-intel/fileScan.api';
import type { 
  AnalysisResult, 
  FileScanUploadResponse,
  FileScanOptions 
} from '@/lib/types/filescan.types';

export function useFilescan() {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [currentFlowId, setCurrentFlowId] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const [pollingProgress, setPollingProgress] = useState(0);

  /**
   * Poll for scan completion, with progress updates
   */
  const pollUntilComplete = async (flowId: string): Promise<AnalysisResult> => {
    const maxAttempts = 60; // 5 minutes max (5s intervals)
    const pollInterval = 5000;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const progress = Math.min(95, (attempt / maxAttempts) * 100);
      setPollingProgress(progress);
      
      const status = await fileScanApi.getStatus(flowId);
      console.log(`[useFilescan] Poll attempt ${attempt + 1}/${maxAttempts}: state=${status.state}, allFinished=${status.allFinished}`);
      
      // BOTH state and allFinished must be true for completion
      if (status.state === 'finished' && status.allFinished === true) {
        setPollingProgress(100);
        console.log('[useFilescan] Scan complete, fetching full analysis...');
        return await fileScanApi.getFullAnalysis(flowId);
      }
      
      if (status.state === 'failed') {
        throw new Error('Scan failed');
      }
      
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
    
    throw new Error('Polling timeout - scan did not complete');
  };

  const uploadFile = async (
    file: File,
    options?: Partial<FileScanOptions>
  ): Promise<FileScanUploadResponse> => {
    setScanning(true);
    setError(null);
    setSuccess(null);
    setCurrentFlowId(null);
    setPollingProgress(0);

    try {
      console.log('[useFilescan] Starting file upload...');
      const response = await fileScanApi.uploadFile(file, options);

      setSuccess(`File uploaded successfully! Flow ID: ${response.flow_id}`);
      setCurrentFlowId(response.flow_id);
      setPolling(true);

      try {
        const result = await pollUntilComplete(response.flow_id);
        setResults(prev => [result, ...prev]);
        console.log('[useFilescan] Analysis complete');
      } finally {
        setPolling(false);
      }

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload file';
      console.error('[useFilescan] Upload failed:', err);
      setError(errorMessage);
      setPolling(false);
      setPollingProgress(0);
      throw err;
    } finally {
      setScanning(false);
    }
  };

  const scanUrl = async (
    url: string,
    options?: FileScanOptions
  ): Promise<FileScanUploadResponse> => {
    setScanning(true);
    setError(null);
    setSuccess(null);
    setCurrentFlowId(null);
    setPollingProgress(0);

    try {
      console.log('[useFilescan] Starting URL scan...');
      const response = await fileScanApi.scanUrl({
        url,
        description: options?.description,
        osint: options?.osint,
        extended_osint: options?.extended_osint,
        url_analysis: options?.url_analysis,
        resolve_domains: options?.resolve_domains,
        whois: options?.whois
      });

      setSuccess(`URL scan started! Flow ID: ${response.flow_id}`);
      setCurrentFlowId(response.flow_id);
      setPolling(true);

      try {
        const result = await pollUntilComplete(response.flow_id);
        setResults(prev => [result, ...prev]);
        console.log('[useFilescan] URL scan complete');
      } finally {
        setPolling(false);
      }

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to scan URL';
      console.error('[useFilescan] URL scan failed:', err);
      setError(errorMessage);
      setPolling(false);
      setPollingProgress(0);
      throw err;
    } finally {
      setScanning(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    setError(null);
    setSuccess(null);
    setCurrentFlowId(null);
    setPolling(false);
    setPollingProgress(0);
    console.log('[useFilescan] Session results cleared');
  };

  const checkFlowId = async (flowId: string): Promise<void> => {
    setScanning(true);
    setError(null);
    setSuccess(null);
    setCurrentFlowId(flowId);
    setPolling(true);
    setPollingProgress(0);

    try {
      console.log(`[useFilescan] Checking flow ID: ${flowId}`);
      const result = await pollUntilComplete(flowId);
      setResults(prev => [result, ...prev]);
      setSuccess(`Analysis retrieved successfully for Flow ID: ${flowId}`);
      console.log('[useFilescan] Flow ID check complete');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to retrieve scan results';
      console.error('[useFilescan] Flow ID check failed:', err);
      setError(errorMessage);
      throw err;
    } finally {
      setScanning(false);
      setPolling(false);
    }
  };

  const getResultStats = () => {
    const stats = {
      total: results.length,
      malicious: results.filter(r => r.verdict?.verdict === 'MALICIOUS').length,
      suspicious: results.filter(r => r.verdict?.verdict === 'SUSPICIOUS').length,
      likelyMalicious: results.filter(r => r.verdict?.verdict === 'LIKELY_MALICIOUS').length,
      benign: results.filter(r => r.verdict?.verdict === 'BENIGN' || r.verdict?.verdict === 'NO_THREAT').length,
      informational: results.filter(r => r.verdict?.verdict === 'INFORMATIONAL').length,
      unknown: results.filter(r => r.verdict?.verdict === 'UNKNOWN').length,
    };

    return stats;
  };

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
    checkFlowId,
    clearResults,
    
    // Utilities
    hasResults: results.length > 0
  };
}