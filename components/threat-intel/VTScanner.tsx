// components/threat-intel/VTScanner.tsx
'use client';

import { useState } from 'react';
import { IOCSearchBar } from '@/components/ui/IOCSearchBar';
import { VTResults } from './VTResults';
import { VTStatsCards } from './VTStatsCards';
import { useVirusTotal } from '@/hooks/useVirusTotal';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Download, 
  Trash2,
  RefreshCw,
  Zap
} from 'lucide-react';
import type { VTIndicatorType } from '@/lib/threat-intel/vt-types';

export function VTScanner() {
  const {
    scanning,
    error,
    results,
    history,
    rateLimit,
    scanIndicator,
    clearResults,
    clearCache,
    loadHistory
  } = useVirusTotal();

  const [activeTab, setActiveTab] = useState<'scanner' | 'history'>('scanner');

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

  const handleClearAll = () => {
    clearResults();
  };

  const formatTimeUntilReset = () => {
    const minutes = Math.ceil(rateLimit.minutesUntilReset);
    if (minutes <= 0) return 'Resets now';
    return `Resets in ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">VirusTotal Scanner</h1>
            <p className="text-sm text-muted-foreground">
              Real-time threat intelligence powered by VirusTotal API
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Rate limit indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-lg">
            <Zap className="w-4 h-4 text-accent" />
            <div className="text-xs">
              <div className="font-medium text-foreground">
                {rateLimit.remaining} requests left
              </div>
              <div className="text-muted-foreground">
                {formatTimeUntilReset()}
              </div>
            </div>
          </div>
          
          <button
            onClick={clearCache}
            className="px-3 py-1.5 border border-border rounded-lg hover:bg-muted/20 transition-colors flex items-center gap-2 text-sm"
            title="Clear cache"
          >
            <RefreshCw className="w-4 h-4" />
            Clear Cache
          </button>
          
          {results.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-3 py-1.5 border border-destructive/30 text-destructive rounded-lg hover:bg-destructive/10 transition-colors flex items-center gap-2 text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <VTStatsCards results={results} history={history} />

      {/* Scanner */}
      <div className="glass border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setActiveTab('scanner')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'scanner'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted/20 text-muted-foreground'
            }`}
          >
            Scanner
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted/20 text-muted-foreground'
            }`}
          >
            Scan History ({history.length})
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
                <h3 className="text-lg font-semibold text-foreground mb-2">No scans yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Enter a hash, IP address, domain, URL, or filename above to start scanning with VirusTotal.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
                  <div className="px-3 py-1.5 bg-muted rounded-lg">
                    <span className="font-mono">275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f</span>
                  </div>
                  <div className="px-3 py-1.5 bg-muted rounded-lg">
                    <span className="font-mono">8.8.8.8</span>
                  </div>
                  <div className="px-3 py-1.5 bg-muted rounded-lg">
                    <span className="font-mono">google.com</span>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4">
            {history.length > 0 ? (
              <div className="space-y-3">
                {history.map((scan) => (
                  <div
                    key={scan.id}
                    className="p-4 border border-border rounded-lg hover:bg-muted/10 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          scan.result.threat_level === 'high' ? 'bg-destructive/10' :
                          scan.result.threat_level === 'medium' ? 'bg-accent/10' :
                          scan.result.threat_level === 'low' ? 'bg-primary/10' :
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
                          <p className="font-medium text-foreground font-mono">{scan.indicator}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {scan.type} • {scan.result.threat_level} threat • {scan.result.detection_stats.detection_ratio}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(scan.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <a
                        href={scan.result.vt_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 text-xs border border-border rounded hover:bg-muted/20 transition-colors"
                      >
                        View on VT
                      </a>
                      <button
                        onClick={() => handleScan(scan.indicator, scan.type)}
                        className="px-2 py-1 text-xs border border-border rounded hover:bg-muted/20 transition-colors"
                      >
                        Rescan
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No scan history yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your scans will appear here after you start scanning indicators.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}