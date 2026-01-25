// hooks/useHybridAnalysis.ts
'use client';

import { useState, useCallback } from 'react';
import type { HAScanRequest, HAAnalysisResult, HAThreatFeedItem } from '@/lib/threat-intel/ha-types';
import { hybridAnalysisService } from '@/lib/threat-intel/hybrid-analysis-service';

export function useHybridAnalysis() {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<HAAnalysisResult[]>([]);
  const [threatFeed, setThreatFeed] = useState<HAThreatFeedItem[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [cache, setCache] = useState<Record<string, HAAnalysisResult>>({});

  const stats = {
    totalScans: results.length,
    maliciousCount: results.filter(r => r.threat_level === 'malicious').length,
    suspiciousCount: results.filter(r => r.threat_level === 'suspicious').length,
    cleanCount: results.filter(r => r.threat_level === 'whitelisted').length,
    avgThreatScore: results.length > 0 
      ? results.reduce((sum, r) => sum + r.threat_score_computed, 0) / results.length 
      : 0,
    detectionRate: results.length > 0
      ? ((results.filter(r => r.threat_level === 'malicious' || r.threat_level === 'suspicious').length) / results.length) * 100
      : 0
  };

  const rateLimit = hybridAnalysisService.getRateLimitInfo();

  const scanIndicator = useCallback(async (request: HAScanRequest) => {
    setScanning(true);
    setError(null);
    
    try {
      console.log(`[useHybridAnalysis] Scanning indicator: ${request.indicator}`);
      
      // Check cache first
      const cacheKey = `ha:${request.indicator}`;
      if (cache[cacheKey]) {
        console.log(`[useHybridAnalysis] Using cached result for ${request.indicator}`);
        const cachedResult = cache[cacheKey];
        setResults(prev => [cachedResult, ...prev.filter(r => r.ioc !== request.indicator)]);
        return cachedResult;
      }

      const result = await hybridAnalysisService.scanIndicator(request);
      
      // Cache the result
      setCache(prev => ({ ...prev, [cacheKey]: result }));
      
      // Add to results (prepend, keep last 20)
      setResults(prev => [result, ...prev.filter(r => r.ioc !== request.indicator)].slice(0, 20));
      
      console.log(`[useHybridAnalysis] Scan completed for ${request.indicator}`, {
        found: result.found,
        threat_score: result.threat_score_computed,
        verdict: result.verdict
      });
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error(`[useHybridAnalysis] Scan failed:`, err);
      setError(errorMessage);
      throw err;
    } finally {
      setScanning(false);
    }
  }, [cache]);

  const loadThreatFeed = useCallback(async (limit: number = 50) => {
    setFeedLoading(true);
    setError(null);
    
    try {
      console.log(`[useHybridAnalysis] Loading threat feed...`);
      const threats = await hybridAnalysisService.getThreatFeed(limit);
      setThreatFeed(threats);
      console.log(`[useHybridAnalysis] Loaded ${threats.length} threats from feed`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load threat feed';
      console.error('[useHybridAnalysis] Failed to load threat feed:', err);
      setError(errorMessage);
    } finally {
      setFeedLoading(false);
    }
  }, []);

  const loadQuickScanFeed = useCallback(async (limit: number = 50) => {
    setFeedLoading(true);
    setError(null);
    
    try {
      const threats = await hybridAnalysisService.getQuickScanFeed(limit);
      setThreatFeed(threats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load quick scan feed';
      console.error('[useHybridAnalysis] Failed to load quick scan feed:', err);
      setError(errorMessage);
    } finally {
      setFeedLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
    console.log('[useHybridAnalysis] Results cleared');
  }, []);

  const clearCache = useCallback(() => {
    setCache({});
    setError(null);
    console.log('[useHybridAnalysis] Cache cleared');
  }, []);

  const getReportSummary = useCallback(async (reportId: string) => {
    try {
      return await hybridAnalysisService.getReportSummary(reportId);
    } catch (err) {
      console.error(`[useHybridAnalysis] Failed to get report summary for ${reportId}:`, err);
      return null;
    }
  }, []);

  const getReportState = useCallback(async (reportId: string) => {
    try {
      return await hybridAnalysisService.getReportState(reportId);
    } catch (err) {
      console.error(`[useHybridAnalysis] Failed to get report state for ${reportId}:`, err);
      return null;
    }
  }, []);

  return {
    scanning,
    error,
    results,
    threatFeed,
    feedLoading,
    stats,
    rateLimit,
    scanIndicator,
    loadThreatFeed,
    loadQuickScanFeed,
    clearResults,
    clearCache,
    getReportSummary,
    getReportState
  };
}