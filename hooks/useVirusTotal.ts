// D:\FYP\Chameleon Frontend\hooks\useVirusTotal.ts - COMPLETE FIXED VERSION
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
  const [stats, setStats] = useState({
    totalScans: 0,
    maliciousCount: 0,
    suspiciousCount: 0,
    cleanCount: 0,
    avgThreatScore: 0,
    detectionRate: 0
  });

  // Load scan history and calculate stats
  const loadHistory = useCallback(async () => {
    try {
      console.log('[useVirusTotal] Loading history...');
      const scans = await virusTotalService.getScanHistory();
      console.log(`[useVirusTotal] Loaded ${scans.length} scans from history`);
      
      // Update history state
      setHistory(scans);
      
      // Calculate statistics from history
      if (scans.length > 0) {
        const historyResults = scans.map(s => s.result);
        
        // Calculate unique results (remove duplicates)
        const uniqueResults = historyResults.filter((result, index, self) =>
          index === self.findIndex(r => r.ioc === result.ioc)
        );
        
        const maliciousCount = uniqueResults.filter(r => r.threat_level === 'high').length;
        const suspiciousCount = uniqueResults.filter(r => r.threat_level === 'medium').length;
        const cleanCount = uniqueResults.filter(r => r.threat_level === 'clean').length;
        const totalScans = uniqueResults.length;
        const highRiskScans = maliciousCount + suspiciousCount;
        const avgThreatScore = uniqueResults.length > 0 
          ? uniqueResults.reduce((sum, r) => sum + r.threat_score, 0) / uniqueResults.length 
          : 0;
        const detectionRate = totalScans > 0 ? (highRiskScans / totalScans) * 100 : 0;
        
        console.log(`[useVirusTotal] Calculated stats:`, {
          totalScans,
          maliciousCount,
          suspiciousCount,
          detectionRate: `${detectionRate.toFixed(1)}%`
        });
        
        setStats({
          totalScans,
          maliciousCount,
          suspiciousCount,
          cleanCount,
          avgThreatScore,
          detectionRate
        });
      } else {
        // Reset stats if no history
        setStats({
          totalScans: 0,
          maliciousCount: 0,
          suspiciousCount: 0,
          cleanCount: 0,
          avgThreatScore: 0,
          detectionRate: 0
        });
      }
      
      return scans;
    } catch (err) {
      console.error('[useVirusTotal] Failed to load scan history:', err);
      return [];
    }
  }, []);

  // Load history on component mount
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const scanIndicator = useCallback(async (request: VTScanRequest) => {
    setScanning(true);
    setError(null);
    
    try {
      console.log(`[useVirusTotal] Scanning indicator: ${request.indicator}`);
      const result = await virusTotalService.scanIndicator(request);
      
      // Add to current session results
      setResults(prev => {
        const newResults = [result, ...prev.filter(r => r.ioc !== request.indicator)];
        return newResults.slice(0, 10); // Keep last 10 in session
      });
      
      // Update history and stats
      await loadHistory();
      
      // Update rate limit info
      setRateLimit(virusTotalService.getRateLimitInfo());
      
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
  }, [loadHistory]);

  const scanMultiple = useCallback(async (requests: VTScanRequest[]) => {
    setScanning(true);
    setError(null);
    
    const results: VTAnalysisResult[] = [];
    
    for (const request of requests) {
      try {
        console.log(`[useVirusTotal] Scanning ${request.indicator}...`);
        const result = await virusTotalService.scanIndicator(request);
        results.push(result);
        
        // Update rate limit after each request
        setRateLimit(virusTotalService.getRateLimitInfo());
        
        // Rate limit: 4 requests/minute = 15 seconds between requests
        await new Promise(resolve => setTimeout(resolve, 15000));
        
        console.log(`[useVirusTotal] Completed scan for ${request.indicator}`);
      } catch (err) {
        console.error(`[useVirusTotal] Failed to scan ${request.indicator}:`, err);
        // Continue with next indicator
      }
    }
    
    // Add all results to current session
    setResults(prev => [...results, ...prev]);
    
    // Update history and stats
    await loadHistory();
    
    setScanning(false);
    console.log(`[useVirusTotal] Completed batch scan of ${requests.length} indicators`);
    
    return results;
  }, [loadHistory]);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
    console.log('[useVirusTotal] Session results cleared');
  }, []);

  const deleteFromHistory = useCallback(async (id: string) => {
    try {
      await vtDatabase.deleteScan(id);
      console.log(`[useVirusTotal] Deleted scan ${id} from history`);
      await loadHistory(); // Reload history after deletion
    } catch (err) {
      console.error('[useVirusTotal] Failed to delete from history:', err);
    }
  }, [loadHistory]);

  const clearCache = useCallback(async () => {
    try {
      await virusTotalService.clearCache();
      setRateLimit(virusTotalService.getRateLimitInfo());
      console.log('[useVirusTotal] Cache cleared');
      await loadHistory(); // Reload after clearing cache
    } catch (err) {
      console.error('[useVirusTotal] Failed to clear cache:', err);
    }
  }, [loadHistory]);

  const clearHistory = useCallback(async () => {
    try {
      await vtDatabase.clearScans();
      setHistory([]);
      setResults([]); // Also clear session results
      setStats({
        totalScans: 0,
        maliciousCount: 0,
        suspiciousCount: 0,
        cleanCount: 0,
        avgThreatScore: 0,
        detectionRate: 0
      });
      console.log('[useVirusTotal] History cleared');
    } catch (err) {
      console.error('[useVirusTotal] Failed to clear history:', err);
    }
  }, []);

  const getCombinedResults = useCallback(() => {
    // Combine history and current session results, removing duplicates
    const allResults = [
      ...history.map(h => h.result),
      ...results
    ];
    
    return allResults.filter((result, index, self) =>
      index === self.findIndex(r => r.ioc === result.ioc)
    );
  }, [history, results]);

  return {
    scanning,
    error,
    results,
    history,
    stats,
    rateLimit,
    scanIndicator,
    scanMultiple,
    clearResults,
    deleteFromHistory,
    clearCache,
    clearHistory,
    loadHistory,
    getCombinedResults
  };
}