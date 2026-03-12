'use client';

import { useState, useCallback } from 'react';
import type { VTScanRequest, VTAnalysisResult } from '@/lib/types/virustotal.types';
import { virusTotalApi } from '@/services/api/threat-intel/virusTotal.api';

export function useVirusTotal() {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<VTAnalysisResult[]>([]);

  const scanIndicator = useCallback(async (request: VTScanRequest) => {
    setScanning(true);
    setError(null);
    
    try {
      console.log(`[useVirusTotal] Scanning indicator: ${request.indicator}`);
      const result = await virusTotalApi.scan(request);
      
      // Add to current session results
      setResults(prev => {
        const newResults = [result, ...prev.filter(r => r.ioc !== request.indicator)];
        return newResults.slice(0, 10); // Keep last 10 in session
      });
      
      console.log(`[useVirusTotal] Scan completed for ${request.indicator}`);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error(`[useVirusTotal] Scan failed:`, err);
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
        console.log(`[useVirusTotal] Scanning ${request.indicator}...`);
        const result = await virusTotalApi.scan(request);
        results.push(result);
        
        console.log(`[useVirusTotal] Completed scan for ${request.indicator}`);
      } catch (err) {
        console.error(`[useVirusTotal] Failed to scan ${request.indicator}:`, err);
        // Continue with next indicator
      }
    }
    
    // Add all results to current session
    setResults(prev => [...results, ...prev]);
    
    setScanning(false);
    console.log(`[useVirusTotal] Completed batch scan of ${requests.length} indicators`);
    
    return results;
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
    console.log('[useVirusTotal] Session results cleared');
  }, []);

  return {
    scanning,
    error,
    results,
    scanIndicator,
    scanMultiple,
    clearResults,
  };
}