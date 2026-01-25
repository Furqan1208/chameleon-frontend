// D:\FYP\Chameleon Frontend\components\threat-intel\OTXScanner.tsx
'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { IOCSearchBar } from '@/components/ui/IOCSearchBar';
import { OTXResults } from './OTXResults';
import { OTXStatsCards } from './OTXStatsCards';
import { OTXPulseVisualization } from './OTXPulseVisualization';
import { useAlienVaultOTX } from '@/hooks/useAlienVaultOTX';
import { 
  AlertTriangle, 
  Globe, 
  Network, 
  Activity,
  Shield, 
  Hash, 
  Link as LinkIcon,
  FileText,
  User,
  Clock,
  RefreshCw,
  Trash2,
  Star,
  StarOff,
  Zap,
  History,
  Database,
  Filter,
  Eye,
  BarChart3,
  Info,
  X,
  Download,
  Search,
  Cpu,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Copy,
  Lock,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import type { OTXIndicatorType } from '@/lib/threat-intel/otx-types';
import type { VTIndicatorType } from '@/lib/threat-intel/vt-types';

export function OTXScanner() {
  const {
    scanning,
    error,
    results,
    history,
    favorites,
    stats,
    rateLimit,
    apiKeyValid,
    scanIndicator,
    clearResults,
    clearCache,
    clearHistory,
    loadHistory,
    toggleFavorite,
    validateApiKey
  } = useAlienVaultOTX();

  const [activeTab, setActiveTab] = useState<'scanner' | 'history' | 'pulses' | 'favorites'>('scanner');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingPulses, setLoadingPulses] = useState(false);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [favoritesError, setFavoritesError] = useState<string | null>(null);
  const [favoriteProcessing, setFavoriteProcessing] = useState<Set<string>>(new Set());
  
  // Use refs to track last values and prevent infinite re-renders
  const resultsRef = useRef(results);
  const historyRef = useRef(history);
  const lastUpdateRef = useRef<number>(0);

  // Helper function to detect indicator type based on pattern
  const detectIndicatorType = (indicator: string): VTIndicatorType => {
    const cleanIndicator = indicator.trim().toLowerCase();
    
    // Check for IPv4
    const ipv4Pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (ipv4Pattern.test(cleanIndicator)) {
      return 'ip';
    }
    
    // Check for IPv6 (simplified pattern)
    const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    if (ipv6Pattern.test(cleanIndicator)) {
      return 'ip';
    }
    
    // Check for file hash patterns
    const md5Pattern = /^[a-fA-F0-9]{32}$/;
    const sha1Pattern = /^[a-fA-F0-9]{40}$/;
    const sha256Pattern = /^[a-fA-F0-9]{64}$/;
    if (sha256Pattern.test(cleanIndicator) || sha1Pattern.test(cleanIndicator) || md5Pattern.test(cleanIndicator)) {
      return 'hash';
    }
    
    // Check for URL
    if (cleanIndicator.startsWith('http://') || cleanIndicator.startsWith('https://')) {
      return 'url';
    }
    
    // Check for domain (simplified pattern)
    const domainPattern = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
    if (domainPattern.test(cleanIndicator) && !cleanIndicator.includes('/')) {
      return 'domain';
    }
    
    // Check for CVE pattern
    const cvePattern = /^cve-\d{4}-\d{4,}$/i;
    if (cvePattern.test(cleanIndicator)) {
      return 'filename';
    }
    
    // Default to filename for everything else
    return 'filename';
  };

  // Map VT types to OTX types with proper handling
  const mapVTTypeToOTXType = (indicator: string, vtType: VTIndicatorType): OTXIndicatorType => {
    const cleanIndicator = indicator.trim().toUpperCase();
    
    // First check for CVE pattern - this takes priority
    const cvePattern = /^CVE-\d{4}-\d{4,}$/i;
    if (cvePattern.test(cleanIndicator)) {
      return 'cve';
    }
    
    switch (vtType) {
      case 'hash':
        return 'file';
        
      case 'ip':
        if (cleanIndicator.includes(':')) {
          return 'IPv6';
        }
        return 'IPv4';
        
      case 'domain':
        return 'domain';
        
      case 'url':
        return 'url';
        
      case 'filename':
        const hashPattern = /^[A-F0-9]{32,64}$/i;
        if (hashPattern.test(cleanIndicator)) {
          return 'file';
        }
        if (cvePattern.test(cleanIndicator)) {
          return 'cve';
        }
        return 'domain';
        
      default:
        const ipv4PatternCheck = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        const ipv6PatternCheck = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
        const sha256PatternCheck = /^[A-F0-9]{64}$/i;
        
        if (ipv4PatternCheck.test(cleanIndicator)) return 'IPv4';
        if (ipv6PatternCheck.test(cleanIndicator)) return 'IPv6';
        if (sha256PatternCheck.test(cleanIndicator)) return 'file';
        if (cvePattern.test(cleanIndicator)) return 'cve';
        if (cleanIndicator.startsWith('HTTP')) return 'url';
        return 'domain';
    }
  };

  const handleScan = async (indicator: string, type: VTIndicatorType) => {
    try {
      const cleanIndicator = indicator.trim();
      
      let detectedType = type;
      if (!['hash', 'ip', 'domain', 'url', 'filename'].includes(type)) {
        detectedType = detectIndicatorType(cleanIndicator);
      }
      
      const otxType = mapVTTypeToOTXType(cleanIndicator, detectedType);
      
      await scanIndicator({
        indicator: cleanIndicator,
        type: otxType,
        include_all_sections: true
      });
    } catch (err) {
      console.error('[OTXScanner] Scan error:', err);
    }
  };

  const handleClearCache = () => {
    if (confirm('Clear all cached AlienVault OTX data? This will not delete your history.')) {
      clearCache();
    }
  };

  const handleClearHistory = () => {
    if (confirm('Permanently delete all scan history? This cannot be undone.')) {
      clearHistory();
    }
  };

  const handleClearAll = () => {
    if (confirm('Clear ALL data including cache, history, and current results?')) {
      clearCache();
      clearHistory();
      clearResults();
    }
  };

  // Load history with error handling
  const handleLoadHistory = useCallback(async () => {
    if (loadingHistory) return;
    
    setLoadingHistory(true);
    setHistoryError(null);
    try {
      await loadHistory();
    } catch (err) {
      console.error('[OTXScanner] Failed to load history:', err);
      setHistoryError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setLoadingHistory(false);
    }
  }, [loadHistory, loadingHistory]);

  // Load favorites with error handling
  const handleLoadFavorites = useCallback(async () => {
    if (loadingFavorites) return;
    
    setLoadingFavorites(true);
    setFavoritesError(null);
    try {
      await loadHistory();
    } catch (err) {
      console.error('[OTXScanner] Failed to load favorites:', err);
      setFavoritesError(err instanceof Error ? err.message : 'Failed to load favorites');
    } finally {
      setLoadingFavorites(false);
    }
  }, [loadHistory, loadingFavorites]);

  // Handle tab changes with proper loading states
  const handleTabChange = useCallback(async (tab: 'scanner' | 'history' | 'pulses' | 'favorites') => {
    setActiveTab(tab);
    
    switch (tab) {
      case 'history':
        await handleLoadHistory();
        break;
      case 'pulses':
        setLoadingPulses(true);
        await handleLoadHistory();
        setLoadingPulses(false);
        break;
      case 'favorites':
        await handleLoadFavorites();
        break;
    }
  }, [handleLoadHistory, handleLoadFavorites]);

  // Load initial data only once on mount
  useEffect(() => {
    const now = Date.now();
    // Only load if more than 5 seconds have passed since last load
    if (now - lastUpdateRef.current > 5000) {
      handleLoadHistory().catch(console.error);
      lastUpdateRef.current = now;
    }
  }, [handleLoadHistory]);

  // Update refs when data changes
  useEffect(() => {
    resultsRef.current = results;
  }, [results]);
  
  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  // Handle favorite toggling with loading state
  const handleToggleFavorite = useCallback(async (scanId: string) => {
    if (favoriteProcessing.has(scanId)) return;
    
    setFavoriteProcessing(prev => new Set(prev).add(scanId));
    try {
      await toggleFavorite(scanId);
      if (activeTab === 'favorites') {
        await handleLoadFavorites();
      }
    } catch (err) {
      console.error('[OTXScanner] Failed to toggle favorite:', err);
    } finally {
      setFavoriteProcessing(prev => {
        const newSet = new Set(prev);
        newSet.delete(scanId);
        return newSet;
      });
    }
  }, [toggleFavorite, activeTab, handleLoadFavorites, favoriteProcessing]);

  // FIXED: Combine current session results with history for display WITHOUT creating new IDs
  const displayHistory = useMemo(() => {
    // Use refs to prevent dependency on changing arrays
    const currentResults = resultsRef.current;
    const currentHistory = historyRef.current;
    
    // Create a map of existing history by indicator
    const historyMap = new Map<string, any>();
    currentHistory.forEach(scan => {
      historyMap.set(scan.indicator, scan);
    });
    
    // Add current results, but don't overwrite existing history entries
    currentResults.forEach(result => {
      if (!historyMap.has(result.ioc)) {
        // Create a temporary entry for current session results
        historyMap.set(result.ioc, {
          id: `session-${result.ioc}-${result.timestamp}`,
          indicator: result.ioc,
          type: result.ioc_type,
          result,
          timestamp: result.timestamp,
          favorite: false,
          isSessionResult: true
        });
      }
    });
    
    return Array.from(historyMap.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [results, history]); // Only recompute when results or history actually change

  // Filter history by search query
  const filteredHistory = useMemo(() => {
    return displayHistory.filter(scan => 
      scan.indicator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scan.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scan.result.threat_level.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [displayHistory, searchQuery]);

  const filteredFavorites = useMemo(() => {
    return favorites.filter(scan => 
      scan.indicator.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [favorites, searchQuery]);

  // Check if there are any pulses in the data
  const hasPulseData = useMemo(() => {
    return displayHistory.some(scan => scan.result.pulse_count > 0);
  }, [displayHistory]);

  // Get pulse statistics
  const pulseStats = useMemo(() => {
    const totalPulses = displayHistory.reduce((sum, scan) => sum + scan.result.pulse_count, 0);
    const uniquePulseIds = new Set<string>();
    
    displayHistory.forEach(scan => {
      const pulses = scan.result.sections.general?.pulse_info?.pulses || [];
      pulses.forEach(pulse => {
        if (pulse.id) {
          uniquePulseIds.add(pulse.id);
        }
      });
    });
    
    return {
      totalPulses,
      uniquePulses: uniquePulseIds.size,
      scansWithPulses: displayHistory.filter(scan => scan.result.pulse_count > 0).length
    };
  }, [displayHistory]);

  // Show API key warning if not valid
  if (apiKeyValid === false) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Globe className="w-8 h-8 text-orange-500" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">AlienVault OTX Scanner</h1>
              <p className="text-sm text-muted-foreground">
                Open Threat Intelligence Exchange • Community-driven threat data
              </p>
            </div>
          </div>
        </div>

        <div className="glass border border-destructive/30 bg-destructive/5 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-destructive mb-2">API Key Required</h3>
              <p className="text-foreground/80 mb-3">
                To use AlienVault OTX, you need to configure an API key.
              </p>
              <ol className="space-y-2 text-sm text-muted-foreground mb-4">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">1.</span>
                  <span>Get a free AlienVault OTX API key from <a href="https://otx.alienvault.com/api" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">their website</a></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">2.</span>
                  <span>Add <code className="bg-muted px-1 rounded font-mono">NEXT_PUBLIC_ALIENTVAULTOTX_API_KEY=your_key_here</code> to your <code className="bg-muted px-1 rounded font-mono">.env.local</code> file</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">3.</span>
                  <span>Restart your development server</span>
                </li>
              </ol>
              <button
                onClick={() => window.open('https://otx.alienvault.com/api', '_blank')}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Get API Key
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Globe className="w-8 h-8 text-orange-500" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">AlienVault OTX Scanner</h1>
            <p className="text-sm text-muted-foreground">
              Open Threat Intelligence Exchange • Community-driven threat data
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* Rate Limit Indicator */}
          {rateLimit && (
            <div className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-lg text-sm">
              <Activity className="w-4 h-4 text-orange-500" />
              <span className="text-foreground">{rateLimit.remaining}</span>
              <span className="text-muted-foreground">/ {rateLimit.limit} requests</span>
              {rateLimit.isLimited && (
                <span className="text-destructive text-xs">
                  (reset in {Math.ceil(rateLimit.minutesUntilReset)} min)
                </span>
              )}
            </div>
          )}
          
          {/* Action Buttons */}
          <button
            onClick={handleClearCache}
            disabled={scanning}
            className="px-3 py-1.5 border border-border rounded-lg hover:bg-muted/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm"
            title="Clear cached API responses"
          >
            <RefreshCw className="w-4 h-4" />
            Clear Cache
          </button>
          
          {displayHistory.length > 0 && (
            <button
              onClick={handleClearHistory}
              disabled={scanning}
              className="px-3 py-1.5 border border-yellow-500/30 text-yellow-500 rounded-lg hover:bg-yellow-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm"
              title="Delete all scan history"
            >
              <History className="w-4 h-4" />
              Clear History
            </button>
          )}
          
          {(results.length > 0 || displayHistory.length > 0) && (
            <button
              onClick={handleClearAll}
              disabled={scanning}
              className="px-3 py-1.5 border border-destructive/30 text-destructive rounded-lg hover:bg-destructive/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm"
              title="Clear all data"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <OTXStatsCards results={results} history={displayHistory} />

      {/* Main Scanner Section */}
      <div className="glass border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          <button
            onClick={() => handleTabChange('scanner')}
            disabled={scanning}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              activeTab === 'scanner'
                ? 'bg-orange-500 text-white'
                : 'hover:bg-muted/20 text-muted-foreground'
            }`}
          >
            <Search className="w-4 h-4" />
            Scanner
            {scanning && <Loader2 className="w-3 h-3 animate-spin" />}
          </button>
          <button
            onClick={() => handleTabChange('history')}
            disabled={scanning || loadingHistory}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              activeTab === 'history'
                ? 'bg-orange-500 text-white'
                : 'hover:bg-muted/20 text-muted-foreground'
            }`}
          >
            <History className="w-4 h-4" />
            History ({displayHistory.length})
            {stats.maliciousCount > 0 && (
              <span className="px-1.5 py-0.5 text-xs bg-destructive/20 text-destructive rounded">
                {stats.maliciousCount} threats
              </span>
            )}
            {loadingHistory && <Loader2 className="w-3 h-3 animate-spin" />}
          </button>
          <button
            onClick={() => handleTabChange('pulses')}
            disabled={scanning || loadingPulses}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              activeTab === 'pulses'
                ? 'bg-orange-500 text-white'
                : 'hover:bg-muted/20 text-muted-foreground'
            }`}
          >
            <Activity className="w-4 h-4" />
            Pulses
            {pulseStats.totalPulses > 0 && (
              <span className="px-1.5 py-0.5 text-xs bg-orange-500/20 text-orange-500 rounded">
                {pulseStats.totalPulses} total
              </span>
            )}
            {loadingPulses && <Loader2 className="w-3 h-3 animate-spin" />}
          </button>
          <button
            onClick={() => handleTabChange('favorites')}
            disabled={scanning || loadingFavorites}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              activeTab === 'favorites'
                ? 'bg-orange-500 text-white'
                : 'hover:bg-muted/20 text-muted-foreground'
            }`}
          >
            <Star className="w-4 h-4" />
            Favorites ({favorites.length})
            {loadingFavorites && <Loader2 className="w-3 h-3 animate-spin" />}
          </button>
        </div>

        {activeTab === 'scanner' ? (
          <>
            <IOCSearchBar 
              onSearch={handleScan} 
              scanning={scanning}
              placeholder="Enter IP, domain, URL, hash, CVE, or hostname..."
            />
            
            {error && (
              <div className="mt-4 p-4 border border-destructive/30 bg-destructive/5 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-destructive mb-1">Scan Failed</p>
                    <p className="text-sm text-foreground/80">{error}</p>
                    {error.includes('Rate limit') && (
                      <div className="mt-2 p-2 bg-black/5 rounded text-xs">
                        <p className="font-medium">Rate Limit Information:</p>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          <div>Remaining: <span className="font-bold">{rateLimit.remaining}</span></div>
                          <div>Reset in: <span className="font-bold">{Math.ceil(rateLimit.minutesUntilReset)} min</span></div>
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {}}
                    className="p-1 hover:bg-black/10 rounded"
                    title="Dismiss"
                  >
                    <XCircle className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            )}
            
            {results.length > 0 ? (
              <div className="mt-6">
                <OTXResults results={results} onToggleFavorite={handleToggleFavorite} />
              </div>
            ) : !scanning && !error && (
              <div className="mt-8 text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500/10 rounded-full mb-4">
                  <Globe className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Ready to Scan</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  Enter any indicator to check with AlienVault OTX threat intelligence
                </p>
                
                {stats.totalScans > 0 && (
                  <div className="inline-block p-4 border border-border rounded-lg bg-muted/10">
                    <div className="text-center mb-2">
                      <div className={`text-3xl font-bold ${
                        stats.avgThreatScore >= 70 ? 'text-destructive' :
                        stats.avgThreatScore >= 50 ? 'text-accent' :
                        stats.avgThreatScore >= 30 ? 'text-yellow-500' :
                        stats.avgThreatScore >= 10 ? 'text-orange-500' :
                        'text-green-500'
                      }`}>
                        {stats.avgThreatScore.toFixed(1)}
                      </div>
                      <div className="text-sm font-medium text-foreground mt-1">
                        {stats.avgThreatScore >= 70 ? 'Very High Risk' :
                         stats.avgThreatScore >= 50 ? 'High Risk' :
                         stats.avgThreatScore >= 30 ? 'Medium Risk' :
                         stats.avgThreatScore >= 10 ? 'Low Risk' :
                         'Very Low Risk'}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground text-center">
                      Average Threat Score • Based on {stats.totalScans} scans
                    </div>
                  </div>
                )}

                <div className="mt-8">
                  <p className="text-sm text-muted-foreground mb-3">Quick test indicators:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <button
                      onClick={() => handleScan('8.8.8.8', 'ip')}
                      disabled={scanning}
                      className="px-3 py-1.5 bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-sm flex items-center gap-2"
                    >
                      <Network className="w-3 h-3" />
                      <code className="text-xs">8.8.8.8 (IPv4)</code>
                    </button>
                    <button
                      onClick={() => handleScan('google.com', 'domain')}
                      disabled={scanning}
                      className="px-3 py-1.5 bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-sm flex items-center gap-2"
                    >
                      <Globe className="w-3 h-3" />
                      <code className="text-xs">google.com</code>
                    </button>
                    <button
                      onClick={() => handleScan('f0c9d66fa9003c46039217450e485277f4f8413b55aa611853c2a21cc20cca58', 'hash')}
                      disabled={scanning}
                      className="px-3 py-1.5 bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-sm flex items-center gap-2"
                    >
                      <Hash className="w-3 h-3" />
                      <code className="text-xs">SHA256 Hash</code>
                    </button>
                    <button
                      onClick={() => handleScan('CVE-2024-12345', 'filename')}
                      disabled={scanning}
                      className="px-3 py-1.5 bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-sm flex items-center gap-2"
                    >
                      <Lock className="w-3 h-3" />
                      <code className="text-xs">CVE-2024-12345</code>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : activeTab === 'history' ? (
          <div className="space-y-4">
            {/* History Header with Refresh Button */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Scan History</h3>
              <div className="flex items-center gap-2">
                {historyError && (
                  <div className="text-xs text-destructive flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {historyError}
                  </div>
                )}
                <button
                  onClick={handleLoadHistory}
                  disabled={loadingHistory || scanning}
                  className="px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm"
                  title="Refresh history"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingHistory ? 'animate-spin' : ''}`} />
                  {loadingHistory ? 'Loading...' : 'Refresh'}
                </button>
              </div>
            </div>

            {/* History Stats */}
            {displayHistory.length > 0 && !loadingHistory && (
              <div className="p-4 bg-muted/10 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">{displayHistory.length}</div>
                    <div className="text-xs text-muted-foreground">Total Scans</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-destructive">{stats.maliciousCount}</div>
                    <div className="text-xs text-muted-foreground">High Risk</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">{stats.suspiciousCount}</div>
                    <div className="text-xs text-muted-foreground">Medium Risk</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-500">{stats.pulseCount}</div>
                    <div className="text-xs text-muted-foreground">Total Pulses</div>
                  </div>
                </div>
                
                {stats.totalScans > 0 && (
                  <div className="mt-4 p-3 border border-border rounded-lg bg-background/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">Average Threat Score</p>
                        <p className="text-xs text-muted-foreground">Across all scans</p>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${
                          stats.avgThreatScore >= 70 ? 'text-destructive' :
                          stats.avgThreatScore >= 50 ? 'text-accent' :
                          stats.avgThreatScore >= 30 ? 'text-yellow-500' :
                          stats.avgThreatScore >= 10 ? 'text-orange-500' :
                          'text-green-500'
                        }`}>
                          {stats.avgThreatScore.toFixed(1)}
                        </div>
                        <div className="text-xs font-medium text-foreground">
                          {stats.avgThreatScore >= 70 ? 'Very High Risk' :
                           stats.avgThreatScore >= 50 ? 'High Risk' :
                           stats.avgThreatScore >= 30 ? 'Medium Risk' :
                           stats.avgThreatScore >= 10 ? 'Low Risk' :
                           'Very Low Risk'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* History Search */}
            {displayHistory.length > 0 && !loadingHistory && (
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search history by indicator or threat level..."
                  className="w-full pl-10 pr-10 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
                  disabled={loadingHistory}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
              </div>
            )}

            {/* Loading State */}
            {loadingHistory && (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-3" />
                <p className="text-muted-foreground">Loading scan history...</p>
              </div>
            )}

            {/* History List */}
            {!loadingHistory && filteredHistory.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredHistory.map((scan) => (
                  <div
                    key={scan.id || `scan-${scan.indicator}`}
                    className="p-4 border border-border rounded-lg hover:bg-muted/10 transition-colors group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          scan.result.threat_level === 'high' ? 'bg-destructive/10' :
                          scan.result.threat_level === 'medium' ? 'bg-accent/10' :
                          scan.result.threat_level === 'clean' ? 'bg-green-500/10' :
                          'bg-muted'
                        }`}>
                          {scan.result.threat_level === 'high' ? (
                            <AlertTriangle className="w-4 h-4 text-destructive" />
                          ) : scan.result.threat_level === 'clean' ? (
                            <Shield className="w-4 h-4 text-green-500" />
                          ) : scan.result.threat_level === 'medium' ? (
                            <AlertTriangle className="w-4 h-4 text-accent" />
                          ) : (
                            <Globe className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground font-mono text-sm">{scan.indicator}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded capitalize">
                              {scan.type}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded capitalize ${
                              scan.result.threat_level === 'high' ? 'bg-destructive/20 text-destructive' :
                              scan.result.threat_level === 'medium' ? 'bg-accent/20 text-accent' :
                              'bg-green-500/20 text-green-500'
                            }`}>
                              {scan.result.threat_level}
                            </span>
                            {scan.result.pulse_count > 0 && (
                              <span className="text-xs px-2 py-0.5 bg-orange-500/20 text-orange-500 rounded">
                                {scan.result.pulse_count} pulses
                              </span>
                            )}
                            {scan.isSessionResult && (
                              <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-500 rounded">
                                Session
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <button
                          onClick={() => handleToggleFavorite(scan.id)}
                          disabled={favoriteProcessing.has(scan.id) || scanning || scan.isSessionResult}
                          className="p-1 hover:bg-muted/20 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors relative"
                          title={scan.favorite ? "Remove from favorites" : scan.isSessionResult ? "Save scan first" : "Add to favorites"}
                        >
                          {favoriteProcessing.has(scan.id) ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : scan.favorite ? (
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          ) : (
                            <StarOff className="w-3 h-3" />
                          )}
                        </button>
                        <Clock className="w-3 h-3" />
                        <span>{new Date(scan.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <a
                        href={scan.result.otx_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 text-xs border border-border rounded hover:bg-muted/20 transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        View on OTX
                      </a>
                      <button
                        onClick={() => handleScan(scan.indicator, scan.type as VTIndicatorType)}
                        disabled={scanning}
                        className="px-2 py-1 text-xs border border-border rounded hover:bg-muted/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Rescan
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(scan.indicator);
                        }}
                        className="px-2 py-1 text-xs border border-border rounded hover:bg-muted/20 transition-colors flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        Copy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : !loadingHistory && displayHistory.length > 0 ? (
              <div className="text-center py-8">
                <Filter className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No matching scans found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try a different search term
                </p>
              </div>
            ) : !loadingHistory ? (
              <div className="text-center py-12">
                <History className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No scan history yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your scans will appear here after you start scanning indicators.
                </p>
                <button
                  onClick={() => handleTabChange('scanner')}
                  className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-500/90 transition-colors"
                >
                  Start Scanning
                </button>
              </div>
            ) : null}
          </div>
        ) : activeTab === 'pulses' ? (
          <div className="space-y-4">
            {/* Pulses Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Threat Intelligence Pulses</h3>
              <div className="flex items-center gap-2">
                {hasPulseData && (
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <Activity className="w-3 h-3" />
                    <span>{pulseStats.totalPulses} total pulses</span>
                    <span className="mx-1">•</span>
                    <span>{pulseStats.uniquePulses} unique pulses</span>
                  </div>
                )}
                <button
                  onClick={handleLoadHistory}
                  disabled={loadingPulses || scanning}
                  className="px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm"
                  title="Refresh pulses"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingPulses ? 'animate-spin' : ''}`} />
                  {loadingPulses ? 'Loading...' : 'Refresh'}
                </button>
              </div>
            </div>

            {/* Loading State */}
            {loadingPulses ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-3" />
                <p className="text-muted-foreground">Loading pulse data...</p>
              </div>
            ) : hasPulseData ? (
              <OTXPulseVisualization history={displayHistory} />
            ) : displayHistory.length > 0 ? (
              <div className="text-center py-12">
                <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No pulse data found in scans</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                  Pulses appear when you scan indicators that have been mentioned in AlienVault OTX threat intelligence reports.
                  Try scanning known malicious indicators.
                </p>
                <div className="mt-6">
                  <p className="text-sm text-muted-foreground mb-2">Try these indicators with pulse data:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <button
                      onClick={() => handleScan('8.8.8.8', 'ip')}
                      disabled={scanning}
                      className="px-3 py-1.5 bg-muted hover:bg-muted/80 disabled:opacity-50 rounded-lg transition-colors text-sm"
                    >
                      <code>8.8.8.8</code>
                    </button>
                    <button
                      onClick={() => handleScan('malware.com', 'domain')}
                      disabled={scanning}
                      className="px-3 py-1.5 bg-muted hover:bg-muted/80 disabled:opacity-50 rounded-lg transition-colors text-sm"
                    >
                      <code>malware.com</code>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No scans available</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Scan some indicators first to see threat intelligence pulses.
                </p>
                <button
                  onClick={() => handleTabChange('scanner')}
                  className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-500/90 transition-colors"
                >
                  Start Scanning
                </button>
              </div>
            )}
          </div>
        ) : (
          // Favorites Tab
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Favorite Scans</h3>
              <div className="flex items-center gap-2">
                {favoritesError && (
                  <div className="text-xs text-destructive flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {favoritesError}
                  </div>
                )}
                <button
                  onClick={handleLoadFavorites}
                  disabled={loadingFavorites || scanning}
                  className="px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm"
                  title="Refresh favorites"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingFavorites ? 'animate-spin' : ''}`} />
                  {loadingFavorites ? 'Loading...' : 'Refresh'}
                </button>
              </div>
            </div>

            {loadingFavorites ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-3" />
                <p className="text-muted-foreground">Loading favorites...</p>
              </div>
            ) : favorites.length > 0 ? (
              <>
                <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <h3 className="font-semibold text-foreground">Favorite Scans ({favorites.length})</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your bookmarked threat intelligence scans.
                  </p>
                </div>

                {favorites.length > 5 && (
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <Filter className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search favorites..."
                      className="w-full pl-10 pr-10 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                      </button>
                    )}
                  </div>
                )}

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredFavorites.map((scan) => (
                    <div
                      key={scan.id}
                      className="p-4 border border-yellow-500/20 bg-yellow-500/5 rounded-lg hover:bg-yellow-500/10 transition-colors group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            scan.result.threat_level === 'high' ? 'bg-destructive/10' :
                            scan.result.threat_level === 'medium' ? 'bg-accent/10' :
                            'bg-green-500/10'
                          }`}>
                            {scan.result.threat_level === 'high' ? (
                              <AlertTriangle className="w-4 h-4 text-destructive" />
                            ) : scan.result.threat_level === 'clean' ? (
                              <Shield className="w-4 h-4 text-green-500" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-accent" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground font-mono text-sm">{scan.indicator}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded capitalize">
                                {scan.type}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded capitalize ${
                                scan.result.threat_level === 'high' ? 'bg-destructive/20 text-destructive' :
                                scan.result.threat_level === 'medium' ? 'bg-accent/20 text-accent' :
                                'bg-green-500/20 text-green-500'
                              }`}>
                                {scan.result.threat_level}
                              </span>
                              {scan.result.pulse_count > 0 && (
                                <span className="text-xs px-2 py-0.5 bg-orange-500/20 text-orange-500 rounded">
                                  {scan.result.pulse_count} pulses
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <button
                            onClick={() => handleToggleFavorite(scan.id)}
                            disabled={favoriteProcessing.has(scan.id) || scanning}
                            className="p-1 hover:bg-muted/20 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors relative"
                            title="Remove from favorites"
                          >
                            {favoriteProcessing.has(scan.id) ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            )}
                          </button>
                          <Clock className="w-3 h-3" />
                          <span>{new Date(scan.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <a
                          href={scan.result.otx_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 text-xs border border-border rounded hover:bg-muted/20 transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          View on OTX
                        </a>
                        <button
                          onClick={() => handleScan(scan.indicator, scan.type as VTIndicatorType)}
                          disabled={scanning}
                          className="px-2 py-1 text-xs border border-border rounded hover:bg-muted/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Rescan
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Star className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No favorite scans yet</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                  Click the star icon on any scan in the history tab to add it to your favorites.
                </p>
                <button
                  onClick={() => handleTabChange('history')}
                  className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-500/90 transition-colors"
                >
                  View History
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}