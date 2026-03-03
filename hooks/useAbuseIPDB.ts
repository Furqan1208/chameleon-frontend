// hooks/useAbuseIPDB.ts
'use client';

import { useState, useCallback } from 'react';
import { abuseIPDBService } from '@/lib/threat-intel/abuseipdb-service';
import type { AbuseIPDBAnalysisResult, AbuseIPDBReportRequest } from '@/lib/threat-intel/abuseipdb-types';

export function useAbuseIPDB() {
  const [checking, setChecking] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<AbuseIPDBAnalysisResult[]>([]);
  const [blacklist, setBlacklist] = useState<AbuseIPDBAnalysisResult[]>([]);



  const checkIP = useCallback(async (ip: string, maxAgeInDays: number = 30) => {
    setChecking(true);
    setError(null);
    
    try {
      console.log(`[useAbuseIPDB] Checking IP: ${ip}`);
      const result = await abuseIPDBService.checkIP(ip, maxAgeInDays);
      
      // Update results state (keep last 10)
      setResults(prev => {
        const newResults = [result, ...prev.filter(r => r.ip !== ip)];
        return newResults.slice(0, 10);
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

  const reportIP = useCallback(async (request: AbuseIPDBReportRequest) => {
    setReporting(true);
    setError(null);
    
    try {
      const success = await abuseIPDBService.reportIP(request);
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setReporting(false);
    }
  }, []);

  const getBlacklist = useCallback(async (confidenceMinimum: number = 90, limit: number = 100) => {
    setChecking(true);
    setError(null);
    
    try {
      console.log(`[useAbuseIPDB] Getting blacklist with confidence: ${confidenceMinimum}%`);
      const blacklistResults = await abuseIPDBService.getBlacklist({ confidenceMinimum, limit });
      setBlacklist(blacklistResults);
      return blacklistResults;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load blacklist';
      console.error(`[useAbuseIPDB] Blacklist failed:`, err);
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

  const clearCache = useCallback(() => {
    abuseIPDBService.clearCache();
    setBlacklist([]);
    console.log('[useAbuseIPDB] Cache cleared');
  }, []);


  const clearAll = useCallback(() => {
    abuseIPDBService.clearAll();
    setResults([]);
    setBlacklist([]);
    setError(null);
    console.log('[useAbuseIPDB] All data cleared');
  }, []);


  return {
    checking,
    reporting,
    error,
    results,
    blacklist,
    checkIP,
    reportIP,
    getBlacklist,
    clearResults,
    clearCache,
    clearAll
  };
}