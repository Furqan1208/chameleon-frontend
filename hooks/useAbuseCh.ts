// hooks/useAbuseCh.ts
'use client';

import { useState, useCallback } from 'react';
import { urlhausApi } from '@/services/api/threat-intel/urlhaus.api';
import { threatFoxApi } from '@/services/api/threat-intel/threatFox.api';

type ServiceType = 'urlhaus' | 'threatfox' | 'both';

export interface AbuseChCombinedResult {
  urlhaus?: any;
  threatfox?: any;
  timestamp: string;
  indicator: string;
}

export function useAbuseCh() {
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<AbuseChCombinedResult[]>([]);

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
          const urlhausResult = await urlhausApi.checkIndicator(indicator);
          console.log(`[useAbuseCh] URLhaus returned:`, urlhausResult);
          result.urlhaus = urlhausResult;
        } catch (urlhausError) {
          console.error(`[useAbuseCh] URLhaus check failed for ${indicator}:`, urlhausError);
          result.urlhaus = {
            ioc: indicator,
            found: false,
            query_status: 'error',
            error: urlhausError instanceof Error ? urlhausError.message : 'Unknown error',
            timestamp: new Date().toISOString()
          };
        }
      }
      
      // Check ThreatFox if needed
      if (service === 'both' || service === 'threatfox') {
        try {
          console.log(`[useAbuseCh] Calling ThreatFox for: ${indicator}`);
          const threatfoxResult = await threatFoxApi.search(indicator);
          console.log(`[useAbuseCh] ThreatFox returned:`, threatfoxResult);
          result.threatfox = threatfoxResult;
        } catch (threatfoxError) {
          console.error(`[useAbuseCh] ThreatFox check failed for ${indicator}:`, threatfoxError);
          result.threatfox = {
            ioc: indicator,
            found: false,
            query_status: 'error',
            error: threatfoxError instanceof Error ? threatfoxError.message : 'Unknown error',
            timestamp: new Date().toISOString()
          };
        }
      }
      
      // Update results state
      setResults(prev => {
        const newResults = [result, ...prev];
        return newResults.slice(0, 10);
      });
      
      console.log(`[useAbuseCh] Final result for ${indicator}:`, result);
      
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

  return {
    checking,
    error,
    results,
    checkIndicator,
    clearResults,
  };
}