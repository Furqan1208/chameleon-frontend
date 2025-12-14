// hooks/useVirusTotal.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { VTScanRequest, VTAnalysisResult, VTScanHistory } from '@/lib/threat-intel/vt-types';
import { virusTotalService } from '@/lib/threat-intel/virustotal-service';
import { vtDatabase } from '@/lib/threat-intel/vt-cache';

export function useVirusTotal() {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<VTAnalysisResult[]>([]);
  const [history, setHistory] = useState<VTScanHistory[]>([]);
  const [rateLimit, setRateLimit] = useState(virusTotalService.getRateLimitInfo());

  // Load scan history
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const scans = await virusTotalService.getScanHistory();
      setHistory(scans);
    } catch (err) {
      console.error('Failed to load scan history:', err);
    }
  };

  const scanIndicator = useCallback(async (request: VTScanRequest) => {
    setScanning(true);
    setError(null);
    
    try {
      const result = await virusTotalService.scanIndicator(request);
      setResults(prev => [result, ...prev]);
      
      // Update history
      await loadHistory();
      
      // Update rate limit info
      setRateLimit(virusTotalService.getRateLimitInfo());
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setScanning(false);
    }
  }, []);

  const scanMultiple = useCallback(async (requests: VTScanRequest[]) => {
    setScanning(true);
    setError(null);
    
    const results: VTAnalysisResult[] = [];
    
    for (const request of requests) {
      try {
        const result = await virusTotalService.scanIndicator(request);
        results.push(result);
        
        // Update rate limit after each request
        setRateLimit(virusTotalService.getRateLimitInfo());
        
        // Small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 15000)); // 15 seconds between requests
      } catch (err) {
        console.error(`Failed to scan ${request.indicator}:`, err);
        // Continue with next indicator
      }
    }
    
    setResults(prev => [...results, ...prev]);
    await loadHistory();
    setScanning(false);
    
    return results;
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  const deleteFromHistory = useCallback(async (id: string) => {
    try {
      await vtDatabase.deleteScan(id);
      await loadHistory();
    } catch (err) {
      console.error('Failed to delete from history:', err);
    }
  }, []);

  const clearCache = useCallback(async () => {
    try {
      await virusTotalService.clearCache();
      setRateLimit(virusTotalService.getRateLimitInfo());
    } catch (err) {
      console.error('Failed to clear cache:', err);
    }
  }, []);

  return {
    scanning,
    error,
    results,
    history,
    rateLimit,
    scanIndicator,
    scanMultiple,
    clearResults,
    deleteFromHistory,
    clearCache,
    loadHistory
  };
}