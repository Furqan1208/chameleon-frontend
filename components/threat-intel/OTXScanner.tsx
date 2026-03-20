'use client';

import { useState } from 'react';
import { IOCSearchBar } from '@/components/ui/IOCSearchBar';
import { OTXResults } from './OTXResults';
import { useAlienVaultOTX } from '../../hooks/useAlienVaultOTX';
import { 
  Globe,
  Trash2,
  AlertTriangle,
  Radar,
  Activity,
  Clock,
  Shield
} from 'lucide-react';
import type { VTIndicatorType } from '@/lib/types/virustotal.types';
import type { OTXIndicatorType } from '@/lib/types/alienvault.types';

export function OTXScanner() {
  const {
    scanning,
    error,
    results,
    scanIndicator,
    clearResults
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary mb-1">OTX Workspace</p>
          <h3 className="text-xl font-semibold text-white">Indicator Scanner</h3>
          <p className="text-sm text-muted-foreground mt-1">Community-driven threat intelligence with pulse context and multi-section IOC enrichment.</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-2 rounded-lg border border-[#1a1a1a] bg-black/20 text-xs text-muted-foreground flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            10 req/min
          </div>

          <button
            onClick={() => clearResults()}
            disabled={results.length === 0 || scanning}
            className="px-3 py-2 rounded-lg border border-[#1a1a1a] bg-black/20 text-muted-foreground hover:text-white hover:border-[#2a2a2a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm"
            title="Clear current results"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-5 space-y-4">
        <IOCSearchBar
          onSearch={handleScan}
          scanning={scanning}
          placeholder="Enter IP, domain, URL, hash, CVE, or hostname..."
        />

        {error && (
          <div className="rounded-lg border border-destructive/25 bg-destructive/10 p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-destructive font-medium">Scan failed</p>
              <p className="text-xs text-muted-foreground mt-0.5">{error}</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-3">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1"><Radar className="w-3 h-3" /> Queries</p>
          <p className="text-xl font-semibold text-white">{results.length}</p>
        </div>
        <div className="rounded-lg border border-destructive/25 bg-destructive/10 p-3">
          <p className="text-[11px] uppercase tracking-wider text-destructive/80 mb-1 flex items-center gap-1"><Shield className="w-3 h-3" /> Threats</p>
          <p className="text-xl font-semibold text-destructive">{results.filter((r) => r.threat_level === 'high' || r.threat_level === 'medium').length}</p>
        </div>
        <div className="rounded-lg border border-primary/25 bg-primary/10 p-3">
          <p className="text-[11px] uppercase tracking-wider text-primary mb-1 flex items-center gap-1"><Activity className="w-3 h-3" /> Pulses</p>
          <p className="text-xl font-semibold text-primary">{results.reduce((sum, r) => sum + r.pulse_count, 0)}</p>
        </div>
        <div className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-3">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1"><Globe className="w-3 h-3" /> Source</p>
          <p className="text-xl font-semibold text-white">OTX</p>
        </div>
      </div>

      {results.length > 0 ? (
        <OTXResults results={results} />
      ) : !scanning ? (
        <div className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 border border-primary/25 mb-4">
            <Globe className="w-7 h-7 text-primary" />
          </div>
          <h4 className="text-white font-semibold">No Searches Yet</h4>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mt-2">Run an OTX lookup to inspect pulse activity, threat score, and section-level intelligence.</p>
        </div>
      ) : null}
    </div>
  );
}
