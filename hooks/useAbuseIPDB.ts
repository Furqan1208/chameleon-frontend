// hooks/useAbuseIPDB.ts
'use client';

import { useState, useCallback } from 'react';
import { abuseIPDBApi } from '@/services/api/threat-intel/abuseipdb.api';

export function useAbuseIPDB() {
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);

  const checkIP = useCallback(async (ip: string, maxAgeInDays: number = 90) => {
    setChecking(true);
    setError(null);
    
    try {
      console.log(`[useAbuseIPDB] Checking IP: ${ip}`);
      const result = await abuseIPDBApi.checkIp(ip, maxAgeInDays);
      
      // Update results state (keep last 10)
      setResults(prev => {
        const newResults = [result, ...prev.filter(r => r.ioc !== ip)];
        return newResults.slice(0, 10);
      });
      
      console.log(`[useAbuseIPDB] Check completed for ${ip}`, {
        found: result.found,
        confidence_score: result.confidence_score,
        threat_level: result.threat_level
      });
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error(`[useAbuseIPDB] Check failed:`, err);
      setError(errorMessage);
      throw err;
    } finally {
      setChecking(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
    console.log('[useAbuseIPDB] Results cleared from state');
  }, []);


  return {
    checking,
    error,
    results,
    checkIP,
    clearResults,
  };
}