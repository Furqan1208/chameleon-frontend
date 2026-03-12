// hooks/useHybridAnalysis.ts
'use client';

import { useState, useCallback } from 'react';
import type { HAScanRequest, HAAnalysisResult, HAThreatFeedItem } from '@/lib/types/hybrid-analysis.types';
import { hybridAnalysisApi } from '@/services/api/threat-intel/hybridAnalysis.api';

export function useHybridAnalysis() {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<HAAnalysisResult[]>([]);
  const [threatFeed, setThreatFeed] = useState<HAThreatFeedItem[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);

  const scanIndicator = useCallback(async (request: HAScanRequest) => {
    setScanning(true);
    setError(null);
    
    try {
      console.log(`[useHybridAnalysis] Scanning indicator: ${request.indicator}`);
      
      const result = await hybridAnalysisApi.scan(request);
      
      // Add to results (prepend, filter duplicates, keep last 20)
      setResults(prev => {
        const filtered = prev.filter(r => r.ioc !== request.indicator);
        return [result, ...filtered].slice(0, 20);
      });
      
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
  }, []);

  const loadThreatFeed = useCallback(async (limit = 50) => {
    setFeedLoading(true);
    setError(null);
    
    try {
      console.log(`[useHybridAnalysis] Loading threat feed...`);
      const threats = await hybridAnalysisApi.getThreatFeed(limit);
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

  const loadQuickScanFeed = useCallback(async (limit = 50) => {
    setFeedLoading(true);
    setError(null);
    
    try {
      const threats = await hybridAnalysisApi.getQuickScanFeed(limit);
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

  return {
    scanning,
    error,
    results,
    threatFeed,
    feedLoading,
    scanIndicator,
    loadThreatFeed,
    loadQuickScanFeed,
    clearResults
  };
}
