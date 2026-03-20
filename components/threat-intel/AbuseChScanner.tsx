"use client";

import { useState } from "react";
import { useAbuseCh } from "@/hooks/useAbuseCh";
import { AbuseChResults } from "./AbuseChResults";
import {
  Search,
  AlertTriangle,
  Database,
  Shield,
  Trash2,
  Loader2,
  Hash,
  Link as LinkIcon,
  Tag,
  Globe,
  Radar,
  Link2,
  Clock,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AbuseChScanner() {
  const {
    checking,
    error,
    results,
    checkIndicator,
    clearResults,
  } = useAbuseCh();

  const [indicatorInput, setIndicatorInput] = useState('');
  const [service, setService] = useState<'both' | 'urlhaus' | 'threatfox'>('both');

  const handleCheckIndicator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!indicatorInput.trim() || checking) return;

    try {
      await checkIndicator(indicatorInput.trim(), service);
      setIndicatorInput('');
    } catch {
      // Error state is handled by the hook.
    }
  };

  const handleQuickSearch = (indicator: string) => {
    setIndicatorInput(indicator);
  };

  const hasURLhausData = (item: any) => item?.urlhaus?.query_status === 'ok' || item?.urlhaus?.raw_data?.query_status === 'ok';
  const hasThreatFoxData = (item: any) => {
    if (!item?.threatfox) return false;
    if (item.threatfox.found === true) return true;
    if (Array.isArray(item.threatfox.iocs) && item.threatfox.iocs.length > 0) return true;
    return item.threatfox.raw_data?.query_status === 'ok';
  };

  const getIndicatorIcon = (indicator: string) => {
    if (indicator.startsWith('http')) return <LinkIcon className="w-4 h-4" />;
    if (/^[a-f0-9]{64}$/i.test(indicator)) return <Hash className="w-4 h-4" />;
    if (/^[a-f0-9]{32}$/i.test(indicator)) return <Hash className="w-4 h-4" />;
    if (/^\d+$/.test(indicator)) return <Tag className="w-4 h-4" />;
    return <Globe className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary mb-1">Abuse.ch Workspace</p>
          <h3 className="text-xl font-semibold text-white">Indicator Scanner</h3>
          <p className="text-sm text-muted-foreground mt-1">Search URLhaus and ThreatFox with one query flow across URLs, hashes, domains, and IOC tags.</p>
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
        <form onSubmit={handleCheckIndicator} className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {indicatorInput.trim() ? getIndicatorIcon(indicatorInput) : <Search className="w-4 h-4" />}
              </div>

              <input
                type="text"
                value={indicatorInput}
                onChange={(e) => setIndicatorInput(e.target.value)}
                placeholder="Enter URL, hash, IP, domain, IOC, or malware tag"
                disabled={checking}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#1a1a1a] bg-black/20 text-white placeholder:text-muted-foreground/70 focus:outline-none focus:border-primary/40 font-mono text-sm disabled:opacity-60"
              />
            </div>

            <div className="w-full lg:w-40">
              <Select value={service} onValueChange={(value) => setService(value as 'both' | 'urlhaus' | 'threatfox')} disabled={checking}>
                <SelectTrigger className="h-12 min-w-[168px] px-4 rounded-xl border-[#22262d] bg-[#101214] text-slate-100 hover:border-[#2a2f38] focus-visible:ring-primary/20 focus-visible:border-primary/40">
                  <SelectValue placeholder="Select feed" />
                </SelectTrigger>
                <SelectContent className="border-[#22262d] bg-[#101214] text-slate-100">
                  <SelectItem value="both" className="focus:bg-[#173226] focus:text-emerald-100 data-[state=checked]:bg-[#173226] data-[state=checked]:text-emerald-100">Both Feeds</SelectItem>
                  <SelectItem value="urlhaus" className="focus:bg-[#173226] focus:text-emerald-100 data-[state=checked]:bg-[#173226] data-[state=checked]:text-emerald-100">URLhaus</SelectItem>
                  <SelectItem value="threatfox" className="focus:bg-[#173226] focus:text-emerald-100 data-[state=checked]:bg-[#173226] data-[state=checked]:text-emerald-100">ThreatFox</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <button
              type="submit"
              disabled={!indicatorInput.trim() || checking}
              className="px-5 py-2.5 rounded-lg bg-primary text-black font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {checking ? 'Checking...' : 'Check Indicator'}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="text-muted-foreground">Quick checks:</span>
            {[
              'http://120.7.95.185:23/1/Photo.scr',
              '86.38.225.228:5555',
              'af94ddf7c35b9d9f016a5a4b232b43e071d59c6beb1560ba76df20df7b49ca4c',
              'CoinMiner',
            ].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => handleQuickSearch(item)}
                className="px-2 py-1 rounded border border-[#1a1a1a] bg-black/20 text-muted-foreground hover:text-white hover:border-[#2a2a2a] transition-colors"
              >
                {item.length > 28 ? `${item.slice(0, 28)}...` : item}
              </button>
            ))}
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/25 bg-destructive/10 p-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-destructive font-medium">Check failed</p>
                <p className="text-xs text-muted-foreground mt-0.5">{error}</p>
              </div>
            </div>
          )}
        </form>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-3">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1"><Radar className="w-3 h-3" /> Queries</p>
          <p className="text-xl font-semibold text-white">{results.length}</p>
        </div>
        <div className="rounded-lg border border-primary/25 bg-primary/10 p-3">
          <p className="text-[11px] uppercase tracking-wider text-primary mb-1 flex items-center gap-1"><Database className="w-3 h-3" /> URLhaus Hits</p>
          <p className="text-xl font-semibold text-primary">{results.filter((r) => hasURLhausData(r)).length}</p>
        </div>
        <div className="rounded-lg border border-sky-500/25 bg-sky-500/10 p-3">
          <p className="text-[11px] uppercase tracking-wider text-sky-400 mb-1 flex items-center gap-1"><Shield className="w-3 h-3" /> ThreatFox Hits</p>
          <p className="text-xl font-semibold text-sky-300">{results.filter((r) => hasThreatFoxData(r)).length}</p>
        </div>
        <div className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-3">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Mode</p>
          <p className="text-xl font-semibold text-white capitalize">{service}</p>
        </div>
      </div>

      {results.length > 0 ? (
        <AbuseChResults results={results} />
      ) : !checking ? (
        <div className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 border border-primary/25 mb-4">
            <Database className="w-7 h-7 text-primary" />
          </div>
          <h4 className="text-white font-semibold">No Checks Yet</h4>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mt-2">Run an indicator lookup to view URLhaus and ThreatFox intelligence in one result set.</p>
          <p className="text-xs text-muted-foreground mt-3">Set <span className="font-mono">NEXT_PUBLIC_THREATFOX_URLHAUS_API_KEY</span> for higher limits.</p>
        </div>
      ) : null}
    </div>
  );
}