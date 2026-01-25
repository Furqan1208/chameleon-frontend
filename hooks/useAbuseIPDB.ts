// hooks/useAbuseIPDB.ts
'use client';

import { useState, useCallback, useEffect } from 'react';
import { abuseIPDBService } from '@/lib/threat-intel/abuseipdb-service';
import { AbuseIPDBStorage } from '@/lib/storage/abuseipdb-storage';
import type { AbuseIPDBAnalysisResult, AbuseIPDBReportRequest } from '@/lib/threat-intel/abuseipdb-types';

export function useAbuseIPDB() {
  const [checking, setChecking] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<AbuseIPDBAnalysisResult[]>([]);
  const [blacklist, setBlacklist] = useState<AbuseIPDBAnalysisResult[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  // Load history and blacklist from storage on mount
  useEffect(() => {
    loadFromStorage();
  }, []);

  const loadFromStorage = useCallback(() => {
    // Load recent searches
    const storedHistory = AbuseIPDBStorage.getHistory();
    const historyResults = storedHistory.map(item => item.result);
    setResults(historyResults.slice(0, 10)); // Show last 10 in scanner
    
    // Load cached blacklist
    const cachedBlacklist = AbuseIPDBStorage.getBlacklist();
    setBlacklist(cachedBlacklist);
    
    // Set full history
    setHistory(storedHistory);
    
    console.log(`[useAbuseIPDB] Loaded ${historyResults.length} history items and ${cachedBlacklist.length} blacklist items`);
  }, []);

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
      
      // Reload history from storage (it was updated by the service)
      loadFromStorage();
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error(`[useAbuseIPDB] Check failed:`, err);
      setError(errorMessage);
      throw err;
    } finally {
      setChecking(false);
    }
  }, [loadFromStorage]);

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

  const clearHistory = useCallback(() => {
    abuseIPDBService.clearHistory();
    setResults([]);
    setHistory([]);
    console.log('[useAbuseIPDB] History cleared');
  }, []);

  const clearAll = useCallback(() => {
    abuseIPDBService.clearAll();
    setResults([]);
    setBlacklist([]);
    setHistory([]);
    setError(null);
    console.log('[useAbuseIPDB] All data cleared');
  }, []);

  const loadHistory = useCallback(() => {
    const storedHistory = AbuseIPDBStorage.getHistory();
    setHistory(storedHistory);
    return storedHistory;
  }, []);

  return {
    checking,
    reporting,
    error,
    results,
    blacklist,
    history,
    checkIP,
    reportIP,
    getBlacklist,
    clearResults,
    clearCache,
    clearHistory,
    clearAll,
    loadHistory,
    loadFromStorage
  };
}