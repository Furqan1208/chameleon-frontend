// hooks/useAlienVaultOTX.ts
'use client';

import { useState } from 'react';
import type { OTXScanRequest, OTXResult } from '@/lib/types/alienvault.types';
import { alienVaultApi } from '@/services/api/threat-intel/alienVault.api';

export function useAlienVaultOTX() {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<OTXResult[]>([]);

  const scanIndicator = async (request: OTXScanRequest) => {
    setScanning(true);
    setError(null);
    
    try {
      console.log(`[useAlienVaultOTX] Scanning indicator: ${request.indicator}`);
      const result = await alienVaultApi.scan(request);
      
      // Check if there's an error in the result
      if (result.error) {
        setError(result.error);
      }
      
      // Add to results, removing any previous result for the same indicator
      setResults(prev => {
        const newResults = [result, ...prev.filter(r => r.ioc !== request.indicator)];
        return newResults.slice(0, 20); // Keep last 20 results
      });
      
      console.log(`[useAlienVaultOTX] Scan completed for ${request.indicator}`);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error(`[useAlienVaultOTX] Scan failed:`, err);
      
      setError(errorMessage);
      
      // Create an error result
      const errorResult: OTXResult = {
        ioc: request.indicator,
        ioc_type: request.type,
        found: false,
        sections: {
          general: {
            indicator: request.indicator,
            pulse_info: {
              count: 0,
              pulses: [],
              references: []
            }
          }
        },
        threat_level: 'unknown',
        threat_score: 0,
        pulse_count: 0,
        malware_count: 0,
        url_count: 0,
        passive_dns_count: 0,
        otx_url: '',
        error: errorMessage,
        timestamp: new Date().toISOString()
      };
      
      setResults(prev => [errorResult, ...prev.slice(0, 19)]);
      
      throw err;
    } finally {
      setScanning(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    setError(null);
    console.log('[useAlienVaultOTX] Session results cleared');
  };

  return {
    scanning,
    error,
    results,
    scanIndicator,
    clearResults
  };
}
