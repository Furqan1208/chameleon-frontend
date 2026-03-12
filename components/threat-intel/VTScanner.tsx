'use client';

import { useState } from 'react';
import { IOCSearchBar } from '@/components/ui/IOCSearchBar';
import { VTResults } from './VTResults';
import { useVirusTotal } from '@/hooks/useVirusTotal';
import { 
  Shield, 
  AlertTriangle,
  Trash2,
  Eye,
  BarChart3,
  Database,
} from 'lucide-react';
import type { VTIndicatorType } from '@/lib/types/virustotal.types';

export function VTScanner() {
  const {
    scanning,
    error,
    results,
    scanIndicator,
    clearResults,
  } = useVirusTotal();

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

  const handleClearResults = () => {
    if (confirm('Clear current results?')) {
      clearResults();
    }
  };



  return (
    <div className="space-y-6">
      {/* Header */}
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
          {results.length > 0 && (
            <button
              onClick={handleClearResults}
              className="px-3 py-1.5 border border-destructive/30 text-destructive rounded-lg hover:bg-destructive/10 transition-colors flex items-center gap-2 text-sm"
              title="Clear current results"
            >
              <Trash2 className="w-4 h-4" />
              Clear Results
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