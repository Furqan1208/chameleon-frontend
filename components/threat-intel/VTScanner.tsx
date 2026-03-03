// D:\FYP\Chameleon Frontend\components\threat-intel\VTScanner.tsx - UPDATED VERSION
'use client';

import { useState } from 'react';
import { IOCSearchBar } from '@/components/ui/IOCSearchBar';
import { VTResults } from './VTResults';
import { useVirusTotal } from '@/hooks/useVirusTotal';
import { 
  Shield, 
  AlertTriangle,
  Trash2,
  RefreshCw,
  Zap,
  Eye,
  BarChart3,
  Info,
  Database,
} from 'lucide-react';
import type { VTIndicatorType } from '@/lib/threat-intel/vt-types';

export function VTScanner() {
  const {
    scanning,
    error,
    results,
    rateLimit,
    scanIndicator,
    clearResults,
    clearCache
  } = useVirusTotal();

  const [showRateLimitInfo, setShowRateLimitInfo] = useState(false);

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

  const handleClearAll = () => {
    if (confirm('Clear cache and current results?')) {
      clearCache();
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
          
          
          {results.length > 0 && (
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


      {/* Main Scanner Section */}
      <div className="glass border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          <span className="px-4 py-2 rounded-lg font-medium bg-primary text-primary-foreground whitespace-nowrap flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Scanner
          </span>
        </div>

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
        
      </div>
    </div>
  );
}