// components/threat-intel/AbuseIPDBScanner.tsx
'use client';

import { useState } from 'react';
import { useAbuseIPDB } from '@/hooks/useAbuseIPDB';
import { AbuseIPDBResults } from './AbuseIPDBResults';
import { 
  Globe, 
  AlertTriangle, 
  Shield, 
  Trash2, 
  Eye, 
  Search,
  Filter
} from 'lucide-react';

export function AbuseIPDBScanner() {
  const {
    checking,
    error,
    results,
    checkIP,
    clearResults,
  } = useAbuseIPDB();

  const [ipInput, setIpInput] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [maxAgeDays, setMaxAgeDays] = useState(90);

  const handleCheckIP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ipInput.trim() || checking) return;

    console.log(`Checking IP: ${ipInput.trim()}`);
    
    try {
      const result = await checkIP(ipInput.trim(), maxAgeDays);
      console.log('IP Check Result:', result);
      setIpInput('');
    } catch (err) {
      console.error('IP Check Error:', err);
    }
  };

  const handleQuickSearch = (ip: string) => {
    setIpInput(ip);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-500" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">AbuseIPDB Scanner</h1>
            <p className="text-sm text-muted-foreground">IP reputation database</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {error && (
            <div className="text-xs text-destructive bg-destructive/10 px-2 py-1 rounded">
              Error: {error}
            </div>
          )}
          
          {results.length > 0 && (
            <button
              onClick={clearResults}
              className="px-3 py-1.5 border border-destructive/30 text-destructive rounded-lg hover:bg-destructive/10 transition-colors flex items-center gap-2 text-sm"
              title="Clear results"
            >
              <Trash2 className="w-4 h-4" />
              Clear Results
            </button>
          )}
        </div>
      </div>

      {/* Scanner */}
      <div className="glass border border-border rounded-xl p-6">
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
            />
            
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
                  <span className="text-xs text-muted-foreground">Default: 90 days</span>
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
          
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="font-medium">Test IPs:</span>
            <button type="button" onClick={() => handleQuickSearch('8.8.8.8')} className="px-2 py-0.5 bg-muted rounded hover:bg-muted/80 transition-colors">8.8.8.8 (Google DNS)</button>
            <button type="button" onClick={() => handleQuickSearch('1.1.1.1')} className="px-2 py-0.5 bg-muted rounded hover:bg-muted/80 transition-colors">1.1.1.1 (Cloudflare)</button>
            <button type="button" onClick={() => handleQuickSearch('217.12.123.27')} className="px-2 py-0.5 bg-muted rounded hover:bg-muted/80 transition-colors">217.12.123.27 (Test IP)</button>
          </div>
        </form>
        
        {error && (
          <div className="mt-4 p-4 border border-destructive/30 bg-destructive/5 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-destructive mb-1">Check Failed</p>
                <p className="text-sm text-foreground/80">{error}</p>
                <p className="text-xs text-muted-foreground mt-2">Make sure the backend server is running and the API key is configured.</p>
              </div>
            </div>
          </div>
        )}
        
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
            <p className="text-muted-foreground max-w-md mx-auto">Enter an IPv4 address above to check its reputation on AbuseIPDB.</p>
          </div>
        )}
      </div>
    </div>
  );
}
