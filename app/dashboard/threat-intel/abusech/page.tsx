// app/dashboard/threat-intel/abusech/page.tsx
'use client';

import { AbuseChScanner } from '@/components/threat-intel/AbuseChScanner';
import { NetworkBackground } from '@/components/3d/NetworkBackground';
import { Database, Shield, AlertTriangle, Globe, FileText, Users } from 'lucide-react';

export default function AbuseChPage() {
  return (
    <div className="relative min-h-full bg-background">
      <NetworkBackground />
      
      <div className="relative z-10 p-4 lg:p-6 max-w-7xl mx-auto">
        <AbuseChScanner />
        
        {/* Information Section */}
        <div className="mt-8 glass border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-500" />
            About Abuse.ch Integration
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span className="font-medium text-foreground">URLhaus</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Malware URL database with real-time updates and malware samples.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-purple-500" />
                <span className="font-medium text-foreground">ThreatFox</span>
              </div>
              <p className="text-sm text-muted-foreground">
                IOC database with threat intelligence and confidence scoring.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-500" />
                <span className="font-medium text-foreground">Multiple Formats</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Supports URLs, hashes, IPs, domains, IOCs, and tags.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-500" />
                <span className="font-medium text-foreground">Malware Samples</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Download malware samples for analysis (handle with caution).
              </p>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="font-medium text-foreground mb-3">Getting Started</h3>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-0.5">1.</span>
                <span>Optional: Get an API key from <a href="https://bazaar.abuse.ch/register/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">abuse.ch</a> for higher rate limits</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">2.</span>
                <span>Add <code className="bg-muted px-1 rounded font-mono">NEXT_PUBLIC_THREATFOX_URLHAUS_API_KEY=your_key_here</code> to <code className="bg-muted px-1 rounded font-mono">.env.local</code></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">3.</span>
                <span>Use test indicators or enter your own URLs, hashes, or IOCs</span>
              </li>
            </ol>
          </div>
          
          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="font-medium text-foreground mb-3">Test Indicators</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 border border-green-500/20 rounded-lg bg-green-500/5">
                <code className="font-mono text-sm text-foreground">http://120.7.95.185:23/1/Photo.scr</code>
                <p className="text-xs text-muted-foreground mt-1">CoinMiner malware URL</p>
              </div>
              <div className="p-3 border border-purple-500/20 rounded-lg bg-purple-500/5">
                <code className="font-mono text-sm text-foreground">86.38.225.228:5555</code>
                <p className="text-xs text-muted-foreground mt-1">Botnet C&C server</p>
              </div>
              <div className="p-3 border border-blue-500/20 rounded-lg bg-blue-500/5">
                <code className="font-mono text-sm text-foreground">af94ddf7c35b9d9f016a5a4b232b43e071d59c6beb1560ba76df20df7b49ca4c</code>
                <p className="text-xs text-muted-foreground mt-1">Malware SHA256 hash</p>
              </div>
              <div className="p-3 border border-orange-500/20 rounded-lg bg-orange-500/5">
                <code className="font-mono text-sm text-foreground">CoinMiner</code>
                <p className="text-xs text-muted-foreground mt-1">Malware family tag</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}