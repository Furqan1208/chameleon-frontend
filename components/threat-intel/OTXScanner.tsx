'use client';

import { useState, useCallback } from 'react';
import { IOCSearchBar } from '@/components/ui/IOCSearchBar';
import { OTXResults } from './OTXResults';
import { useAlienVaultOTX } from '../../hooks/useAlienVaultOTX';
import { 
  Globe,
  Activity,
  RefreshCw,
  Trash2,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import type { VTIndicatorType } from '@/lib/threat-intel/vt-types';
import type { OTXIndicatorType } from '@/lib/threat-intel/otx-types';

export function OTXScanner() {
  const {
    scanning,
    error,
    results,
    rateLimit,
    apiKeyValid,
    scanIndicator,
    clearResults,
    clearCache,
    validateApiKey
  } = useAlienVaultOTX();

  // helper functions copied from original implementation
  const detectIndicatorType = (indicator: string): VTIndicatorType => {
    const cleanIndicator = indicator.trim().toLowerCase();
    const ipv4Pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (ipv4Pattern.test(cleanIndicator)) return 'ip';
    const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    if (ipv6Pattern.test(cleanIndicator)) return 'ip';
    const md5Pattern = /^[a-fA-F0-9]{32}$/;
    const sha1Pattern = /^[a-fA-F0-9]{40}$/;
    const sha256Pattern = /^[a-fA-F0-9]{64}$/;
    if (sha256Pattern.test(cleanIndicator) || sha1Pattern.test(cleanIndicator) || md5Pattern.test(cleanIndicator)) return 'hash';
    if (cleanIndicator.startsWith('http://') || cleanIndicator.startsWith('https://')) return 'url';
    const domainPattern = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
    if (domainPattern.test(cleanIndicator) && !cleanIndicator.includes('/')) return 'domain';
    const cvePattern = /^cve-\d{4}-\d{4,}$/i;
    if (cvePattern.test(cleanIndicator)) return 'filename';
    return 'filename';
  };

  const mapVTTypeToOTXType = (indicator: string, vtType: VTIndicatorType): OTXIndicatorType => {
    const cleanIndicator = indicator.trim().toUpperCase();
    const cvePattern = /^CVE-\d{4}-\d{4,}$/i;
    if (cvePattern.test(cleanIndicator)) return 'cve';

    switch (vtType) {
      case 'hash':
        return 'file';
      case 'ip':
        if (cleanIndicator.includes(':')) return 'IPv6';
        return 'IPv4';
      case 'domain':
        return 'domain';
      case 'url':
        return 'url';
      case 'filename': {
        const hashPattern = /^[A-F0-9]{32,64}$/i;
        if (hashPattern.test(cleanIndicator)) return 'file';
        if (cvePattern.test(cleanIndicator)) return 'cve';
        return 'domain';
      }
      default:
        if (/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(cleanIndicator)) return 'IPv4';
        if (/^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(cleanIndicator)) return 'IPv6';
        if (/^[A-F0-9]{64}$/i.test(cleanIndicator)) return 'file';
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
      await scanIndicator({ indicator: cleanIndicator, type: otxType, include_all_sections: true });
    } catch (err) {
      console.error('[OTXScanner] Scan error:', err);
    }
  };

  const handleClearCache = () => {
    if (confirm('Clear all cached AlienVault OTX data? This will not delete your results.')) {
      clearCache();
    }
  };

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

          <button
            onClick={handleClearCache}
            disabled={scanning}
            className="px-3 py-1.5 border border-border rounded-lg hover:bg-muted/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm"
            title="Clear cached API responses"
          >
            <RefreshCw className="w-4 h-4" />
            Clear Cache
          </button>

          {results.length > 0 && (
            <button
              onClick={() => clearResults()}
              disabled={scanning}
              className="px-3 py-1.5 border border-destructive/30 text-destructive rounded-lg hover:bg-destructive/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm"
              title="Clear current results"
            >
              <Trash2 className="w-4 h-4" />
              Clear Results
            </button>
          )}
        </div>
      </div>

      {/* Scanner Section */}
      <div className="glass border border-border rounded-xl p-6">
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
            </div>
          </div>
        )}

        {results.length > 0 && <OTXResults results={results} />}
      </div>
    </div>
  );
}
