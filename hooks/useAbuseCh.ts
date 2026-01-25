// hooks/useAbuseCh.ts - COMPLETE FIX
'use client';

import { useState, useCallback } from 'react';
import { urlhausService } from '@/lib/threat-intel/urlhaus-service';
import { threatFoxService } from '@/lib/threat-intel/threatfox-service';
import type { URLhausAnalysisResult } from '@/lib/threat-intel/urlhaus-types';
import type { ThreatFoxAnalysisResult } from '@/lib/threat-intel/threatfox-types';

type ServiceType = 'urlhaus' | 'threatfox' | 'both';

export interface AbuseChCombinedResult {
  urlhaus?: URLhausAnalysisResult;
  threatfox?: ThreatFoxAnalysisResult;
  timestamp: string;
  indicator: string;
}

export function useAbuseCh() {
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<AbuseChCombinedResult[]>([]);
  const [history, setHistory] = useState<AbuseChCombinedResult[]>([]);

  const checkIndicator = useCallback(async (
    indicator: string,
    service: ServiceType = 'both'
  ): Promise<AbuseChCombinedResult> => {
    setChecking(true);
    setError(null);
    
    try {
      console.log(`[useAbuseCh] Checking ${service} for: ${indicator}`);
      
      const result: AbuseChCombinedResult = {
        indicator,
        timestamp: new Date().toISOString()
      };
      
      // Check URLhaus if needed
      if (service === 'both' || service === 'urlhaus') {
        try {
          console.log(`[useAbuseCh] Calling URLhaus for: ${indicator}`);
          const urlhausResult = await urlhausService.checkIndicator(indicator);
          console.log(`[useAbuseCh] URLhaus returned:`, urlhausResult);
          result.urlhaus = urlhausResult;
        } catch (urlhausError) {
          console.error(`[useAbuseCh] URLhaus check failed for ${indicator}:`, urlhausError);
          result.urlhaus = {
            query_status: 'unknown',
            raw_data: { error: urlhausError instanceof Error ? urlhausError.message : 'Unknown error' },
            timestamp: new Date().toISOString()
          } as URLhausAnalysisResult;
        }
      }
      
      // Check ThreatFox if needed
      if (service === 'both' || service === 'threatfox') {
        try {
          console.log(`[useAbuseCh] Calling ThreatFox for: ${indicator}`);
          const threatfoxResult = await threatFoxService.searchIndicator(indicator);
          console.log(`[useAbuseCh] ThreatFox returned:`, threatfoxResult);
          result.threatfox = threatfoxResult;
        } catch (threatfoxError) {
          console.error(`[useAbuseCh] ThreatFox check failed for ${indicator}:`, threatfoxError);
          result.threatfox = {
            query_status: 'unknown',
            raw_data: { error: threatfoxError instanceof Error ? threatfoxError.message : 'Unknown error' },
            timestamp: new Date().toISOString()
          } as ThreatFoxAnalysisResult;
        }
      }
      
      // Debug: Check if raw_data is present
      console.log(`[useAbuseCh] Final result structure:`, {
        indicator: result.indicator,
        urlhausRawData: result.urlhaus?.raw_data,
        threatfoxRawData: result.threatfox?.raw_data,
        urlhausKeys: result.urlhaus ? Object.keys(result.urlhaus) : [],
        threatfoxKeys: result.threatfox ? Object.keys(result.threatfox) : []
      });
      
      // Update results state
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
      console.error(`[useAbuseCh] Check failed:`, err);
      setError(errorMessage);
      throw err;
    } finally {
      setChecking(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
    console.log('[useAbuseCh] Results cleared');
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    console.log('[useAbuseCh] History cleared');
  }, []);

  const clearCache = useCallback(() => {
    urlhausService.clearCache();
    threatFoxService.clearCache();
    console.log('[useAbuseCh] Cache cleared');
  }, []);

  const downloadMalware = useCallback(async (sha256: string) => {
    try {
      const blob = await urlhausService.downloadMalware(sha256);
      return blob;
    } catch (err) {
      console.error(`[useAbuseCh] Download failed:`, err);
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