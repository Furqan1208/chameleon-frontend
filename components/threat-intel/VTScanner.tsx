// D:\FYP\Chameleon Frontend\components\threat-intel\VTScanner.tsx - UPDATED VERSION
'use client';

import { useState, useEffect } from 'react';
import { IOCSearchBar } from '@/components/ui/IOCSearchBar';
import { VTResults } from './VTResults';
import { VTStatsCards } from './VTStatsCards';
import { VTThreatMap } from './VTThreatMap';
import { useVirusTotal } from '@/hooks/useVirusTotal';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Trash2,
  RefreshCw,
  Zap,
  History,
  Database,
  Filter,
  Eye,
  BarChart3,
  Info,
  X,
  Download
} from 'lucide-react';
import type { VTIndicatorType } from '@/lib/threat-intel/vt-types';

export function VTScanner() {
  const {
    scanning,
    error,
    results,
    history,
    stats,
    rateLimit,
    scanIndicator,
    clearResults,
    clearCache,
    clearHistory,
    loadHistory
  } = useVirusTotal();

  const [activeTab, setActiveTab] = useState<'scanner' | 'history' | 'map'>('scanner');
  const [showRateLimitInfo, setShowRateLimitInfo] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleScan = async (indicator: string, type: VTIndicatorType) => {
    try {
      await scanIndicator({
        indicator,
        type,
        include_relationships: true
      });
    } catch (err) {
      // Error is handled in the hook
    }
  };

  const handleClearCache = () => {
    if (confirm('Clear all cached VirusTotal data? This will not delete your history.')) {
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

  const formatTimeUntilReset = () => {
    if (rateLimit.minutesUntilReset <= 0) return 'Resets now';
    const minutes = Math.ceil(rateLimit.minutesUntilReset);
    return `Resets in ${minutes}m`;
  };

  const getRateLimitColor = () => {
    if (rateLimit.remaining === 0) return 'bg-destructive/10 text-destructive border-destructive/20';
    if (rateLimit.remaining <= 1) return 'bg-accent/10 text-accent border-accent/20';
    return 'bg-primary/10 text-primary border-primary/20';
  };

  const getThreatScoreLabel = (score: number) => {
    if (score >= 70) return 'Very High Risk';
    if (score >= 50) return 'High Risk';
    if (score >= 30) return 'Medium Risk';
    if (score >= 10) return 'Low Risk';
    return 'Very Low Risk';
  };

  const getThreatScoreColor = (score: number) => {
    if (score >= 70) return 'text-destructive';
    if (score >= 50) return 'text-accent';
    if (score >= 30) return 'text-yellow-500';
    if (score >= 10) return 'text-primary';
    return 'text-green-500';
  };

  // Refresh history when tab changes
  useEffect(() => {
    if (activeTab === 'history' && history.length === 0) {
      loadHistory();
    }
  }, [activeTab, history.length, loadHistory]);

  // Filter history by search query
  const filteredHistory = history.filter(scan => 
    scan.indicator.toLowerCase().includes(searchQuery.toLowerCase()) ||
    scan.result.ioc_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    scan.result.threat_level.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header - UPDATED with new buttons */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">VirusTotal Scanner</h1>
            <p className="text-sm text-muted-foreground">
              70+ antivirus engines • Real-time threat intelligence
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* Rate Limit Indicator */}
          <div className="relative">
            <div className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg ${getRateLimitColor()}`}>
              <Zap className="w-4 h-4" />
              <div className="text-xs">
                <div className="font-medium">
                  {rateLimit.remaining} / 4 req
                </div>
                <div className="text-xs opacity-80">
                  {formatTimeUntilReset()}
                </div>
              </div>
              <button
                onClick={() => setShowRateLimitInfo(!showRateLimitInfo)}
                className="ml-1"
              >
                <Info className="w-3 h-3" />
              </button>
            </div>
            
            {/* Rate limit tooltip */}
            {showRateLimitInfo && (
              <div className="absolute right-0 top-full mt-2 w-64 p-3 glass border border-border rounded-lg shadow-lg z-10">
                <h4 className="font-semibold text-foreground mb-2">Rate Limit</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5"></div>
                    <span><strong>Free Tier:</strong> 4 requests/minute</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5"></div>
                    <span><strong>Current:</strong> {rateLimit.remaining} remaining</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5"></div>
                    <span>Results cached for 1 hour</span>
                  </li>
                </ul>
                <button
                  onClick={() => setShowRateLimitInfo(false)}
                  className="mt-3 w-full text-xs text-primary hover:underline"
                >
                  Close
                </button>
              </div>
            )}
          </div>
          
          {/* Action Buttons - UPDATED */}
          <button
            onClick={handleClearCache}
            className="px-3 py-1.5 border border-border rounded-lg hover:bg-muted/20 transition-colors flex items-center gap-2 text-sm"
            title="Clear cached API responses"
          >
            <RefreshCw className="w-4 h-4" />
            Clear Cache
          </button>
          
          {history.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="px-3 py-1.5 border border-yellow-500/30 text-yellow-500 rounded-lg hover:bg-yellow-500/10 transition-colors flex items-center gap-2 text-sm"
              title="Delete all scan history"
            >
              <History className="w-4 h-4" />
              Clear History
            </button>
          )}
          
          {(results.length > 0 || history.length > 0) && (
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

      {/* Stats Cards */}
      <VTStatsCards results={results} history={history} />

      {/* Main Scanner Section */}
      <div className="glass border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('scanner')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'scanner'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted/20 text-muted-foreground'
            }`}
          >
            <Shield className="w-4 h-4" />
            Scanner
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'history'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted/20 text-muted-foreground'
            }`}
          >
            <History className="w-4 h-4" />
            History ({history.length})
            {stats.maliciousCount > 0 && (
              <span className="px-1.5 py-0.5 text-xs bg-destructive/20 text-destructive rounded">
                {stats.maliciousCount} malicious
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'map'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted/20 text-muted-foreground'
            }`}
          >
            <Eye className="w-4 h-4" />
            Threat Map
            {stats.maliciousCount > 0 && (
              <span className="px-1.5 py-0.5 text-xs bg-destructive/20 text-destructive rounded">
                Hotspots
              </span>
            )}
          </button>
        </div>

        {activeTab === 'scanner' ? (
          <>
            <IOCSearchBar 
              onSearch={handleScan} 
              scanning={scanning}
              placeholder="Enter hash, IP, domain, URL, or filename..."
            />
            
            {error && (
              <div className="mt-4 p-4 border border-destructive/30 bg-destructive/5 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-destructive mb-1">Scan Failed</p>
                    <p className="text-sm text-foreground/80">{error}</p>
                    {error.includes('Rate limit') && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Free tier allows 4 requests per minute. Try again in {formatTimeUntilReset()}.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {results.length > 0 ? (
              <div className="mt-6">
                <VTResults results={results} />
              </div>
            ) : !scanning && (
              <div className="mt-8 text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
                  <Shield className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Ready to Scan</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  Enter any indicator to check with 70+ antivirus engines
                </p>
                
                {/* Threat Score Display - FIXED */}
                {stats.totalScans > 0 && (
                  <div className="inline-block p-4 border border-border rounded-lg bg-muted/10">
                    <div className="text-center mb-2">
                      <div className={`text-3xl font-bold ${getThreatScoreColor(stats.avgThreatScore)}`}>
                        {stats.avgThreatScore.toFixed(1)}
                      </div>
                      <div className="text-sm font-medium text-foreground mt-1">
                        {getThreatScoreLabel(stats.avgThreatScore)}
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
                      onClick={() => handleScan('275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f', 'hash')}
                      className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-lg transition-colors text-sm flex items-center gap-2"
                    >
                      <Database className="w-3 h-3" />
                      <code className="text-xs">SHA256 Hash</code>
                    </button>
                    <button
                      onClick={() => handleScan('8.8.8.8', 'ip')}
                      className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-lg transition-colors text-sm flex items-center gap-2"
                    >
                      <BarChart3 className="w-3 h-3" />
                      <code className="text-xs">8.8.8.8</code>
                    </button>
                    <button
                      onClick={() => handleScan('google.com', 'domain')}
                      className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-lg transition-colors text-sm flex items-center gap-2"
                    >
                      <Eye className="w-3 h-3" />
                      <code className="text-xs">google.com</code>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : activeTab === 'history' ? (
          <div className="space-y-4">
            {/* History Stats */}
            {history.length > 0 && (
              <div className="p-4 bg-muted/10 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">{history.length}</div>
                    <div className="text-xs text-muted-foreground">Total Scans</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-destructive">{stats.maliciousCount}</div>
                    <div className="text-xs text-muted-foreground">Malicious</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">{stats.suspiciousCount}</div>
                    <div className="text-xs text-muted-foreground">Suspicious</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{stats.cleanCount}</div>
                    <div className="text-xs text-muted-foreground">Clean</div>
                  </div>
                </div>
                
                {/* Average Threat Score Display - FIXED */}
                {stats.totalScans > 0 && (
                  <div className="mt-4 p-3 border border-border rounded-lg bg-background/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">Average Threat Score</p>
                        <p className="text-xs text-muted-foreground">Across all scans</p>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getThreatScoreColor(stats.avgThreatScore)}`}>
                          {stats.avgThreatScore.toFixed(1)}
                        </div>
                        <div className="text-xs font-medium text-foreground">
                          {getThreatScoreLabel(stats.avgThreatScore)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* History Search */}
            {history.length > 0 && (
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search history by IP, hash, or threat level..."
                  className="w-full pl-10 pr-10 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary transition-colors"
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

            {/* History List */}
            {filteredHistory.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredHistory.map((scan) => (
                  <div
                    key={scan.id}
                    className="p-4 border border-border rounded-lg hover:bg-muted/10 transition-colors group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          scan.result.threat_level === 'high' ? 'bg-destructive/10' :
                          scan.result.threat_level === 'medium' ? 'bg-accent/10' :
                          scan.result.threat_level === 'clean' ? 'bg-primary/10' :
                          'bg-muted'
                        }`}>
                          {scan.result.threat_level === 'high' ? (
                            <AlertTriangle className="w-4 h-4 text-destructive" />
                          ) : scan.result.threat_level === 'clean' ? (
                            <CheckCircle className="w-4 h-4 text-primary" />
                          ) : (
                            <Shield className="w-4 h-4" />
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
                              'bg-primary/20 text-primary'
                            }`}>
                              {scan.result.threat_level}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {scan.result.detection_stats.detection_ratio}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(scan.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <a
                        href={scan.result.vt_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 text-xs border border-border rounded hover:bg-muted/20 transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        View on VT
                      </a>
                      <button
                        onClick={() => handleScan(scan.indicator, scan.type)}
                        className="px-2 py-1 text-xs border border-border rounded hover:bg-muted/20 transition-colors flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Rescan
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(scan.indicator);
                          // You could add a toast notification here
                        }}
                        className="px-2 py-1 text-xs border border-border rounded hover:bg-muted/20 transition-colors flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        Copy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : history.length > 0 ? (
              <div className="text-center py-8">
                <Filter className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No matching scans found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try a different search term
                </p>
              </div>
            ) : (
              <div className="text-center py-12">
                <History className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No scan history yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your scans will appear here after you start scanning indicators.
                </p>
                <button
                  onClick={() => setActiveTab('scanner')}
                  className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Start Scanning
                </button>
              </div>
            )}
          </div>
        ) : (
          // Threat Map Tab
          <VTThreatMap history={history} />
        )}
      </div>
    </div>
  );
}