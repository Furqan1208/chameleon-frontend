'use client';

import { useState } from 'react';
import { useAbuseIPDB } from '@/hooks/useAbuseIPDB';
import { AbuseIPDBResults } from './AbuseIPDBResults';
import {
  Globe,
  AlertTriangle,
  Shield,
  Trash2,
  Search,
  SlidersHorizontal,
  Loader2,
  Radar,
  Users,
  Calendar,
} from 'lucide-react';

export function AbuseIPDBScanner() {
  const { checking, error, results, checkIP, clearResults } = useAbuseIPDB();

  const [ipInput, setIpInput] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [maxAgeDays, setMaxAgeDays] = useState(90);

  const handleCheckIP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ipInput.trim() || checking) return;

    try {
      await checkIP(ipInput.trim(), maxAgeDays);
      setIpInput('');
    } catch {
      // Error already handled in hook state.
    }
  };

  const handleQuickSearch = (ip: string) => {
    setIpInput(ip);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary mb-1">AbuseIPDB Workspace</p>
          <h3 className="text-xl font-semibold text-white">IP Reputation Scanner</h3>
          <p className="text-sm text-muted-foreground mt-1">Investigate IP abuse confidence, report evidence, and historical community activity.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearResults}
            disabled={results.length === 0}
            className="px-3 py-2 rounded-lg border border-[#1a1a1a] bg-black/20 text-muted-foreground hover:text-white hover:border-[#2a2a2a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
            title="Clear results"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-5 space-y-4">
        <form onSubmit={handleCheckIP} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={ipInput}
                onChange={(e) => setIpInput(e.target.value)}
                placeholder="Enter IPv4 address (e.g., 8.8.8.8)"
                disabled={checking}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#1a1a1a] bg-black/20 text-white placeholder:text-muted-foreground/70 focus:outline-none focus:border-primary/40 font-mono text-sm disabled:opacity-60"
                pattern="^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$"
                title="Enter a valid IPv4 address"
              />
            </div>

            <button
              type="submit"
              disabled={!ipInput.trim() || checking}
              className="px-5 py-2.5 rounded-lg bg-primary text-black font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {checking ? 'Checking...' : 'Check IP'}
            </button>
          </div>

          <div className="rounded-lg border border-[#1a1a1a] bg-black/20 p-3">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs text-muted-foreground hover:text-white transition-colors flex items-center gap-2"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {showAdvanced ? 'Hide' : 'Show'} Advanced Options
            </button>

            {showAdvanced && (
              <div className="mt-3 pt-3 border-t border-[#1a1a1a] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-muted-foreground">Max report age</label>
                  <span className="text-white font-medium">{maxAgeDays} days</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="365"
                  value={maxAgeDays}
                  onChange={(e) => setMaxAgeDays(parseInt(e.target.value))}
                  className="w-full"
                />
                <p className="text-[11px] text-muted-foreground">Only include reports from the last {maxAgeDays} days.</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="text-muted-foreground">Quick checks:</span>
            {['8.8.8.8', '1.1.1.1', '217.12.123.27'].map((ip) => (
              <button
                key={ip}
                type="button"
                onClick={() => handleQuickSearch(ip)}
                className="px-2 py-1 rounded border border-[#1a1a1a] bg-black/20 text-muted-foreground hover:text-white hover:border-[#2a2a2a] transition-colors"
              >
                {ip}
              </button>
            ))}
          </div>
        </form>

        {error && (
          <div className="rounded-lg border border-destructive/25 bg-destructive/10 p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
            <div>
              <p className="text-sm text-destructive font-medium">Check failed</p>
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
          <p className="text-[11px] uppercase tracking-wider text-destructive/80 mb-1 flex items-center gap-1"><Shield className="w-3 h-3" /> High Risk</p>
          <p className="text-xl font-semibold text-destructive">{results.filter((r) => r.threat_level === 'high').length}</p>
        </div>
        <div className="rounded-lg border border-amber-500/25 bg-amber-500/10 p-3">
          <p className="text-[11px] uppercase tracking-wider text-amber-400 mb-1 flex items-center gap-1"><Users className="w-3 h-3" /> Reported</p>
          <p className="text-xl font-semibold text-amber-400">{results.filter((r) => (r.total_reports || 0) > 0).length}</p>
        </div>
        <div className="rounded-lg border border-primary/25 bg-primary/10 p-3">
          <p className="text-[11px] uppercase tracking-wider text-primary mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Window</p>
          <p className="text-xl font-semibold text-primary">{maxAgeDays}d</p>
        </div>
      </div>

      {results.length > 0 ? (
        <AbuseIPDBResults results={results} />
      ) : !checking ? (
        <div className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 border border-primary/25 mb-4">
            <Search className="w-7 h-7 text-primary" />
          </div>
          <h4 className="text-white font-semibold">No Checks Yet</h4>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mt-2">Run an IP lookup to see confidence score, abuse categories, and report history.</p>
        </div>
      ) : null}
    </div>
  );
}
