// components/threat-intel/AbuseIPDBScanner.tsx - ADD HISTORY TAB AND IMPROVED FEATURES
'use client';

import { useState, useEffect } from 'react';
import { useAbuseIPDB } from '@/hooks/useAbuseIPDB';
import { AbuseIPDBResults } from './AbuseIPDBResults';
import { AbuseIPDBStatsCards } from './AbuseIPDBStatsCards';
import { AbuseIPDBHistory } from './AbuseIPDBHistory';
import { 
  Globe, 
  AlertTriangle, 
  Shield, 
  RefreshCw, 
  Trash2, 
  List, 
  Eye, 
  Download,
  History,
  Database,
  Search,
  Filter,
  Clock,
  FileText
} from 'lucide-react';

export function AbuseIPDBScanner() {
  const {
    checking,
    error,
    results,
    blacklist,
    history,
    checkIP,
    getBlacklist,
    clearResults,
    clearCache,
    clearHistory,
    clearAll,
    loadFromStorage
  } = useAbuseIPDB();

  const [ipInput, setIpInput] = useState('');
  const [activeTab, setActiveTab] = useState<'scanner' | 'blacklist' | 'history'>('scanner');
  const [blacklistConfidence, setBlacklistConfidence] = useState(90);
  const [blacklistLoading, setBlacklistLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [maxAgeDays, setMaxAgeDays] = useState(30);

  // Load search history from localStorage
  useEffect(() => {
    const savedSearches = localStorage.getItem('abuseipdb_search_history');
    if (savedSearches) {
      setSearchHistory(JSON.parse(savedSearches));
    }
  }, []);

  const saveToSearchHistory = (ip: string) => {
    const updatedHistory = [ip, ...searchHistory.filter(item => item !== ip)].slice(0, 10);
    setSearchHistory(updatedHistory);
    localStorage.setItem('abuseipdb_search_history', JSON.stringify(updatedHistory));
  };

  const handleCheckIP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ipInput.trim() || checking) return;

    console.log(`Checking IP: ${ipInput.trim()}`);
    saveToSearchHistory(ipInput.trim());
    
    try {
      const result = await checkIP(ipInput.trim(), maxAgeDays);
      console.log('IP Check Result:', result);
      setIpInput('');
    } catch (err) {
      console.error('IP Check Error:', err);
    }
  };

  const handleLoadBlacklist = async () => {
    setBlacklistLoading(true);
    try {
      console.log('Loading blacklist with confidence:', blacklistConfidence);
      const blacklistResult = await getBlacklist(blacklistConfidence, 50);
      console.log('Blacklist loaded:', blacklistResult?.length || 0, 'IPs');
    } catch (err) {
      console.error('Failed to load blacklist:', err);
    } finally {
      setBlacklistLoading(false);
    }
  };

  const handleClearCache = () => {
    clearCache();
    alert('Cache cleared successfully!');
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear all search history? This action cannot be undone.')) {
      clearHistory();
      setSearchHistory([]);
      localStorage.removeItem('abuseipdb_search_history');
      alert('History cleared successfully!');
    }
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear ALL data (results, cache, history)? This action cannot be undone.')) {
      clearAll();
      setSearchHistory([]);
      localStorage.removeItem('abuseipdb_search_history');
      alert('All data cleared successfully!');
    }
  };

  const handleQuickSearch = (ip: string) => {
    setIpInput(ip);
    // Optionally trigger search automatically
    // checkIP(ip, maxAgeDays);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-500" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">AbuseIPDB Scanner</h1>
            <p className="text-sm text-muted-foreground">
              Persistent IP reputation database with history tracking
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {error && (
            <div className="text-xs text-destructive bg-destructive/10 px-2 py-1 rounded">
              Error: {error}
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearCache}
              className="px-3 py-1.5 border border-border rounded-lg hover:bg-muted/20 transition-colors flex items-center gap-2 text-sm"
              title="Clear API cache"
            >
              <RefreshCw className="w-4 h-4" />
              Clear Cache
            </button>
            
            {history.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="px-3 py-1.5 border border-yellow-500/30 text-yellow-500 rounded-lg hover:bg-yellow-500/10 transition-colors flex items-center gap-2 text-sm"
                title="Clear search history"
              >
                <History className="w-4 h-4" />
                Clear History
              </button>
            )}
            
            {(results.length > 0 || blacklist.length > 0) && (
              <button
                onClick={handleClearAll}
                className="px-3 py-1.5 border border-destructive/30 text-destructive rounded-lg hover:bg-destructive/10 transition-colors flex items-center gap-2 text-sm"
                title="Clear all data"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <AbuseIPDBStatsCards results={results} blacklist={blacklist} history={history} />

      {/* Scanner */}
      <div className="glass border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('scanner')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'scanner'
                ? 'bg-blue-500 text-white'
                : 'hover:bg-muted/20 text-muted-foreground'
            }`}
          >
            <Search className="w-4 h-4 inline mr-2" />
            IP Scanner
          </button>
          <button
            onClick={() => setActiveTab('blacklist')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'blacklist'
                ? 'bg-blue-500 text-white'
                : 'hover:bg-muted/20 text-muted-foreground'
            }`}
          >
            <AlertTriangle className="w-4 h-4 inline mr-2" />
            Blacklist ({blacklist.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-blue-500 text-white'
                : 'hover:bg-muted/20 text-muted-foreground'
            }`}
          >
            <History className="w-4 h-4 inline mr-2" />
            History ({history.length})
          </button>
        </div>

        {activeTab === 'scanner' && (
          <>
            {/* IP Check Form */}
            <form onSubmit={handleCheckIP} className="mb-6">
              <div className="relative flex items-center">
                <div className="absolute left-3 text-muted-foreground">
                  <Globe className="w-5 h-5" />
                </div>
                
                <input
                  type="text"
                  value={ipInput}
                  onChange={(e) => setIpInput(e.target.value)}
                  placeholder="Enter IP address (e.g., 8.8.8.8)"
                  disabled={checking}
                  className="w-full pl-10 pr-32 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  pattern="^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$"
                  title="Enter a valid IPv4 address"
                  list="search-history"
                />
                
                <datalist id="search-history">
                  {searchHistory.map((ip, idx) => (
                    <option key={idx} value={ip} />
                  ))}
                </datalist>
                
                <button
                  type="submit"
                  disabled={!ipInput.trim() || checking}
                  className="absolute right-2 px-4 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {checking ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Checking...</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      <span>Check IP</span>
                    </>
                  )}
                </button>
              </div>
              
              {/* Advanced Options */}
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
                >
                  <Filter className="w-3 h-3" />
                  {showAdvanced ? 'Hide' : 'Show'} Advanced Options
                </button>
                
                {showAdvanced && (
                  <div className="mt-3 p-3 bg-muted/10 rounded-lg">
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-foreground">
                        Max Report Age: {maxAgeDays} days
                      </label>
                      <span className="text-xs text-muted-foreground">Default: 30 days</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="365"
                      value={maxAgeDays}
                      onChange={(e) => setMaxAgeDays(parseInt(e.target.value))}
                      className="w-full mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Only consider reports from the last {maxAgeDays} days
                    </p>
                  </div>
                )}
              </div>
              
              {/* Quick Search Buttons */}
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Recent Searches:
                </span>
                {searchHistory.slice(0, 5).map((ip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickSearch(ip)}
                    className="px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded transition-colors"
                  >
                    {ip}
                  </button>
                ))}
              </div>
              
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="font-medium">Test IPs:</span>
                <button
                  type="button"
                  onClick={() => handleQuickSearch('8.8.8.8')}
                  className="px-2 py-0.5 bg-muted rounded hover:bg-muted/80 transition-colors"
                >
                  8.8.8.8 (Google DNS)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSearch('1.1.1.1')}
                  className="px-2 py-0.5 bg-muted rounded hover:bg-muted/80 transition-colors"
                >
                  1.1.1.1 (Cloudflare)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSearch('217.12.123.27')}
                  className="px-2 py-0.5 bg-muted rounded hover:bg-muted/80 transition-colors"
                >
                  217.12.123.27 (Test IP)
                </button>
              </div>
            </form>
            
            {/* Error Display */}
            {error && (
              <div className="mt-4 p-4 border border-destructive/30 bg-destructive/5 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-destructive mb-1">Check Failed</p>
                    <p className="text-sm text-foreground/80">{error}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Check your API key in .env.local and ensure it's valid.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Results Display */}
            {results.length > 0 ? (
              <div className="mt-6">
                <AbuseIPDBResults results={results} />
              </div>
            ) : !checking && (
              <div className="mt-8 text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No recent checks</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Enter an IPv4 address above to check its reputation on AbuseIPDB.
                </p>
                <div className="mt-4 text-sm text-muted-foreground">
                  <p>Make sure your API key is set in <code className="bg-muted px-1 rounded">.env.local</code>:</p>
                  <code className="block mt-2 p-2 bg-muted/30 rounded text-xs">
                    NEXT_PUBLIC_ABUSEIPDB_API_KEY=your_api_key_here
                  </code>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'blacklist' && (
          <div className="space-y-4">
            {/* Blacklist Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-muted/10 rounded-lg">
              <div className="space-y-2 flex-1">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    Confidence Threshold: {blacklistConfidence}%
                  </label>
                  <span className="text-xs px-2 py-1 bg-blue-500/10 text-blue-500 rounded">
                    Higher = More Risky
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={blacklistConfidence}
                  onChange={(e) => setBlacklistConfidence(parseInt(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  IPs with confidence score ≥ {blacklistConfidence}% will be shown
                </p>
              </div>
              
              <button
                onClick={handleLoadBlacklist}
                disabled={blacklistLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
              >
                {blacklistLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Load Blacklist</span>
                  </>
                )}
              </button>
            </div>

            {/* Blacklist Results */}
            {blacklist.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">
                    High-Risk IPs ({blacklist.length})
                  </h3>
                  <span className="text-sm text-muted-foreground">
                    Confidence ≥ {blacklistConfidence}%
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {blacklist.map((ip, index) => (
                    <div
                      key={index}
                      className="p-4 border border-border rounded-lg hover:bg-muted/10 transition-colors group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded ${
                            ip.confidence_score >= 90 ? 'bg-destructive/10 text-destructive' :
                            ip.confidence_score >= 70 ? 'bg-accent/10 text-accent' :
                            'bg-primary/10 text-primary'
                          }`}>
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                          <code className="font-mono text-foreground font-medium">{ip.ip}</code>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          ip.confidence_score >= 90 ? 'bg-destructive/20 text-destructive' :
                          ip.confidence_score >= 70 ? 'bg-accent/20 text-accent' :
                          'bg-primary/20 text-primary'
                        }`}>
                          {ip.confidence_score}%
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Country:</span>
                          <span className="text-foreground">{ip.country}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Last Reported:</span>
                          <span className="text-foreground">
                            {ip.last_reported ? new Date(ip.last_reported).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Threat Level:</span>
                          <span className={`font-medium ${
                            ip.threat_level === 'high' ? 'text-destructive' :
                            ip.threat_level === 'medium' ? 'text-accent' :
                            'text-primary'
                          }`}>
                            {ip.threat_level.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleQuickSearch(ip.ip)}
                        className="mt-3 w-full text-xs text-blue-500 hover:text-blue-600 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Search className="w-3 h-3" />
                        Check this IP
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Database className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No blacklist data loaded</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Click "Load Blacklist" to fetch high-risk IPs
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Blacklist is cached for 24 hours
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <AbuseIPDBHistory 
            history={history} 
            onSearch={handleQuickSearch}
            onClear={handleClearHistory}
          />
        )}
      </div>
    </div>
  );
}