// components/threat-intel/AbuseChScanner.tsx - SIMPLIFIED VERSION
'use client';

import { useState } from 'react';
import { useAbuseCh } from '@/hooks/useAbuseCh';
import { AbuseChResults } from './AbuseChResults';
import { 
  Search,
  AlertTriangle,
  Database,
  Shield,
  RefreshCw,
  Trash2,
  Eye,
  Download,
  Hash,
  Link as LinkIcon,
  Tag,
  Globe
} from 'lucide-react';

export function AbuseChScanner() {
  const {
    checking,
    error,
    results,
    checkIndicator,
    clearResults,
    clearCache,
    downloadMalware
  } = useAbuseCh();

  const [indicatorInput, setIndicatorInput] = useState('');
  const [downloading, setDownloading] = useState<string | null>(null);



  const handleCheckIndicator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!indicatorInput.trim() || checking) return;

    console.log(`Checking indicator: ${indicatorInput.trim()}`);
    
    try {
      await checkIndicator(indicatorInput.trim(), 'both');
      setIndicatorInput('');
    } catch (err) {
      console.error('Check failed:', err);
    }
  };

  const handleQuickSearch = (indicator: string) => {
    setIndicatorInput(indicator);
  };

  const handleDownloadMalware = async (sha256: string) => {
    setDownloading(sha256);
    try {
      const blob = await downloadMalware(sha256);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${sha256}.malware`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      alert('Download started! Be careful - this file contains active malware.');
    } catch (err) {
      console.error('Download failed:', err);
      alert('Download failed. The file may no longer be available.');
    } finally {
      setDownloading(null);
    }
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all search results? This action cannot be undone.')) {
      clearResults();
    }
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
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
            <Database className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Abuse.ch Intelligence</h1>
            <p className="text-sm text-muted-foreground">
              Combined URLhaus & ThreatFox malware intelligence
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
              onClick={clearCache}
              className="px-3 py-1.5 border border-border rounded-lg hover:bg-muted/20 transition-colors flex items-center gap-2 text-sm"
              title="Clear API cache"
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
      </div>

      {/* Main Scanner */}
      <div className="glass border border-border rounded-xl p-6">
  
          {/* Search Form */}
          <form onSubmit={handleCheckIndicator} className="mb-6">
              <div className="relative flex items-center">
                <div className="absolute left-3 text-muted-foreground">
                  {indicatorInput.trim() ? getIndicatorIcon(indicatorInput) : <Search className="w-5 h-5" />}
                </div>
                
                <input
                  type="text"
                  value={indicatorInput}
                  onChange={(e) => setIndicatorInput(e.target.value)}
                  placeholder="Enter URL, hash, IP, domain, IOC, or tag..."
                  disabled={checking}
                  className="w-full pl-10 pr-32 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
                
                <button
                  type="submit"
                  disabled={!indicatorInput.trim() || checking}
                  className="absolute right-2 px-4 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-md hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {checking ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Checking...</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      <span>Check</span>
                    </>
                  )}
                </button>
              </div>
              
              {/* Test Indicators */}
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                  Test indicators:
                </span>
                <button
                  type="button"
                  onClick={() => handleQuickSearch('http://120.7.95.185:23/1/Photo.scr')}
                  className="px-2 py-1 text-xs bg-muted rounded hover:bg-muted/80 transition-colors"
                >
                  Malware URL
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSearch('af94ddf7c35b9d9f016a5a4b232b43e071d59c6beb1560ba76df20df7b49ca4c')}
                  className="px-2 py-1 text-xs bg-muted rounded hover:bg-muted/80 transition-colors"
                >
                  Malware Hash
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSearch('86.38.225.228:5555')}
                  className="px-2 py-1 text-xs bg-muted rounded hover:bg-muted/80 transition-colors"
                >
                  Botnet C&C
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSearch('CoinMiner')}
                  className="px-2 py-1 text-xs bg-muted rounded hover:bg-muted/80 transition-colors"
                >
                  Malware Tag
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
                      Check your API key in .env.local or try using test indicators.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Results Display */}
            {results.length > 0 ? (
              <div className="mt-6">
                <AbuseChResults 
                  results={results} 
                  onDownloadMalware={handleDownloadMalware}
                />
              </div>
            ) : !checking && (
              <div className="mt-8 text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full mb-4">
                  <Database className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No recent checks</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Enter an indicator above to check it against URLhaus and ThreatFox databases.
                </p>
                <div className="mt-4 text-sm text-muted-foreground">
                  <p>Make sure your API key is set in <code className="bg-muted px-1 rounded">.env.local</code>:</p>
                  <code className="block mt-2 p-2 bg-muted/30 rounded text-xs">
                    NEXT_PUBLIC_THREATFOX_URLHAUS_API_KEY=your_key_here
                  </code>
                </div>
              </div>
            )}
      </div>
    </div>
  );
}