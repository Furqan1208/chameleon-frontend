// hooks/useURLhaus.ts
'use client';

import { useState, useCallback } from 'react';
import { urlhausService } from '@/lib/threat-intel/urlhaus-service';
import type { URLhausAnalysisResult } from '@/lib/threat-intel/urlhaus-types';

export function useURLhaus() {
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<URLhausAnalysisResult[]>([]);
  const [history, setHistory] = useState<URLhausAnalysisResult[]>([]);

  const checkIndicator = useCallback(async (indicator: string) => {
    setChecking(true);
    setError(null);
    
    try {
      console.log(`[useURLhaus] Checking indicator: ${indicator}`);
      const result = await urlhausService.checkIndicator(indicator);
      
      // Update results state (keep last 10)
      setResults(prev => {
        const newResults = [result, ...prev];
        return newResults.slice(0, 10);
      });
      
      // Update history
      setHistory(prev => {
        const newHistory = [result, ...prev];
        return newHistory.slice(0, 50);
      });
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error(`[useURLhaus] Check failed:`, err);
      setError(errorMessage);
      throw err;
    } finally {
      setChecking(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
    console.log('[useURLhaus] Results cleared');
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    console.log('[useURLhaus] History cleared');
  }, []);

  const clearCache = useCallback(() => {
    urlhausService.clearCache();
    console.log('[useURLhaus] Cache cleared');
  }, []);

  const downloadMalware = useCallback(async (sha256: string) => {
    try {
      const blob = await urlhausService.downloadMalware(sha256);
      return blob;
    } catch (err) {
      console.error(`[useURLhaus] Download failed:`, err);
      throw err;
    }
  }, []);

  return {
    checking,
    error,
    results,
    history,
    checkIndicator,
    clearResults,
    clearHistory,
    clearCache,
    downloadMalware
  };
}