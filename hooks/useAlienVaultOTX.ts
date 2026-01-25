// D:\FYP\Chameleon Frontend\hooks\useAlienVaultOTX.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { OTXScanRequest, OTXResult, OTXScanHistory } from '@/lib/threat-intel/otx-types';
import { alienvaultOTXService } from '@/lib/threat-intel/alienvault-service';
import { otxDatabase } from '@/lib/threat-intel/otx-cache';

interface OTXStats {
  totalScans: number;
  maliciousCount: number;
  suspiciousCount: number;
  cleanCount: number;
  avgThreatScore: number;
  pulseCount: number;
  malwareCount: number;
  urlCount: number;
  recentScans: number; // Scans in last 24 hours
  favoriteCount: number;
  uniqueIOCs: number;
}

interface RateLimitInfo {
  remaining: number;
  resetTime: Date;
  minutesUntilReset: number;
  used: number;
  limit: number;
  isLimited: boolean;
}

interface OTXState {
  scanning: boolean;
  error: string | null;
  results: OTXResult[];
  history: OTXScanHistory[];
  favorites: OTXScanHistory[];
  stats: OTXStats;
  rateLimit: RateLimitInfo;
  apiKeyValid: boolean | null;
  lastScanTime: Date | null;
  scanQueue: OTXScanRequest[];
}

export function useAlienVaultOTX() {
  // Main state
  const [state, setState] = useState<OTXState>({
    scanning: false,
    error: null,
    results: [],
    history: [],
    favorites: [],
    stats: {
      totalScans: 0,
      maliciousCount: 0,
      suspiciousCount: 0,
      cleanCount: 0,
      avgThreatScore: 0,
      pulseCount: 0,
      malwareCount: 0,
      urlCount: 0,
      recentScans: 0,
      favoriteCount: 0,
      uniqueIOCs: 0
    },
    rateLimit: {
      remaining: 10,
      resetTime: new Date(),
      minutesUntilReset: 0,
      used: 0,
      limit: 10,
      isLimited: false
    },
    apiKeyValid: null, // Start as null (loading)
    lastScanTime: null,
    scanQueue: []
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const isInitialized = useRef(false);

  // Check API key on mount and load history
  useEffect(() => {
    const initialize = async () => {
      // Prevent double initialization in Strict Mode
      if (isInitialized.current) return;
      isInitialized.current = true;
      
      try {
        console.log('[useAlienVaultOTX] Initializing...');
        
        // TEMPORARY FIX: Skip API validation during OTX maintenance
        // Check if API key is configured (quick check)
        const isConfigured = alienvaultOTXService.isConfigured();
        
        if (!isConfigured) {
          console.warn('[useAlienVaultOTX] API key not configured in environment');
          setState(prev => ({ ...prev, apiKeyValid: false }));
          // Still load history even without API key (for cached data)
          console.log('[useAlienVaultOTX] Loading history from cache...');
          await loadHistory();
          return;
        }
        
        // TEMPORARY: Assume API key is valid if configured (skip validation during maintenance)
        console.log('[useAlienVaultOTX] API key configured, assuming valid (skipping validation due to maintenance)');
        setState(prev => ({ ...prev, apiKeyValid: true }));
        
        // Load history
        console.log('[useAlienVaultOTX] Loading initial history...');
        await loadHistory();
        
      } catch (error) {
        console.error('[useAlienVaultOTX] Initialization failed:', error);
        // Don't set apiKeyValid to false on general errors
      }
    };
    
    initialize();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Calculate statistics from history and results
  const calculateStats = useCallback((history: OTXScanHistory[], results: OTXResult[]): OTXStats => {
    // Combine all data
    const allResults = [
      ...history.map(h => h.result),
      ...results
    ];

    if (allResults.length === 0) {
      return {
        totalScans: 0,
        maliciousCount: 0,
        suspiciousCount: 0,
        cleanCount: 0,
        avgThreatScore: 0,
        pulseCount: 0,
        malwareCount: 0,
        urlCount: 0,
        recentScans: 0,
        favoriteCount: 0,
        uniqueIOCs: 0
      };
    }

    // Remove duplicates by IOC (preferring newer results)
    const uniqueResultsMap = new Map<string, OTXResult>();
    [...allResults].reverse().forEach(result => {
      if (!uniqueResultsMap.has(result.ioc)) {
        uniqueResultsMap.set(result.ioc, result);
      }
    });
    const uniqueResults = Array.from(uniqueResultsMap.values());

    // Calculate basic statistics
    const maliciousCount = uniqueResults.filter(r => r.threat_level === 'high').length;
    const suspiciousCount = uniqueResults.filter(r => r.threat_level === 'medium').length;
    const cleanCount = uniqueResults.filter(r => r.threat_level === 'clean').length;
    const totalScans = allResults.length;
    
    // Calculate totals
    const pulseCount = uniqueResults.reduce((sum, r) => sum + r.pulse_count, 0);
    const malwareCount = uniqueResults.reduce((sum, r) => sum + r.malware_count, 0);
    const urlCount = uniqueResults.reduce((sum, r) => sum + r.url_count, 0);
    
    // Calculate average threat score
    const avgThreatScore = uniqueResults.length > 0 
      ? Number((uniqueResults.reduce((sum, r) => sum + r.threat_score, 0) / uniqueResults.length).toFixed(1))
      : 0;
    
    // Calculate recent scans (last 24 hours)
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    const recentScans = allResults.filter(r => {
      try {
        const scanDate = new Date(r.timestamp);
        return scanDate > twentyFourHoursAgo;
      } catch {
        return false;
      }
    }).length;

    // Count favorites
    const favoriteCount = history.filter(scan => scan.favorite).length;

    return {
      totalScans,
      maliciousCount,
      suspiciousCount,
      cleanCount,
      avgThreatScore,
      pulseCount,
      malwareCount,
      urlCount,
      recentScans,
      favoriteCount,
      uniqueIOCs: uniqueResults.length
    };
  }, []);

  // Load scan history and calculate stats
  const loadHistory = useCallback(async () => {
    try {
      console.log('[useAlienVaultOTX] Loading history...');
      
      // Load scans and favorites
      const [scans, favorites] = await Promise.all([
        alienvaultOTXService.getScanHistory(),
        otxDatabase.getFavorites()
      ]);
      
      console.log(`[useAlienVaultOTX] Loaded ${scans.length} scans, ${favorites.length} favorites`);
      
      // Update state
      setState(prev => {
        const stats = calculateStats(scans, prev.results);
        
        return {
          ...prev,
          history: scans,
          favorites: favorites,
          stats
        };
      });
      
      return scans;
    } catch (err) {
      console.error('[useAlienVaultOTX] Failed to load scan history:', err);
      
      // Show empty state
      setState(prev => ({
        ...prev,
        history: [],
        favorites: []
      }));
      
      return [];
    }
  }, [calculateStats]);

  // Scan a single indicator
  const scanIndicator = useCallback(async (request: OTXScanRequest) => {
    // Check if API key is configured (not validated, just check if it exists)
    if (!alienvaultOTXService.isConfigured()) {
      const errorMsg = 'AlienVault OTX API key is not configured. Please add NEXT_PUBLIC_ALIENTVAULTOTX_API_KEY to your .env.local file.';
      setState(prev => ({ ...prev, error: errorMsg }));
      throw new Error(errorMsg);
    }

    // Clear previous error
    setState(prev => ({ ...prev, error: null, scanning: true }));

    // Create abort controller for this scan
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      console.log(`[useAlienVaultOTX] Scanning indicator: ${request.indicator}`);
      
      const result = await alienvaultOTXService.scanIndicator(request);
      
      // Create a scan history entry for immediate display
      const scanHistory: OTXScanHistory = {
        id: crypto.randomUUID(),
        indicator: request.indicator,
        type: request.type,
        result,
        timestamp: new Date().toISOString(),
        favorite: false
      };

      // Add to current session results AND history for immediate update
      setState(prev => {
        const newResults = [
          result,
          ...prev.results.filter(r => r.ioc !== request.indicator)
        ].slice(0, 20); // Keep last 20 in session
        
        const newHistory = [
          scanHistory,
          ...prev.history.filter(h => h.result.ioc !== request.indicator)
        ].slice(0, 50); // Keep last 50 in history
        
        const stats = calculateStats(newHistory, newResults);
        
        return {
          ...prev,
          scanning: false,
          results: newResults,
          history: newHistory,
          lastScanTime: new Date(),
          stats
        };
      });

      // Update rate limit info from service
      const rateLimitInfo = alienvaultOTXService.getRateLimitInfo();
      setState(prev => ({
        ...prev,
        rateLimit: {
          ...prev.rateLimit,
          remaining: rateLimitInfo.remaining,
          resetTime: rateLimitInfo.resetTime,
          minutesUntilReset: rateLimitInfo.minutesUntilReset,
          used: 10 - rateLimitInfo.remaining,
          isLimited: rateLimitInfo.remaining <= 0
        }
      }));

      // Reload history from database to ensure consistency
      setTimeout(() => {
        loadHistory().catch(err => {
          console.warn('[useAlienVaultOTX] Background history refresh failed:', err);
        });
      }, 100);
      
      console.log(`[useAlienVaultOTX] Scan completed for ${request.indicator}`);
      return result;
    } catch (err) {
      console.error(`[useAlienVaultOTX] Scan failed for ${request.indicator}:`, err);
      
      let errorMessage = 'Unknown error occurred';
      
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          errorMessage = 'Scan was cancelled';
        } else if (err.message.includes('Rate limit')) {
          errorMessage = err.message;
          // Update rate limit state
          const rateLimitInfo = alienvaultOTXService.getRateLimitInfo();
          setState(prev => ({
            ...prev,
            rateLimit: {
              ...prev.rateLimit,
              remaining: rateLimitInfo.remaining,
              resetTime: rateLimitInfo.resetTime,
              minutesUntilReset: rateLimitInfo.minutesUntilReset,
              used: 10 - rateLimitInfo.remaining,
              isLimited: true
            }
          }));
        } else if (err.message.includes('API key')) {
          errorMessage = err.message;
          setState(prev => ({ ...prev, apiKeyValid: false }));
        } else if (err.message.includes('Network error') || err.message.includes('timeout')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (err.message.includes('maintenance') || err.message.includes('unavailable')) {
          // Handle OTX maintenance gracefully
          errorMessage = 'AlienVault OTX is currently undergoing maintenance. Please try again later.';
          
          // Create a mock result for frontend testing during maintenance
          const mockResult: OTXResult = {
            ioc: request.indicator,
            ioc_type: request.type,
            found: false,
            sections: {
              general: {
                indicator: request.indicator,
                type: request.type.toString(),
                pulse_info: { 
                  count: 0, 
                  pulses: [], 
                  references: [], 
                  related: { 
                    alienvault: { 
                      adversary: [], 
                      malware_families: [], 
                      industries: [] 
                    }, 
                    other: { 
                      adversary: [], 
                      malware_families: [], 
                      industries: [] 
                    } 
                  } 
                }
              }
            },
            threat_level: 'unknown',
            threat_score: 0,
            pulse_count: 0,
            malware_count: 0,
            url_count: 0,
            passive_dns_count: 0,
            otx_url: `https://otx.alienvault.com/indicator/${request.type}/${encodeURIComponent(request.indicator)}`,
            timestamp: new Date().toISOString(),
            raw_data: { error: 'OTX under maintenance' },
            file_type: 'Unknown'
          };
          
          // Add mock result to state for frontend testing
          const scanHistory: OTXScanHistory = {
            id: crypto.randomUUID(),
            indicator: request.indicator,
            type: request.type,
            result: mockResult,
            timestamp: new Date().toISOString(),
            favorite: false
          };
          
          setState(prev => {
            const newResults = [
              mockResult,
              ...prev.results.filter(r => r.ioc !== request.indicator)
            ].slice(0, 20);
            
            const newHistory = [
              scanHistory,
              ...prev.history.filter(h => h.result.ioc !== request.indicator)
            ].slice(0, 50);
            
            const stats = calculateStats(newHistory, newResults);
            
            return {
              ...prev,
              scanning: false,
              results: newResults,
              history: newHistory,
              lastScanTime: new Date(),
              stats
            };
          });
          
          return mockResult;
        } else {
          errorMessage = err.message;
        }
      }
      
      setState(prev => ({ 
        ...prev, 
        scanning: false, 
        error: errorMessage 
      }));
      
      throw err;
    } finally {
      // Clean up abort controller
      abortControllerRef.current = null;
    }
  }, [calculateStats, loadHistory]);

  // Quick scan with minimal data
  const quickScan = useCallback(async (indicator: string, type: OTXScanRequest['type']) => {
    return scanIndicator({
      indicator,
      type,
      include_all_sections: false
    });
  }, [scanIndicator]);

  // Scan multiple indicators with rate limiting
  const scanMultiple = useCallback(async (requests: OTXScanRequest[]) => {
    // Check if API key is configured (not validated, just check if it exists)
    if (!alienvaultOTXService.isConfigured()) {
      const errorMsg = 'AlienVault OTX API key is not configured.';
      setState(prev => ({ ...prev, error: errorMsg }));
      throw new Error(errorMsg);
    }

    // Clear previous error
    setState(prev => ({ ...prev, error: null, scanning: true }));

    const results: OTXResult[] = [];
    
    for (let i = 0; i < requests.length; i++) {
      const request = requests[i];
      
      // Check rate limit before each request
      const rateLimitInfo = alienvaultOTXService.getRateLimitInfo();
      if (rateLimitInfo.remaining <= 0) {
        const errorMsg = `Rate limit reached after ${i} scans. Please wait ${Math.ceil(rateLimitInfo.minutesUntilReset)} minutes.`;
        setState(prev => ({ 
          ...prev, 
          scanning: false, 
          error: errorMsg,
          results: [...results, ...prev.results]
        }));
        break;
      }

      try {
        console.log(`[useAlienVaultOTX] Batch scanning ${i + 1}/${requests.length}: ${request.indicator}`);
        
        const result = await alienvaultOTXService.scanIndicator(request);
        results.push(result);
        
        // Create a scan history entry for immediate display
        const scanHistory: OTXScanHistory = {
          id: crypto.randomUUID(),
          indicator: request.indicator,
          type: request.type,
          result,
          timestamp: new Date().toISOString(),
          favorite: false
        };
        
        // Update progress in state
        setState(prev => {
          const newResults = [...results, ...prev.results.filter(r => 
            !results.some(newResult => newResult.ioc === r.ioc)
          )].slice(0, 20);
          
          const newHistory = [
            scanHistory,
            ...prev.history.filter(h => h.result.ioc !== request.indicator)
          ].slice(0, 50);
          
          return {
            ...prev,
            results: newResults,
            history: newHistory,
            lastScanTime: new Date()
          };
        });

        // Update rate limit
        const updatedRateLimit = alienvaultOTXService.getRateLimitInfo();
        setState(prev => ({
          ...prev,
          rateLimit: {
            ...prev.rateLimit,
            remaining: updatedRateLimit.remaining,
            resetTime: updatedRateLimit.resetTime,
            minutesUntilReset: updatedRateLimit.minutesUntilReset,
            used: 10 - updatedRateLimit.remaining
          }
        }));

        // Rate limit: 10 requests/minute = 6 seconds between requests
        if (i < requests.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 6000));
        }
        
        console.log(`[useAlienVaultOTX] Completed batch scan for ${request.indicator}`);
      } catch (err) {
        console.error(`[useAlienVaultOTX] Failed to scan ${request.indicator}:`, err);
        // Continue with next indicator
      }
    }

    // Update final state
    setState(prev => {
      const finalResults = [...results, ...prev.results].slice(0, 20);
      const stats = calculateStats(prev.history, finalResults);
      
      return {
        ...prev,
        scanning: false,
        results: finalResults,
        stats
      };
    });

    // Reload history
    await loadHistory();

    console.log(`[useAlienVaultOTX] Completed batch scan of ${results.length} indicators`);
    return results;
  }, [calculateStats, loadHistory]);

  // Clear current session results
  const clearResults = useCallback(() => {
    setState(prev => ({
      ...prev,
      results: [],
      error: null
    }));
    console.log('[useAlienVaultOTX] Session results cleared');
  }, []);

  // Delete a specific scan from history
  const deleteFromHistory = useCallback(async (id: string) => {
    try {
      await otxDatabase.deleteScan(id);
      console.log(`[useAlienVaultOTX] Deleted scan ${id} from history`);
      await loadHistory(); // Reload history after deletion
    } catch (err) {
      console.error('[useAlienVaultOTX] Failed to delete from history:', err);
      // Don't show error to user for delete operations
    }
  }, [loadHistory]);

  // Clear API cache
  const clearCache = useCallback(async () => {
    try {
      await alienvaultOTXService.clearCache();
      
      // Update rate limit info
      const rateLimitInfo = alienvaultOTXService.getRateLimitInfo();
      setState(prev => ({
        ...prev,
        rateLimit: {
          ...prev.rateLimit,
          remaining: rateLimitInfo.remaining,
          resetTime: rateLimitInfo.resetTime,
          minutesUntilReset: rateLimitInfo.minutesUntilReset
        }
      }));
      
      console.log('[useAlienVaultOTX] Cache cleared');
      await loadHistory(); // Reload after clearing cache
    } catch (err) {
      console.error('[useAlienVaultOTX] Failed to clear cache:', err);
      // Don't show error to user for cache clearing
    }
  }, [loadHistory]);

  // Clear all history
  const clearHistory = useCallback(async () => {
    try {
      await otxDatabase.clearScans();
      
      setState(prev => ({
        ...prev,
        history: [],
        favorites: [],
        results: [], // Also clear session results
        stats: {
          totalScans: 0,
          maliciousCount: 0,
          suspiciousCount: 0,
          cleanCount: 0,
          avgThreatScore: 0,
          pulseCount: 0,
          malwareCount: 0,
          urlCount: 0,
          recentScans: 0,
          favoriteCount: 0,
          uniqueIOCs: 0
        }
      }));
      
      console.log('[useAlienVaultOTX] History cleared');
    } catch (err) {
      console.error('[useAlienVaultOTX] Failed to clear history:', err);
      // Don't show error to user for history clearing
    }
  }, []);

  // Toggle favorite status
  const toggleFavorite = useCallback(async (id: string) => {
    try {
      const isFavorite = await otxDatabase.toggleFavorite(id);
      console.log(`[useAlienVaultOTX] Toggled favorite for ${id}: ${isFavorite}`);
      
      // Update local state immediately
      setState(prev => {
        const updatedHistory = prev.history.map(scan => 
          scan.id === id ? { ...scan, favorite: isFavorite } : scan
        );
        
        const updatedFavorites = isFavorite 
          ? [...prev.favorites, prev.history.find(scan => scan.id === id)!].filter(Boolean)
          : prev.favorites.filter(scan => scan.id !== id);
        
        const stats = calculateStats(updatedHistory, prev.results);
        
        return {
          ...prev,
          history: updatedHistory,
          favorites: updatedFavorites,
          stats
        };
      });
      
      return isFavorite;
    } catch (err) {
      console.error('[useAlienVaultOTX] Failed to toggle favorite:', err);
      // Don't throw, just return false
      return false;
    }
  }, [calculateStats]);

  // Get combined unique results
  const getCombinedResults = useCallback(() => {
    // Combine history and current session results, removing duplicates
    const allResults = [
      ...state.history.map(h => h.result),
      ...state.results
    ];
    
    const uniqueResultsMap = new Map<string, OTXResult>();
    [...allResults].reverse().forEach(result => {
      if (!uniqueResultsMap.has(result.ioc)) {
        uniqueResultsMap.set(result.ioc, result);
      }
    });
    
    return Array.from(uniqueResultsMap.values());
  }, [state.history, state.results]);

  // Get results by threat level
  const getResultsByThreatLevel = useCallback(async (level: string) => {
    try {
      const scans = await otxDatabase.getScansByThreatLevel(level);
      return scans.map(s => s.result);
    } catch (err) {
      console.error('[useAlienVaultOTX] Failed to get results by threat level:', err);
      return [];
    }
  }, []);

  // Validate API key
  const validateApiKey = useCallback(async () => {
    try {
      const isValid = await alienvaultOTXService.validateApiKey();
      setState(prev => ({ ...prev, apiKeyValid: isValid }));
      return isValid;
    } catch (err) {
      console.error('[useAlienVaultOTX] API key validation failed:', err);
      setState(prev => ({ ...prev, apiKeyValid: false }));
      return false;
    }
  }, []);

  // Cancel current scan
  const cancelScan = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setState(prev => ({ 
        ...prev, 
        scanning: false,
        error: 'Scan cancelled by user'
      }));
      console.log('[useAlienVaultOTX] Scan cancelled');
    }
  }, []);

  // Add to scan queue
  const queueScan = useCallback((request: OTXScanRequest) => {
    setState(prev => ({
      ...prev,
      scanQueue: [...prev.scanQueue, request]
    }));
  }, []);

  // Process scan queue
  const processScanQueue = useCallback(async () => {
    if (state.scanQueue.length === 0 || state.scanning) return;
    
    const queue = [...state.scanQueue];
    setState(prev => ({ ...prev, scanQueue: [], scanning: true }));
    
    try {
      await scanMultiple(queue);
    } catch (err) {
      console.error('[useAlienVaultOTX] Failed to process scan queue:', err);
    }
  }, [state.scanQueue, state.scanning, scanMultiple]);

  return {
    // State
    scanning: state.scanning,
    error: state.error,
    results: state.results,
    history: state.history,
    favorites: state.favorites,
    stats: state.stats,
    rateLimit: state.rateLimit,
    apiKeyValid: state.apiKeyValid,
    lastScanTime: state.lastScanTime,
    scanQueue: state.scanQueue,
    
    // Actions
    scanIndicator,
    quickScan,
    scanMultiple,
    clearResults,
    deleteFromHistory,
    clearCache,
    clearHistory,
    loadHistory,
    toggleFavorite,
    getCombinedResults,
    getResultsByThreatLevel,
    validateApiKey,
    cancelScan,
    queueScan,
    processScanQueue
  };
}